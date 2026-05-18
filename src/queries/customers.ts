import { getCustomers, getCustomer } from "@/apis/customers";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

export interface CustomerQueryParams {
  search: string;
  page: number;
  limit: number;
  isVIP: string; 
}

export const useCustomerQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    isVIP: parseAsString.withDefault("all"),
  });

  return {
    query: query as CustomerQueryParams,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    setIsVIP: (isVIP: string) => setQuery({ isVIP, page: 1 }),
    resetFilters: () =>
      setQuery({ search: "", page: 1, limit: 10, isVIP: "all" }),
  };
};

export const buildQueryString = (
  params: Partial<CustomerQueryParams>,
): string => {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.isVIP && params.isVIP !== "all")
    searchParams.set("isVIP", params.isVIP);
  return searchParams.toString();
};

export const useCustomers = () => {
  const { query } = useCustomerQueryFilterState();
  const queryString = buildQueryString(query);
  return useQuery({
    queryKey: ["customers", query],
    queryFn: () => getCustomers(queryString),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomer(id),
    enabled: !!id,
  });
};
