import UserFormComponent from "@/components/forms/users/userFomr";
import { useUser } from "@/queries/users";
import { useParams } from "react-router";
import { Loader2 } from "lucide-react";

export default function EditUser() {
  const { id } = useParams();
  const { value: userInfo ,loading} = useUser(id as string);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }



  return (
    <>
      <UserFormComponent mode="update" defaultValues={userInfo} />;
      <h1>{userInfo?.name}</h1>
    </>
  );
}
