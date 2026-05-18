import { apiClient } from "@/lib/api-clients";

interface LoginResponse {
  token: string;
  user: User;
}

export const Login = async (email: string, password: string) => {
  return await apiClient<LoginResponse>({
    url: "/auth/login",
    method: "POST",
    auth: false,
    data: { email, password },
  });
};

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  return await apiClient({
    url: "/auth/register",
    method: "POST",
    data: { name, email, password },
  });
};

export const logout = async () => {
  return await apiClient({
    url: "/auth/logout",
    method: "POST",
  });
};

export const getMe = async (): Promise<{ user: User }> => {
  return await apiClient({
    url: "/auth/me",
    method: "GET",
    auth: true,
  });
};
