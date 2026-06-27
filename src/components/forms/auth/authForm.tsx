import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, Package, Save, X } from "lucide-react";

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

import { useNavigate } from "react-router";
import { AuthSchema, type AuthForm } from "./scham";
import { useState } from "react";
import { useLogin } from "@/api";
import { useSetAtom } from "jotai";
import { tokenAtom, currentUserAtom } from "@/atoms";

export default function AuthForm() {
  const nav = useNavigate();
  const setToken = useSetAtom(tokenAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const [visiblePassword, setVisiblePassword] = useState(false);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        if ("data" in data && data.status === 200) {
          const { token, user } = data.data as { token: string; user: User };
          setToken(token);
          setCurrentUser(user);
          toast.success("تم تسجيل الدخول بنجاح", { position: "top-center" });
          nav("/");
        }
      },
      onError: () => {
        toast.error("بيانات غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.", {
          position: "top-center",
        });
      },
    },
  });

  const form = useForm<AuthForm>({
    resolver: zodResolver(AuthSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<AuthForm> = (Input: AuthForm) => {
    loginMutation.mutate({ data: { email: Input.email, password: Input.password } });
  };

  return (
    <div className="container mx-auto   px-4" dir="rtl">
      <Card className="max-w-2xl mx-auto py-0  border-0">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-t-lg border-b flex items-center justify-start pt-5 ">
          <Package className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-bold">{"تسجيل الدخول"}</CardTitle>
        </CardHeader>

        <form id="create-medicine-form" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="">
            <FieldGroup className="grid grid-cols-1 gap-6">
              <Controller
                name="email"
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
                      البريد الإلكتروني
                    </FieldLabel>
                    <Input
                      id="email"
                      placeholder="مثال: ايميل@example.com"
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
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className="space-y-1 relative"
                  >
                    <FieldLabel
                      htmlFor="medicine-name"
                      className="flex items-center gap-1"
                    >
                      <Package className="h-4 w-4 text-muted-foreground" />
                      كلمة المرور
                    </FieldLabel>
                    <Input
                      id="password"
                      type={visiblePassword ? "text" : "password"}
                      placeholder="مثال: 123456789"
                      className={`h-10 ${fieldState.invalid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      aria-invalid={fieldState.invalid}
                      {...field}
                    />

                    <Button
                      variant={"link"}
                      type="button"
                      onClick={() => setVisiblePassword(!visiblePassword)}
                      className="absolute   -left-[44%] top-[50px] h-4 w-4  cursor-pointer"
                    >
                      {visiblePassword ? (
                        <Eye aria-hidden={visiblePassword} />
                      ) : (
                        <EyeOff aria-hidden={visiblePassword} />
                      )}
                    </Button>

                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex justify-end gap-2  p-6">
            <Button
              type="submit"
              form="create-medicine-form"
              className="h-10 gap-2"
            >
              <Save className="h-4 w-4" />
              تسجيل الدخول
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => nav("/store")}
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
