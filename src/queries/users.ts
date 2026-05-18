import { getUser, getUsers } from "@/apis/users";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";

import { useAsyncRetry } from "react-use";

export interface UsersQueryParams {
  search: string;
  page: number;
  limit: number;
}

export const useUsersQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
  });

  return {
    query: query as UsersQueryParams,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10 }),
  };
};

export const buildQueryString = (params: Partial<UsersQueryParams>): string => {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());

  return searchParams.toString();
};

export const useUsers = () => {
  const { query } = useUsersQueryFilterState();
  const queryString = buildQueryString(query);
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => getUsers(queryString),
  });
};

export const useUser = (id: string) => {
  return useAsyncRetry(async () => {
    const result = await getUser(id);
    return result;
  });
};
