import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  useGetCustomers,
  useGetCustomerById,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useToggleCustomerStatus,
  getGetCustomersQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateCustomerRequest, UpdateCustomerRequest, ToggleStatusRequest } from "@/api";

export interface CustomerQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  isVIP?: string;
}

export const useCustomerQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    isVIP: parseAsString.withDefault("all"),
  });

  return {
    query: query as Required<CustomerQueryParams>,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    setIsVIP: (isVIP: string) => setQuery({ isVIP, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10, isVIP: "all" }),
  };
};

export const useCustomers = () => {
  const { query } = useCustomerQueryFilterState();
  return useGetCustomers({
    search: query.search || undefined,
    page: query.page,
    limit: query.limit,
    isVIP: query.isVIP !== "all" ? (query.isVIP as "true" | "false") : undefined,
  });
};

export const useCustomer = (id: string) => {
  return useGetCustomerById(id, { query: { enabled: !!id } });
};

export const useCreateCustomerAction = () => {
  const queryClient = useQueryClient();
  return useCreateCustomer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });
        toast.success("تم إضافة العميل بنجاح");
      },
      onError: () => toast.error("فشل في إضافة العميل"),
    },
  });
};

export const useUpdateCustomerAction = () => {
  const queryClient = useQueryClient();
  return useUpdateCustomer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });
        toast.success("تم تحديث العميل بنجاح");
      },
      onError: () => toast.error("فشل في تحديث العميل"),
    },
  });
};

export const useDeleteCustomerAction = () => {
  const queryClient = useQueryClient();
  return useDeleteCustomer({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });
        toast.success("تم حذف العميل بنجاح");
      },
      onError: () => toast.error("فشل في حذف العميل"),
    },
  });
};

export const useToggleCustomerStatusAction = () => {
  const queryClient = useQueryClient();
  return useToggleCustomerStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCustomersQueryKey() });
        toast.success("تم تغيير حالة العميل بنجاح");
      },
      onError: () => toast.error("فشل في تغيير حالة العميل"),
    },
  });
};

export type { CreateCustomerRequest, UpdateCustomerRequest, ToggleStatusRequest };
