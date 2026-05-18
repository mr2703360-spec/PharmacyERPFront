import SaleForm from "@/components/forms/sales/saleForm";
import { useParams } from "react-router-dom";
import { useSale } from "@/queries/sales";


export default function SalesUpdate() {
  const { id } = useParams<{ id: string }>();
  const { value: sale, loading: isLoading, error } = useSale(id || "");


if (isLoading) {
    return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;
  }

  if (error || !sale) {
    return <div className="p-8 text-center text-red-500" dir="rtl">فشل في تحميل بيانات المبيعة</div>;
  }
  return <SaleForm id={id}  initialData={sale} isEdit={true} />;
}

