import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useAtom } from "jotai";
import type { ColumnDef } from "@tanstack/react-table";

import { useReports, useDeleteReport } from "@/queries/reports";
import { queryTableAtom } from "@/atoms";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/delete-dialog";
import { ViewItemDialog } from "@/components/view-item-dialog";
import DataTable from "@/components/ui/data-table";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Generated":
      return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-200">مُنشأ</Badge>;
    case "Draft":
    default:
      return <Badge variant="outline" className="text-muted-foreground">مسودة</Badge>;
  }
};

const getTypeBadge = (type: string) => {
  switch (type) {
    case "Sales": return <Badge variant="secondary">مبيعات</Badge>;
    case "Purchases": return <Badge variant="secondary">مشتريات</Badge>;
    case "Inventory": return <Badge variant="secondary">مخزون</Badge>;
    case "Financial": return <Badge variant="secondary">مالي</Badge>;
    default: return <Badge variant="secondary">مخصص</Badge>;
  }
};

export default function Reports() {
  const [search, setSearch] = useState("");
  const [, setQueryTable] = useAtom(queryTableAtom);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewReport, setViewReport] = useState<ReportType | null>(null);

  const { data: reportsResponse, isLoading } = useReports(search);
  const deleteMutation = useDeleteReport();

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const columns: ColumnDef<ReportType>[] = [
    {
      accessorKey: "title",
      header: "اسم التقرير",
    },
    {
      accessorKey: "type",
      header: "النوع",
      cell: ({ row }) => getTypeBadge(row.original.type),
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: "dateRange",
      header: "المدة",
      cell: ({ row }) => {
        const { dateRange } = row.original;
        if (dateRange?.startDate && dateRange?.endDate) {
          return (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3" />
              {new Date(dateRange.startDate).toLocaleDateString("ar-EG")} 
              {" - "}
              {new Date(dateRange.endDate).toLocaleDateString("ar-EG")}
            </span>
          );
        }
        return <span className="text-muted-foreground">غير محدد</span>;
      },
    },
    {
      id: "createdBy",
      header: "أنشئ بواسطة",
      cell: ({ row }) => <span>{row.original.createdBy?.name || "مجهول"}</span>,
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => {
        const report = row.original;
        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewReport(report)}
              className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Link to={`/reports/${report._id}/edit`}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteId(report._id)}
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">التقارير</h1>
            <p className="text-sm text-muted-foreground">إدارة التقارير والتحليلات</p>
          </div>
        </div>
        <Link to="/reports/create">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            إنشاء تقرير جديد
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة التقارير</CardTitle>
          <CardDescription>عرض وتعديل التقارير المحفوظة.</CardDescription>
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث باسم التقرير..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setQueryTable((prev) => ({ ...prev, page: 1 }));
                }}
                className="pr-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={reportsResponse?.data || []}
            loading={isLoading}
            totalPages={reportsResponse?.pagination?.totalPages || 0}
          />
        </CardContent>
      </Card>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="حذف التقرير"
        description="هل أنت متأكد من أنك تريد حذف هذا التقرير؟ لا يمكن التراجع عن هذا الإجراء."
      />

      <ViewItemDialog
        open={!!viewReport}
        onOpenChange={(open) => !open && setViewReport(null)}
        item={viewReport as any}
        title="تفاصيل التقرير"
        labels={{
          title: "اسم التقرير",
          type: "النوع",
          status: "الحالة",
          description: "الوصف",
          dateRange: "المدة الزمنية",
          createdBy: "أنشئ بواسطة",
        }}
        excludeKeys={["_id", "updatedAt", "__v"]}
      />
    </div>
  );
}
