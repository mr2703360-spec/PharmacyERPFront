import SaleForm from "@/components/forms/sales/saleForm";
import { useParams } from "react-router-dom";
import { useSale } from "@/queries/sales";


export default function SalesUpdate() {
  const { id } = useParams<{ id: string }>();
  const { data: sale, isLoading, error } = useSale(id || "");


if (isLoading) {
    return <div className="p-8 text-center" dir="rtl">جاري التحميل...</div>;
  }

  if (error || !sale) {
    return <div className="p-8 text-center text-red-500" dir="rtl">فشل في تحميل بيانات المبيعة</div>;
  }
  
  const saleData = sale?.status === 200 ? sale.data.data : undefined;
  
  return <SaleForm id={id}  initialData={saleData as any} isEdit={true} />;
}

