import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Users,
  UserCheck,
  DollarSign,
  Eye,
} from "lucide-react";
import { useSuppliers, useSupplierQueryFilterState } from "@/queries/suppliers";
import { DeleteDialog } from "@/components/delete-dialog";
import { ViewItemDialog } from "@/components/view-item-dialog";
import { toast } from "sonner";
import { useDeleteSupplier } from "@/api";
import { StatusToggleCell } from "@/components/status-toggle-cell";
import { usePermissions } from "@/hooks/usePermissions";
import { SearchInput } from "@/components/common/SearchInput";

export default function Supplier() {
  const { can } = usePermissions();
  const { query, setSearch, setPaymentType } = useSupplierQueryFilterState();
  const { data: suppliersResponse, isLoading } = useSuppliers();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);

  const responseData =
    suppliersResponse?.status === 200 ? suppliersResponse.data : null;
  const suppliers = responseData?.data || [];
  const pagination = responseData?.pagination;
  const totalSuppliers = pagination?.total || suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;
  const totalOutstanding = suppliers.reduce(
    (sum, s) => sum + (s.outstandingBalance || 0),
    0,
  );

  const deleteSupplierMutation = useDeleteSupplier({
    mutation: {
      onSuccess: () => {
        toast.success("تم حذف المورد بنجاح");
        setDeleteDialogOpen(false);
        setSelectedSupplier(null);
      },
      onError: () => toast.error("فشل حذف المورد"),
    },
  });

  const handleDelete = () => {
    if (!selectedSupplier) return;
    deleteSupplierMutation.mutate({ id: selectedSupplier._id });
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "name",
      header: "اسم المورد",
    },
    {
      accessorKey: "phone",
      header: "الهاتف",
    },
    {
      accessorKey: "email",
      header: "البريد الإلكتروني",
    },
    {
      accessorKey: "paymentType",
      header: "نوع الدفع",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.paymentType}</Badge>
      ),
    },
    {
      accessorKey: "address",
      header: "العنوان",
    },
    {
      accessorKey: "outstandingBalance",
      header: "المستحقات",
      cell: ({ row }) => {
        const balance = row.original.outstandingBalance || 0;
        return (
          <div className="text-right font-mono">
            {balance.toLocaleString()} ر.س
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => <StatusToggleCell supplier={row.original} />,
    },
    {
      accessorKey: "lastOrder",
      header: "آخر طلب",
      cell: ({ row }) => {
        const lastOrder = row.original.lastOrder;
        return lastOrder
          ? new Date(lastOrder).toLocaleDateString("ar-EG")
          : "—";
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const supplier = row.original;
        const hasAnyAction =
          can("view_supplier") ||
          can("update_supplier") ||
          can("delete_supplier");
        if (!hasAnyAction) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">فتح القائمة</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {can("view_supplier") && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setViewingSupplier(supplier);
                    setViewDialogOpen(true);
                  }}
                >
                  <Eye className="ml-2 h-4 w-4" />
                  عرض
                </DropdownMenuItem>
              )}
              {can("update_supplier") && (
                <Link to={`/supplier/${supplier._id}/update`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Pencil className="ml-2 h-4 w-4" />
                    تعديل
                  </DropdownMenuItem>
                </Link>
              )}
              {can("delete_supplier") && (
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => {
                    setSelectedSupplier(supplier);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="ml-2 h-4 w-4" />
                  حذف
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4 md:px-6" dir="rtl">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الموردين
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">مورد مسجل</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              الموردين النشطين
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">حاليًا</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المستحقات
            </CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOutstanding.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">على الموردين</p>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table Card */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">الموردين</CardTitle>
            <CardDescription>إدارة وتتبع جميع الموردين</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Select value={query.paymentType} onValueChange={setPaymentType}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="نوع الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="نقدي">نقدي</SelectItem>
                <SelectItem value="آجل">آجل</SelectItem>
              </SelectContent>
            </Select>

            <SearchInput
              value={query.search}
              onChange={setSearch}
              placeholder="بحث..."
            />
            {can("create_supplier") && (
              <Link to="/supplier/create">
                <Button className="gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  إضافة مورد
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns as any}
            data={suppliers}
            loading={isLoading}
            totalPages={responseData?.pagination?.totalPages || 1}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف مورد"
        itemName={selectedSupplier?.name}
        onConfirm={handleDelete}
        isLoading={deleteSupplierMutation.isPending}
      />

      <ViewItemDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        item={viewingSupplier || {}}
        title={`تفاصيل المورد: ${viewingSupplier?.name || ""}`}
        labels={{
          name: "الاسم",
          phone: "الهاتف",
          email: "البريد الإلكتروني",
          address: "العنوان",
          paymentType: "نوع الدفع",
          status: "الحالة",
          outstandingBalance: "المستحقات",
          notes: "ملاحظات",
          lastOrder: "آخر طلب",
          createdAt: "تاريخ الإنشاء",
          updatedAt: "تاريخ التحديث",
        }}
      />
    </div>
  );
}
