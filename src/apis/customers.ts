import { apiClient } from "@/lib/api-clients";

export const getCustomers = async (queryString?: string) => {
  const response = await apiClient<ApiResponse>({
    url: `/customers${queryString ? `?${queryString}` : ""}`,
    method: "GET",
    auth: true,
  });
  return response;
};

export const getCustomer = async (id: string) => {
  const response = await apiClient<{ data: Customer }>({
    url: `/customers/${id}`,
    method: "GET",
    auth: true,
  });
  return response.data;
};

export const createCustomer = async (data: InputCustomer) => {
  try {
    const response = await apiClient<ApiResponse>({
      url: "/customers",
      method: "POST",
      auth: true,
      data,
    });
    return response.data;
  } catch (error) {
    console.error("Create Customer Error:", error);
    throw error;
  }
};

export const updateCustomer = async (id: string, data: InputCustomer) => {
  try {
    const response = await apiClient<ApiResponse>({
      url: `/customers/${id}`,
      method: "PUT",
      auth: true,
      data,
    });
    return response;
  } catch (error) {
    console.error("Update Customer Error:", error);
    throw error;
  }
};

export const deleteCustomer = async (id: string) => {
  try {
    const response = await apiClient<ApiResponse>({
      url: `/customers/${id}`,
      method: "DELETE",
      auth: true,
    });
    return response;
  } catch (error) {
    console.error("Delete Error:", error);
    throw error;
  }
};

export const toggleCustomerStatus = async (id: string, status: string) => {
  const response = await apiClient<ApiResponse>({
    url: `/customers/${id}/status`,
    method: "PATCH",
    auth: true,
    data: { status },
  });
  return response;
};
