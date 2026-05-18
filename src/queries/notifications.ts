import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from "@/apis/notifications";
import { useAtom } from "jotai";
import { notificationsAtom } from "@/atoms";
import { useEffect } from "react";

export const useNotifications = () => {
  const [notifications, setNotifications] = useAtom(notificationsAtom);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const data = await getNotifications();
      return data;
    },
    refetchInterval: 30000, // Poll every 30 seconds
  });

  useEffect(() => {
    if (query.data) {
      setNotifications(query.data);
    }
  }, [query.data, setNotifications]);

  const markReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
