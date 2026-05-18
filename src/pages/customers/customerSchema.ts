import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "اسم العميل مطلوب"),
  phone: z.string().min(1, "رقم الهاتف مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صالح").or(z.literal("")).optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  outstandingBalance: z.number().min(0, "الرصيد لا يمكن أن يكون سالباً").optional(),
  isVIP: z.boolean().optional(),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
