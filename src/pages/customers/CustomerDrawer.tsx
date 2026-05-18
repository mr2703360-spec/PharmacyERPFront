import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CustomerForm from "./CustomerForm";

interface CustomerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
}

export function CustomerDrawer({ open, onOpenChange, customer }: Readonly<CustomerDrawerProps>) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full px-6 sm:max-w-md md:max-w-xl overflow-y-auto" dir="rtl">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold">
            {customer ? "تعديل بيانات العميل" : "إضافة عميل جديد"}
          </SheetTitle>
          <SheetDescription>
            {customer
              ? "قم بتحديث بيانات العميل هنا. سيتم حفظ التغييرات فوراً."
              : "أدخل بيانات العميل الجديد ليتم إضافته إلى النظام."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-1">
          <CustomerForm
            id={customer?._id}
            values={customer}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
