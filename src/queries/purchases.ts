import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  useGetPurchases,
  useGetPurchaseById,
  useCreatePurchase,
  useUpdatePurchase,
  useDeletePurchase,
  getGetPurchasesQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreatePurchaseRequest, UpdatePurchaseRequest, GetPurchasesPaymentStatus } from "@/api";

export interface PurchasesQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  paymentStatus?: string;
}

export const usePurchasesQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    paymentStatus: parseAsString.withDefault("all"),
  });

  return {
    query: query as Required<PurchasesQueryParams>,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    setPaymentStatus: (paymentStatus: string) => setQuery({ paymentStatus, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10, paymentStatus: "all" }),
  };
};

export const usePurchases = () => {
  const { query } = usePurchasesQueryFilterState();
  return useGetPurchases({
    search: query.search || undefined,
    page: query.page,
    limit: query.limit,
    paymentStatus: query.paymentStatus !== "all" ? (query.paymentStatus as GetPurchasesPaymentStatus) : undefined,
  });
};

export const usePurchase = (id: string) => {
  return useGetPurchaseById(id, { query: { enabled: !!id } });
};

export const useCreatePurchaseAction = () => {
  const queryClient = useQueryClient();
  return useCreatePurchase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPurchasesQueryKey() });
        toast.success("تم إنشاء أمر الشراء بنجاح");
      },
      onError: () => toast.error("فشل في إنشاء أمر الشراء"),
    },
  });
};

export const useUpdatePurchaseAction = () => {
  const queryClient = useQueryClient();
  return useUpdatePurchase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPurchasesQueryKey() });
        toast.success("تم تحديث أمر الشراء بنجاح");
      },
      onError: () => toast.error("فشل في تحديث أمر الشراء"),
    },
  });
};

export const useDeletePurchaseAction = () => {
  const queryClient = useQueryClient();
  return useDeletePurchase({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPurchasesQueryKey() });
        toast.success("تم حذف أمر الشراء بنجاح");
      },
      onError: () => toast.error("فشل في حذف أمر الشراء"),
    },
  });
};

export type { CreatePurchaseRequest, UpdatePurchaseRequest };
