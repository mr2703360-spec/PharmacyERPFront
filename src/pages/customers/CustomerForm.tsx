import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  type Resolver,
  type SubmitHandler,
} from "react-hook-form";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Star,
  FileText,
  Save,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { customerSchema, type CustomerFormValues } from "./customerSchema";
import { createCustomer, updateCustomer } from "@/apis/customers";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface CustomerFormProps {
  id?: string;
  values?: Customer | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CustomerForm({ id, values, onSuccess, onCancel }: Readonly<CustomerFormProps>) {
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema) as unknown as Resolver<CustomerFormValues>,
    defaultValues: {
      name: values?.name ?? "",
      phone: values?.phone ?? "",
      email: values?.email ?? "",
      address: values?.address ?? "",
      status: values?.status ?? "active",
      outstandingBalance: values?.outstandingBalance ?? 0,
      isVIP: values?.isVIP ?? false,
      notes: values?.notes ?? "",
    },
  });

  useEffect(() => {
    if (values) {
      form.reset({
        name: values.name ?? "",
        phone: values.phone ?? "",
        email: values.email ?? "",
        address: values.address ?? "",
        status: values.status ?? "active",
        outstandingBalance: values.outstandingBalance ?? 0,
        isVIP: values.isVIP ?? false,
        notes: values.notes ?? "",
      });
    } else {
      form.reset({
        name: "",
        phone: "",
        email: "",
        address: "",
        status: "active",
        outstandingBalance: 0,
        isVIP: false,
        notes: "",
      });
    }
  }, [values, form, isEdit]);

  const onSubmit: SubmitHandler<CustomerFormValues> = async (data) => {
    try {
      if (!isEdit) {
        await createCustomer(data);
        toast.success("تم إضافة العميل بنجاح", {
          description: `تم إضافة ${data.name} إلى قاعدة البيانات.`,
        });
      } else {
        await updateCustomer(id, data);
        toast.success("تم تحديث معلومات العميل بنجاح", {
          description: `تم تحديث ${data.name} في قاعدة البيانات.`,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "حدث خطأ ما");
    }
  };

  return (
    <form id="customer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" dir="rtl">
      <FieldGroup className="grid grid-cols-1 gap-4">
        {/* الاسم */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-1">
              <FieldLabel htmlFor="customer-name" className="flex items-center gap-1">
                <User className="h-4 w-4 text-muted-foreground" />
                اسم العميل <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="customer-name"
                placeholder="أدخل اسم العميل"
                className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* الهاتف */}
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-1">
              <FieldLabel htmlFor="customer-phone" className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                رقم الهاتف <span className="text-red-500">*</span>
              </FieldLabel>
              <Input
                id="customer-phone"
                placeholder="0123456789"
                className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* البريد الإلكتروني */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-1">
              <FieldLabel htmlFor="customer-email" className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                البريد الإلكتروني
              </FieldLabel>
              <Input
                id="customer-email"
                type="email"
                placeholder="example@mail.com"
                className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* العنوان */}
        <Controller
          name="address"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-1">
              <FieldLabel htmlFor="customer-address" className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                العنوان
              </FieldLabel>
              <Input
                id="customer-address"
                placeholder="أدخل عنوان العميل"
                className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* الرصيد المستحق */}
        <Controller
          name="outstandingBalance"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-1">
              <FieldLabel htmlFor="customer-balance" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                الرصيد المستحق (ر.س)
              </FieldLabel>
              <Input
                id="customer-balance"
                type="number"
                min={0}
                step="0.01"
                className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                placeholder="0.00"
                aria-invalid={fieldState.invalid}
                {...field}
                value={field.value ?? 0}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* الحالة و VIP */}
        <div className="flex gap-4 items-center">
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field className="space-y-1 flex-1">
                <FieldLabel className="flex items-center gap-1 mb-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  حساب نشط
                </FieldLabel>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    checked={field.value === "active"}
                    onCheckedChange={(checked) => field.onChange(checked ? "active" : "inactive")}
                  />
                  <span>{field.value === "active" ? "نعم" : "لا"}</span>
                </div>
              </Field>
            )}
          />

          <Controller
            name="isVIP"
            control={form.control}
            render={({ field }) => (
              <Field className="space-y-1 flex-1">
                <FieldLabel className="flex items-center gap-1 mb-2 text-yellow-600 font-semibold">
                  <Star className="h-4 w-4" />
                  عميل VIP
                </FieldLabel>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span>{field.value ? "نعم" : "لا"}</span>
                </div>
              </Field>
            )}
          />
        </div>

        {/* ملاحظات */}
        <Controller
          name="notes"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="space-y-1">
              <FieldLabel htmlFor="customer-notes" className="flex items-center gap-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                ملاحظات
              </FieldLabel>
              <Textarea
                id="customer-notes"
                placeholder="معلومات إضافية..."
                className={`min-h-[80px] ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            إلغاء
          </Button>
        )}
        <Button type="submit" form="customer-form" className="gap-2">
          <Save className="h-4 w-4" />
          {isEdit ? "تحديث العميل" : "إضافة العميل"}
        </Button>
      </div>
    </form>
  );
}
