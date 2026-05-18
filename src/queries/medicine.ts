import { getMedicine, getMedicines } from "@/apis/medicines";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { useAsyncRetry } from "react-use";

export interface MedicineQueryParams {
  search: string;
  page: number;
  limit: number;
}

export const useMedicineQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });

  return {
    query: query as MedicineQueryParams,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10 }),
  };
};

export const buildQueryString = (
  params: Partial<MedicineQueryParams>,
): string => {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
};

export const useMedicines = () => {
  const { query } = useMedicineQueryFilterState();
  const queryString = buildQueryString(query);
  return useQuery({
    queryKey: ["medicines", query],
    queryFn: () => getMedicines(queryString),
  });
};

export const useMedicine = (id: string) => {
  return useAsyncRetry(async () => {
    if (!id) return null;
    const result = await getMedicine(id);
    return result;
  });
};
