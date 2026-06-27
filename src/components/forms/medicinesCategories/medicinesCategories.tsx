import { useEffect} from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Package, Save, X } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateMedicineCategory,
  useUpdateMedicineCategory,
} from "@/api";
import { toast } from "sonner";
import { categorySchema, type CategoryFormValues } from "./schema";


interface CategoryFormProps {
  id?: string;
  isLoading?: boolean;
  isEdit?: boolean;
  initialData?: MedicineCategoriesType | null;
}

export default function CategoryForm({
  id,
  initialData,
  isEdit,
  isLoading,
}: CategoryFormProps) {
  const navigate = useNavigate();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        description: initialData.description ?? "",
      });
    }
  }, [initialData, form]);

  const createCategoryMutation = useCreateMedicineCategory({
    mutation: {
      onSuccess: () => {
        toast.success("تم إضافة التصنيف بنجاح");
        navigate("/categories");
      },
      onError: (error: any) => {
        console.error(error);
        toast.error("حدث خطأ أثناء إضافة التصنيف. حاول مجدداً.");
      },
    },
  });

  const updateCategoryMutation = useUpdateMedicineCategory({
    mutation: {
      onSuccess: () => {
        toast.success("تم تحديث التصنيف بنجاح");
        navigate("/categories");
      },
      onError: (error: any) => {
        console.error(error);
        toast.error("حدث خطأ أثناء تحديث التصنيف. حاول مجدداً.");
      },
    },
  });

  const isPending = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const onSubmit: SubmitHandler<CategoryFormValues> = (data) => {
    if (isEdit && id) {
      updateCategoryMutation.mutate({ id, data });
    } else {
      createCategoryMutation.mutate({ data });
    }
  };

  // ── Loading skeleton while fetching initial data ───────────────────────────
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 text-center" dir="rtl">
        <p className="text-muted-foreground">جاري تحميل البيانات...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4" dir="rtl">
      <Card className="max-w-2xl mx-auto py-0 border-0">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg border-b flex items-center justify-start pt-5">
          <Package className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-bold">
            {id ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
          </CardTitle>
        </CardHeader>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent>
            <FieldGroup className="grid grid-cols-1 gap-6">
              {/* Name field */}
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="category-name"
                      className="flex items-center gap-1"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      اسم التصنيف
                    </FieldLabel>
                    <Input
                      id="category-name"
                      placeholder="مثال: مسكنات، مضادات حيوية"
                      className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {/* Description field */}
              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1"
                  >
                    <FieldLabel
                      htmlFor="category-description"
                      className="flex items-center gap-1"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      الوصف
                    </FieldLabel>
                    <Textarea
                      id="category-description"
                      placeholder="وصف قصير للتصنيف..."
                      className={`resize-none ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      rows={4}
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

          <CardFooter className="flex justify-end gap-2 p-6">
            <Button type="submit" disabled={isPending} className="h-10 gap-2">
              <Save className="h-4 w-4" />
              {isPending
                ? "جاري الحفظ..."
                : id
                  ? "تحديث التصنيف"
                  : "إضافة التصنيف"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => navigate("/categories")}
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
