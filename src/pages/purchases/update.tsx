import { useParams } from "react-router-dom";
import PurchaseForm from "@/components/forms/purchases/purchaseForm";
import { usePurchase } from "@/queries/purchases";

export default function PurchasesUpdate() {
  const { id } = useParams<{ id: string }>();
  const { data: purchaseResponse, isLoading: loading, error } = usePurchase(id ?? "");

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4" dir="rtl">
        <p className="text-muted-foreground text-center">جارٍ تحميل بيانات الفاتورة...</p>
      </div>
    );
  }

  if (error || !purchaseResponse) {
    return (
      <div className="container mx-auto py-8 px-4" dir="rtl">
        <p className="text-red-500 text-center">تعذّر تحميل بيانات الفاتورة.</p>
      </div>
    );
  }

  const purchaseData = purchaseResponse?.status === 200 ? purchaseResponse.data.data : undefined;

  return <PurchaseForm id={id} isEdit initialData={purchaseData as any} />;
}
