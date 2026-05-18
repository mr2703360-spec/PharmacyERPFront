import z from "zod";

export const medicineSchema = z.object({
  name: z
    .string({ error: "اسم المنتج مطلوب" })
    .min(2, "يجب أن يكون الاسم على الأقل حرفين"),

  category: z.string({ error: "الفئة مطلوبة" }).min(1, "يرجى اختيار الفئة"),

  quantity: z.coerce
    .number({ error: "الكمية مطلوبة" })
    .int("يجب أن تكون الكمية عدداً صحيحاً")
    .min(0, "لا يمكن أن تكون الكمية سالبة"),

  price: z.coerce
    .number({ error: "السعر مطلوب" })
    .min(0.01, "يجب أن يكون السعر أكبر من صفر"),
  image: z
    .union([
      z.instanceof(FileList).refine((f) => f.length > 0, "يرجى اختيار صورة"),
      z.string().min(1),
    ])
    .optional(),
  expiryDate: z
    .string({ error: "تاريخ الانتهاء مطلوب" })
    .min(1, "يرجى إدخال تاريخ الانتهاء")
    .refine(
      (val) => new Date(val) > new Date(),
      "يجب أن يكون تاريخ الانتهاء في المستقبل",
    ),

  supplier: z
    .string({ error: "اسم المورد مطلوب" })
    .min(2, "يجب أن يكون اسم المورد على الأقل حرفين"),

  storeStatus: z
    .string({ error: "حالة المخزون مطلوبة" })
    .min(1, "يرجى اختيار حالة المخزون"),
});
  
export type MedicineForm = z.infer<typeof medicineSchema>;
