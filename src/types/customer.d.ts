interface Customer {
  _id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: "active" | "inactive";
  outstandingBalance: number;
  isVIP: boolean;
  notes: string;
  lastVisit: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InputCustomer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  status?: "active" | "inactive";
  outstandingBalance?: number;
  isVIP?: boolean;
  notes?: string;
}
