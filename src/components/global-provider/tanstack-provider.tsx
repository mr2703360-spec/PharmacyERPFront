import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// eslint-disable-next-line react-refresh/only-export-components
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
    mutations: {
      retry: false,
    },
  },
});

type Props = {
  children: React.ReactNode;
};

export function TanstackProvider({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.VITE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
