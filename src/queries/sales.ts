import { getSale, getSales } from "@/apis/sales";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useAsyncRetry } from "react-use";

export interface SalesQueryParams {
  search: string;
  page: number;
  limit: number;
}

export const useSalesQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });

  return {
    query: query as SalesQueryParams,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10 }),
  };
};

export const buildQueryString = (
  params: Partial<SalesQueryParams>,
): string => {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
};

export const useSales = () => {
  const { query } = useSalesQueryFilterState();
  const queryString = buildQueryString(query);
  return useQuery({
    queryKey: ["sales", query],
    queryFn: () => getSales(queryString),
  });
};

export const useSale = (id: string) => {
  return useAsyncRetry(async () => {
    if (!id) return null;
    const result = await getSale(id);
    return result;
  });
};

