import {
  useGetReports,
  useGetReportById,
  useCreateReport,
  useUpdateReport,
  useDeleteReport,
  getGetReportsQueryKey,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import type { CreateReportRequest, UpdateReportRequest } from "@/api";

export interface ReportsQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const useReportsQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });

  return {
    query: query as Required<ReportsQueryParams>,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10 }),
  };
};

export const useReports = (search = "") => {
  const { query } = useReportsQueryFilterState();
  return useGetReports({
    search: search || query.search || undefined,
    page: query.page,
    limit: query.limit,
  });
};

export const useReport = (id?: string) => {
  return useGetReportById(id!, { query: { enabled: !!id } });
};

export const useCreateReportAction = () => {
  const queryClient = useQueryClient();
  return useCreateReport({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetReportsQueryKey() });
        toast.success("تم إنشاء التقرير بنجاح");
      },
      onError: (error: unknown) => {
        const err = error as { data?: { message?: string }; message?: string };
        toast.error("فشل في إنشاء التقرير", {
          description: err?.data?.message || err?.message,
        });
      },
    },
  });
};

export const useUpdateReportAction = () => {
  const queryClient = useQueryClient();
  return useUpdateReport({
    mutation: {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: getGetReportsQueryKey() });
        queryClient.invalidateQueries({
          queryKey: [`/api/reports/${variables.id}`],
        });
        toast.success("تم تحديث التقرير بنجاح");
      },
      onError: (error: unknown) => {
        const err = error as { data?: { message?: string }; message?: string };
        toast.error("فشل في تحديث التقرير", {
          description: err?.data?.message || err?.message,
        });
      },
    },
  });
};

export const useDeleteReportAction = () => {
  const queryClient = useQueryClient();
  return useDeleteReport({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetReportsQueryKey() });
        toast.success("تم حذف التقرير بنجاح");
      },
      onError: () => toast.error("فشل في حذف التقرير"),
    },
  });
};

export type { CreateReportRequest, UpdateReportRequest };
