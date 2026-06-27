import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { 
  Package, 
  Save, 
  X, 
  Shield, 
  User as UserIcon, 
  Mail, 
  Lock, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  Store,
  Tags,
  Truck,
  Users as UsersIcon,
  ShoppingCart,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
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
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useParams } from "react-router";
import { UserSchema, type UserForm , ROLES } from "./scham.ts";
import { useCreateUser, useUpdateUser } from "@/api";
import { cn } from "@/lib/utils";

// --- Permission Grouping ---
const PERMISSION_GROUPS = [
  {
    id: "general",
    title: "عام",
    icon: LayoutDashboard,
    permissions: ["view_dashboard", "view_profile", "update_profile"]
  },
  {
    id: "inventory",
    title: "المخزون",
    icon: Store,
    permissions: ["view_store", "create_store", "update_store", "delete_store"]
  },
  {
    id: "categories",
    title: "التصنيفات",
    icon: Tags,
    permissions: ["view_category", "create_category", "update_category", "delete_category"]
  },
  {
    id: "suppliers",
    title: "الموردون",
    icon: Truck,
    permissions: ["view_supplier", "create_supplier", "update_supplier", "delete_supplier"]
  },
  {
    id: "sales",
    title: "المبيعات",
    icon: ShoppingCart,
    permissions: ["view_sale", "create_sale", "update_sale", "delete_sale"]
  },
  {
    id: "purchases",
    title: "المشتريات",
    icon: CreditCard,
    permissions: ["view_purchase", "create_purchase", "update_purchase", "delete_purchase"]
  },
  {
    id: "users",
    title: "المستخدمين",
    icon: UsersIcon,
    permissions: ["view_users", "create_user", "update_user", "delete_user"]
  }
];

type Props = {
  defaultValues?: UserType;
  mode?: "create" | "update";
};

