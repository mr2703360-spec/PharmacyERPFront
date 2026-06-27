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
import { useQueryClient} from "@tanstack/react-query";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/delete-dialog";
import { ViewItemDialog } from "@/components/view-item-dialog";
import {
  usePurchases,
  usePurchasesQueryFilterState,
} from "@/queries/purchases";
import { useDeletePurchase } from "@/api";
import { usePermissions } from "@/hooks/usePermissions";
import { SearchInput } from "@/components/common/SearchInput";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  }).format(value ?? 0);

const paymentStatusLabel: Record<PurchasePaymentStatus, string> = {
  Paid: "مدفوع",
  Partial: "جزئي",
  Unpaid: "غير مدفوع",
};

const paymentStatusVariant: Record<
  PurchasePaymentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  Paid: "default",
  Partial: "secondary",
  Unpaid: "destructive",
};

const ALL_STATUS = "all";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PurchasesPage() {
  const { can } = usePermissions();
  const { query, setSearch, setPaymentStatus, resetFilters } =
    usePurchasesQueryFilterState();
  const { data: purchasesResponse, refetch, isLoading } = usePurchases();
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRow | null>(
    null,
  );
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState<PurchaseRow | null>(
    null,
  );

  // ── Delete mutation ──
  const deleteMutation = useDeletePurchase({
    mutation: {
      onSuccess: () => {
        toast.success("تم حذف فاتورة الشراء بنجاح");
        queryClient.invalidateQueries({ queryKey: ["purchases"] });
        setDeleteDialogOpen(false);
        setSelectedPurchase(null);
        refetch();
      },
      onError: () => {
        toast.error("فشل حذف فاتورة الشراء");
      },
    },
  });

  const handleDeleteConfirm = () => {
    if (selectedPurchase) deleteMutation.mutate({ id: selectedPurchase._id });
  };

  const openDeleteDialog = (purchase: PurchaseRow) => {
    setSelectedPurchase(purchase);
    setDeleteDialogOpen(true);
  };

  const openViewDialog = (purchase: PurchaseRow) => {
    setViewingPurchase(purchase);
    setViewDialogOpen(true);
  };

  const hasActiveFilters =
    query.search !== "" || query.paymentStatus !== ALL_STATUS;

  const purchasesData: PurchaseRow[] = (
    purchasesResponse?.status === 200 ? purchasesResponse.data?.data || [] : []
  ) as PurchaseRow[];

  // ─── Columns ──────────────────────────────────────────────────────────────

  const columns: ColumnDef<PurchaseRow>[] = [
    {
      accessorKey: "invoiceNumber",
      header: "رقم الفاتورة",
    },
    {
      id: "supplier",
      header: "المورد",
      cell: ({ row }) => {
        const s = row.original.supplierId;
        if (!s) return <span className="text-muted-foreground">—</span>;
        const name = typeof s === "string" ? s : (s as Supplier).name;
        return <span>{name}</span>;
      },
    },
    {
      id: "itemsCount",
      header: "عدد المنتجات",
      cell: ({ row }) => (
        <span className="font-mono">{row.original.items?.length ?? 0}</span>
      ),
    },
    {
      accessorKey: "totalAmount",
      header: "الإجمالي",
      cell: ({ row }) => (
        <span className="font-mono font-semibold">
          {formatCurrency(row.original.totalAmount)}
        </span>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: "حالة الدفع",
      cell: ({ row }) => {
        const status = row.original.paymentStatus as PurchasePaymentStatus;
        return (
          <Badge
            variant={paymentStatusVariant[status] ?? "outline"}
            className="text-xs font-medium px-3 py-1 rounded-full"
          >
            {paymentStatusLabel[status] ?? status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "purchaseDate",
      header: "تاريخ الشراء",
      cell: ({ row }) => {
        const date = new Date(row.original.purchaseDate);
        return (
          <span dir="ltr" className="font-mono text-xs sm:text-sm">
            {date.toLocaleDateString("en-GB")}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const purchase = row.original;
        const hasAnyAction =
          can("view_purchase") ||
          can("update_purchase") ||
          can("delete_purchase");
        if (!hasAnyAction) return null;
        return (
          <div className="flex items-center justify-end gap-2">
            {can("view_purchase") && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => openViewDialog(purchase)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {can("update_purchase") && (
              <Link to={`/purchase/${purchase._id}/update`}>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {can("delete_purchase") && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => openDeleteDialog(purchase)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-6" dir="rtl">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-4 pb-4">
            {/* Title row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-bold">المشتريات</CardTitle>
                <CardDescription>
                  عرض جميع فواتير الشراء وإدارة المخزون.
                </CardDescription>
              </div>
              {can("create_purchase") && (
                <Link to="/purchase/create">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    فاتورة شراء جديدة
                  </Button>
                </Link>
              )}
            </div>

            {/* Search & Filter row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
              {/* Search */}
              <SearchInput
                value={query.search}
                onChange={setSearch}
                placeholder="بحث برقم الفاتورة أو المورد..."
                className="sm:max-w-xs"
              />

              {/* Payment status filter */}
              <Select
                value={query.paymentStatus}
                onValueChange={setPaymentStatus}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="حالة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUS}>كل الحالات</SelectItem>
                  <SelectItem value="Paid">مدفوع</SelectItem>
                  <SelectItem value="Partial">جزئي</SelectItem>
                  <SelectItem value="Unpaid">غير مدفوع</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
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
              columns={columns}
              data={purchasesData}
              loading={isLoading}
              totalPages={
                purchasesResponse?.status === 200
                  ? (purchasesResponse.data?.pagination?.totalPages ?? 0)
                  : 0
              }
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="حذف فاتورة الشراء"
        itemName={selectedPurchase?.invoiceNumber}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* View dialog */}
      <ViewItemDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        item={
          viewingPurchase
            ? {
                invoiceNumber: viewingPurchase.invoiceNumber,
                supplier:
                  typeof viewingPurchase.supplierId === "string"
                    ? viewingPurchase.supplierId
                    : ((viewingPurchase.supplierId as Supplier)?.name ?? "—"),
                itemsCount: viewingPurchase.items?.length ?? 0,
                totalAmount: formatCurrency(viewingPurchase.totalAmount),
                paymentStatus:
                  paymentStatusLabel[
                    viewingPurchase.paymentStatus as PurchasePaymentStatus
                  ] ?? viewingPurchase.paymentStatus,
                purchaseDate: new Date(
                  viewingPurchase.purchaseDate,
                ).toLocaleDateString("en-GB"),
                notes: viewingPurchase.notes ?? "—",
              }
            : {}
        }
        title={`تفاصيل الفاتورة: ${viewingPurchase?.invoiceNumber ?? ""}`}
        labels={{
          invoiceNumber: "رقم الفاتورة",
          supplier: "المورد",
          itemsCount: "عدد المنتجات",
          totalAmount: "الإجمالي الكلي",
          paymentStatus: "حالة الدفع",
          purchaseDate: "تاريخ الشراء",
          notes: "ملاحظات",
        }}
      />
    </>
  );
}
