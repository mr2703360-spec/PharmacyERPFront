interface Customer {
  id: string | number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  type?: "individual" | "clinic" | "hospital" | "company";
  creditLimit?: number;
  currentBalance?: number;
  status?: "active" | "inactive";
  notes?: string;
}

type PaymentMethod = "cash" | "card" | "transfer" | "cheque" | "insurance" | "other";

type PaymentStatus = "paid" | "partial" | "unpaid";

interface InvoiceItem {
  id: string;
  invoiceId: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: Customer["id"];
  customerName: string;
  supplierId?: Supplier["id"];
  totalBeforeDiscount: number;
  discount: number;
  tax: number;
  totalAfterTax: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
}

interface Payment {
  id: string;
  invoiceId: Invoice["id"];
  date: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
}

 interface SaleRow {
  _id: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt?: string;
  updatedAt?: string;
  _v: number;
}
