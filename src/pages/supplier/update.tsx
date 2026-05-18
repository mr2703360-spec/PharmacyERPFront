import SupplierForm from "@/components/forms/supplier/supplierForm";
import { useSupplier } from "@/queries/suppliers";
import { useParams } from "react-router";

export default function SupplierUpdate() {
  const { id } = useParams();
    const { data: supplierData } = useSupplier(id || "");
  return <SupplierForm id={id} values={supplierData} />;
}
