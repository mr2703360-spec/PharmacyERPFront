import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  useGetSales,
  useGetSaleById,
  useCreateSale,
  useUpdateSale,
  useDeleteSale,
  getGetSalesQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateSaleRequest, UpdateSaleRequest } from "@/api";

export interface SalesQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const useSalesQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });

  return {
    query: query as Required<SalesQueryParams>,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10 }),
  };
};

export const useSales = () => {
  const { query } = useSalesQueryFilterState();
  return useGetSales({
    search: query.search || undefined,
    page: query.page,
    limit: query.limit,
  });
};

export const useSale = (id: string) => {
  return useGetSaleById(id, { query: { enabled: !!id } });
};

export const useCreateSaleAction = () => {
  const queryClient = useQueryClient();
  return useCreateSale({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSalesQueryKey() });
        toast.success("تم إنشاء المبيعة بنجاح");
      },
      onError: () => toast.error("فشل في إنشاء المبيعة"),
    },
  });
};

export const useUpdateSaleAction = () => {
  const queryClient = useQueryClient();
  return useUpdateSale({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSalesQueryKey() });
        toast.success("تم تحديث المبيعة بنجاح");
      },
      onError: () => toast.error("فشل في تحديث المبيعة"),
    },
  });
};

export const useDeleteSaleAction = () => {
  const queryClient = useQueryClient();
  return useDeleteSale({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSalesQueryKey() });
        toast.success("تم حذف المبيعة بنجاح");
      },
      onError: () => toast.error("فشل في حذف المبيعة"),
    },
  });
};

export type { CreateSaleRequest, UpdateSaleRequest };
