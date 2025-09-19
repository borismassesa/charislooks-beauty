import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Users, 
  Clock,
  MessageSquare, 
  Image, 
  Briefcase,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import type { Service, Appointment, PortfolioItem, ContactMessage } from "@shared/schema";
import { 
  calculateDashboardMetrics, 
  formatCurrency, 
  formatPercentage 
} from "@/lib/dashboard-analytics";
import { useMemo, useState } from "react";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DateRangeFilter from "@/components/dashboard/DateRangeFilter";
import { subDays, differenceInDays } from "date-fns";
import type { DateRange } from "@/lib/dashboard-analytics";
import { queryClient } from "@/lib/queryClient";

// Enhanced KPI Card Component
function KPICard({ 
  title, 
  value, 
  previousValue, 
  description, 
  icon: Icon, 
  format = "number",
  loading = false 
}: {
  title: string;
  value: number;
  previousValue?: number;
  description: string;
  icon: React.ComponentType<{className?: string}>;
  format?: "currency" | "number" | "percentage";
  loading?: boolean;
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency": return formatCurrency(val);
      case "percentage": return `${val.toFixed(1)}%`;
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
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
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
    <Card className="hover-elevate" data-testid={`card-kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}>
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
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
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
                  {formatPercentage(change)}
                </span>
              </div>
            )}
          </div>
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
): { totalRevenue: number; totalAppointments: number; averageBookingValue: number } | null {
  const daysDiff = differenceInDays(currentDateRange.to, currentDateRange.from);
  const previousPeriodEnd = subDays(currentDateRange.from, 1);
  const previousPeriodStart = subDays(previousPeriodEnd, daysDiff);
  
  const previousPeriodAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate >= previousPeriodStart && aptDate <= previousPeriodEnd;
  });

  if (previousPeriodAppointments.length === 0) {
    return { totalRevenue: 0, totalAppointments: 0, averageBookingValue: 0 };
  }

  const totalRevenue = previousPeriodAppointments.reduce((sum, apt) => {
    const service = services.find(s => s.id === apt.serviceId);
    return sum + (service ? parseFloat(service.price) : 0);
  }, 0);

  const averageBookingValue = totalRevenue / previousPeriodAppointments.length;

  return {
    totalRevenue,
    totalAppointments: previousPeriodAppointments.length,
    averageBookingValue
  };
}

export default function AdminOverview() {
  // Date range state for filtering analytics
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30), // Default to last 30 days
    to: new Date()
  });
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"]
  });
  
  const { data: appointments, isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"]
  });
  
  const { data: portfolio, isLoading: portfolioLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"]
  });
  
  const { data: messages, isLoading: messagesLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact"]
  });

  // Calculate comprehensive metrics using our analytics utilities with date filtering
  const dashboardMetrics = useMemo(() => {
    if (!appointments || !services) return null;
    return calculateDashboardMetrics(appointments, services, dateRange);
  }, [appointments, services, dateRange]);

  // Filter appointments by date range for components that need it
  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= dateRange.from && aptDate <= dateRange.to;
    });
  }, [appointments, dateRange]);

  const isLoading = servicesLoading || appointmentsLoading || portfolioLoading || messagesLoading;

  // Calculate real previous period metrics
  const previousPeriodMetrics = useMemo(() => {
    if (!appointments || !services) return null;
    return calculatePreviousPeriodMetrics(appointments, services, dateRange);
  }, [appointments, services, dateRange]);

  // Enhanced KPI data with business metrics
  const kpiData = useMemo(() => {
    if (!dashboardMetrics || !appointments || !services || !messages || !portfolio) {
      return [];
    }

    return [
      {
        title: "Total Revenue",
        value: dashboardMetrics.totalRevenue,
        previousValue: previousPeriodMetrics?.totalRevenue,
        description: "Selected period",
        icon: DollarSign,
        format: "currency" as const
      },
      {
        title: "Total Appointments",
        value: dashboardMetrics.totalAppointments,
        previousValue: previousPeriodMetrics?.totalAppointments,
        description: "Confirmed bookings",
        icon: Calendar,
        format: "number" as const
      },
      {
        title: "Average Booking Value",
        value: dashboardMetrics.averageBookingValue,
        previousValue: previousPeriodMetrics?.averageBookingValue,
        description: "Per appointment",
        icon: Target,
        format: "currency" as const
      },
      {
        title: "Active Services",
        value: services.filter(s => s.active).length,
        description: "Services offered",
        icon: Briefcase,
        format: "number" as const
      },
      {
        title: "Portfolio Items",
        value: portfolio.length,
        description: "Showcase pieces",
        icon: Image,
        format: "number" as const
      },
      {
        title: "Unread Messages",
        value: messages.filter(m => m.status === 'unread').length,
        description: "Requiring response",
        icon: MessageSquare,
        format: "number" as const
      }
    ];
  }, [dashboardMetrics, appointments, services, messages, portfolio, previousPeriodMetrics]);

  // Top Services for quick insight
  const topServices = dashboardMetrics?.topServices.slice(0, 3) || [];

  // Handler for refresh button
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/services'] });
    queryClient.invalidateQueries({ queryKey: ['/api/appointments'] });
    queryClient.invalidateQueries({ queryKey: ['/api/portfolio'] });
    queryClient.invalidateQueries({ queryKey: ['/api/contact'] });
  };

  // Handler for export button
  const handleExport = () => {
    if (!dashboardMetrics || !kpiData) return;
    
    // Generate CSV content
    const csvContent = [
      ['Metric', 'Current Value', 'Previous Value', 'Change'],
      ...kpiData.map(kpi => [
        kpi.title,
        kpi.value.toString(),
        kpi.previousValue?.toString() || 'N/A',
        kpi.previousValue ? `${(((kpi.value - kpi.previousValue) / kpi.previousValue) * 100).toFixed(1)}%` : 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-8" data-testid="admin-overview">
      {/* Header Section with Date Range Filter */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Business Overview</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights for your beauty salon business
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-refresh" onClick={handleRefresh}>
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Date Range Filter */}
        <div className="flex items-center justify-between py-4 border-b">
          <div>
            <h3 className="text-lg font-medium">Analytics Period</h3>
            <p className="text-sm text-muted-foreground">
              Filter all metrics and charts by date range
            </p>
          </div>
          <DateRangeFilter 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange}
          />
        </div>
      </div>

      {/* Enhanced KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={`${kpi.title}-${index}`}
            title={kpi.title}
            value={kpi.value}
            previousValue={kpi.previousValue}
            description={kpi.description}
            icon={kpi.icon}
            format={kpi.format}
            loading={isLoading}
          />
        ))}
      </div>

      {/* Business Insights Section */}
      {dashboardMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Services Performance */}
          <Card className="hover-elevate" data-testid="card-top-services">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg font-semibold">Top Services</CardTitle>
                <CardDescription>Highest revenue generators</CardDescription>
              </div>
              <div className="rounded-md bg-primary/10 p-2">
                <Target className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topServices.map((serviceData, index) => (
                  <div key={serviceData.service.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/20 text-primary text-xs font-medium h-6 w-6 flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{serviceData.service.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {serviceData.bookings} booking{serviceData.bookings !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(serviceData.revenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(serviceData.averageValue)} avg
                      </p>
                    </div>
                  </div>
                ))}
                {topServices.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No service data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Status */}
          <Card className="hover-elevate" data-testid="card-revenue-status">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg font-semibold">Revenue by Status</CardTitle>
                <CardDescription>Appointment revenue breakdown</CardDescription>
              </div>
              <div className="rounded-md bg-primary/10 p-2">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardMetrics.revenueByStatus.map((statusData) => {
                  const statusColors = {
                    'Confirmed': 'bg-green-500/10 text-green-600 border-green-500/20',
                    'Pending': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
                    'Completed': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                    'Cancelled': 'bg-red-500/10 text-red-600 border-red-500/20'
                  };
                  const colorClass = statusColors[statusData.status as keyof typeof statusColors] || 'bg-muted text-muted-foreground';
                  
                  return (
                    <div key={statusData.status} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-xs ${colorClass}`}>
                          {statusData.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {statusData.count} appointment{statusData.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="font-semibold text-sm">
                        {formatCurrency(statusData.revenue)}
                      </div>
                    </div>
                  );
                })}
                {dashboardMetrics.revenueByStatus.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No revenue data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="hover-elevate" data-testid="card-quick-stats">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg font-semibold">Quick Stats</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </div>
              <div className="rounded-md bg-primary/10 p-2">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Revenue Growth</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {dashboardMetrics.monthOverMonthRevenue > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-sm font-semibold ${
                      dashboardMetrics.monthOverMonthRevenue > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(dashboardMetrics.monthOverMonthRevenue)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Booking Growth</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {dashboardMetrics.monthOverMonthAppointments > 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-sm font-semibold ${
                      dashboardMetrics.monthOverMonthAppointments > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(dashboardMetrics.monthOverMonthAppointments)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Active Services</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {services?.filter(s => s.active).length || 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Avg. Booking Value</span>
                  </div>
                  <span className="text-sm font-semibold">
                    {formatCurrency(dashboardMetrics.averageBookingValue)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interactive Charts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Business Analytics</h2>
            <p className="text-muted-foreground">
              Interactive charts and data visualizations
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Real-time Data
          </Badge>
        </div>
        
        <DashboardCharts 
          services={services || []} 
          appointments={filteredAppointments} 
          isLoading={isLoading}
          dateRange={dateRange}
        />
      </div>

      {/* Recent Activity Section - Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <Card className="hover-elevate" data-testid="card-recent-appointments">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Appointments</CardTitle>
              <CardDescription>Latest confirmed bookings</CardDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-view-all-appointments">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : appointments && appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.slice(0, 5).map((apt) => {
                  const service = services?.find(s => s.id === apt.serviceId);
                  const statusColors = {
                    'confirmed': 'bg-green-500/10 text-green-600 border-green-500/20',
                    'pending': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
                    'completed': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                    'cancelled': 'bg-red-500/10 text-red-600 border-red-500/20'
                  };
                  const colorClass = statusColors[apt.status as keyof typeof statusColors] || 'bg-muted text-muted-foreground';
                  
                  return (
                    <div key={apt.id} className="flex items-center justify-between py-3 border-b last:border-0 hover-elevate rounded-md px-2 -mx-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{apt.clientName}</p>
                          <Badge variant="outline" className={`text-xs ${colorClass}`}>
                            {apt.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(apt.appointmentDate).toLocaleDateString()}</span>
                          <span>{new Date(apt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          {service && <span>{service.name}</span>}
                        </div>
                      </div>
                      {service && (
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(parseFloat(service.price))}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No appointments yet</p>
                <p className="text-xs mt-1">Bookings will appear here when clients schedule services</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Recent Messages */}
        <Card className="hover-elevate" data-testid="card-recent-messages">
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Messages</CardTitle>
              <CardDescription>Latest contact inquiries</CardDescription>
            </div>
            <Button variant="outline" size="sm" data-testid="button-view-all-messages">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between py-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-3">
                {messages.slice(0, 5).map((msg) => (
                  <div key={msg.id} className="flex items-center justify-between py-3 border-b last:border-0 hover-elevate rounded-md px-2 -mx-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm">{msg.firstName} {msg.lastName}</p>
                        <Badge 
                          variant={msg.status === 'unread' ? 'default' : 'outline'} 
                          className="text-xs"
                        >
                          {msg.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate pr-4">{msg.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Client inquiries will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}