import { SidebarTrigger } from "../ui/sidebar";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { Input } from "../ui/input";
import {
  Search,
  Settings,
  LogOut,
  User,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSetAtom, useAtomValue } from "jotai";
import { tokenAtom, currentUserAtom } from "@/atoms";
import { NotificationDropdown } from "./NotificationDropdown";

// ─── Pages registry ───────────────────────────────────────────────────────────
interface PageEntry {
  label: string;       // Arabic display name
  keywords: string[];  // extra search terms (Arabic + English)
  path: string;
}

const PAGES: PageEntry[] = [
  {
    label: "الرئيسية",
    keywords: ["home", "dashboard", "الرئيسية", "لوحة التحكم"],
    path: "/",
  },
  {
    label: "المخزون (الأدوية)",
    keywords: ["store", "medicines", "stock", "المخزون", "الأدوية"],
    path: "/store",
  },
  {
    label: "إضافة دواء",
    keywords: ["add medicine", "create store", "إضافة دواء", "دواء جديد"],
    path: "/store/create",
  },
  {
    label: "التصنيفات",
    keywords: ["categories", "category", "التصنيفات", "تصنيف"],
    path: "/categories",
  },
  {
    label: "إضافة تصنيف",
    keywords: ["add category", "create category", "إضافة تصنيف", "تصنيف جديد"],
    path: "/categories/create",
  },
  {
    label: "الموردون",
    keywords: ["supplier", "suppliers", "الموردون", "مورد"],
    path: "/supplier",
  },
  {
    label: "إضافة مورد",
    keywords: ["add supplier", "create supplier", "إضافة مورد", "مورد جديد"],
    path: "/supplier/create",
  },
  {
    label: "المستخدمون",
    keywords: ["users", "user", "المستخدمون", "مستخدم"],
    path: "/users",
  },
  {
    label: "إضافة مستخدم",
    keywords: ["add user", "create user", "إضافة مستخدم", "مستخدم جديد"],
    path: "/users/create",
  },
  {
    label: "المبيعات",
    keywords: ["sales", "invoices", "المبيعات", "فواتير", "مبيعة"],
    path: "/sales",
  },
  {
    label: "فاتورة جديدة",
    keywords: ["new sale", "create sale", "فاتورة جديدة", "إضافة مبيعة"],
    path: "/sales/create",
  },
  {
    label: "الملف الشخصي",
    keywords: ["profile", "account", "الملف الشخصي", "حساب"],
    path: "/profile",
  },
  {
    label: "المشتريات",
    keywords: ["purchases", "purchase", "المشتريات", "شراء"],
    path: "/purchase",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
export default function TheHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const nav = useNavigate();
  const setToken = useSetAtom(tokenAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const currentUser = useAtomValue(currentUserAtom);

  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("current_user");
    nav("/login", { replace: true });
  };

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("ar-EG", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const formattedTime = currentTime.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Filter pages
  const filteredPages =
    searchQuery.trim() === ""
      ? []
      : PAGES.filter((page) => {
          const q = searchQuery.toLowerCase();
          return (
            page.label.toLowerCase().includes(q) ||
            page.keywords.some((k) => k.toLowerCase().includes(q))
          );
        });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
    setActiveIndex(0);
  };

  const handleSelectPage = (path: string) => {
    nav(path);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showResults || filteredPages.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredPages.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelectPage(filteredPages[activeIndex].path);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center border-b bg-background px-4">
      <SidebarTrigger />
      <div className="flex w-full container mx-auto py-3 items-center justify-between">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <img
              src="/logo.webp"
              alt="Pharmacy Dashboard"
              className="size-20 object-cover"
            />
          </div>
        </div>

        {/* ── Page Search ── */}
        <div
          ref={searchRef}
          className="hidden max-w-md flex-1 px-6 md:block relative"
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="ابحث عن صفحة..."
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => searchQuery && setShowResults(true)}
              onKeyDown={handleKeyDown}
              className="w-full bg-muted pl-8 md:w-[300px] lg:w-[400px]"
              dir="rtl"
            />
          </div>

          {/* Results dropdown */}
          {showResults && filteredPages.length > 0 && (
            <div className="absolute top-full mt-1 w-full md:w-[300px] lg:w-[400px] rounded-md border bg-popover shadow-lg z-50 overflow-hidden">
              <ul className="py-1" role="listbox">
                {filteredPages.map((page, idx) => (
                  <li
                    key={page.path}
                    role="option"
                    aria-selected={idx === activeIndex}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={() => handleSelectPage(page.path)}
                    className={`flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                      idx === activeIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    }`}
                    dir="rtl"
                  >
                    <span className="font-medium">{page.label}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span dir="ltr">{page.path}</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* No results */}
          {showResults && searchQuery.trim() !== "" && filteredPages.length === 0 && (
            <div className="absolute top-full mt-1 w-full md:w-[300px] lg:w-[400px] rounded-md border bg-popover shadow-lg z-50 px-4 py-3 text-sm text-muted-foreground text-right" dir="rtl">
              لا توجد نتائج لـ &quot;{searchQuery}&quot;
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">

          {/* Date & Time */}
          <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex" dir="rtl">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
            <Clock className="mr-2 h-4 w-4" />
            <span>{formattedTime}</span>
          </div>

          {/* Notifications */}
          <NotificationDropdown />


          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.image} alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {currentUser?.name ?? "المستخدم"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser?.email ?? ""}
                  </p>
                  <p className="text-xs text-primary font-medium">
                    {currentUser?.role === "admin" ? "مسؤول" : currentUser?.role ?? ""}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => nav("/profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
