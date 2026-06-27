import { useMemo, useRef } from "react";
import { debounce } from "lodash-es";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/**
 * Reusable debounced search input.
 * Syncs with URL query params via the onChange callback (setSearch from filter state).
 * Debounces the URL update so typing feels instant while the query stays clean.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "بحث...",
  debounceMs = 500,
  className,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced onChange — only updates query/URL after user stops typing
  const debouncedOnChange = useMemo(
    () => debounce((val: string) => onChange(val), debounceMs),
    [onChange, debounceMs],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedOnChange(e.target.value);
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    debouncedOnChange.cancel();
    onChange("");
  };

  return (
    <div className={cn("relative flex-1 sm:flex-initial", className)}>
      <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        defaultValue={value}
        placeholder={placeholder}
        onChange={handleChange}
        className="pr-9 pl-8 w-full sm:w-[250px]"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
