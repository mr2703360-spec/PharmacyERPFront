// If you want strict typing for permissions (using the exact list)
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

// Main user type
interface User {
  _id: string;               // or ObjectId if using MongoDB driver
  name: string;
  email: string;
  permissions: Permission[]; // or simply string[] if you prefer loose typing
  isActive: boolean;
  role: string;              // could be union: 'admin' | 'manager' | etc.
  createdAt: string;         // ISO date string
  updatedAt: string;         // ISO date string
  __v: number;               // Mongoose version key
}

// If you prefer a type alias instead of interface
type UserType = {
  _id: string;
  name: string;
  email: string;
  image: string;
  permissions: string[];     // less strict, but still valid
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

interface InputUser {
  name: string;
  email: string;
  permissions: Permission[];
  isActive: boolean;
  role: string;
  password?: string;
  image?: any;
}
