import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  AlertTriangle,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { useStats } from "@/queries/stats";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
  }).format(value);

const paymentMethodLabel: Record<string, string> = {
  cash: "نقدي",
  card: "بطاقة",
  transfer: "تحويل بنكي",
  cheque: "شيك",
  insurance: "تأمين",
  other: "أخرى",
};

// ── Skeleton card ─────────────────────────────────────────────────────────────
function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const { data, isLoading } = useStats();
  const stats = data?.data;

  const changeColor = (change: number) =>
    change >= 0 ? "text-green-600" : "text-red-500";

  const statCards = stats
    ? [
        {
          title: "إجمالي الإيرادات (هذا الشهر)",
          value: formatCurrency(stats.totalRevenue),
          icon: DollarSign,
          change: `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange}%`,
          changePositive: stats.revenueChange >= 0,
          sub: "مقارنة بالشهر الماضي",
        },
        {
          title: "مبيعات اليوم",
          value: stats.salesToday.toString(),
          icon: ShoppingCart,
          change: null,
          sub: "فاتورة مسجلة اليوم",
        },
        {
          title: "إجمالي الأدوية",
          value: stats.totalMedicines.toString(),
          icon: Package,
          change: null,
          sub: `${stats.outOfStockCount} نفذ من المخزون`,
          alert: stats.outOfStockCount > 0,
        },
        {
          title: "منخفض المخزون",
          value: stats.lowStockCount.toString(),
          icon: AlertTriangle,
          change: null,
          sub: "يحتاج إعادة طلب",
          alert: stats.lowStockCount > 0,
        },
        {
          title: "الموردون",
          value: stats.totalSuppliers.toString(),
          icon: Truck,
          change: null,
          sub: "مورد نشط",
        },
        {
          title: "المستخدمون",
          value: stats.totalUsers.toString(),
          icon: Users,
          change: null,
          sub: "مستخدم مسجل",
        },
      ]
    : [];

  return (
    <div className="container mx-auto space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
        <Link to="/sales/create">
          <Button>فاتورة جديدة</Button>
        </Link>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon
                    className={`h-4 w-4 ${stat.alert ? "text-red-500" : "text-muted-foreground"}`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs mt-1 ${stat.alert ? "text-red-500" : "text-muted-foreground"}`}>
                    {stat.change && (
                      <span className={`font-semibold ${changeColor(stats!.revenueChange)} ml-1`}>
                        {stat.change}
                      </span>
                    )}
                    {stat.sub}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* ── Two-column: Recent Sales + Low Stock ── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle>آخر المبيعات</CardTitle>
            <CardDescription>أحدث 5 فواتير مسجلة في النظام.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الفاتورة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead>الدفع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.recentSales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                        لا توجد مبيعات مسجلة
                      </TableCell>
                    </TableRow>
                  )}
                  {stats?.recentSales.map((sale) => (
                    <TableRow key={sale._id}>
                      <TableCell className="font-mono text-xs">{sale.invoiceNumber}</TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell className="font-semibold">{formatCurrency(sale.total)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {paymentMethodLabel[sale.paymentMethod] ?? sale.paymentMethod}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4">
              <Link to="/sales">
                <Button variant="outline" size="sm" className="w-full">
                  عرض جميع المبيعات
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              تنبيهات نقص المخزون
            </CardTitle>
            <CardDescription>أدوية كميتها أقل من 20 وحدة.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الدواء</TableHead>
                    <TableHead>الكمية المتبقية</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.lowStockItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                        المخزون في حالة جيدة ✓
                      </TableCell>
                    </TableRow>
                  )}
                  {stats?.lowStockItems.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <span className={item.quantity < 10 ? "text-red-600 font-bold" : "text-yellow-600 font-semibold"}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={item.quantity < 10 ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {item.quantity < 10 ? "حرج" : "منخفض"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="mt-4">
              <Link to="/store">
                <Button variant="outline" size="sm" className="w-full">
                  إدارة المخزون
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Weekly trend placeholder ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ملخص الأداء
          </CardTitle>
          <CardDescription>مقارنة إيرادات الشهر الحالي بالشهر الماضي.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="flex items-center gap-8 p-4 rounded-lg bg-muted">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">هذا الشهر</p>
                <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue ?? 0)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">الشهر الماضي</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {formatCurrency(stats?.revenueLastMonth ?? 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">التغيير</p>
                <p className={`text-2xl font-bold ${changeColor(stats?.revenueChange ?? 0)}`}>
                  {stats?.revenueChange !== undefined
                    ? `${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange}%`
                    : "—"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
