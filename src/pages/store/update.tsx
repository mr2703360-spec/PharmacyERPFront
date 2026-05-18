import MedicineForms from "@/components/forms/store/storeCreateForm";
import { useMedicine } from "@/queries/medicine";
import { useParams } from "react-router";

export default function Update() {
  const { id } = useParams<{ id: string }>();
  const { value: medicine } = useMedicine(id || "");
  return <MedicineForms idEdit values={medicine} />;
}
