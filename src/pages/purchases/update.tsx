import { useParams } from "react-router-dom";
import PurchaseForm from "@/components/forms/purchases/purchaseForm";
import { usePurchase } from "@/queries/purchases";

export default function PurchasesUpdate() {
  const { id } = useParams<{ id: string }>();
  const { value: purchase, loading, error } = usePurchase(id ?? "");

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4" dir="rtl">
        <p className="text-muted-foreground text-center">جارٍ تحميل بيانات الفاتورة...</p>
      </div>
    );
  }

  if (error || !purchase) {
    return (
      <div className="container mx-auto py-8 px-4" dir="rtl">
        <p className="text-red-500 text-center">تعذّر تحميل بيانات الفاتورة.</p>
      </div>
    );
  }

  return <PurchaseForm id={id} isEdit initialData={purchase} />;
}
