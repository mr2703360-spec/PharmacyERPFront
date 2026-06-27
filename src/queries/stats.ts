import { useGetStats } from "@/api";

export const useStats = () => {
  return useGetStats({
    query: {
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  });
};
