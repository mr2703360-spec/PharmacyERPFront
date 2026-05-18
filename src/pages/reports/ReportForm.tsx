import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Save, ArrowRight, FileText, Calendar as CalendarIcon, Tag, AlignLeft, Info } from "lucide-react";

import { useCreateReport, useUpdateReport, useReport } from "@/queries/reports";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldGroup,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/ui/loader";

const reportSchema = z.object({
  title: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  type: z.enum(["Sales", "Purchases", "Inventory", "Financial", "Custom"]),
  description: z.string().optional(),
  status: z.enum(["Draft", "Generated"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
    path: ["endDate"],
  }
);

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();

  const { data: reportData, isLoading } = useReport(id);
  const createMutation = useCreateReport();
  const updateMutation = useUpdateReport();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      type: "Sales",
      description: "",
      status: "Draft",
      startDate: "",
      endDate: "",
    },
  });

  useEffect(() => {
    if (isEdit && reportData) {
      const report = reportData;
      form.reset({
        title: report.title,
        type: report.type,
        description: report.description || "",
        status: report.status,
        startDate: report.dateRange?.startDate ? new Date(report.dateRange.startDate).toISOString().split("T")[0] : "",
        endDate: report.dateRange?.endDate ? new Date(report.dateRange.endDate).toISOString().split("T")[0] : "",
      });
    }
  }, [isEdit, reportData, form]);

  const onSubmit = (data: ReportFormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        { id, data },
        { onSuccess: () => navigate("/reports") }
      );
    } else {
      createMutation.mutate(data, { onSuccess: () => navigate("/reports") });
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="text-primary" />
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto p-4 md:p-6" dir="rtl">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/reports")}
          className="rounded-full"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? "تعديل التقرير" : "تقرير جديد"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "قم بتحديث بيانات ومحددات التقرير"
              : "أدخل بيانات التقرير لإنشائه أو حفظه كمسودة"}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-muted/30 border-b pb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">المعلومات الأساسية</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
              <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="title"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="space-y-2 md:col-span-2">
                      <FieldLabel className="flex items-center gap-1 font-semibold text-foreground/80">
                        <Tag className="h-4 w-4" />
                        اسم التقرير <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        placeholder="مثال: تقرير المبيعات الشهري لشهر أكتوبر"
                        className={`h-11 transition-all ${
                          fieldState.invalid
                            ? "border-destructive focus-visible:ring-destructive/20"
                            : "focus-visible:ring-primary/20"
                        }`}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="type"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="space-y-2">
                      <FieldLabel className="flex items-center gap-1 font-semibold text-foreground/80">
                        <Info className="h-4 w-4" />
                        نوع التقرير <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="اختر النوع" />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          <SelectItem value="Sales">المبيعات</SelectItem>
                          <SelectItem value="Purchases">المشتريات</SelectItem>
                          <SelectItem value="Inventory">المخزون</SelectItem>
                          <SelectItem value="Financial">التقارير المالية</SelectItem>
                          <SelectItem value="Custom">مخصص</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="status"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="space-y-2">
                      <FieldLabel className="flex items-center gap-1 font-semibold text-foreground/80">
                        <Info className="h-4 w-4" />
                        الحالة <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent dir="rtl">
                          <SelectItem value="Draft">مسودة (Draft)</SelectItem>
                          <SelectItem value="Generated">مُنشأ (Generated)</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="startDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="space-y-2">
                      <FieldLabel className="flex items-center gap-1 font-semibold text-foreground/80">
                        <CalendarIcon className="h-4 w-4" />
                        تاريخ البداية (اختياري)
                      </FieldLabel>
                      <Input
                        type="date"
                        {...field}
                        className="h-11"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="endDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="space-y-2">
                      <FieldLabel className="flex items-center gap-1 font-semibold text-foreground/80">
                        <CalendarIcon className="h-4 w-4" />
                        تاريخ النهاية (اختياري)
                      </FieldLabel>
                      <Input
                        type="date"
                        {...field}
                        className="h-11"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field className="space-y-2 md:col-span-2">
                      <FieldLabel className="flex items-center gap-1 font-semibold text-foreground/80">
                        <AlignLeft className="h-4 w-4" />
                        الوصف أو الملاحظات (اختياري)
                      </FieldLabel>
                      <Textarea
                        {...field}
                        placeholder="أضف أي تفاصيل أو ملاحظات حول هذا التقرير..."
                        className="min-h-[120px] resize-none"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
            
            <CardFooter className="bg-muted/20 border-t p-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-6 rounded-xl"
                onClick={() => navigate("/reports")}
                disabled={isPending}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                className="h-11 px-8 rounded-xl gap-2 font-bold" 
                disabled={isPending}
              >
                {isPending ? (
                  <Loader className="h-4 w-4 text-white" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEdit ? "حفظ التعديلات" : "إنشاء التقرير"}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
