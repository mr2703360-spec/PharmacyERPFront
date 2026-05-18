import { useQuery } from "@tanstack/react-query";
import { getStats } from "@/apis/stats";

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