export default function UserFormComponent({
  defaultValues,
  mode = "create",
}: Props) {
  const nav = useNavigate();
  const { id } = useParams();
  
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [preview, setPreview] = useState<string | null>(
    (defaultValues?.image as string) || null
  );

  const form = useForm<UserForm>({
    resolver: zodResolver(UserSchema) as unknown as Resolver<UserForm>,
    defaultValues: {
      name: defaultValues?.name ?? "",
      email: defaultValues?.email ?? "",
      password: "",
      role: (defaultValues?.role as any) ?? "pharmacist",
      isActive: defaultValues?.isActive ?? true,
      permissions: (defaultValues?.permissions as any) ?? [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      form.setValue("image", e.target.files as any);
    }
  };

  const handleSubmit: SubmitHandler<UserForm> = async (data) => {
    try {
      const payload: any = {
        name: data.name,
        email: data.email,
        role: data.role,
        isActive: String(data.isActive),
        permissions: data.permissions,
      };
      
      if (data.password) {
        payload.password = data.password;
      }

      if (data.image?.[0]) {
        payload.image = data.image[0];
      }

      if (mode === "create") {
        await createMutation.mutateAsync({ data: payload });
        toast.success("تم إضافة المستخدم بنجاح");
      } else {
        await updateMutation.mutateAsync({ id: id as string, data: payload });
        toast.success("تم تعديل بيانات المستخدم بنجاح");
      }
      nav(-1);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.response?.data?.message || error?.message || "حدث خطأ ما. حاول مجددًا.";
      toast.error(errorMessage);
    }
  };

  const toggleGroup = (groupPermissions: string[], checked: boolean) => {
    const currentPermissions = form.getValues("permissions") || [];
    let newPermissions: any[];
    
    if (checked) {
      newPermissions = Array.from(new Set([...currentPermissions, ...groupPermissions]));
    } else {
      newPermissions = currentPermissions.filter(p => !groupPermissions.includes(p));
    }
    
    form.setValue("permissions", newPermissions as any, { shouldValidate: true });
  };

  return (
    <div className="container mx-auto px-4 pb-12" dir="rtl">
      <Card className="max-w-3xl mx-auto border shadow-lg overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-b p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <Package className="h-8 w-8 text-primary animate-pulse-slow" />
            </div>
            <div>
              <CardTitle className="text-3xl font-extrabold tracking-tight">
                {mode === "create" ? "إضافة مستخدم جديد" : "تعديل بيانات المستخدم"}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                {mode === "create" ? "قم بتعبئة البيانات لإنشاء حساب موظف جديد" : "تحديث معلومات الموظف وصلاحياته"}
              </p>
            </div>
          </div>
        </CardHeader>

        <form
          id="user-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8"
        >
          <CardContent className="p-8 space-y-10">
            {/* --- Basic Information Section --- */}
            <section className="space-y-6">
              <div className="flex items-center gap-2 border-b pb-2">
                <UserIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">المعلومات الأساسية</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-2">
                      <FieldLabel className="text-sm font-semibold flex items-center gap-2">
                        الاسم الكامل
                      </FieldLabel>
                      <div className="relative group">
                        <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          placeholder="أدخل الاسم الرباعي"
                          className={cn(
                            "h-12 pr-10 bg-muted/50 border-transparent focus:bg-background transition-all duration-300",
                            fieldState.invalid && "border-destructive focus:ring-destructive"
                          )}
                          {...field}
                        />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Email */}
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-2">
                      <FieldLabel className="text-sm font-semibold flex items-center gap-2">
                        البريد الإلكتروني
                      </FieldLabel>
                      <div className="relative group">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="email"
                          placeholder="example@pharmacy.com"
                          className={cn(
                            "h-12 pr-10 bg-muted/50 border-transparent focus:bg-background transition-all duration-300",
                            fieldState.invalid && "border-destructive focus:ring-destructive"
                          )}
                          {...field}
                        />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Password */}
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-2">
                      <FieldLabel className="text-sm font-semibold flex items-center gap-2">
                        كلمة المرور
                        {mode === "update" && (
                          <span className="text-xs font-normal text-muted-foreground">
                            (اختياري للتغيير)
                          </span>
                        )}
                      </FieldLabel>
                      <div className="relative group">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className={cn(
                            "h-12 pr-10 bg-muted/50 border-transparent focus:bg-background transition-all duration-300",
                            fieldState.invalid && "border-destructive focus:ring-destructive"
                          )}
                          {...field}
                        />
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />

                {/* Role */}
                <Controller
                  name="role"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-2">
                      <FieldLabel className="text-sm font-semibold flex items-center gap-2">
                        الدور الوظيفي
                      </FieldLabel>
                      <div className="relative group">
                        <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                        <select
                          {...field}
                          className={cn(
                            "w-full h-12 pr-10 bg-muted/50 border-transparent rounded-md text-sm focus:bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 appearance-none",
                            fieldState.invalid && "border-destructive"
                          )}
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r === "admin" ? "مدير نظام" : r === "pharmacist" ? "صيدلي" : "محاسب"}
                            </option>
                          ))}
                        </select>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </section>

            {/* --- Account Status & Profile Picture --- */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
              {/* isActive */}
              <div className="bg-muted/30 p-6 rounded-2xl border border-dashed border-primary/20 flex items-center justify-between group hover:bg-muted/50 transition-colors">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm">حالة الحساب</h4>
                  <p className="text-xs text-muted-foreground">تفعيل أو تعطيل دخول المستخدم للنظام</p>
                </div>
                <Controller
                  name="isActive"
                  control={form.control}
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <span className={cn("text-xs font-medium", field.value ? "text-primary" : "text-muted-foreground")}>
                        {field.value ? "نشط" : "غير نشط"}
                      </span>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  )}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm">الصورة الشخصية</h4>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="size-24 rounded-2xl border-2 border-primary/20 overflow-hidden bg-muted group-hover:border-primary transition-colors">
                      {preview ? (
                        <img src={preview} alt="Preview" className="size-full object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-xl cursor-pointer shadow-lg hover:scale-110 transition-transform">
                      <Save className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-muted-foreground">
                      يفضل استخدام صورة مربعة بحجم لا يتجاوز 2 ميجابايت.
                    </p>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setPreview(null); form.setValue("image", null as any); }}
                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      إزالة الصورة
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* --- Permissions Section --- */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">صلاحيات النظام</h3>
                </div>
                <p className="text-xs text-muted-foreground">حدد المهام التي يمكن للمستخدم القيام بها</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PERMISSION_GROUPS.map((group) => {
                  const groupSelectedCount = (form.watch("permissions") || []).filter(p => group.permissions.includes(p)).length;
                  const isAllSelected = groupSelectedCount === group.permissions.length;
                  const isSomeSelected = groupSelectedCount > 0 && !isAllSelected;

                  return (
                    <div key={group.id} className="border rounded-2xl p-6 bg-muted/20 hover:bg-muted/40 transition-all duration-300 group/group">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg group-hover/group:bg-primary/20 transition-colors">
                            <group.icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-bold text-sm">{group.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-muted-foreground">تحديد الكل</span>
                          <Checkbox
                            checked={isAllSelected || (isSomeSelected ? "indeterminate" : false)}
                            onCheckedChange={(checked) => toggleGroup(group.permissions, !!checked)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {group.permissions.map((perm) => (
                          <label
                            key={perm}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-background/80 cursor-pointer transition-all border border-transparent hover:border-primary/10 group/item"
                          >
                            <span className="text-xs font-medium text-muted-foreground group-hover/item:text-foreground transition-colors">
                              {perm.replace(/_/g, " ").replace("view", "عرض").replace("create", "إضافة").replace("update", "تعديل").replace("delete", "حذف").replace("store", "المخزون").replace("category", "التصنيفات").replace("supplier", "الموردين").replace("sale", "المبيعات").replace("purchase", "المشتريات").replace("dashboard", "لوحة التحكم").replace("profile", "الملف الشخصي").replace("users", "المستخدمين")}
                            </span>
                            <Controller
                              name="permissions"
                              control={form.control}
                              render={({ field }) => (
                                <Checkbox
                                  checked={field.value?.includes(perm as any)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    field.onChange(
                                      checked
                                        ? [...current, perm]
                                        : current.filter((p) => p !== perm)
                                    );
                                  }}
                                />
                              )}
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <Controller
                name="permissions"
                control={form.control}
                render={({ fieldState }) => (
                  fieldState.invalid ? (
                    <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl text-sm border border-destructive/20">
                      <AlertCircle className="h-4 w-4" />
                      يجب اختيار صلاحية واحدة على الأقل للمستخدم.
                    </div>
                  ) : <></>
                )}
              />
            </section>
          </CardContent>

          <CardFooter className="flex items-center justify-between p-8 bg-muted/30 border-t gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              {form.formState.isDirty && (
                <span className="text-xs flex items-center gap-1 animate-in fade-in slide-in-from-right-4">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  لديك تغييرات غير محفوظة
                </span>
              )}
            </div>
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => nav("/users")}
                className="h-12 px-8 rounded-xl gap-2 font-bold"
                disabled={isPending}
              >
                <X className="h-4 w-4" />
                إلغاء
              </Button>
              <Button
                type="submit"
                className="h-12 px-10 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
                disabled={isPending}
              >
                {isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    جارٍ الحفظ...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {mode === "create" ? "إنشاء الحساب" : "حفظ التعديلات"}
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
