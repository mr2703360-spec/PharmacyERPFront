import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { toast } from "sonner";
import {
  Calendar,
  DollarSign,
  FileText,
  Hash,
  Layers,
  Package,
  Plus,
  Save,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

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
import { purchaseSchema, type PurchaseFormValues } from "./schema";
import { createPurchase, updatePurchase } from "@/apis/purchases";
import { getSuppliers } from "@/apis/suppliers";
import { getMedicines } from "@/apis/medicines";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  }).format(value);

const safeDate = (d?: string) => {
  if (!d) return new Date().toISOString().split("T")[0];
  const parsed = new Date(d);
  return isNaN(parsed.getTime())
    ? new Date().toISOString().split("T")[0]
    : parsed.toISOString().split("T")[0];
};

const defaultItem = {
  productId: "",
  quantity: 1,
  purchasePrice: 0,
  batchNumber: "",
  expiryDate: "",
  subtotal: 0,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface PurchaseFormProps {
  id?: string;
  isEdit?: boolean;
  initialData?: PurchaseRow | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PurchaseFormComponent({
  id,
  initialData,
  isEdit = false,
}: Readonly<PurchaseFormProps>) {
  const nav = useNavigate();
  const queryClient = useQueryClient();

  // ── Fetch suppliers (all, no pagination) ──
  const { data: suppliersResponse } = useQuery({
    queryKey: ["suppliers-all"],
    queryFn: () => getSuppliers("limit=200"),
  });
  const suppliers: Supplier[] = suppliersResponse?.data ?? [];

  // ── Fetch medicines (all, no pagination) ──
  const { data: medicinesResponse } = useQuery({
    queryKey: ["medicines-all"],
    queryFn: () => getMedicines("limit=200"),
  });
  const medicines: MedicineType[] = medicinesResponse?.data ?? [];

  // ── Form setup ──
  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(purchaseSchema) as unknown as Resolver<PurchaseFormValues>,
    values:
      isEdit && initialData
        ? {
            invoiceNumber: initialData.invoiceNumber ?? "",
            supplierId:
              typeof initialData.supplierId === "string"
                ? initialData.supplierId
                : (initialData.supplierId as Supplier)?._id ?? "",
            items: initialData.items.map((item) => ({
              productId:
                typeof item.productId === "string"
                  ? item.productId
                  : (item.productId as any)?._id ?? "",
              quantity: item.quantity,
              purchasePrice: item.purchasePrice,
              batchNumber: item.batchNumber,
              expiryDate: safeDate(item.expiryDate),
              subtotal: item.subtotal,
            })),
            discount: initialData.discount ?? 0,
            tax: initialData.tax ?? 0,
            paymentStatus: initialData.paymentStatus ?? "Unpaid",
            purchaseDate: safeDate(initialData.purchaseDate),
            notes: initialData.notes ?? "",
          }
        : {
            invoiceNumber: "",
            supplierId: "",
            items: [{ ...defaultItem }],
            discount: 0,
            tax: 0,
            paymentStatus: "Unpaid",
            purchaseDate: new Date().toISOString().split("T")[0],
            notes: "",
          },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // ── Reactive totals ──
  const watchedItems = useWatch({ control: form.control, name: "items" });
  const watchedDiscount = useWatch({ control: form.control, name: "discount" });
  const watchedTax = useWatch({ control: form.control, name: "tax" });

  const itemsSubtotal = (watchedItems ?? []).reduce((acc, item) => {
    return acc + (Number(item.quantity) || 0) * (Number(item.purchasePrice) || 0);
  }, 0);

  const totalAmount =
    itemsSubtotal - (Number(watchedDiscount) || 0) + (Number(watchedTax) || 0);

  // ── Mutations ──
  const createMutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      toast.success("تم إنشاء فاتورة الشراء بنجاح");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      nav("/purchase");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? "حدث خطأ أثناء حفظ فاتورة الشراء";
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InputPurchase> }) =>
      updatePurchase(id, data),
    onSuccess: () => {
      toast.success("تم تعديل فاتورة الشراء بنجاح");
      queryClient.invalidateQueries({ queryKey: ["purchases"] });
      queryClient.invalidateQueries({ queryKey: ["purchase", id] });
      nav("/purchase");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message ?? "حدث خطأ أثناء تعديل فاتورة الشراء";
      toast.error(msg);
    },
  });

  const onSubmit: SubmitHandler<PurchaseFormValues> = (data) => {
    const enrichedItems = data.items.map((item) => ({
      ...item,
      subtotal: Number(item.quantity) * Number(item.purchasePrice),
    }));

    const payload: InputPurchase = {
      ...data,
      items: enrichedItems,
      totalAmount,
    };

    if (id && isEdit) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // ── Render ──
  return (
    <div className="container mx-auto py-8 px-4 md:px-6" dir="rtl">
      <Card className="max-w-5xl mx-auto border-0 shadow-md">
        {/* ── Header ── */}
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              {isEdit ? "تعديل فاتورة شراء" : "إنشاء فاتورة شراء جديدة"}
            </CardTitle>
          </div>
          <CardDescription>
            أدخل تفاصيل فاتورة الشراء والمنتجات. الحقول الموسومة بـ{" "}
            <span className="text-red-500">*</span> مطلوبة.
          </CardDescription>
        </CardHeader>

        <form id="purchase-form" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6 space-y-8">

            {/* ─── Section 1: Invoice meta ─────────────────────── */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                بيانات الفاتورة
              </h3>
              <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Invoice Number */}
                <Controller
                  name="invoiceNumber"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-1">
                      <FieldLabel htmlFor="purchase-invoice-number" className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        رقم الفاتورة <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Input
                        id="purchase-invoice-number"
                        placeholder="مثال: PUR-001"
                        className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Purchase Date */}
                <Controller
                  name="purchaseDate"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-1">
                      <FieldLabel htmlFor="purchase-date" className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        تاريخ الشراء <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Input
                        id="purchase-date"
                        type="date"
                        className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        {...field}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Supplier */}
                <Controller
                  name="supplierId"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-1 md:col-span-2">
                      <FieldLabel htmlFor="purchase-supplier" className="flex items-center gap-1">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        المورد <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id="purchase-supplier"
                          className={`h-10 ${fieldState.invalid ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="اختر المورد" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s._id} value={s._id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Payment Status */}
                <Controller
                  name="paymentStatus"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-1">
                      <FieldLabel htmlFor="purchase-payment-status" className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        حالة الدفع <span className="text-red-500">*</span>
                      </FieldLabel>
                      <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          id="purchase-payment-status"
                          className={`h-10 ${fieldState.invalid ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="اختر حالة الدفع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paid">مدفوع</SelectItem>
                          <SelectItem value="Partial">جزئي</SelectItem>
                          <SelectItem value="Unpaid">غير مدفوع</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Notes */}
                <Controller
                  name="notes"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="space-y-1">
                      <FieldLabel htmlFor="purchase-notes">ملاحظات</FieldLabel>
                      <Input
                        id="purchase-notes"
                        placeholder="أي ملاحظات إضافية..."
                        className="h-10"
                        {...field}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </section>

            {/* ─── Section 2: Items ────────────────────────────── */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  المنتجات المشتراة <span className="text-red-500">*</span>
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => append({ ...defaultItem })}
                >
                  <Plus className="h-4 w-4" />
                  إضافة منتج
                </Button>
              </div>

              {form.formState.errors.items?.root && (
                <p className="text-sm text-red-500 mb-2">
                  {form.formState.errors.items.root.message}
                </p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => {
                  const qty = Number(watchedItems?.[index]?.quantity) || 0;
                  const price = Number(watchedItems?.[index]?.purchasePrice) || 0;
                  const rowSubtotal = qty * price;

                  return (
                    <div
                      key={field.id}
                      className="border rounded-lg p-4 bg-muted/30 relative"
                    >
                      {/* Remove button */}
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 left-2 h-7 w-7 text-red-500 hover:bg-red-50"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}

                      <p className="text-xs font-medium text-muted-foreground mb-3">
                        المنتج #{index + 1}
                      </p>

                      <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Product */}
                        <Controller
                          name={`items.${index}.productId`}
                          control={form.control}
                          render={({ field: f, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="space-y-1 sm:col-span-2 lg:col-span-3">
                              <FieldLabel htmlFor={`item-product-${index}`} className="flex items-center gap-1">
                                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                                الدواء / المنتج <span className="text-red-500">*</span>
                              </FieldLabel>
                              <Select name={f.name} value={f.value} onValueChange={f.onChange}>
                                <SelectTrigger
                                  id={`item-product-${index}`}
                                  className={`h-10 ${fieldState.invalid ? "border-red-500" : ""}`}
                                >
                                  <SelectValue placeholder="اختر الدواء" />
                                </SelectTrigger>
                                <SelectContent>
                                  {medicines.map((m) => (
                                    <SelectItem key={m._id} value={m._id}>
                                      {m.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        {/* Quantity */}
                        <Controller
                          name={`items.${index}.quantity`}
                          control={form.control}
                          render={({ field: f, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="space-y-1">
                              <FieldLabel htmlFor={`item-qty-${index}`}>
                                الكمية <span className="text-red-500">*</span>
                              </FieldLabel>
                              <Input
                                id={`item-qty-${index}`}
                                type="number"
                                min={1}
                                className={`h-10 ${fieldState.invalid ? "border-red-500" : ""}`}
                                placeholder="1"
                                {...f}
                                onChange={(e) => f.onChange(parseInt(e.target.value) || 1)}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        {/* Purchase Price */}
                        <Controller
                          name={`items.${index}.purchasePrice`}
                          control={form.control}
                          render={({ field: f, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="space-y-1">
                              <FieldLabel htmlFor={`item-price-${index}`} className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                سعر الشراء <span className="text-red-500">*</span>
                              </FieldLabel>
                              <Input
                                id={`item-price-${index}`}
                                type="number"
                                min={0}
                                step="0.01"
                                className={`h-10 ${fieldState.invalid ? "border-red-500" : ""}`}
                                placeholder="0.00"
                                {...f}
                                onChange={(e) => f.onChange(parseFloat(e.target.value) || 0)}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        {/* Row subtotal (read-only) */}
                        <div className="space-y-1">
                          <FieldLabel>الإجمالي الجزئي</FieldLabel>
                          <div className="h-10 flex items-center rounded-md border bg-muted px-3 font-mono text-sm">
                            {formatCurrency(rowSubtotal)}
                          </div>
                          <FieldDescription>كمية × سعر الشراء</FieldDescription>
                        </div>

                        {/* Batch Number */}
                        <Controller
                          name={`items.${index}.batchNumber`}
                          control={form.control}
                          render={({ field: f, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="space-y-1">
                              <FieldLabel htmlFor={`item-batch-${index}`} className="flex items-center gap-1">
                                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                                رقم الدُفعة <span className="text-red-500">*</span>
                              </FieldLabel>
                              <Input
                                id={`item-batch-${index}`}
                                className={`h-10 ${fieldState.invalid ? "border-red-500" : ""}`}
                                placeholder="مثال: BATCH-2024-01"
                                {...f}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />

                        {/* Expiry Date */}
                        <Controller
                          name={`items.${index}.expiryDate`}
                          control={form.control}
                          render={({ field: f, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className="space-y-1">
                              <FieldLabel htmlFor={`item-expiry-${index}`} className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                                تاريخ الانتهاء <span className="text-red-500">*</span>
                              </FieldLabel>
                              <Input
                                id={`item-expiry-${index}`}
                                type="date"
                                className={`h-10 ${fieldState.invalid ? "border-red-500" : ""}`}
                                {...f}
                              />
                              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                          )}
                        />
                      </FieldGroup>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ─── Section 3: Financials summary ───────────────── */}
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                الملخص المالي
              </h3>
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Subtotal (read-only) */}
                <div className="space-y-1">
                  <FieldLabel>الإجمالي قبل الخصم</FieldLabel>
                  <div className="h-10 flex items-center rounded-md border bg-muted px-3 font-mono text-sm">
                    {formatCurrency(itemsSubtotal)}
                  </div>
                </div>

                {/* Discount */}
                <Controller
                  name="discount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-1">
                      <FieldLabel htmlFor="purchase-discount">الخصم (ج.م)</FieldLabel>
                      <Input
                        id="purchase-discount"
                        type="number"
                        min={0}
                        step="0.01"
                        className={`h-10 ${fieldState.invalid ? "border-red-500" : ""}`}
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Tax */}
                <Controller
                  name="tax"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-1">
                      <FieldLabel htmlFor="purchase-tax">الضريبة (ج.م)</FieldLabel>
                      <Input
                        id="purchase-tax"
                        type="number"
                        min={0}
                        step="0.01"
                        className={`h-10 ${fieldState.invalid ? "border-red-500" : ""}`}
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </FieldGroup>

              {/* Total amount display */}
              <div className="mt-4 flex justify-end">
                <div className="bg-primary/10 border border-primary/20 rounded-lg px-6 py-4 text-right">
                  <p className="text-sm text-muted-foreground">الإجمالي الكلي</p>
                  <p className="text-2xl font-bold text-primary font-mono">
                    {formatCurrency(totalAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    الإجمالي − الخصم + الضريبة
                  </p>
                </div>
              </div>
            </section>
          </CardContent>

          {/* ── Footer ── */}
          <CardFooter className="flex justify-end gap-2 border-t p-6">
            <Button
              type="submit"
              form="purchase-form"
              className="h-10 gap-2"
              disabled={isPending}
            >
              <Save className="h-4 w-4" />
              {isPending
                ? "جارٍ الحفظ..."
                : isEdit
                  ? "حفظ التعديلات"
                  : "حفظ فاتورة الشراء"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => nav("/purchase")}
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
