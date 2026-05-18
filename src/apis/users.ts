import { apiClient } from "@/lib/api-clients";

/**
 * Fetch medicines with optional query parameters (search, pagination)
 * @param queryString - URL query string (e.g., "search=pain&page=1&limit=10")
 */

export const getUsers = async (queryString?: string) => {
  const response = await apiClient<ApiResponse>({
    url: `/users${queryString ? `?${queryString}` : ""}`,
    method: "GET",
    auth: true,
  });
  return response;
};

export const getUser = async (id: string) => {
  const response = await apiClient<UserType>({
    url: `/users/${id}`,
    method: "GET",
    auth: true,
  });
  return response;
};

export const createUser = async (data: InputUser) => {
  try {
    const response = await apiClient<InputUser>({
      url: "/users",
      method: "POST",
      auth: true,
      data,
    });
    return response;
  } catch (error) {
    console.error("Create User Error:", error);
    throw error;
  }
};

export const updateUser = async (id: string, data: InputUser) => {
  try {
    const response = await apiClient<InputUser>({
      url: `/users/${id}`,
      method: "PUT",
      auth: true,
      data,
    });
    return response;
  } catch (error) {
    console.error("Update User Error:", error);
    throw error;
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await apiClient<{
      success: boolean;
      message: string;
    }>({
      url: `/users/${id}`,
      method: "DELETE",
      auth: true,
    });

    return response;
  } catch (error) {
    console.error("Delete User Error:", error);
    throw error;
  }
};
