import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { profileFormSchema, type ProfileFormValues } from "./sheam";
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Camera, 
  Shield, 
  CheckCircle2, 
  Save,
  Key,
  Info
} from "lucide-react";
import { useAtom } from "jotai";
import { currentUserAtom } from "@/atoms";
import { useUpdateUser } from "@/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PharmacyProfilePage() {
  const [currentUser, setCurrentUser] = useAtom(currentUserAtom);
  const [isPending, setIsPending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.image || null);

  const {
    control,
    handleSubmit,
    formState: {  isDirty },
    setValue,
    reset
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      password: "",
      avatar: null,
    },
  });

  // Hydrate form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      reset({
        name: currentUser.name,
        email: currentUser.email,
        password: "",
        avatar: null,
      });
      setPreviewUrl(currentUser.image || null);
    }
  }, [currentUser, reset]);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setValue("avatar", null);
      setPreviewUrl(currentUser?.image || null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("حجم الصورة يجب أن لا يتجاوز 2 ميجابايت");
      return;
    }

    setValue("avatar", file, { shouldDirty: true });
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };


  const updateUserMutation = useUpdateUser();

  async function onSubmit(data: ProfileFormValues) {
    if (!currentUser?._id) return;
    
    setIsPending(true);
    try {
      const updateData: any = {
        name: data.name,
        email: data.email,
      };
      if (data.password) updateData.password = data.password;
      
      if (data.avatar instanceof File) {
        updateData.image = data.avatar;
      }

      const response = await updateUserMutation.mutateAsync({ 
        id: currentUser._id, 
        data: updateData 
      });
      
      // Update local state (Jotai) to reflect changes immediately across the app
      setCurrentUser(response.data as any);
      
      toast.success("تم تحديث الملف الشخصي بنجاح");
      reset({ ...data, password: "", avatar: null });
    } catch (error: any) {
      console.error(error);
      toast.error(error?.data?.message || "حدث خطأ أثناء التحديث");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl space-y-8" dir="rtl">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-background border p-8 md:p-12 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="size-32 md:size-40 rounded-full border-4 border-background shadow-2xl overflow-hidden bg-muted">
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar" className="size-full object-cover" />
              ) : (
                <div className="size-full flex items-center justify-center bg-primary/5">
                  <UserIcon className="size-16 text-primary/20" />
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 p-3 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
              <Camera className="size-5" />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <div className="text-center md:text-right space-y-3">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              {currentUser?.name || "المستخدم"}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 px-3 py-1 text-primary gap-1.5">
                <Shield className="size-3.5" />
                {currentUser?.role === "admin" ? "مدير نظام" : "صيدلي"}
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 gap-1.5">
                <Mail className="size-3.5" />
                {currentUser?.email}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              أهلاً بك في ملفك الشخصي. يمكنك تعديل بياناتك الشخصية وإدارة كلمة المرور الخاصة بك من هنا.
            </p>
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 size-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/30 px-6 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Info className="size-5 text-primary" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <Controller
                name="name"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-2">
                    <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      الاسم الكامل
                    </FieldLabel>
                    <div className="relative group">
                      <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        className="h-12 pr-10 bg-muted/20 border-transparent focus:bg-background transition-all"
                        placeholder="أدخل اسمك الكامل"
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
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-2">
                    <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      البريد الإلكتروني
                    </FieldLabel>
                    <div className="relative group">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        className="h-12 pr-10 bg-muted/20 border-transparent focus:bg-background transition-all"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </div>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/30 px-6 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Key className="size-5 text-primary" />
                أمان الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="max-w-md">
                <Controller
                  name="password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid} className="space-y-2">
                      <FieldLabel className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        تغيير كلمة المرور
                      </FieldLabel>
                      <div className="relative group">
                        <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          type="password"
                          className="h-12 pr-10 bg-muted/20 border-transparent focus:bg-background transition-all"
                          placeholder="اتركها فارغة إذا لم ترد التغيير"
                          {...field}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.
                      </p>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Roles & Permissions (Read Only) */}
        <div className="space-y-8">
          <Card className="border shadow-sm bg-primary/5 border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary/10 px-6 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                <Shield className="size-5" />
                الصلاحيات الممنوحة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap gap-2">
                {currentUser?.permissions?.map((perm) => (
                  <Badge 
                    key={perm} 
                    variant="secondary" 
                    className="bg-background border px-2 py-1 text-[10px] font-medium"
                  >
                    {perm.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                * الصلاحيات يتم التحكم بها من قبل مدير النظام ولا يمكن تعديلها من هنا.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button 
              type="submit" 
              className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all gap-2"
              disabled={isPending || !isDirty}
            >
              {isPending ? (
                <div className="size-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Save className="size-5" />
              )}
              {isPending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
            </Button>
            
            {!isDirty && (
              <p className="text-center text-[10px] text-muted-foreground animate-in fade-in">
                لا توجد تغييرات لحفظها حالياً
              </p>
            )}
            
            {isDirty && (
              <div className="flex items-center justify-center gap-1.5 text-primary animate-bounce mt-2">
                <CheckCircle2 className="size-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">لديك تغييرات غير محفوظة</span>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

