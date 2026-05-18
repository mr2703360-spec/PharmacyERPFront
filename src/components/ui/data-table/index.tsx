import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSetAtom } from "jotai";
import { parseAsInteger } from "nuqs";
import { useQueryStates } from "nuqs";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { DataTablePagination } from "@/components/ui/data-table/table-pagination";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { queryTableAtom } from "@/atoms";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import Loader from "../loader";

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  isStatic?: boolean;
  totalPages?: number;
  className?: string;
}

export default function DataTable<TData, TValue>({
  className,
  columns,
  data,
  loading = false,
  isStatic = false,
  totalPages = 1,
}: Readonly<Props<TData, TValue>>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const defaultPagination = {
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  };

  const [pagination, setPagination] = useQueryStates(defaultPagination);

  const setQueryTable = useSetAtom(queryTableAtom);

  useEffect(() => {
    if (pagination.page && pagination.limit) {
      setQueryTable((prev) => ({
        ...prev,
        page: pagination.page,
        limit: pagination.limit,
      }));
    }
  }, [pagination, setQueryTable]);

  const onUpdatePagination = (
    newPagination: Partial<PaginationQueryParams>
  ) => {
    setPagination((prev) => {
      return {
        ...prev,
        ...newPagination,
      };
    });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      ...(!isStatic && {
        pagination: {
          pageIndex: pagination.page - 1,
          pageSize: pagination.limit,
        },
      }),
    },

    ...(totalPages &&
      !isStatic && {
        pageCount: totalPages,
      }),
    manualPagination: !isStatic,
  });

  const hasRows = Boolean(table.getRowModel().rows?.length);

  return (
    <>
      <ScrollArea
        className={cn(
          "w-full",
          "max-w-[calc(100vw-2rem)]",
          "sm:max-w-[calc(100vw-3rem)]",
          "md:max-w-full",
          className
        )}
      >
        <div className="min-w-full my-10">
          <Table dir="rtl">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="py-4 bg-gray-100  text-center"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="relative">
              {hasRows &&
                table.getRowModel().rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      index % 2 === 0 ? "bg-white" : "bg-gray-50",
                      index === table.getRowModel().rows.length - 1 &&
                        "border-b-0"
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 text-center">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {loading && !hasRows && (
                <TableRow className="h-20">
                  <TableCell colSpan={columns.length}>
                    <Loader className="size-8 mx-auto" />
                  </TableCell>
                </TableRow>
              )}

              {loading && hasRows && (
                <TableRow className="absolute inset-0 flex items-center justify-center bg-primary/20">
                  <TableCell colSpan={columns.length}>
                    <Loader className="size-8" />
                  </TableCell>
                </TableRow>
              )}

              {!loading && !hasRows && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-lg font-semibold"
                  >
                    لا يوجد نتائج
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <ScrollBar
          orientation="horizontal"
          className="h-3 bg-gray-100 rounded-full"
        />
      </ScrollArea>

      <DataTablePagination
        table={table}
        isStatic={isStatic}
        onUpdatePagination={onUpdatePagination}
        pagination={pagination}
      />
    </>
  );
}
