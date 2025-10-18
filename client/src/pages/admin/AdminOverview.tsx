import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  Calendar, 
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import type { Service, Appointment } from "@shared/schema";
import { 
  calculateDashboardMetrics, 
  formatCurrency, 
  formatPercentage,
  calculateRevenueTrends,
  calculateAppointmentDistribution,
  calculateTopServices,
  BILLABLE_STATUSES
} from "@/lib/dashboard-analytics";
import { useMemo, useState } from "react";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";
import { subDays, differenceInDays, format } from "date-fns";
import type { DateRange } from "@/lib/dashboard-analytics";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from "recharts";

// KPI Card Component
function KPICard({ 
  title, 
  value, 
  previousValue, 
  icon: Icon, 
  format = "number",
  loading = false,
  testId
}: {
  title: string;
  value: number;
  previousValue?: number;
  icon: React.ComponentType<{className?: string}>;
  format?: "currency" | "number";
  loading?: boolean;
  testId: string;
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency": return formatCurrency(val);
      default: return val.toLocaleString();
    }
  };

  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return null;
    const changePercent = ((value - previousValue) / previousValue) * 100;
    return changePercent;
  };

  const change = calculateChange();
  const isPositive = change !== null && change > 0;
  const isNegative = change !== null && change < 0;

  if (loading) {
    return (
      <Card className="hover-elevate">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-3 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-elevate" data-testid={testId}>
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="rounded-md bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold">
            {formatValue(value)}
          </div>
          {change !== null && (
            <div className="flex items-center gap-1">
              {isPositive ? (
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              ) : isNegative ? (
                <ArrowDownRight className="h-3 w-3 text-red-600" />
              ) : null}
              <span className={`text-xs font-medium ${
                isPositive 
                  ? 'text-green-600' 
                  : isNegative 
                  ? 'text-red-600' 
                  : 'text-muted-foreground'
              }`}>
                {formatPercentage(change)} from previous period
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate previous period metrics
function calculatePreviousPeriodMetrics(
  appointments: Appointment[],
  services: Service[],
  currentDateRange: DateRange
): { 
  totalRevenue: number; 
  totalAppointments: number; 
  confirmedAppointments: number;
  completedAppointments: number;
} {
  const daysDiff = differenceInDays(currentDateRange.to, currentDateRange.from);
  const previousPeriodEnd = subDays(currentDateRange.from, 1);
  const previousPeriodStart = subDays(previousPeriodEnd, daysDiff);
  
  const previousPeriodAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate >= previousPeriodStart && aptDate <= previousPeriodEnd;
  });

  const billableAppointments = previousPeriodAppointments.filter(apt => 
    (BILLABLE_STATUSES as readonly string[]).includes(apt.status)
  );

  const totalRevenue = billableAppointments.reduce((sum, apt) => {
    const service = services.find(s => s.id === apt.serviceId);
    return sum + (service ? parseFloat(service.price) : 0);
  }, 0);

  return {
    totalRevenue,
    totalAppointments: billableAppointments.length,
    confirmedAppointments: previousPeriodAppointments.filter(apt => apt.status === 'confirmed').length,
    completedAppointments: previousPeriodAppointments.filter(apt => apt.status === 'completed').length
  };
}

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-md border bg-background p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Chart color schemes
const PIE_COLORS = ["#22c55e", "#f59e0b", "#3b82f6", "#ef4444"];

export default function AdminOverview() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });

  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"]
  });
  
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"]
  });

  const dashboardMetrics = useMemo(() => {
    if (!appointments || !services) return null;
    return calculateDashboardMetrics(appointments, services, dateRange);
  }, [appointments, services, dateRange]);

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= dateRange.from && aptDate <= dateRange.to;
    });
  }, [appointments, dateRange]);

  const previousPeriodMetrics = useMemo(() => {
    if (!appointments || !services) return null;
    return calculatePreviousPeriodMetrics(appointments, services, dateRange);
  }, [appointments, services, dateRange]);

  // Calculate chart data
  const chartData = useMemo(() => {
    if (!services || !appointments) return null;

    const filteredApts = appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= dateRange.from && aptDate <= dateRange.to;
    });

    const revenueTrends = calculateRevenueTrends(filteredApts, services, 'daily', 365, [...BILLABLE_STATUSES]);
    const appointmentDistribution = calculateAppointmentDistribution(filteredApts);
    const topServices = calculateTopServices(filteredApts, services, 8, [...BILLABLE_STATUSES]);

    const bookingTrends = revenueTrends.map(item => ({
      date: item.date,
      appointments: item.appointments
    }));

    return {
      revenueTrends,
      appointmentDistribution,
      topServices,
      bookingTrends
    };
  }, [services, appointments, dateRange]);

  const isLoading = servicesLoading || appointmentsLoading;

  const confirmedCount = filteredAppointments.filter(apt => apt.status === 'confirmed').length;
  const completedCount = filteredAppointments.filter(apt => apt.status === 'completed').length;

  return (
    <div className="space-y-8" data-testid="admin-overview">
      {/* Header Section with Date Range Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Business insights and analytics at a glance
            </p>
          </div>
          <DateRangeFilter 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* Top Row: 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Revenue"
          value={dashboardMetrics?.totalRevenue || 0}
          previousValue={previousPeriodMetrics?.totalRevenue}
          icon={DollarSign}
          format="currency"
          loading={isLoading}
          testId="card-kpi-total-revenue"
        />
        <KPICard
          title="Total Appointments"
          value={dashboardMetrics?.totalAppointments || 0}
          previousValue={previousPeriodMetrics?.totalAppointments}
          icon={Calendar}
          format="number"
          loading={isLoading}
          testId="card-kpi-total-appointments"
        />
        <KPICard
          title="Confirmed Appointments"
          value={confirmedCount}
          previousValue={previousPeriodMetrics?.confirmedAppointments}
          icon={CheckCircle}
          format="number"
          loading={isLoading}
          testId="card-kpi-confirmed-appointments"
        />
        <KPICard
          title="Completed Appointments"
          value={completedCount}
          previousValue={previousPeriodMetrics?.completedAppointments}
          icon={Clock}
          format="number"
          loading={isLoading}
          testId="card-kpi-completed-appointments"
        />
      </div>

      {/* Second Row: Revenue Trend Chart (Full Width) */}
      <Card className="hover-elevate" data-testid="chart-revenue-trend">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Revenue Trend</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Daily revenue over the selected period
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {format(dateRange.from, 'MMM d, yyyy')} - {format(dateRange.to, 'MMM d, yyyy')}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading || !chartData ? (
            <div className="h-[350px] flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          ) : chartData.revenueTrends.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No revenue data yet</p>
                <p className="text-xs mt-1">Revenue trends will appear when you have completed appointments</p>
              </div>
            </div>
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.revenueTrends}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return format(date, 'MMM d');
                    }}
                  />
                  <YAxis 
                    className="text-xs"
                    tickFormatter={(value) => formatCurrency(value).replace(/\.00$/, '')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-1))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Third Row: Two Charts Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Distribution Pie Chart */}
        <Card className="hover-elevate" data-testid="chart-appointment-status">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Appointment Status Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">
              Breakdown by status
            </p>
          </CardHeader>
          <CardContent>
            {isLoading || !chartData ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-md" />
              </div>
            ) : chartData.appointmentDistribution.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No appointments yet</p>
                  <p className="text-xs mt-1">Status distribution will appear when you have bookings</p>
                </div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.appointmentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {chartData.appointmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} appointments`, name]}
                      labelFormatter={(label) => `Status: ${label}`}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => `${value}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Services Bar Chart */}
        <Card className="hover-elevate" data-testid="chart-popular-services">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Popular Services</CardTitle>
            <p className="text-sm text-muted-foreground">
              Top services by booking count
            </p>
          </CardHeader>
          <CardContent>
            {isLoading || !chartData ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-md" />
              </div>
            ) : chartData.topServices.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No service data yet</p>
                  <p className="text-xs mt-1">Popular services will appear when you have bookings</p>
                </div>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.topServices} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      type="number" 
                      className="text-xs"
                    />
                    <YAxis 
                      type="category" 
                      dataKey="service.name" 
                      className="text-xs"
                      width={120}
                      tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} bookings`, 'Bookings']}
                      labelFormatter={(label) => `Service: ${label}`}
                    />
                    <Bar 
                      dataKey="bookings" 
                      fill="hsl(var(--chart-2))"
                      radius={[0, 4, 4, 0]}
                      name="Bookings"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fourth Row: Booking Trends Area Chart (Full Width) */}
      <Card className="hover-elevate" data-testid="chart-booking-trends">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">Booking Trends</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Appointment bookings over time
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading || !chartData ? (
            <div className="h-[350px] flex items-center justify-center">
              <Skeleton className="h-full w-full rounded-md" />
            </div>
          ) : chartData.bookingTrends.length === 0 ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No booking data yet</p>
                <p className="text-xs mt-1">Booking trends will appear when you have appointments</p>
              </div>
            </div>
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.bookingTrends}>
                  <defs>
                    <linearGradient id="bookingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return format(date, 'MMM d');
                    }}
                  />
                  <YAxis 
                    className="text-xs"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="appointments"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    fill="url(#bookingGradient)"
                    name="Appointments"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
