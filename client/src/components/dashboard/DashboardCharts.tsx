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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Activity,
  Calendar,
  Clock,
  Users
} from "lucide-react";
import { format } from "date-fns/format";
import type { Service, Appointment } from "@shared/schema";
import {
  calculateRevenueTrends,
  calculateAppointmentDistribution,
  calculateTopServices,
  calculatePeakHours,
  formatCurrency,
  BILLABLE_STATUSES
} from "@/lib/dashboard-analytics";
import { useMemo } from "react";

interface DashboardChartsProps {
  services: Service[];
  appointments: Appointment[];
  isLoading?: boolean;
  dateRange?: { from: Date; to: Date };
}

// Chart color schemes matching the beauty salon theme
const REVENUE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))"
];

const PIE_COLORS = [
  "#22c55e", // Green for confirmed
  "#f59e0b", // Yellow for pending  
  "#3b82f6", // Blue for completed
  "#ef4444"  // Red for cancelled
];

// Custom tooltip for revenue charts
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

// Chart loading skeleton
function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className={`h-[${height}px] w-full rounded-md`} />
    </div>
  );
}

export default function DashboardCharts({ 
  services, 
  appointments, 
  isLoading = false,
  dateRange
}: DashboardChartsProps) {
  // Handler for chart export
  const handleChartExport = () => {
    // Basic CSV export of chart data
    if (!services || !appointments) return;
    
    const filteredAppointments = dateRange 
      ? appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= dateRange.from && aptDate <= dateRange.to;
        })
      : appointments;

    const csvContent = [
      ['Date', 'Service', 'Revenue', 'Status'],
      ...filteredAppointments.map(apt => {
        const service = services.find(s => s.id === apt.serviceId);
        return [
          new Date(apt.appointmentDate).toLocaleDateString(),
          service?.name || 'Unknown',
          service?.price || '0',
          apt.status
        ];
      })
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `chart-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  // Calculate chart data using analytics utilities with date filtering
  const chartData = useMemo(() => {
    if (!services || !appointments) return null;

    // Filter appointments by date range if provided
    const filteredAppointments = dateRange 
      ? appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= dateRange.from && aptDate <= dateRange.to;
        })
      : appointments;

    const revenueData = calculateRevenueTrends(filteredAppointments, services, 'monthly', 365, BILLABLE_STATUSES);
    const appointmentDistribution = calculateAppointmentDistribution(filteredAppointments);
    const topServices = calculateTopServices(filteredAppointments, services, 8, BILLABLE_STATUSES);
    const peakHours = calculatePeakHours(filteredAppointments);

    return {
      revenueData,
      appointmentDistribution,
      topServices,
      peakHours
    };
  }, [services, appointments, dateRange]);

  if (isLoading || !chartData) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <ChartSkeleton />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <ChartSkeleton />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { revenueData, appointmentDistribution, topServices, peakHours } = chartData;

  return (
    <div className="space-y-8" data-testid="dashboard-charts">
      {/* Revenue Trends Chart */}
      <Card className="hover-elevate" data-testid="chart-revenue-trends">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-6">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Trends
            </CardTitle>
            <CardDescription>Monthly revenue performance over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {dateRange 
                ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}`
                : 'Last 12 Months'
              }
            </Badge>
            <Button variant="outline" size="sm" onClick={handleChartExport}>
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
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
                    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  }}
                />
                <YAxis 
                  className="text-xs"
                  tickFormatter={(value) => formatCurrency(value).replace(/\.00$/, '')}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Distribution */}
        <Card className="hover-elevate" data-testid="chart-appointment-distribution">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-6">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Appointment Distribution
              </CardTitle>
              <CardDescription>Breakdown by appointment status</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={appointmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {appointmentDistribution.map((entry, index) => (
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
                    formatter={(value, entry) => `${value} (${entry.payload?.percentage?.toFixed(1)}%)`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Services Performance */}
        <Card className="hover-elevate" data-testid="chart-top-services">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-6">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Service Performance
              </CardTitle>
              <CardDescription>Revenue by service type</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topServices} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    type="number" 
                    className="text-xs"
                    tickFormatter={(value) => formatCurrency(value).replace(/\.00$/, '')}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="service.name" 
                    className="text-xs"
                    width={120}
                    tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                    name="Revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours and Booking Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Chart */}
        <Card className="hover-elevate" data-testid="chart-peak-hours">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-6">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Peak Hours Analysis
              </CardTitle>
              <CardDescription>Busiest hours of the day</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakHours}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="displayHour" 
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value) => [`${value} appointments`, 'Bookings']}
                    labelFormatter={(label) => `Time: ${label}`}
                  />
                  <Bar 
                    dataKey="appointments" 
                    fill="hsl(var(--chart-3))"
                    radius={[4, 4, 0, 0]}
                    name="Appointments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Booking Volume */}
        <Card className="hover-elevate" data-testid="chart-booking-volume">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-6">
            <div>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Booking Volume Trends
              </CardTitle>
              <CardDescription>Monthly appointment count</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    className="text-xs"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    }}
                  />
                  <YAxis className="text-xs" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--chart-4))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Appointments"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Performance Table */}
      <Card className="hover-elevate" data-testid="chart-service-details">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-6">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Service Performance Details
            </CardTitle>
            <CardDescription>Comprehensive service analytics</CardDescription>
          </div>
          <Tabs defaultValue="revenue" className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs">Bookings</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue" className="w-full">
            <TabsContent value="revenue">
              <div className="space-y-4">
                {topServices.slice(0, 6).map((serviceData, index) => (
                  <div key={serviceData.service.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/20 text-primary text-sm font-medium h-8 w-8 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{serviceData.service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {serviceData.service.category} • {serviceData.service.duration}min
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(serviceData.revenue)}</p>
                      <p className="text-sm text-muted-foreground">
                        {serviceData.bookings} booking{serviceData.bookings !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="bookings">
              <div className="space-y-4">
                {topServices
                  .sort((a, b) => b.bookings - a.bookings)
                  .slice(0, 6)
                  .map((serviceData, index) => (
                    <div key={serviceData.service.id} className="flex items-center justify-between py-3 border-b last:border-0">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/20 text-primary text-sm font-medium h-8 w-8 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{serviceData.service.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Avg: {formatCurrency(serviceData.averageValue)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-lg">{serviceData.bookings}</p>
                        <p className="text-sm text-muted-foreground">appointments</p>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}