import { merge } from "lodash-es";
import NProgress from "nprogress";
import { ofetch } from "ofetch";

// Configure NProgress
NProgress.configure({ showSpinner: false });

type options = {
  url?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  retry?: number;
  timeout?: number;
  headers?: HeadersInit;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  auth?: boolean;
};

/**
 * Makes an HTTP request to the specified URL with the given options.
 *
 * @param options - The options for the request.
 * @param options.url - The URL for the request. If not provided, it defaults to the VITE_API_URL environment variable.
 * @param options.method - The HTTP method for the request. Defaults to "GET".
 * @param options.retry - The number of times to retry the request on failure. Defaults to 2.
 * @param options.timeout - The timeout for the request in milliseconds. Defaults to 10000.
 * @returns A promise that resolves to the response data.
 */
export const apiClient = async <T>(options: options): Promise<T> => {
  try {
    const {
      url,
      method = "GET",
      retry = 0,
      timeout = 10000,
      data = undefined,
      auth = true,
    } = options;

    const baseURL = url?.includes("http")
      ? url
      : import.meta.env.VITE_API_URL + url?.replace(/^\//, "");

    if (!baseURL) {
      throw new Error("Base URL is required");
    }

    let headers: HeadersInit = {};

    if (auth) {
      const token = localStorage.getItem("token");

      if (!token || token === "null" || token === '"null"') {
        throw new Error("Token is required");
      }

      headers.Authorization = "Bearer " + token.replace(/"/g, "");
    }

    if (options.headers) {
      headers = merge(headers,options.headers);
    }

    const response = await ofetch<T>(baseURL, {
      method,
      headers,
      retry,
      timeout,
      ...(data && { body: data }),
      onRequest: () => {
        NProgress.start();
      },
      onResponse: () => {
        NProgress.done();
      },
    });

    return response;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};
