import { apiClient } from "@/lib/api-clients";

export interface StatsData {
  totalRevenue: number;
  revenueChange: number;
  revenueLastMonth: number;
  salesToday: number;
  totalMedicines: number;
  outOfStockCount: number;
  lowStockCount: number;
  totalSuppliers: number;
  totalUsers: number;
  recentSales: {
    _id: string;
    invoiceNumber: string;
    customerName: string;
    medicineName: string;
    total: number;
    paymentMethod: string;
    date: string;
  }[];
  lowStockItems: {
    _id: string;
    name: string;
    quantity: number;
  }[];
}

export const getStats = async (): Promise<{ success: boolean; data: StatsData }> => {
  return apiClient({
    url: "/stats",
    method: "GET",
    auth: true,
  });
};
