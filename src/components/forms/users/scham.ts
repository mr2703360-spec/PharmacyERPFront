import { z } from "zod";

export const PERMISSIONS = [
  "view_dashboard",
  "view_store",
  "create_store",
  "update_store",
  "delete_store",
  "view_category",
  "create_category",
  "update_category",
  "delete_category",
  "view_supplier",
  "create_supplier",
  "update_supplier",
  "delete_supplier",
  "view_sale",
  "create_sale",
  "update_sale",
  "delete_sale",
  "view_profile",
  "update_profile",
  "view_users",
  "create_user",
  "update_user",
  "delete_user",
  "view_purchase",
  "create_purchase",
  "update_purchase",
  "delete_purchase",
] as const;

export const ROLES = ["admin", "pharmacist", "cashier"] as const;

export const UserSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .optional()
    .or(z.literal("")),
  image: z.instanceof(FileList).optional().or(z.null()),
  role: z.enum(ROLES),
  isActive: z.boolean().default(true),
  permissions: z
    .array(z.enum(PERMISSIONS))
    .min(1, "يجب اختيار صلاحية واحدة على الأقل"),
});

export type UserForm = z.infer<typeof UserSchema>;

