import { getSuppliers, getSupplier } from "@/apis/suppliers";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export interface SupplierQueryParams {
  search: string;
  page: number;
  limit: number;
  paymentType: string; 
}

export const useSupplierQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    paymentType: parseAsString.withDefault("all"),
  });

  return {
    query: query as SupplierQueryParams,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    setPaymentType: (paymentType: string) => setQuery({ paymentType, page: 1 }),
    resetFilters: () =>
      setQuery({ search: "", page: 1, limit: 10, paymentType: "all" }),
  };
};

export const buildQueryString = (
  params: Partial<SupplierQueryParams>,
): string => {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.paymentType && params.paymentType !== "all")
    searchParams.set("paymentType", params.paymentType);
  return searchParams.toString();
};

export const useSuppliers = () => {
  const { query } = useSupplierQueryFilterState();
  const queryString = buildQueryString(query);
  return useQuery({
    queryKey: ["suppliers", query], // fixed key
    queryFn: () => getSuppliers(queryString),
  });
};

// Optional: fetch single supplier (use useQuery instead of useAsyncRetry)
export const useSupplier = (id: string) => {
  return useQuery({
    queryKey: ["supplier", id],
    queryFn: () => getSupplier(id),
    enabled: !!id,
  });
};
