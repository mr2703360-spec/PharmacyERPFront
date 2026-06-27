import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useToggleSupplierStatus } from "@/api";

interface StatusToggleCellProps {
  supplier: Supplier;
}

// Define the shape of the cached data (from useSuppliers)
interface SuppliersResponse {
  data: Supplier[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function StatusToggleCell({ supplier }: StatusToggleCellProps) {
  const [optimisticStatus, setOptimisticStatus] = useState(
    supplier.status || "active",
  );
  const isActive = optimisticStatus === "active";
  const queryClient = useQueryClient();

  const { mutate, isPending } = useToggleSupplierStatus({
    mutation: {
      onMutate: async ({ data: { status: newStatus } }) => {
        // Cancel ongoing refetches to avoid overwriting optimistic update
        await queryClient.cancelQueries({ queryKey: ["suppliers"] });

        // Snapshot previous value
        const previousData = queryClient.getQueryData<SuppliersResponse>([
          "suppliers",
        ]);

        // Optimistically update the cache
        queryClient.setQueryData<SuppliersResponse>(["suppliers"], (old) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((s) =>
              s._id === supplier._id
                ? { ...s, status: newStatus as "active" | "inactive" }
                : s,
            ),
          };
        });

        // Update local optimistic state
        setOptimisticStatus(newStatus as "active" | "inactive");

        // Return context with previous data for rollback
        return { previousData };
      },
      onError: (_err, _variables, context: any) => {
        // Rollback to previous status
        if (context?.previousData) {
          queryClient.setQueryData(["suppliers"], context.previousData);
          const originalStatus =
            context.previousData.data.find((s: Supplier) => s._id === supplier._id)
              ?.status || "active";
          setOptimisticStatus(originalStatus);
        } else {
          setOptimisticStatus(supplier.status || "active");
        }
        toast.error("فشل تغيير حالة المورد");
      },
      onSuccess: (_, { data: { status: newStatus } }) => {
        toast.success(
          newStatus === "active" ? "تم تنشيط المورد" : "تم تعطيل المورد",
        );
      },
      onSettled: () => {
        // Refetch to ensure consistency with backend
        queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      },
    }
  });

  const handleToggle = () => {
    const newStatus = isActive ? "inactive" : "active";
    mutate({ id: supplier._id, data: { status: newStatus } as any });
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={isActive}
        onCheckedChange={handleToggle}
        disabled={isPending}
      />
      <span className="text-sm text-muted-foreground">
        {isActive ? "نشط" : "غير نشط"}
      </span>
    </div>
  );
}
