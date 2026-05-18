
import { apiClient } from "@/lib/api-clients";

/**
 * Fetch medicines with optional query parameters (search, pagination)
 * @param queryString - URL query string (e.g., "search=pain&page=1&limit=10")
 */

export const getMedicinesCategories = async (queryString?: string) => {
  const response = await apiClient<ApiResponse>({
    url: `/medicinesCategories?${queryString ? `?${queryString}` : ""}`,
    method: "GET",
    auth: true,
  });
  return response;
};

export const getMedicineCategory = async (id: string) => {
  const response = await apiClient<{
    success: boolean;
    data: MedicineCategoriesType;
  }>({
    url: `/medicinesCategories/${id}`,
    method: "GET",
  });
  return response.data;
};

export const createMedicineCategory = async (data: InputCategory) => {
  try {
    const response = await apiClient<{
        success: boolean;
        data: MedicineCategoriesType;
    }>({
      url: "/medicinesCategories",
      method: "POST",
      auth: true,
      data,
    });
    return response.data;
  } catch (error) {
    console.error("Create Medicine Category Error:", error);
    throw error;
  }
};

export const updateMedicineCategory = async (id: string, data: InputCategory) => {
  try {
    const response = await apiClient<{success:boolean,data:MedicineCategoriesType}>({
      url: `/medicinesCategories/update/${id}`,
      method: "PUT",
      auth: true,
      data,
    });
    return response.data;
  } catch (error) {
    console.error("Update Medicine Category Error:", error);
    throw error;
  }
};

export const deleteMedicineCategory = async (id: string) => {
  try {
    const response = await apiClient<{
      success: boolean;
      message: string;
      data:MedicineCategoriesType
    }>({
      url: `/medicinesCategories/${id}`,
      method: "DELETE",
      auth: true,
    });

    return response;
  } catch (error) {
    console.error("Delete Medicine Category Error:", error);
    throw error;
  }
};
