import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleCustomerStatus } from "@/apis/customers";

interface StatusToggleCellProps {
  customer: Customer;
}

interface CustomersResponse {
  data: Customer[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function StatusToggleCell({ customer }: StatusToggleCellProps) {
  const [optimisticStatus, setOptimisticStatus] = useState(
    customer.status || "active",
  );
  const isActive = optimisticStatus === "active";
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (newStatus: string) =>
      toggleCustomerStatus(customer._id, newStatus),
    onMutate: async (newStatus) => {
      await queryClient.cancelQueries({ queryKey: ["customers"] });

      const previousData = queryClient.getQueryData<CustomersResponse>([
        "customers",
      ]);

      queryClient.setQueryData<CustomersResponse>(["customers"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((c) =>
            c._id === customer._id
              ? { ...c, status: newStatus as "active" | "inactive" }
              : c,
          ),
        };
      });

      setOptimisticStatus(newStatus as "active" | "inactive");
      return { previousData };
    },
    onError: (_err, _newStatus, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(["customers"], context.previousData);
        const originalStatus =
          context.previousData.data.find((c) => c._id === customer._id)
            ?.status || "active";
        setOptimisticStatus(originalStatus);
      } else {
        setOptimisticStatus(customer.status || "active");
      }
      toast.error("فشل تغيير حالة العميل");
    },
    onSuccess: (_, newStatus) => {
      toast.success(
        newStatus === "active" ? "تم تنشيط حساب العميل" : "تم تعطيل حساب العميل",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const handleToggle = () => {
    const newStatus = isActive ? "inactive" : "active";
    mutate(newStatus);
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
