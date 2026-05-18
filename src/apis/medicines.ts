import { apiClient } from "@/lib/api-clients";

/**
 * Fetch medicines with optional query parameters (search, pagination)
 * @param queryString - URL query string (e.g., "search=pain&page=1&limit=10")
 */

export const getMedicines = async (queryString?: string) => {
  const response = await apiClient<ApiResponse>({
    url: `/medicines${queryString ? `?${queryString}` : ""}`,
    method: "GET",
    auth: true,
  });
  return response;
};

export const getMedicine = async (id: string) => {
  const response = await apiClient<MedicineType>({
    url: `/medicines/${id}`,
    method: "GET",
    auth: true,
  });
  return response;
};

export const createMedicine = async (data: InputMedicine) => {
  try {
    const response = await apiClient<medicineResponse>({
      url: "/medicines",
      method: "POST",
      auth: true,
      data,
    });
    return response.data;
  } catch (error) {
    console.error("Create Medicine Error:", error);
    throw error;
  }
};

export const updateMedicine = async (id: string, data: InputMedicine) => {
  try {
    const response = await apiClient<InputMedicine>({
      url: `/medicines/${id}`,
      method: "PUT",
      auth: true,
      data,
    });
    return response;
  } catch (error) {
    console.error("Update Medicine Error:", error);
    throw error;
  }
};

export const deleteMedicine = async (id: string) => {
  try {
    const response = await apiClient<{
      success: boolean;
      message: string;
    }>({
      url: `/medicines/${id}`,
      method: "DELETE",
      auth: true,
    });

    return response;
  } catch (error) {
    console.error("Delete Error:", error);
    throw error;
  }
};
