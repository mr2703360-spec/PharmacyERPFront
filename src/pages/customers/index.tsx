import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { SearchInput } from "@/components/common/SearchInput";
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
  Star,
  Eye,
} from "lucide-react";
import { useCustomers, useCustomerQueryFilterState } from "@/queries/customers";
import { DeleteDialog } from "@/components/delete-dialog";
import { ViewItemDialog } from "@/components/view-item-dialog";
import { toast } from "sonner";
import { useDeleteCustomer } from "@/api";
import { usePermissions } from "@/hooks/usePermissions";
import { CustomerDrawer } from "./CustomerDrawer";
import { StatusToggleCell } from "./CustomerStatusToggle";

export default function Customers() {
  const { can } = usePermissions();
  const { query, setSearch, setIsVIP } = useCustomerQueryFilterState();
  const { data: customersResponse, isLoading, refetch } = useCustomers();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  const customers =
    customersResponse?.status === 200 ? customersResponse.data?.data || [] : [];
  const pagination =
    customersResponse?.status === 200
      ? customersResponse.data?.pagination
      : undefined;
  const totalCustomers = pagination?.total || customers.length;
  const activeCustomers = customers.filter((c) => c.status === "active").length;
  const vipCustomers = customers.filter((c) => c.isVIP).length;
  const totalOutstanding = customers.reduce(
    (sum, c) => sum + (c.outstandingBalance || 0),
    0,
  );

  const deleteMutation = useDeleteCustomer();

  const handleDelete = async () => {
    if (!selectedCustomer) return;
    try {
      await deleteMutation.mutateAsync({ id: selectedCustomer._id });
      toast.success("تم حذف العميل بنجاح");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      refetch();
      setDeleteDialogOpen(false);
      setSelectedCustomer(null);
    } catch {
      toast.error("فشل حذف العميل");
    }
  };

  const handleCreateNew = () => {
    setSelectedCustomer(null);
    setDrawerOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDrawerOpen(true);
  };

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: "name",
      header: "اسم العميل",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 font-medium">
          {row.original.name}
          {row.original.isVIP && (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "الهاتف",
    },
    {
      accessorKey: "email",
      header: "البريد الإلكتروني",
      cell: ({ row }) => row.original.email || "—",
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
      cell: ({ row }) => <StatusToggleCell customer={row.original} />,
    },
    {
      accessorKey: "lastVisit",
      header: "آخر زيارة",
      cell: ({ row }) => {
        const lastVisit = row.original.lastVisit;
        return lastVisit
          ? new Date(lastVisit).toLocaleDateString("ar-EG")
          : "—";
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const customer = row.original;
        const hasAnyAction =
          can("view_customer") ||
          can("update_customer") ||
          can("delete_customer");
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
              {can("view_customer") && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setViewingCustomer(customer);
                    setViewDialogOpen(true);
                  }}
                >
                  <Eye className="ml-2 h-4 w-4" />
                  عرض
                </DropdownMenuItem>
              )}
              {can("update_customer") && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => handleEdit(customer)}
                >
                  <Pencil className="ml-2 h-4 w-4" />
                  تعديل
                </DropdownMenuItem>
              )}
              {can("delete_customer") && (
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => {
                    setSelectedCustomer(customer);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي العملاء
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">عميل مسجل</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              العملاء النشطين
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground">حاليًا</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عملاء VIP</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vipCustomers}</div>
            <p className="text-xs text-muted-foreground">عملاء مميزين</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المستحقات
            </CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOutstanding.toLocaleString()} ر.س
            </div>
            <p className="text-xs text-muted-foreground">على العملاء</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">العملاء</CardTitle>
            <CardDescription>إدارة بيانات وحسابات العملاء</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Select value={query.isVIP} onValueChange={setIsVIP}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="نوع العميل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="true">عملاء VIP</SelectItem>
                <SelectItem value="false">عملاء عاديين</SelectItem>
              </SelectContent>
            </Select>

            <SearchInput
              value={query.search}
              onChange={setSearch}
              placeholder="بحث بالاسم أو الهاتف..."
            />
            {can("create_customer") && (
              <Button
                className="gap-2 w-full sm:w-auto"
                onClick={handleCreateNew}
              >
                <Plus className="h-4 w-4" />
                إضافة عميل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns as any}
            data={customers}
            loading={isLoading}
            totalPages={pagination?.totalPages || 1}
          />
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف عميل"
        itemName={selectedCustomer?.name}
        onConfirm={handleDelete}
        isLoading={deleteMutation.isPending}
      />

      <CustomerDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        customer={selectedCustomer}
      />

      <ViewItemDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        item={viewingCustomer || {}}
        title={`تفاصيل العميل: ${viewingCustomer?.name || ""}`}
        labels={{
          name: "الاسم",
          phone: "الهاتف",
          email: "البريد الإلكتروني",
          address: "العنوان",
          status: "الحالة",
          outstandingBalance: "المستحقات",
          isVIP: "عميل VIP",
          notes: "ملاحظات",
          lastVisit: "آخر زيارة",
          createdAt: "تاريخ الإنشاء",
          updatedAt: "تاريخ التحديث",
        }}
      />
    </div>
  );
}
