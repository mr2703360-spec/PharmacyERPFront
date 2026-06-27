import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import {
  useGetMedicineCategories,
  useGetMedicineCategoryById,
  useCreateMedicineCategory,
  useUpdateMedicineCategory,
  useDeleteMedicineCategory,
  getGetMedicineCategoriesQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CreateCategoryRequest } from "@/api";

export interface MedicineCategoriesQueryParams {
  search: string;
  page: number;
  limit: number;
}

export const useMedicineCategoriesQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });

  return {
    query: query as MedicineCategoriesQueryParams,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10 }),
  };
};

export const useMedicineCategories = () => {
  const { query } = useMedicineCategoriesQueryFilterState();
  return useGetMedicineCategories({
    search: query.search || undefined,
    page: query.page,
    limit: query.limit,
  });
};

export const useMedicineCategoryById = (id: string) => {
  return useGetMedicineCategoryById(id, { query: { enabled: !!id } });
};

export const useCreateMedicineCategoryAction = () => {
  const queryClient = useQueryClient();
  return useCreateMedicineCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMedicineCategoriesQueryKey() });
        toast.success("تم إضافة التصنيف بنجاح");
      },
      onError: () => toast.error("فشل في إضافة التصنيف"),
    },
  });
};

export const useUpdateMedicineCategoryAction = () => {
  const queryClient = useQueryClient();
  return useUpdateMedicineCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMedicineCategoriesQueryKey() });
        toast.success("تم تحديث التصنيف بنجاح");
      },
      onError: () => toast.error("فشل في تحديث التصنيف"),
    },
  });
};

export const useDeleteMedicineCategoryAction = () => {
  const queryClient = useQueryClient();
  return useDeleteMedicineCategory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMedicineCategoriesQueryKey() });
        toast.success("تم حذف التصنيف بنجاح");
      },
      onError: () => toast.error("فشل في حذف التصنيف"),
    },
  });
};

export type { CreateCategoryRequest };