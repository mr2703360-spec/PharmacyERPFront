import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 2,
  }).format(price);
};

export function filterData<T>(data: T[], search: string, keys: (keyof T)[]) {
  if (!Array.isArray(data)) return [];
  if (!search) return data;

  const lowerSearch = search.toLowerCase();

  return data.filter((item) =>
    keys.some((key) =>
      String(item?.[key] ?? "")
        .toLowerCase()
        .includes(lowerSearch),
    ),
  );
}

export const formatDateForInput = (dateValue?: string | Date) => {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return date.toISOString().split("T")[0];
};
