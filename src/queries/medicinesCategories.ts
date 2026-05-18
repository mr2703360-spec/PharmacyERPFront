import { getMedicineCategory, getMedicinesCategories } from "@/apis/medicinesCategories";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

// import { useAsyncRetry } from "react-use";

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

export const buildQueryString = (
  params: Partial<MedicineCategoriesQueryParams>,
): string => {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
};

export const useMedicineCategories = () => {
  const { query } = useMedicineCategoriesQueryFilterState();
  const queryString = buildQueryString(query);
  return useQuery({
    queryKey: ["medicineCategories", query],
    queryFn: () => getMedicinesCategories(queryString),
  });
};


export const useMedicineCategoryById = (id: string) => {
  return useQuery({
    queryKey: ["medicineCategory", id],
    queryFn: () => getMedicineCategory(id),
  });
};