import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  useGetUsers,
  useGetUserById,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  getGetUsersQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateUserRequest, UpdateUserRequest } from "@/api";

export interface UsersQueryParams {
  search: string;
  page: number;
  limit: number;
}

export const useUsersQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });

  return {
    query: query as UsersQueryParams,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10 }),
  };
};

export const useUsers = () => {
  const { query } = useUsersQueryFilterState();
  return useGetUsers({
    search: query.search || undefined,
    page: query.page,
    limit: query.limit,
  });
};

export const useUser = (id: string) => {
  return useGetUserById(id, { query: { enabled: !!id } });
};

export const useCreateUserAction = () => {
  const queryClient = useQueryClient();
  return useCreateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });
        toast.success("تم إضافة المستخدم بنجاح");
      },
      onError: () => toast.error("فشل في إضافة المستخدم"),
    },
  });
};

export const useUpdateUserAction = () => {
  const queryClient = useQueryClient();
  return useUpdateUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });
        toast.success("تم تحديث المستخدم بنجاح");
      },
      onError: () => toast.error("فشل في تحديث المستخدم"),
    },
  });
};

export const useDeleteUserAction = () => {
  const queryClient = useQueryClient();
  return useDeleteUser({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUsersQueryKey() });
        toast.success("تم حذف المستخدم بنجاح");
      },
      onError: () => toast.error("فشل في حذف المستخدم"),
    },
  });
};

export type { CreateUserRequest, UpdateUserRequest };
