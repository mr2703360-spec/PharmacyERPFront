 interface Medicine {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  expiryDate: string;
  supplier: string;
  stockAlert: "متاح" | "قرب النفاد" | "غير متاح";
}
