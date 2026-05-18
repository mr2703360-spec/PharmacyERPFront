
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { toast } from "sonner";
import {
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  Save,
  User,
  X,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router";
import { saleSchema, type SaleForm } from "./schema";
import { createSale, updateSale } from "@/apis/sales";

interface SaleFormProps {
  id?: string;
  isEdit?: boolean;
  initialData?: SaleRow | null;
}

export default function SaleFormComponent({
  id,
  initialData,
  isEdit = false,
}: Readonly<SaleFormProps>) {
  const nav = useNavigate();
  const queryClient = useQueryClient();

  const safeDate = (d?: string) => {
    if (!d) return new Date().toISOString().split("T")[0];
    const parsed = new Date(d);
    return isNaN(parsed.getTime())
      ? new Date().toISOString().split("T")[0]
      : parsed.toISOString().split("T")[0];
  };

  // ✅ Using `values` (not `defaultValues`) so the form automatically re-syncs
  // whenever initialData arrives from the async fetch — no useEffect needed.
  const form = useForm<SaleForm>({
    resolver: zodResolver(saleSchema) as unknown as Resolver<SaleForm>,
    values:
      isEdit && initialData
        ? {
            invoiceNumber: initialData.invoiceNumber ?? "",
            date: safeDate(initialData.date),
            customerName: initialData.customerName ?? "",
            medicineName: initialData.medicineName ?? "",
            quantity: initialData.quantity ?? 1,
            unitPrice: initialData.unitPrice ?? 0,
            paymentMethod: initialData.paymentMethod ?? "cash",
          }
        : {
            invoiceNumber: "",
            date: new Date().toISOString().split("T")[0],
            customerName: "",
            medicineName: "",
            quantity: 1,
            unitPrice: 0,
            paymentMethod: "cash",
          },
  });

  // ✅ Watch quantity & unitPrice to compute total reactively
  const quantity = form.watch("quantity");
  const unitPrice = form.watch("unitPrice");
  const computedTotal = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  const createMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      toast.success("تم إنشاء عملية بيع جديدة");
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      nav("/sales");
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء حفظ عملية البيع");
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateSale(id, data),
    onSuccess: () => {
      toast.success("تم تعديل عملية البيع");
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sale", id] });
      nav("/sales");
    },
    onError: (error) => {
      toast.error("حدث خطأ أثناء تعديل عملية البيع");
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<SaleForm> = (data) => {
    const payload = {
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      customerName: data.customerName,
      medicineName: data.medicineName,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      total: computedTotal, // ✅ use computed total
      paymentMethod: data.paymentMethod,
    };

    if (id && isEdit) {
      updateMutation.mutate({ id, data: payload as any });
    } else {
      createMutation.mutate(payload as any);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6" dir="rtl">
      <Card className="max-w-4xl mx-auto border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg border-b">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              {isEdit ? "تعديل عملية بيع" : "إنشاء عملية بيع جديدة"}
            </CardTitle>
          </div>
          <CardDescription>
            أدخل تفاصيل الفاتورة والعميل والدواء. الحقول الموسومة بـ{" "}
            <span className="text-red-500">*</span> مطلوبة.
          </CardDescription>
        </CardHeader>

        <form id="sale-form" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* رقم الفاتورة */}
              <Controller
                name="invoiceNumber"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="invoice-number"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      رقم الفاتورة <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="invoice-number"
                      placeholder="مثال: INV-001"
                      className={`h-10 ${
                        fieldState.invalid
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldDescription>
                      رقم فريد لتعريف الفاتورة في النظام.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* تاريخ الفاتورة */}
              <Controller
                name="date"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="sale-date"
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      تاريخ الفاتورة <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="sale-date"
                      type="date"
                      className={`h-10 ${
                        fieldState.invalid
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* اسم العميل */}
              <Controller
                name="customerName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="customer-name"
                      className="flex items-center gap-1"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      اسم العميل <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="customer-name"
                      placeholder="مثال: محمد علي"
                      className={`h-10 ${
                        fieldState.invalid
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldDescription>
                      اسم العميل الذي سيتم البيع له.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* اسم الدواء */}
              <Controller
                name="medicineName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="medicine-name"
                      className="flex items-center gap-1"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      اسم الدواء <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="medicine-name"
                      placeholder="مثال: باراسيتامول 500mg"
                      className={`h-10 ${
                        fieldState.invalid
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldDescription>
                      اسم الدواء الذي سيتم بيعه.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* الكمية / سعر الوحدة / الإجمالي */}
              <FieldSet className="md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Controller
                    name="quantity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-1"
                      >
                        <FieldLabel
                          htmlFor="sale-quantity"
                          className="flex items-center gap-1"
                        >
                          الكمية <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="sale-quantity"
                          type="number"
                          min={1}
                          className={`h-10 ${
                            fieldState.invalid
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          placeholder="1"
                          aria-invalid={fieldState.invalid}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 1)
                          }
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="unitPrice"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-1"
                      >
                        <FieldLabel
                          htmlFor="unit-price"
                          className="flex items-center gap-1"
                        >
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          سعر الوحدة <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="unit-price"
                          type="number"
                          min={0}
                          step="0.01"
                          className={`h-10 ${
                            fieldState.invalid
                              ? "border-red-500 focus-visible:ring-red-500"
                              : ""
                          }`}
                          placeholder="0.00"
                          aria-invalid={fieldState.invalid}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                        <FieldDescription>
                          يمكن تعديل سعر البيع يدويًا عند الحاجة.
                        </FieldDescription>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {/* ✅ Computed total displayed reactively */}
                  <div className="space-y-1">
                    <FieldLabel className="flex items-center gap-1">
                      الإجمالي
                    </FieldLabel>
                    <div className="h-10 flex items-center rounded-md border bg-muted px-3 font-mono text-sm">
                      {computedTotal.toFixed(2)} ج.م
                    </div>
                    <FieldDescription>
                      ناتج ضرب الكمية × سعر الوحدة.
                    </FieldDescription>
                  </div>
                </div>
              </FieldSet>

              {/* طريقة الدفع */}
              <Controller
                name="paymentMethod"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1 md:col-span-2"
                  >
                    <FieldLabel
                      htmlFor="payment-method"
                      className="flex items-center gap-1"
                    >
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      طريقة الدفع <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="payment-method"
                        className={`h-10 ${
                          fieldState.invalid
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">نقدًا</SelectItem>
                        <SelectItem value="card">بطاقة بنكية</SelectItem>
                        <SelectItem value="transfer">تحويل بنكي</SelectItem>
                        <SelectItem value="cheque">شيك</SelectItem>
                        <SelectItem value="insurance">تأمين</SelectItem>
                        <SelectItem value="other">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t p-6">
            <Button
              type="submit"
              form="sale-form"
              className="h-10 gap-2"
              disabled={isPending}
            >
              <Save className="h-4 w-4" />
              {isPending
                ? "جارٍ الحفظ..."
                : isEdit
                  ? "حفظ التعديلات"
                  : "حفظ عملية البيع"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => nav("/sales")}
              className="h-10 gap-2"
              disabled={isPending}
            >
              <X className="h-4 w-4" />
              إلغاء
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
