import { apiClient } from "@/lib/api-clients";

export const getPurchases = async (queryString?: string) => {
  const response = await apiClient<ApiResponse>({
    url: `/purchases${queryString ? `?${queryString}` : ""}`,
    method: "GET",
    auth: true,
  });
  return response;
};

export const getPurchase = async (id: string) => {
  const response = await apiClient<{ success: boolean; data: PurchaseRow }>({
    url: `/purchases/${id}`,
    method: "GET",
    auth: true,
  });
  return response.data;
};

export const createPurchase = async (data: InputPurchase) => {
  try {
    const response = await apiClient<{
      success: boolean;
      message: string;
      data: PurchaseRow;
    }>({
      url: "/purchases",
      method: "POST",
      auth: true,
      data,
    });
    return response;
  } catch (error) {
    console.error("Create Purchase Error:", error);
    throw error;
  }
};

export const updatePurchase = async (id: string, data: Partial<InputPurchase>) => {
  try {
    const response = await apiClient<{
      success: boolean;
      message: string;
      data: PurchaseRow;
    }>({
      url: `/purchases/${id}`,
      method: "PATCH",
      auth: true,
      data,
    });
    return response;
  } catch (error) {
    console.error("Update Purchase Error:", error);
    throw error;
  }
};

export const deletePurchase = async (id: string) => {
  try {
    const response = await apiClient<{ success: boolean; message: string }>({
      url: `/purchases/${id}`,
      method: "DELETE",
      auth: true,
    });
    return response;
  } catch (error) {
    console.error("Delete Purchase Error:", error);
    throw error;
  }
};
