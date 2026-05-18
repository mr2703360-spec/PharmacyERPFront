import { getPurchase, getPurchases } from "@/apis/purchases";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs";
import { useAsyncRetry } from "react-use";

export interface PurchasesQueryParams {
  search: string;
  page: number;
  limit: number;
  paymentStatus: string;
}

export const usePurchasesQueryFilterState = () => {
  const [query, setQuery] = useQueryStates({
    search: parseAsString.withDefault(""),
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    paymentStatus: parseAsString.withDefault("all"),
  });

  return {
    query: query as PurchasesQueryParams,
    setQuery,
    setSearch: (search: string) => setQuery({ search, page: 1 }),
    setPage: (page: number) => setQuery({ page }),
    setLimit: (limit: number) => setQuery({ limit, page: 1 }),
    setPaymentStatus: (paymentStatus: string) => setQuery({ paymentStatus, page: 1 }),
    resetFilters: () => setQuery({ search: "", page: 1, limit: 10, paymentStatus: "all" }),
  };
};

export const buildPurchasesQueryString = (
  params: Partial<PurchasesQueryParams>
): string => {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.paymentStatus && params.paymentStatus !== "all")
    searchParams.set("paymentStatus", params.paymentStatus);
  return searchParams.toString();
};

export const usePurchases = () => {
  const { query } = usePurchasesQueryFilterState();
  const queryString = buildPurchasesQueryString(query);
  return useQuery({
    queryKey: ["purchases", query],
    queryFn: () => getPurchases(queryString),
  });
};

export const usePurchase = (id: string) => {
  return useAsyncRetry(async () => {
    if (!id) return null;
    const result = await getPurchase(id);
    return result;
  }, [id]);
};
