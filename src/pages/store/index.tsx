import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Search,
  Package,
  AlertTriangle,
  DollarSign,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/delete-dialog";
import { ViewItemDialog } from "@/components/view-item-dialog"; // adjust path if needed

import { useMedicines, useMedicineQueryFilterState } from "@/queries/medicine";
import { deleteMedicine } from "@/apis/medicines";
import { filterData, formatPrice } from "@/lib/utils";

// Define the Medicine type (adjust fields to match your API)
interface MedicineType {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  image?: string;
  price: number;
  expiryDate: string;
  supplier: string;
  storeStatus: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function Index() {
  const { can } = usePermissions();
  const { query, setSearch } = useMedicineQueryFilterState();
  const { data: medicinesResponse, refetch, isLoading } = useMedicines();
  const queryClient = useQueryClient();

  const medicinesData = medicinesResponse?.data || [];

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineType | null>(
    null,
  );

  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingMedicine, setViewingMedicine] = useState<MedicineType | null>(
    null,
  );

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteMedicine(id);
    },
    onSuccess: () => {
      toast.success("تم حذف الدواء بنجاح");
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
      setDeleteDialogOpen(false);
      setSelectedMedicine(null);
      refetch();
    },
    onError: (error) => {
      console.error(error);
      toast.error("فشل حذف الدواء");
    },
  });

  const handleDeleteConfirm = () => {
    if (selectedMedicine) {
      deleteMutation.mutate(selectedMedicine._id);
    }
  };

  const openDeleteDialog = (medicine: MedicineType) => {
    setSelectedMedicine(medicine);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (medicine: MedicineType) => {
    setViewingMedicine(medicine);
    setViewDialogOpen(true);
  };

  const totalMedicines = medicinesData.length;
  const lowStockCount = medicinesData.filter(
    (m) => m.storeStatus === "OutOfStock" || m.quantity < 10,
  ).length;
  const outOfStockCount = medicinesData.filter(
    (m) => m.storeStatus === "OutOfStock",
  ).length;

  const columns: ColumnDef<MedicineType>[] = [
    {
      accessorKey: "name",
      header: "اسم المنتج",
    },
    {
      accessorKey: "category",
      header: "الفئة",
    },
    {
      accessorKey: "quantity",
      header: "الكمية",
      cell: ({ row }) => (
        <span className="font-mono">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: "image",
      header: "الصورة",
      cell: ({ row }) => (
        <img
          src={row.original.image}
          alt={row.original.name}
          className="w-16 h-16 rounded-md object-cover"
        />
      ),
    },
    {
      accessorKey: "price",
      header: "السعر",
      cell: ({ row }) => (
        <span className="font-mono">{formatPrice(row.original.price)}</span>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "تاريخ الانتهاء",
      cell: ({ row }) => {
        const date = new Date(row.original.expiryDate);
        return <span dir="ltr">{date.toLocaleDateString("ar-EG")}</span>;
      },
    },
    {
      accessorKey: "supplier",
      header: "المورد",
    },
    {
      accessorKey: "storeStatus",
      header: "حالة المخزون",
      cell: ({ row }) => (
        <Badge className="bg-gray-100 text-gray-800">
          {row.original.storeStatus}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const medicine = row.original;
        const hasAnyAction =
          can("view_store") ||
          can("update_store") ||
          can("delete_store");
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
              {can("view_store") && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => openViewDialog(medicine)}
                >
                  <Eye className="ml-2 h-4 w-4" />
                  عرض
                </DropdownMenuItem>
              )}
              {can("update_store") && (
                <Link to={`/store/${medicine._id}/update`}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Pencil className="ml-2 h-4 w-4" />
                    تعديل
                  </DropdownMenuItem>
                </Link>
              )}
              {can("delete_store") && (
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  onClick={() => openDeleteDialog(medicine)}
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

  const filteredData = filterData(medicinesData, query.search, [
    "name",
    "category",
    "supplier",
    "storeStatus",
  ]);

  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-6" dir="rtl">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                إجمالي الأدوية
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMedicines}</div>
              <p className="text-xs text-muted-foreground">منتج مسجل</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                منخفض المخزون
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockCount}</div>
              <p className="text-xs text-muted-foreground">
                يحتاج إلى إعادة طلب
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                نفذ من المخزون
              </CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outOfStockCount}</div>
              <p className="text-xs text-muted-foreground">غير متوفر حاليًا</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Card */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">
                المخزون (الأدوية)
              </CardTitle>
              <CardDescription>
                إدارة وتتبع جميع الأدوية في المستودع
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
              {can("create_store") && (
                <Link to="/store/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    إضافة دواء
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
              totalPages={medicinesResponse?.pagination?.totalPages || 1}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف دواء"
        itemName={selectedMedicine?.name}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* View Item Modal */}
      <ViewItemDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        item={viewingMedicine || {}} 
        title={`تفاصيل الدواء: ${viewingMedicine?.name || ""}`}
        labels={{
          name: "اسم الدواء",
          category: "الفئة",
          quantity: "الكمية",
          price: "السعر",
          expiryDate: "تاريخ الانتهاء",
          supplier: "المورد",
          storeStatus: "حالة المخزون",
          description: "الوصف",
        }}
      />
    </>
  );
}
