 interface Supplier {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  paymentType: "نقدي" | "آجل"; // e.g. "آجل" or "Cash"
  notes: string;
  status: "active" | "inactive"; // restrict to known values
  outstandingBalance: number;
  lastOrder: string | null; // could be an ObjectId or null
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

interface InputSupplier {
  name: string;
  phone: string;
  email: string;
  address: string;
  paymentType: "نقدي" | "آجل";
  notes: string;
  status: "active" | "inactive";
}
