import {
  useGetNotifications,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useDeleteNotification,
  getGetNotificationsQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { notificationsAtom } from "@/atoms";
import { useEffect } from "react";

export const useNotifications = () => {
  const [notifications, setNotifications] = useAtom(notificationsAtom);
  const queryClient = useQueryClient();

  const query = useGetNotifications({
    query: {
      refetchInterval: 30000, // Poll every 30 seconds
      select: (data) => data,
    },
  });

  useEffect(() => {
    if (query.data && "data" in query.data && query.data.status === 200) {
      const notifData = query.data.data as any;
      if (notifData?.data && Array.isArray(notifData.data)) {
        setNotifications(notifData.data);
      } else if (notifData?.notifications && Array.isArray(notifData.notifications)) {
        setNotifications(notifData.notifications);
      }
    }
  }, [query.data, setNotifications]);

  const markReadMutation = useMarkNotificationAsRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
      },
    },
  });

  const markAllReadMutation = useMarkAllNotificationsAsRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
      },
    },
  });

  const deleteMutation = useDeleteNotification({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetNotificationsQueryKey() });
      },
    },
  });

  return {
    query,
    notifications,
    markReadMutation,
    markAllReadMutation,
    deleteMutation,
  };
};
