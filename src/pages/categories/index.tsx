import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2, Plus, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { apiClient } from "@/lib/api-clients";

import DataTable from "@/components/ui/data-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DeleteDialog } from "@/components/delete-dialog"; // adjust path

import { filterData } from "@/lib/utils";
import {
  useMedicineCategories,
  useMedicineCategoriesQueryFilterState,
} from "@/queries/medicinesCategories";
import { ViewItemDialog } from "@/components/view-item-dialog";

interface MedicineCategoriesType {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Index() {
  const { can } = usePermissions();
  const { query, setSearch } = useMedicineCategoriesQueryFilterState();
  const { data: medicineCategories ,refetch,isLoading} = useMedicineCategories();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<MedicineCategoriesType | null>(null);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCategory, setViewingCategory] =
    useState<MedicineCategoriesType | null>(null);


    const openViewDialog = (category: MedicineCategoriesType) => {
      setViewingCategory(category);
      setViewDialogOpen(true);
    };

  const medicinesData =
    medicineCategories?.data || ([] as MedicineCategoriesType[]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient({
        url: `/medicinesCategories/delete/${id}`,
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast.success("تم حذف التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["medicines-categories"] });
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      refetch();
    },
    onError: (error) => {
      console.error(error);
      toast.error("حدث خطأ أثناء الحذف");
    },
  });

  const handleDeleteConfirm = () => {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory._id);
    }
  };

  const openDeleteDialog = (category: MedicineCategoriesType) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const columns: ColumnDef<MedicineCategoriesType>[] = [
    {
      accessorKey: "name",
      header: "اسم الفئة",
    },
    {
      accessorKey: "description",
      header: "وصف الفئة",
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const medicineCategory = row.original;
        // Check if ANY action is available — if none, show nothing
        const hasAnyAction =
          can("update_category") ||
          can("delete_category") ||
          can("view_category")
        if (!hasAnyAction) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {can("update_category") && (
                <Link to={`/categories/${medicineCategory._id}/update`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Pencil className="ml-2 h-4 w-4" />
                    تعديل
                  </DropdownMenuItem>
                </Link>
              )}
              {can("delete_category") && (
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => openDeleteDialog(medicineCategory)}
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              )}
              {can("view_category") && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => openViewDialog(medicineCategory)}
                >
                  <Eye className="ml-2 h-4 w-4" />
                  عرض
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const filteredData = filterData(medicinesData, query.search, [
    "name",
    "description",
  ]);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6" dir="rtl">
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">
              إدارة فئات الأدوية
            </CardTitle>
            <CardDescription>
              إدارة وتتبع جميع فئات الأدوية في المستودع
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={query.search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9 w-full sm:w-[250px]"
              />
            </div>
            {can("create_category") && (
              <Link to="/categories/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  إضافة فئة
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredData || []}
            loading={isLoading}
            totalPages={medicineCategories?.pagination?.totalPages || 1}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف فئة دواء"
        itemName={selectedCategory?.name}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
      <ViewItemDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        item={viewingCategory || {} }
        title={`تفاصيل الفئة: ${viewingCategory?.name || ""}`}
        labels={{
          name: "اسم الفئة",
          description: "الوصف",
        }}
      />
    </div>
  );
}
