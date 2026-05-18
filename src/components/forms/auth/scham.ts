import z from "zod";

export const AuthSchema = z.object({
  email: z
    .string({ error: "البريد الإلكتروني مطلوب" })
    .min(2, "يجب أن يكون البريد الإلكتروني على الأقل حرفين"),
  password: z
    .string({ error: "كلمة المرور مطلوبة" })
    .min(8, "يجب أن تكون كلمة المرور على الأقل ثماني خانات"),
});

export type AuthForm = z.infer<typeof AuthSchema>;
