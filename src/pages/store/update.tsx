import MedicineForms from "@/components/forms/store/storeCreateForm";
import { useMedicine } from "@/queries/medicine";
import { useParams } from "react-router";

export default function Update() {
  const { id } = useParams<{ id: string }>();
  const { data: response } = useMedicine(id || "");
  const medicine = response?.status === 200 ? (response.data as any).data : undefined;
  return <MedicineForms idEdit values={medicine as any} />;
}
