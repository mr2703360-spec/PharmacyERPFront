interface ReportType {
  _id: string;
  title: string;
  type: "Sales" | "Purchases" | "Inventory" | "Financial" | "Custom";
  description?: string;
  status: "Draft" | "Generated";
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ReportFormValues {
  title: string;
  type: "Sales" | "Purchases" | "Inventory" | "Financial" | "Custom";
  description?: string;
  status: "Draft" | "Generated";
  startDate?: string;
  endDate?: string;
}

interface ReportResponse {
  success: boolean;
  data: ReportType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface SingleReportResponse {
  success: boolean;
  data: ReportType;
}
