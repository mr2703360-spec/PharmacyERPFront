// Define specific permission strings as a union type for better type safety
type Permission =
  | "view_dashboard"
  | "view_store"
  | "create_store"
  | "update_store"
  | "delete_store"
  | "view_category"
  | "create_category"
  | "update_category"
  | "delete_category"
  | "view_supplier"
  | "create_supplier"
  | "update_supplier"
  | "delete_supplier"
  | "view_sale"
  | "create_sale"
  | "update_sale"
  | "delete_sale"
  | "view_profile"
  | "update_profile"
  | "view_users"
  | "create_user"
  | "update_user"
  | "delete_user"
  | "view_purchase"
  | "create_purchase"
  | "update_purchase"
  | "delete_purchase";

interface User {
  _id: string;
  name: string;
  image: string;
  email: string;
  permissions: Permission[];
  isActive: boolean;
  role: string; // Could be narrowed to 'admin' | ... if more roles exist
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
}

interface AuthResponse {
  token: string; // JWT string
  user: User;
}
