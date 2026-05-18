import { apiClient } from "@/lib/api-clients";

/**
 * Fetch suppliers   with optional query parameters (search, pagination)
 * @param queryString - URL query string (e.g., "search=pain&page=1&limit=10")
 */

export const getSuppliers = async (queryString?: string) => {
  const response = await apiClient<ApiResponse>({
    url: `/suppliers${queryString ? `?${queryString}` : ""}`,
    method: "GET",
    auth: true,
  });
  return response;
};

export const getSupplier = async (id: string) => {
  const response = await apiClient<{data:Supplier}>({
    url: `/suppliers/${id}`,
    method: "GET",
    auth: true,
  });
  return response.data;
};

export const createSupplier = async (data: InputSupplier) => {
  try {
    const response = await apiClient<ApiResponse>({
      url: "/suppliers",
      method: "POST",
      auth: true,
      data,
    });
    return response.data;
  } catch (error) {
    console.error("Create Supplier Error:", error);
    throw error;
  }
};

/**
 * Update a supplier by ID
 * @param id - Supplier ID
 * @param data - Supplier data to update
 */

export const updateSupplier = async (id: string, data: InputSupplier) => {
  try {
    const response = await apiClient<ApiResponse>({
      url: `/suppliers/${id}`,
      method: "PUT",
      auth: true,
      data,
    });
    return response;
  } catch (error) {
    console.error("Update Supplier Error:", error);
    throw error;
  }
};

export const deleteSupplier = async (id: string) => {
  try {
    const response = await apiClient<ApiResponse>({
      url: `/suppliers/${id}`,
      method: "DELETE",
      auth: true,
    });    
    return response;
  } catch (error) {
    console.error("Delete Error:", error);
    throw error;
  }
};


export const toggleSupplierStatus = async (id: string, status: string) => {
  const response = await apiClient<ApiResponse>({
    url: `/suppliers/${id}/status`,
    method: "PATCH",
    auth: true,
    data: { status },
  });
  return response;
};
