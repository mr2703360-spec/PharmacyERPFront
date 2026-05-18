interface PurchaseItem {
  productId: string;
  productName?: string; // populated from Medicines
  quantity: number;
  purchasePrice: number;
  batchNumber: string;
  expiryDate: string;
  subtotal: number;
}

type PurchasePaymentStatus = "Paid" | "Partial" | "Unpaid";

interface PurchaseRow {
  _id: string;
  invoiceNumber: string;
  supplierId: string | Supplier;
  items: PurchaseItem[];
  discount: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PurchasePaymentStatus;
  purchaseDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

interface InputPurchase {
  invoiceNumber: string;
  supplierId: string;
  items: PurchaseItem[];
  discount: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PurchasePaymentStatus;
  purchaseDate: string;
  notes?: string;
}
