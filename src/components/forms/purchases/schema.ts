import { z } from "zod";

export const purchaseItemSchema = z.object({
  productId: z.string().min(1, "اختر منتجًا"),
  quantity: z.coerce.number().int().min(1, "الكمية يجب أن تكون 1 على الأقل"),
  purchasePrice: z.coerce.number().min(0, "سعر الشراء يجب أن يكون 0 أو أكثر"),
  batchNumber: z.string().min(1, "رقم الدُفعة مطلوب"),
  expiryDate: z.string().min(1, "تاريخ الانتهاء مطلوب"),
  subtotal: z.number().optional(),
});

export const purchaseSchema = z.object({
  invoiceNumber: z.string().min(1, "رقم الفاتورة مطلوب"),
  supplierId: z.string().min(1, "اختر موردًا"),
  items: z
    .array(purchaseItemSchema)
    .min(1, "يجب إضافة منتج واحد على الأقل"),
  discount: z.coerce.number().min(0).default(0),
  tax: z.coerce.number().min(0).default(0),
  paymentStatus: z.enum(["Paid", "Partial", "Unpaid"]).default("Unpaid"),
  purchaseDate: z.string().min(1, "تاريخ الشراء مطلوب"),
  notes: z.string().optional().default(""),
});

export type PurchaseFormValues = z.infer<typeof purchaseSchema>;
export type PurchaseItemValues = z.infer<typeof purchaseItemSchema>;
