import { apiClient } from "@/lib/api-clients";

export const getNotifications = async () => {
  const response = await apiClient<NotificationResponse>({
    url: "/notifications",
    method: "GET",
    auth: true,
  });
  return response.data;
};

export const markAsRead = async (id: string) => {
  const response = await apiClient<{ success: boolean; data: NotificationType }>({
    url: `/notifications/${id}/read`,
    method: "PATCH",
    auth: true,
  });
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await apiClient<{ success: boolean; message: string }>({
    url: "/notifications/read-all",
    method: "PATCH",
    auth: true,
  });
  return response;
};

export const deleteNotification = async (id: string) => {
  const response = await apiClient<{ success: boolean; message: string }>({
    url: `/notifications/${id}`,
    method: "DELETE",
    auth: true,
  });
  return response;
};
