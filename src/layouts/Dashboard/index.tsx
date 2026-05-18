import { AppSidebar } from "@/components/common/AppSideBar";
import TheFooter from "@/components/common/TheFooter";
import TheHeader from "@/components/common/TheHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { useMe } from "@/queries/auth";

export default function DashboardLayout() {
  useMe(); // ← syncs user permissions from backend on mount + tab focus

  return (
    <SidebarProvider >
      <AppSidebar />
      <div className=" w-full">
        <TheHeader />
        <main className=" min-h-screen">
          <Outlet />
        </main>
        <TheFooter />
      </div>
    </SidebarProvider>
  );
}
