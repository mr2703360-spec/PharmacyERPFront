import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  // IconDatabase,
  IconFileAi,
  IconFileDescription,
  // IconFileWord,
  // IconFolder,
  IconHelp,
  IconPackage,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

// import { NavDocuments } from "@/components/ui/sideBarParts/nav-documents";
import { NavMain } from "@/components/ui/sideBarParts/nav-main";
import { NavSecondary } from "@/components/ui/sideBarParts/nav-secondary";
import { NavUser } from "@/components/ui/sideBarParts/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Package, Store } from "lucide-react";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "المخزون (الأدوية)",
      url: "store",
      icon: () => <Store />,
    },
    {
      title: "التصنيفات",
      url: "categories",
      icon: () => <Package />,
    },
    {
      title: "إدارة الموردين",
      url: "supplier",
      icon: IconPackage,
    },
    {
      title: "إدارة المستخدمين والصلاحيات",
      url: "users",
      icon: IconUsers,
    },
    {
      title: "العملاء",
      url: "customers",
      icon: IconUsers,
    },
    {
      title: "المبيعات",
      url: "sales",
      icon: IconChartBar,
    },
    {
      title: "المشتريات",
      url: "purchase",
      icon: IconPackage,
    },
    {
      title: "التقارير",
      url: "reports",
      icon: IconReport,
    },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "#",
  //     icon: IconDatabase,
  //   },
  //   {
  //     name: "Reports",
  //     url: "/reports",
  //     icon: IconReport,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "#",
  //     icon: IconFileWord,
  //   },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar side="right" collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem className=" flex items-center justify-center  overflow-hidden   size-20 mx-auto  rounded-full">
            <a href="#">
              <img
                src="/logo.webp"
                alt="Acme Inc."
                className="object-cover  w-auto"
              />
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
