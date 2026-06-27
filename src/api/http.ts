/**
 * Orval custom fetch mutator  –  src/api/http.ts
 *
 * Orval calls: customInstance<T>(url: string, options?: RequestInit)
 * We inject the base URL and auth token here.
 */

const BASE_URL =
  (import.meta as unknown as { env: Record<string, string> }).env
    ?.VITE_API_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: unknown;

  constructor(
    status: number,
    statusText: string,
    body: unknown,
  ) {
    super(`${status} ${statusText}`);
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.name = "ApiError";
  }
}

export const customInstance = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  let token = null;
  if (typeof localStorage !== "undefined") {
    const rawToken = localStorage.getItem("token");
    if (rawToken) {
      try {
        // Jotai's atomWithStorage stores strings with JSON.stringify, so we need to parse it
        token = JSON.parse(rawToken);
      } catch {
        token = rawToken;
      }
    }
  }

  const authHeader: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...authHeader,
      ...(options?.headers as Record<string, string>),
    },
  });

  let responseBody: unknown;
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    responseBody = await response.json();
  } else {
    responseBody = await response.text();
  }

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, responseBody);
  }

  return {
    data: responseBody,
    status: response.status,
    headers: response.headers,
  } as unknown as T;
};

export default customInstance;
