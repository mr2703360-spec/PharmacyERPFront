import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Package,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";

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
import { DeleteDialog } from "@/components/delete-dialog";
import { ViewItemDialog } from "@/components/view-item-dialog"; // adjust path if needed
import { ImagePreviewDialog } from "@/components/image-preview-dialog";

import { useUsers, useUsersQueryFilterState } from "@/queries/users";
import { useDeleteUser } from "@/api";
import { filterData } from "@/lib/utils";

export default function Index() {
  const { can } = usePermissions();
  const { query, setSearch } = useUsersQueryFilterState();
  const { data: usersResponse, refetch, isLoading } = useUsers();
  const queryClient = useQueryClient();

  const responseData =
    usersResponse?.status === 200 ? usersResponse.data : null;
  const usersData = (responseData?.data || []) as UserType[];

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<UserType | null>(
    null,
  );

  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingMedicine, setViewingMedicine] = useState<UserType | null>(null);

  // Delete mutation
  const deleteMutation = useDeleteUser({
    mutation: {
      onSuccess: () => {
        toast.success("تم حذف المستخدم بنجاح");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        setDeleteDialogOpen(false);
        setSelectedMedicine(null);
        refetch();
      },
      onError: (error) => {
        console.error(error);
        toast.error("فشل حذف المستخدم");
      },
    },
  });

  const handleDeleteConfirm = () => {
    if (selectedMedicine) {
      deleteMutation.mutate({ id: selectedMedicine._id });
    }
  };

  const openDeleteDialog = (user: UserType) => {
    setSelectedMedicine(user);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (user: UserType) => {
    setViewingMedicine(user);
    setViewDialogOpen(true);
  };

  const columns: ColumnDef<UserType>[] = [
    {
      accessorKey: "name",
      header: "اسم المستخدم",
    },
    {
      accessorKey: "email",
      header: "البريد الإلكتروني",
    },
    {
      accessorKey: "isActive",
      header: "الحالة",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-md ${
            row.original.isActive ? "bg-green-500" : "bg-red-500"
          } text-white text-xs font-medium`}
        >
          {row.original.isActive ? "نشط" : "غير نشط"}
        </span>
      ),
    },
    {
      accessorKey: "image",
      header: "الصورة",
      cell: ({ row }) => (
        <ImagePreviewDialog src={row.original.image} alt={row.original.name}>
          <img
            src={row.original.image}
            alt={row.original.name}
            className="w-16 h-16 rounded-md object-cover"
          />
        </ImagePreviewDialog>
      ),
    },
    {
      accessorKey: "role",
      header: "الدور",
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const user = row.original;
        const hasAnyAction =
          can("view_users") || can("update_user") || can("delete_user");
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
              {can("view_users") && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => openViewDialog(user)}
                >
                  <Eye className="ml-2 h-4 w-4" />
                  عرض
                </DropdownMenuItem>
              )}
              {can("update_user") && (
                <Link to={`/users/${user._id}/update`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Pencil className="ml-2 h-4 w-4" />
                    تعديل
                  </DropdownMenuItem>
                </Link>
              )}
              {can("delete_user") && (
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => openDeleteDialog(user)}
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

  const filteredData = filterData(usersData, query.search, [
    "name",
    "email",
    "isActive",
    "role",
  ]);

  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-6" dir="rtl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي المستخدمين
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                إدارة المستخدمين
              </CardTitle>
              <CardDescription>إدارة وتتبع جميع المستخدمين</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SearchInput
                value={query.search}
                onChange={setSearch}
                placeholder="بحث..."
              />
              {can("create_user") && (
                <Link to="/users/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة مستخدم
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
              totalPages={responseData?.pagination?.totalPages || 1}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف المستخدم"
        itemName={selectedMedicine?.name}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      <ViewItemDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        item={viewingMedicine || {}}
        title={`تفاصيل المستخدم: ${viewingMedicine?.name || ""}`}
        labels={{
          name: "اسم المستخدم",
          email: "البريد الإلكتروني",
          image: "الصورة",
          isActive: "الحالة",
          phone: "الهاتف",
        }}
      />
    </>
  );
}
