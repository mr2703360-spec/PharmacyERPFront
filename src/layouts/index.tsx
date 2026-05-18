import { TanstackProvider } from "@/components/global-provider/tanstack-provider";
import { Pill } from "lucide-react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
export default function Layout() {
  return (
    <main>
      <NuqsAdapter>
        <TanstackProvider>
          <Suspense
            fallback={
              <div className="min-h-screen  flex items-center justify-center ">
                <Pill size={"5rem"} />
              </div>
            }
          >
            <div className=" min-h-screen" dir="rtl">
              <Outlet />
            </div>
          </Suspense>
          <Toaster />
        </TanstackProvider>
      </NuqsAdapter>
    </main>
  );
}
