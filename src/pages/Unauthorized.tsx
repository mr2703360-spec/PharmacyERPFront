import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const nav = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6 text-center" dir="rtl">
      <ShieldX className="h-20 w-20 text-red-500 opacity-80" />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">غير مصرح لك</h1>
        <p className="text-muted-foreground text-lg">
          ليس لديك صلاحية الوصول إلى هذه الصفحة.
        </p>
        <p className="text-sm text-muted-foreground">
          تواصل مع المسؤول لمنحك الصلاحية المطلوبة.
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={() => nav(-1)} variant="outline">العودة</Button>
        <Button onClick={() => nav("/")}>الرئيسية</Button>
      </div>
    </div>
  );
}
