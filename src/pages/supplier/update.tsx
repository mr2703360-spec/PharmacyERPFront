import SupplierForm from "@/components/forms/supplier/supplierForm";
import { useSupplier } from "@/queries/suppliers";
import { useParams } from "react-router";

export default function SupplierUpdate() {
  const { id } = useParams();
    const { data: response } = useSupplier(id || "");
    const supplierData = response?.status === 200 ? response.data.data : undefined;
  return <SupplierForm id={id} values={supplierData as any} />;
}
