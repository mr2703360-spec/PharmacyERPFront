interface NotificationType {
  _id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  recipient: string | null;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationResponse {
  success: boolean;
  data: NotificationType[];
}
