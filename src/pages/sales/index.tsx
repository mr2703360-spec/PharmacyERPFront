import { useState } from "react";
import DataTable from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Eye, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/delete-dialog";
import { ViewItemDialog } from "@/components/view-item-dialog";
import { useSales, useSalesQueryFilterState } from "@/queries/sales";
import { useDeleteSale } from "@/api";
import { filterData } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";
import { SearchInput } from "@/components/common/SearchInput";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  }).format(value);

const paymentMethodLabel: Record<PaymentMethod, string> = {
  cash: "نقدي",
  card: "بطاقة",
  transfer: "تحويل بنكي",
  cheque: "شيك",
  insurance: "تأمين",
  other: "أخرى",
};

const paymentMethodVariant: Record<PaymentMethod, "outline" | "secondary"> = {
  cash: "outline",
  card: "secondary",
  transfer: "outline",
  cheque: "secondary",
  insurance: "outline",
  other: "secondary",
};

const ALL_PAYMENT_METHODS = "all";

export default function SalesPage() {
  const { can } = usePermissions();
  const { query, setSearch } = useSalesQueryFilterState();
  const { data: salesResponse, refetch, isLoading } = useSales();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingSale, setViewingSale] = useState<SaleRow | null>(null);

  // Client-side payment method filter
  const [paymentFilter, setPaymentFilter] =
    useState<string>(ALL_PAYMENT_METHODS);

  const deleteMutation = useDeleteSale({
    mutation: {
      onSuccess: () => {
        toast.success("تم حذف المبيعة بنجاح");
        queryClient.invalidateQueries({ queryKey: ["sales"] });
        setDeleteDialogOpen(false);
        setSelectedSale(null);
        refetch();
      },
      onError: (error) => {
        console.error(error);
        toast.error("فشل حذف المبيعة");
      },
    },
  });

  const handleDeleteConfirm = () => {
    if (selectedSale) {
      deleteMutation.mutate({ id: selectedSale._id });
    }
  };

  const openDeleteDialog = (sale: SaleRow) => {
    setSelectedSale(sale);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (sale: SaleRow) => {
    setViewingSale(sale);
    setViewDialogOpen(true);
  };

  const handleResetFilters = () => {
    setSearch("");
    setPaymentFilter(ALL_PAYMENT_METHODS);
  };

  const salesData =
    salesResponse?.status === 200 ? salesResponse.data?.data || [] : [];

  // Apply client-side search + payment method filter
  const searchFiltered = filterData(salesData, query.search, [
    "invoiceNumber",
    "customerName",
    "medicineName",
  ]);

  const filteredData =
    paymentFilter === ALL_PAYMENT_METHODS
      ? searchFiltered
      : searchFiltered.filter((s) => s.paymentMethod === paymentFilter);

  const hasActiveFilters =
    query.search !== "" || paymentFilter !== ALL_PAYMENT_METHODS;

  const columns: ColumnDef<SaleRow>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "رقم الفاتورة",
    },
    {
      accessorKey: "date",
      header: "التاريخ",
      cell: ({ row }) => {
        const date = new Date(row.original.date);
        return (
          <span dir="ltr" className="font-mono text-xs sm:text-sm">
            {date.toLocaleDateString("en-GB")}
          </span>
        );
      },
    },
    {
      accessorKey: "customerName",
      header: "اسم العميل",
    },
    {
      accessorKey: "medicineName",
      header: "اسم الدواء",
    },
    {
      accessorKey: "quantity",
      header: "الكمية",
      cell: ({ row }) => (
        <span className="font-mono">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: "unitPrice",
      header: "سعر الوحدة",
      cell: ({ row }) => (
        <span className="font-mono">
          {formatCurrency(row.original.unitPrice)}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: "الإجمالي",
      cell: ({ row }) => (
        <span className="font-mono font-semibold">
          {formatCurrency(row.original.total)}
        </span>
      ),
    },
    {
      accessorKey: "paymentMethod",
      header: "طريقة الدفع",
      cell: ({ row }) => {
        const method = row.original.paymentMethod;
        return (
          <Badge
            variant={paymentMethodVariant[method] || "outline"}
            className="text-xs font-medium px-3 py-1 rounded-full"
          >
            {paymentMethodLabel[method] || method}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const sale = row.original;
        const hasAnyAction =
          can("view_sale") || can("update_sale") || can("delete_sale");
        if (!hasAnyAction) return null;
        return (
          <div className="flex items-center justify-end gap-2">
            {can("view_sale") && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => openViewDialog(sale)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {can("update_sale") && (
              <Link to={`/sales/${sale._id}/update`}>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {can("delete_sale") && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => openDeleteDialog(sale)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-6" dir="rtl">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-4 pb-4">
            {/* Title row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">المبيعات</CardTitle>
                <CardDescription>
                  عرض جميع فواتير المبيعات وطرق الدفع.
                </CardDescription>
              </div>
              {can("create_sale") && (
                <Link to="/sales/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    فاتورة جديدة
                  </Button>
                </Link>
              )}
            </div>

            {/* Search & Filter row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              {/* Search input */}
              <SearchInput
                value={query.search}
                onChange={setSearch}
                placeholder="بحث برقم الفاتورة، العميل، الدواء..."
                className="sm:max-w-xs"
              />

              {/* Payment method filter */}
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_PAYMENT_METHODS}>كل الطرق</SelectItem>
                  <SelectItem value="cash">نقدي</SelectItem>
                  <SelectItem value="card">بطاقة</SelectItem>
                  <SelectItem value="transfer">تحويل بنكي</SelectItem>
                  <SelectItem value="cheque">شيك</SelectItem>
                  <SelectItem value="insurance">تأمين</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset filters button — only shows when filters are active */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="gap-1 text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                  إعادة تعيين
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={columns as any}
              data={filteredData}
              loading={isLoading}
              totalPages={
                salesResponse?.status === 200
                  ? salesResponse.data?.pagination?.totalPages || 0
                  : 0
              }
            />
          </CardContent>
        </Card>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف المبيعة"
        itemName={selectedSale?.invoiceNumber}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      <ViewItemDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        item={viewingSale || {}}
        title={`تفاصيل الفاتورة: ${viewingSale?.invoiceNumber || ""}`}
        labels={{
          invoiceNumber: "رقم الفاتورة",
          date: "التاريخ",
          customerName: "اسم العميل",
          medicineName: "اسم الدواء",
          quantity: "الكمية",
          unitPrice: "سعر الوحدة",
          total: "الإجمالي",
          paymentMethod: "طريقة الدفع",
        }}
      />
    </>
  );
}
