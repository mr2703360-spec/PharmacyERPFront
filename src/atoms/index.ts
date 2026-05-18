import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export const countAtom = atom(0);

export const userAtom = atom<AuthResponse | null>(null);
export const tokenAtom = atomWithStorage<string | null>("token", null);
export const currentUserAtom = atomWithStorage<User | null>("current_user", null);

export const queryTableAtom = atom<QueryTableType>({
  page: 1,
  limit: DEFAULT_PAGE_SIZE,
});

export const notificationsAtom = atom<NotificationType[]>([]);
export const unreadNotificationsCountAtom = atom((get) => 
  get(notificationsAtom).filter(n => !n.isRead).length
);
