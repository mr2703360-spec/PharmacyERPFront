
import { apiClient } from "@/lib/api-clients";


export const getSales = async (queryString?: string) => {
  const response = await apiClient<ApiResponse>({
    url: `/sales${queryString ? `?${queryString}` : ""}`,
    method: "GET",
    auth: true,
  });
  return response;
};

export const getSale = async (id: string) => {
  const response = await apiClient<{data:SaleRow}>({
    url: `/sales/${id}`,
    method: "GET",
    auth: true,
  });
  return response.data;
};

export const createSale = async (data: SaleRow) => {
  try {
    const response = await apiClient<{ message: string; data: SaleRow }>({
      url: "/sales",
      method: "POST",
      auth: true,
      data,
    });
    return response;
  } catch (error) {
    console.error("Create Sale Error:", error);
    throw error;
  }
};

export const updateSale = async (id: string, data: SaleRow) => {
  try {
    const response = await apiClient<{ message: string; data: SaleRow }>({
      url: `/sales/${id}`,
      method: "PUT",
      auth: true,
      data,
    });
    return response;
  } catch (error) {
    console.error("Update Sale Error:", error);
    throw error;
  }
};

export const deleteSale = async (id: string) => {
  try {
    const response = await apiClient<{
      success: boolean;
      message: string;
    }>({
      url: `/sales/${id}`,
      method: "DELETE",
      auth: true,
    });
    return response;
  } catch (error) {
    console.error("Delete Sale Error:", error);
    throw error;
  }
};
