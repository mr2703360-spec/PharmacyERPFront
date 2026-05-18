import z from "zod";



export const supplierSchema = z.object({
  address: z
    .string({ error: "العنوان مطلوب" })
    .min(2, "يجب أن يكون العنوان على الأقل حرفين"),
  lastOrder: z.date({ error: "تاريخ آخر الطلب مطلوب" }).nullable(),
  email: z.string({ error: "البريد الإلكتروني مطلوب" }).email("يجب أن يكون البريد الإلكتروني صحيحًا"),
  phone: z.string({ error: "رقم الهاتف مطلوب" }).min(10, "يجب أن يكون رقم الهاتف على الأقل 10 أرقام"),
  status: z.string({ error: "الحالة مطلوبة" }).min(1, "يرجى اختيار الحالة"),
  notes: z.string({ error: "التعليقات مطلوبة" }),
  outstandingBalance: z.number({ error: "الرصيد المتبقي مطلوب" }).min(0, "يجب أن يكون الرصيد المتبقي أكبر من أو يساوي صفرًا"),
  paymentType: z.string({ error: "نوع الدفع مطلوب" }).min(1, "يرجى اختيار نوع الدفع"),
  name: z.string({ error: "الاسم مطلوب" }).min(2, "يجب أن يكون الاسم على الأقل حرفين"),
})

export type SupplierForm = z.infer<typeof supplierSchema>;
