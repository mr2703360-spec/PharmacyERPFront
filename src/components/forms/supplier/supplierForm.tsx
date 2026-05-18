import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { toast } from "sonner";
import {
  Package,
  DollarSign,
  Calendar,
  Truck,
  AlertTriangle,
  Save,
  X,
  Phone,
  User,
  Activity,
  FileText,
} from "lucide-react";

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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router";
import { supplierSchema, type SupplierForm } from "./sham";
import { createSupplier, updateSupplier } from "@/apis/suppliers";
import { useEffect } from "react";

interface SupplierFormsProps {
  idEdit?: boolean;
  id?: string;
  values?: Supplier;
}

export default function SupplierForm({ idEdit=false, id, values }: Readonly<SupplierFormsProps>) {
  const nav = useNavigate();
  const form = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema) as unknown as Resolver<SupplierForm>,
    defaultValues: {
      name: values?.name ?? "",
      address: values?.address ?? "",
      email: values?.email ?? "",
      phone: values?.phone ?? "",
      status: values?.status ?? "active",
      notes: values?.notes ?? "",
      outstandingBalance: values?.outstandingBalance ?? 0,
      paymentType: values?.paymentType ?? "نقدي",
    },
  });

    useEffect(() => {
      if (values) {
        form.reset({
          name: values.name ?? "",
          address: values.address ?? "",
          email: values.email ?? "",
          phone: values.phone ?? "",
          status: values.status ?? "active",
          notes: values.notes ?? "",
          outstandingBalance: values.outstandingBalance ?? 0,
          paymentType: values.paymentType ?? "نقدي",
        });
      }
    }, [values, form]);

  const onSubmit: SubmitHandler<SupplierForm> = async (data) => {
    if (!idEdit) {
      await createSupplier(data as any);
      toast.success("تم تحديث معلومات المورد بنجاح", {
        description: `تم تحديث ${data.name} في قاعدة البيانات.`,
      });
    } else {
      await updateSupplier(id || "", data as any);
      toast.success("تم تحديث معلومات المورد بنجاح", {
        description: `تم تحديث ${data.name} في قاعدة البيانات.`,
      });
    }
    nav("/supplier");
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6" dir="rtl">
      <Card className="max-w-4xl mx-auto shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg border-b">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              {id ? "تعديل معلومات المورد" : "إضافة مورد جديد"}
            </CardTitle>
          </div>
          <CardDescription>
            <span className="text-red-500">*</span> مطلوبة.
          </CardDescription>
        </CardHeader>

        <form id="supplier-form" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* الاسم */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="supplier-name"
                      className="flex items-center gap-1"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      اسم المورد <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="supplier-name"
                      placeholder="مثال: شركة ميديكو فارما"
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

              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="supplier-address"
                      className="flex items-center gap-1"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      العنوان <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="supplier-address"
                      placeholder="شارع النيل، القاهرة"
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

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="supplier-email"
                      className="flex items-center gap-1"
                    >
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      البريد الإلكتروني <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="supplier-email"
                      type="email"
                      placeholder="info@example.com"
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

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="supplier-phone"
                      className="flex items-center gap-1"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      رقم الهاتف <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="supplier-phone"
                      placeholder="0123456789"
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

              <Controller
                name="outstandingBalance"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="supplier-balance"
                      className="flex items-center gap-1"
                    >
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      الرصيد المستحق
                    </FieldLabel>
                    <Input
                      id="supplier-balance"
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
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="paymentType"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="supplier-payment-type"
                      className="flex items-center gap-1"
                    >
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      طريقة الدفع <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="supplier-payment-type"
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
                        <SelectItem value="نقدي">نقدي</SelectItem>
                        <SelectItem value="آجل">آجل</SelectItem>
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
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="supplier-status"
                      className="flex items-center gap-1"
                    >
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      الحالة <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="supplier-status"
                        className={`h-10 ${
                          fieldState.invalid
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="lastOrder"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="supplier-last-order"
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      تاريخ آخر طلب
                    </FieldLabel>
                    <Input
                      id="supplier-last-order"
                      type="date"
                      className={`h-10 ${
                        fieldState.invalid
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }`}
                      aria-invalid={fieldState.invalid}
                      value={
                        field.value instanceof Date &&
                        !isNaN(field?.value?.getTime())
                          ? field.value.toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const date = e.target.value
                          ? new Date(e.target.value)
                          : null;
                        field.onChange(date);
                      }}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="notes"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1 md:col-span-2"
                  >
                    <FieldLabel
                      htmlFor="supplier-notes"
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      ملاحظات إضافية
                    </FieldLabel>
                    <Textarea
                      id="supplier-notes"
                      placeholder="أي معلومات إضافية عن المورد..."
                      className={`min-h-[80px] ${
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
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t p-6">
            <Button type="submit" form="supplier-form" className="h-10 gap-2">
              <Save className="h-4 w-4" />
              {id ? "تحديث المورد" : "إضافة المورد"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => nav("/supplier")}
              className="h-10 gap-2"
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
