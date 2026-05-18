import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
} from "@/apis/reports";
import { useAtom } from "jotai";
import { queryTableAtom } from "@/atoms";

export const useReports = (search = "") => {
  const [tableState] = useAtom(queryTableAtom);

  return useQuery({
    queryKey: ["reports", tableState.page, tableState.limit, search],
    queryFn: () => getReports(tableState.page, tableState.limit, search),
  });
};

export const useReport = (id?: string) => {
  return useQuery({
    queryKey: ["reports", id],
    queryFn: () => getReportById(id!),
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("تم إنشاء التقرير بنجاح");
    },
    onError: (error: any) => {
      toast.error("فشل في إنشاء التقرير", {
        description: error.data?.message || error.message,
      });
    },
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReportFormValues }) =>
      updateReport(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["reports", variables.id] });
      toast.success("تم تحديث التقرير بنجاح");
    },
    onError: (error: any) => {
      toast.error("فشل في تحديث التقرير", {
        description: error.data?.message || error.message,
      });
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("تم حذف التقرير بنجاح");
    },
    onError: (error: any) => {
      toast.error("فشل في حذف التقرير", {
        description: error.data?.message || error.message,
      });
    },
  });
};
