import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  useGetSuppliers,
  useGetSupplierById,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  useToggleSupplierStatus,
  getGetSuppliersQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateSupplierRequest, UpdateSupplierRequest, ToggleStatusRequest, GetSuppliersPaymentType } from "@/api";

export interface SupplierQueryParams {
  search?: string;
  page?: number;
  limit?: number;
  paymentType?: string;
}

export const useSupplierQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    paymentType: parseAsString.withDefault("all"),
  });

  return {
    query: query as Required<SupplierQueryParams>,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    setPaymentType: (paymentType: string) => setQuery({ paymentType, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10, paymentType: "all" }),
  };
};

export const useSuppliers = () => {
  const { query } = useSupplierQueryFilterState();
  return useGetSuppliers({
    search: query.search || undefined,
    page: query.page,
    limit: query.limit,
    paymentType: query.paymentType !== "all" ? (query.paymentType as GetSuppliersPaymentType) : undefined,
  });
};

export const useSupplier = (id: string) => {
  return useGetSupplierById(id, { query: { enabled: !!id } });
};

export const useCreateSupplierAction = () => {
  const queryClient = useQueryClient();
  return useCreateSupplier({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSuppliersQueryKey() });
        toast.success("تم إضافة المورد بنجاح");
      },
      onError: () => toast.error("فشل في إضافة المورد"),
    },
  });
};

export const useUpdateSupplierAction = () => {
  const queryClient = useQueryClient();
  return useUpdateSupplier({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSuppliersQueryKey() });
        toast.success("تم تحديث المورد بنجاح");
      },
      onError: () => toast.error("فشل في تحديث المورد"),
    },
  });
};

export const useDeleteSupplierAction = () => {
  const queryClient = useQueryClient();
  return useDeleteSupplier({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSuppliersQueryKey() });
        toast.success("تم حذف المورد بنجاح");
      },
      onError: () => toast.error("فشل في حذف المورد"),
    },
  });
};

export const useToggleSupplierStatusAction = () => {
  const queryClient = useQueryClient();
  return useToggleSupplierStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSuppliersQueryKey() });
        toast.success("تم تغيير حالة المورد بنجاح");
      },
      onError: () => toast.error("فشل في تغيير حالة المورد"),
    },
  });
};

export type { CreateSupplierRequest, UpdateSupplierRequest, ToggleStatusRequest };
