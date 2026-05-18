import CategoryForm from "@/components/forms/medicinesCategories/medicinesCategories";
import { useMedicineCategoryById } from "@/queries/medicinesCategories";
import { useParams } from "react-router";

export default function UpdateCategory() {
  const { id } = useParams();
    const {data,isLoading}=useMedicineCategoryById(id ?? "" )
  
  return <CategoryForm id={id} initialData={data} isEdit={true} isLoading={isLoading} />
}
