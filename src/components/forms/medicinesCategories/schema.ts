import z from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "اسم التصنيف يجب أن يكون حرفين على الأقل" })
    .max(50, { message: "اسم التصنيف لا يتجاوز 50 حرفاً" }),
  description: z
    .string()
    .min(1, { message: "الوصف مطلوب" })
    .max(200, { message: "الوصف لا يتجاوز 200 حرف" }),
});

 export type CategoryFormValues = z.infer<typeof categorySchema>;   