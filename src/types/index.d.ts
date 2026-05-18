
interface PaginationQueryParams {
  page: number;
  limit: number;
}

interface MedicineType {
  _id: string;
  name: string;
  category: string;
  quantity: number;
  image: string;
  price: number;
  stockAlert: string;
  supplier: string;
  expiryDate: string;
  storeStatus: "Available" | "OutOfStock" | "Expired" | "Pending";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface medicineResponse {
  message: string;
  data: MedicineType[];
}

interface InputMedicine {
  _id?: string;
  name?: string;
  category: string;
  quantity: number;
  image: string;
  price: number;
  stockAlert: string;
  expiryDate: string;
  supplier: string;
  storeStatus: "Available" | "OutOfStock" | "Expired" | "Pending";
}

interface ApiResponse {
  success: boolean;
  data: T[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}


interface ApiResponseError {
  message: string;
}



