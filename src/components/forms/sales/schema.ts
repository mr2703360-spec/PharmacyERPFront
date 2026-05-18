import z from "zod";

export const saleSchema = z.object({
  invoiceNumber: z
    .string({ error: "رقم الفاتورة مطلوب" })
    .min(1, "يرجى إدخال رقم الفاتورة"),
  date: z
    .string({ error: "تاريخ الفاتورة مطلوب" })
    .min(1, "يرجى إدخال تاريخ الفاتورة"),
    customerName: z
    .string({ error: "اسم العميل مطلوب" })
    .min(1, "يرجى إدخال اسم العميل"),
medicineName: z
    .string({ error: "اسم الدواء مطلوب" })
    .min(1, "يرجى إدخال اسم الدواء"),
  quantity: z.coerce
    .number({ error: "الكمية مطلوبة" })
    .int("يجب أن تكون الكمية عددًا صحيحًا")
    .min(1, "يجب أن تكون الكمية أكبر من صفر"),
  unitPrice: z.coerce
    .number({ error: "سعر الوحدة مطلوب" })
    .min(0.01, "يجب أن يكون السعر أكبر من صفر"),
  paymentMethod: z
    .string({ error: "طريقة الدفع مطلوبة" })
    .min(1, "يرجى اختيار طريقة الدفع"),
});

export type SaleForm = z.infer<typeof saleSchema>;
