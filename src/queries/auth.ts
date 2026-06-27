import { useGetMe } from "@/api";
import { useSetAtom } from "jotai";
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

  return useGetMe({
    query: {
      queryKey: ["me"],
      staleTime: 1000 * 60 * 5,    // 5 minutes
      refetchOnWindowFocus: true,   // sync when user switches back to the tab
      retry: false,                 // don't spam on 401
      select: (data) => {
        // data is of type getMeResponse — narrowed to the success case
        if ("data" in data && data.status === 200) {
          const user = (data.data as { user?: unknown }).user;
          if (user) setCurrentUser(user as Parameters<typeof setCurrentUser>[0]);
        }
        return data;
      },
    },
  });
};
