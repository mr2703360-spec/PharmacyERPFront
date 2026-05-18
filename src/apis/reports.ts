import { apiClient } from "@/lib/api-clients";

export const getReports = async (page = 1, limit = 10, search = "") => {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search && { search }),
  }).toString();

  const response = await apiClient<ReportResponse>({
    url: `/reports?${query}`,
    method: "GET",
    auth: true,
  });
  return response;
};

export const getReportById = async (id: string) => {
  const response = await apiClient<SingleReportResponse>({
    url: `/reports/${id}`,
    method: "GET",
    auth: true,
  });
  return response.data;
};

export const createReport = async (data: ReportFormValues) => {
  const payload = {
    ...data,
    dateRange: {
      startDate: data.startDate,
      endDate: data.endDate,
    },
  };

  const response = await apiClient<SingleReportResponse>({
    url: "/reports",
    method: "POST",
    data: payload,
    auth: true,
  });
  return response.data;
};

export const updateReport = async (id: string, data: ReportFormValues) => {
  const payload = {
    ...data,
    dateRange: {
      startDate: data.startDate,
      endDate: data.endDate,
    },
  };

  const response = await apiClient<SingleReportResponse>({
    url: `/reports/${id}`,
    method: "PUT",
    data: payload,
    auth: true,
  });
  return response.data;
};

export const deleteReport = async (id: string) => {
  const response = await apiClient<{ success: boolean; message: string }>({
    url: `/reports/${id}`,
    method: "DELETE",
    auth: true,
  });
  return response;
};
