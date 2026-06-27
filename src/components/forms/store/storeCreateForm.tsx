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
  Tag,
  Hash,
  DollarSign,
  Calendar,
  AlertTriangle,
  Save,
  X,
  Truck,
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
import { useNavigate, useParams } from "react-router";
import { medicineSchema, type MedicineForm } from "./scham";
import { useCreateMedicine, useUpdateMedicine } from "@/api";
import { formatDateForInput } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useMedicineCategories } from "@/queries/medicinesCategories";
import {  useSuppliers } from "@/queries/suppliers";

interface MedicineFormsProps {
  idEdit?: boolean;
  values?: MedicineType | null;
}

export default function MedicineForms({
  idEdit = false,
  values,
}: Readonly<MedicineFormsProps>) {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [preview, setPreview] = useState<string | null>(
    idEdit && typeof values?.image === "string" ? values.image : null,
  );
  const { data: medicineCategoriesResponse } = useMedicineCategories();
  const medicineCategories =
    medicineCategoriesResponse?.status === 200
      ? medicineCategoriesResponse.data?.data || []
      : [];

  const { data: supplierResponse } = useSuppliers();
  const suppliers =
    supplierResponse?.status === 200
      ? supplierResponse.data?.data || []
      : [];

  const form = useForm<MedicineForm>({
    resolver: zodResolver(medicineSchema) as unknown as Resolver<MedicineForm>,
    defaultValues: {
      name: values?.name ?? "",
      category: values?.category ?? "",
      quantity: values?.quantity ?? 0,
      image: values?.image ?? "",
      price: values?.price ?? 0,
      expiryDate: formatDateForInput(values?.expiryDate),
      supplier: values?.supplier ?? "",
      storeStatus: values?.storeStatus ?? "Available",
    },
  });

  useEffect(() => {
    if (idEdit && typeof values?.image === "string" && values.image) {
      setPreview(values?.image );
    }
  }, [values?.image, idEdit]);

  useEffect(() => {
    if (values && idEdit) {
      form.reset({
        name: values?.name ?? "",
        category: values?.category ?? "",
        quantity: values?.quantity ?? 0,
        image: values?.image ?? "",
        price: values?.price ?? 0,
        expiryDate: formatDateForInput(values?.expiryDate),
        supplier: values?.supplier ?? "",
        storeStatus: values?.storeStatus ?? "Available",
      });
    }
  }, [values, idEdit, form.reset]);

  const createMutation = useCreateMedicine();
  const updateMutation = useUpdateMedicine();

  const onSubmit: SubmitHandler<MedicineForm> = async (Input: MedicineForm) => {
    const payload: any = {
      name: Input.name,
      category: Input.category,
      quantity: Input.quantity,
      price: Input.price,
      expiryDate: Input.expiryDate ?? "",
      supplier: Input.supplier,
      storeStatus: Input.storeStatus,
    };

    if (Input.image && Input.image[0] instanceof File) {
      payload.image = Input.image[0];
    }

    try {
      if (!idEdit) {
        await createMutation.mutateAsync({ data: payload });
        toast.success("تم إضافة الدواء بنجاح", {
          description: `تم حفظ ${Input.name} في قاعدة البيانات.`,
        });
      } else {
        if (!id) {
          toast.error("معرّف الدواء مفقود");
          return;
        }
        await updateMutation.mutateAsync({ id, data: payload });
        toast.success("تم تحديث بيانات الدواء بنجاح", {
          description: `تم حفظ ${Input.name} في قاعدة البيانات.`,
        });
      }
      nav("/store");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء الحفظ");
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto py-8 px-4 md:px-6" dir="rtl">
      <Card className="max-w-4xl mx-auto border-0">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg border-b">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-bold">
              {idEdit ? "تعديل دواء" : "إضافة دواء جديد"}
            </CardTitle>
          </div>
          <CardDescription>
            أدخل معلومات الدواء بالكامل. الحقول الموسومة بـ{" "}
            <span className="text-red-500">*</span> مطلوبة.
          </CardDescription>
        </CardHeader>

        <form id="create-medicine-form" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="pt-6">
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <Controller
                name="name"
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
                      <Package className="h-4 w-4 text-muted-foreground" />
                      اسم المنتج <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="medicine-name"
                      placeholder="مثال: أموكسيسيلين"
                      className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldDescription>الاسم التجاري للدواء.</FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="image"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel>الصورة</FieldLabel>
                    <Input
                      type="file"
                      accept="image/*"
                      className="h-10"
                      onChange={(e) => {
                        const files = e.target.files;
                        field.onChange(files);
                        if (files?.[0]) {
                          setPreview(URL.createObjectURL(files[0]));
                        }
                      }}
                    />
                    {preview && (
                      <img
                        src={preview}
                        alt="صورة الدواء"
                        className="  h-24 w-24 rounded-full object-cover   shrink-0"
                      />
                    )}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Category */}
              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="medicine-category"
                      className="flex items-center gap-1"
                    >
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      الفئة <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="medicine-category"
                        className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        {medicineCategories.map(
                          (category: MedicineCategoriesType) => (
                            <SelectItem
                              key={category._id}
                              value={category.name || ""}
                            >
                              {category.name}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      صنّف الدواء ضمن الفئة المناسبة.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <FieldSet className="md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Controller
                    name="quantity"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-1"
                      >
                        <FieldLabel
                          htmlFor="medicine-quantity"
                          className="flex items-center gap-1"
                        >
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          الكمية <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="medicine-quantity"
                          type="number"
                          min={0}
                          className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          placeholder="0"
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
                    name="price"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field
                        data-invalid={fieldState.invalid}
                        className="space-y-1"
                      >
                        <FieldLabel
                          htmlFor="medicine-price"
                          className="flex items-center gap-1"
                        >
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          السعر (ج.م) <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          id="medicine-price"
                          type="number"
                          min={0}
                          step="0.01"
                          className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                          placeholder="0.00"
                          aria-invalid={fieldState.invalid}
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>
              </FieldSet>

              {/* Expiry Date */}
              <Controller
                name="expiryDate"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="medicine-expiry"
                      className="flex items-center gap-1"
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      تاريخ الانتهاء <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Input
                      id="medicine-expiry"
                      type="date"
                      className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    <FieldDescription>
                      يجب أن يكون التاريخ في المستقبل.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Supplier */}
              <Controller
                name="supplier"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="medicine-supplier"
                      className="flex items-center gap-1"
                    >
                      <Truck className="h-4 w-4 text-muted-foreground" />{" "}
                      {/* ✅ */}
                      المورد <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="medicine-supplier"
                        className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="اختر المورد" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier: any) => (
                          <SelectItem key={supplier._id} value={supplier?.name}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      اسم الشركة أو المورد المسؤول.
                    </FieldDescription>{" "}
                    {/* ✅ */}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Store Status */}
              <Controller
                name="storeStatus"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1 md:col-span-2"
                  >
                    <FieldLabel
                      htmlFor="medicine-stock"
                      className="flex items-center gap-1"
                    >
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      حالة المخزون <span className="text-red-500">*</span>
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value || ""}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id="medicine-stock"
                        className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="OutOfStock">Out of Stock</SelectItem>
                        <SelectItem value="Expired">Expired</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      الحالة الحالية لمخزون هذا الدواء.
                    </FieldDescription>
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
              form="create-medicine-form"
              className="h-10 gap-2"
              disabled={isPending}
            >
              <Save className="h-4 w-4" />
              {isPending ? "جارٍ الحفظ..." : idEdit ? "تعديل الدواء" : "إضافة الدواء"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => nav("/store")}
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
