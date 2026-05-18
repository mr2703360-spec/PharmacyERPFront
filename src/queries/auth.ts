import { useQuery } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { getMe } from "@/apis/auth";
import { currentUserAtom } from "@/atoms";

/**
 * Fetches the current user's fresh data from the backend.
 * - Runs on mount and on every window focus (tab switch back).
 * - This is the permission-sync mechanism: if admin updates a user's
 *   permissions, the changes propagate within 5 minutes or on the
 *   next tab focus.
 */
export const useMe = () => {
  const setCurrentUser = useSetAtom(currentUserAtom);

  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const data = await getMe();
      setCurrentUser(data.user); // ← updates localStorage via atomWithStorage
      return data;
    },
    staleTime: 1000 * 60 * 5,   // 5 minutes
    refetchOnWindowFocus: true,  // sync when user switches back to the tab
    retry: false,                // don't spam on 401
  });
};
