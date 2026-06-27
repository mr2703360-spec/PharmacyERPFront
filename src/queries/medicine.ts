import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  useGetMedicines,
  useGetMedicineById,
  useCreateMedicine,
  useUpdateMedicine,
  useDeleteMedicine,
  getGetMedicinesQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateMedicineRequest, UpdateMedicineRequest } from "@/api";

export interface MedicineQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const useMedicineQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });

  return {
    query: query as Required<MedicineQueryParams>,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10 }),
  };
};

export const useMedicines = () => {
  const { query } = useMedicineQueryFilterState();
  return useGetMedicines({
    search: query.search || undefined,
    page: query.page,
    limit: query.limit,
  });
};

export const useMedicine = (id: string) => {
  return useGetMedicineById(id, { query: { enabled: !!id } });
};

export const useCreateMedicineAction = () => {
  const queryClient = useQueryClient();
  return useCreateMedicine({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMedicinesQueryKey() });
        toast.success("تم إضافة الدواء بنجاح");
      },
      onError: () => toast.error("فشل في إضافة الدواء"),
    },
  });
};

export const useUpdateMedicineAction = () => {
  const queryClient = useQueryClient();
  return useUpdateMedicine({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMedicinesQueryKey() });
        toast.success("تم تحديث الدواء بنجاح");
      },
      onError: () => toast.error("فشل في تحديث الدواء"),
    },
  });
};

export const useDeleteMedicineAction = () => {
  const queryClient = useQueryClient();
  return useDeleteMedicine({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMedicinesQueryKey() });
        toast.success("تم حذف الدواء بنجاح");
      },
      onError: () => toast.error("فشل في حذف الدواء"),
    },
  });
};

export type { CreateMedicineRequest, UpdateMedicineRequest };
