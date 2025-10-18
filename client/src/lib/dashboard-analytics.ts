import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, differenceInDays } from "date-fns";
import type { Service, Appointment, ContactMessage, PortfolioItem } from "@shared/schema";

// Types for analytics calculations
export interface RevenueData {
  date: string;
  revenue: number;
  appointments: number;
}

export interface ServiceAnalytics {
  service: Service;
  revenue: number;
  bookings: number;
  averageValue: number;
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalAppointments: number;
  averageBookingValue: number;
  monthOverMonthRevenue: number;
  monthOverMonthAppointments: number;
  topServices: ServiceAnalytics[];
  revenueByStatus: { status: string; revenue: number; count: number }[];
  dailyRevenue: RevenueData[];
  weeklyRevenue: RevenueData[];
  monthlyRevenue: RevenueData[];
}

export interface DateRange {
  from: Date;
  to: Date;
}

// Define billable statuses
export const BILLABLE_STATUSES = ['confirmed', 'completed'];
export type BillableStatus = typeof BILLABLE_STATUSES[number];

// Helper function to check if an appointment is billable
export function isAppointmentBillable(appointment: Appointment, allowedStatuses: string[] = BILLABLE_STATUSES): boolean {
  return allowedStatuses.includes(appointment.status);
}

// Helper function to calculate revenue from appointments and services (only billable appointments)
export function calculateAppointmentRevenue(appointment: Appointment, services: Service[], allowedStatuses: string[] = BILLABLE_STATUSES): number {
  if (!isAppointmentBillable(appointment, allowedStatuses)) {
    return 0;
  }
  const service = services.find(s => s.id === appointment.serviceId);
  return service ? parseFloat(service.price) : 0;
}

// Filter data by date range
export function filterByDateRange<T extends { createdAt: string | Date }>(
  data: T[], 
  dateRange: DateRange
): T[] {
  return data.filter(item => {
    const itemDate = typeof item.createdAt === 'string' ? new Date(item.createdAt) : item.createdAt;
    return isWithinInterval(itemDate, { start: dateRange.from, end: dateRange.to });
  });
}

// Calculate revenue trends over time (only billable appointments)
export function calculateRevenueTrends(
  appointments: Appointment[],
  services: Service[],
  period: 'daily' | 'weekly' | 'monthly' = 'daily',
  daysBack: number = 30,
  allowedStatuses: string[] = BILLABLE_STATUSES
): RevenueData[] {
  const today = new Date();
  const startDate = subDays(today, daysBack);
  
  // Group appointments by period
  const revenueMap = new Map<string, { revenue: number; appointments: number }>();
  
  appointments.forEach(appointment => {
    const appointmentDate = new Date(appointment.appointmentDate);
    if (appointmentDate < startDate) return;
    
    let periodKey: string;
    switch (period) {
      case 'weekly':
        periodKey = format(startOfWeek(appointmentDate), 'yyyy-MM-dd');
        break;
      case 'monthly':
        periodKey = format(startOfMonth(appointmentDate), 'yyyy-MM-01');
        break;
      default:
        periodKey = format(appointmentDate, 'yyyy-MM-dd');
    }
    
    const revenue = calculateAppointmentRevenue(appointment, services, allowedStatuses);
    if (revenue > 0) {
      const existing = revenueMap.get(periodKey) || { revenue: 0, appointments: 0 };
      revenueMap.set(periodKey, {
        revenue: existing.revenue + revenue,
        appointments: existing.appointments + 1
      });
    }
  });
  
  // Convert to array and sort
  return Array.from(revenueMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      appointments: data.appointments
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Calculate top performing services (only billable appointments)
export function calculateTopServices(
  appointments: Appointment[],
  services: Service[],
  limit: number = 5,
  allowedStatuses: string[] = BILLABLE_STATUSES
): ServiceAnalytics[] {
  const serviceMap = new Map<string, { revenue: number; bookings: number }>();
  
  appointments.forEach(appointment => {
    if (!isAppointmentBillable(appointment, allowedStatuses)) return;
    
    const revenue = calculateAppointmentRevenue(appointment, services, allowedStatuses);
    const existing = serviceMap.get(appointment.serviceId) || { revenue: 0, bookings: 0 };
    serviceMap.set(appointment.serviceId, {
      revenue: existing.revenue + revenue,
      bookings: existing.bookings + 1
    });
  });
  
  return services
    .map(service => {
      const analytics = serviceMap.get(service.id) || { revenue: 0, bookings: 0 };
      return {
        service,
        revenue: analytics.revenue,
        bookings: analytics.bookings,
        averageValue: analytics.bookings > 0 ? analytics.revenue / analytics.bookings : 0
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// Calculate period-over-period growth aligned with date range (only billable appointments)
export function calculatePeriodOverPeriodGrowth(
  appointments: Appointment[],
  services: Service[],
  dateRange: DateRange,
  allowedStatuses: string[] = BILLABLE_STATUSES
): { revenueGrowth: number; appointmentGrowth: number } {
  // Calculate the number of days in current period
  const periodDays = differenceInDays(dateRange.to, dateRange.from);
  
  // Calculate previous period (same length, immediately before current period)
  const previousPeriodEnd = subDays(dateRange.from, 1);
  const previousPeriodStart = subDays(previousPeriodEnd, periodDays);
  
  // Filter current period appointments (billable only)
  const currentPeriodAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return isWithinInterval(aptDate, { start: dateRange.from, end: dateRange.to }) && 
           isAppointmentBillable(apt, allowedStatuses);
  });
  
  // Filter previous period appointments (billable only)
  const previousPeriodAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return isWithinInterval(aptDate, { start: previousPeriodStart, end: previousPeriodEnd }) && 
           isAppointmentBillable(apt, allowedStatuses);
  });
  
  // Calculate revenue for both periods
  const currentRevenue = currentPeriodAppointments.reduce((sum, apt) => 
    sum + calculateAppointmentRevenue(apt, services, allowedStatuses), 0
  );
  
  const previousRevenue = previousPeriodAppointments.reduce((sum, apt) => 
    sum + calculateAppointmentRevenue(apt, services, allowedStatuses), 0
  );
  
  // Calculate growth percentages
  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
  const appointmentGrowth = previousPeriodAppointments.length > 0 
    ? ((currentPeriodAppointments.length - previousPeriodAppointments.length) / previousPeriodAppointments.length) * 100 
    : 0;
  
  return { revenueGrowth, appointmentGrowth };
}

// Backward compatibility wrapper (deprecated - use calculatePeriodOverPeriodGrowth instead)
export function calculateMonthOverMonth(
  appointments: Appointment[],
  services: Service[]
): { revenueGrowth: number; appointmentGrowth: number } {
  const currentMonth = startOfMonth(new Date());
  const lastMonth = startOfMonth(subDays(currentMonth, 1));
  
  return calculatePeriodOverPeriodGrowth(
    appointments,
    services,
    { from: currentMonth, to: endOfMonth(currentMonth) }
  );
}

// Calculate appointment status distribution
export function calculateAppointmentDistribution(appointments: Appointment[]): { 
  status: string; 
  count: number; 
  percentage: number;
}[] {
  const statusCounts = appointments.reduce((acc, appointment) => {
    acc[appointment.status] = (acc[appointment.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const total = appointments.length;
  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count,
    percentage: total > 0 ? (count / total) * 100 : 0
  }));
}

// Calculate peak hours analysis
export function calculatePeakHours(appointments: Appointment[]): { 
  hour: number; 
  appointments: number;
  displayHour: string;
}[] {
  const hourCounts = new Map<number, number>();
  
  appointments.forEach(appointment => {
    const hour = new Date(appointment.appointmentDate).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });
  
  return Array.from(hourCounts.entries())
    .map(([hour, appointments]) => ({
      hour,
      appointments,
      displayHour: `${hour.toString().padStart(2, '0')}:00`
    }))
    .sort((a, b) => a.hour - b.hour);
}

// Main function to calculate all dashboard metrics (only billable appointments)
export function calculateDashboardMetrics(
  appointments: Appointment[],
  services: Service[],
  dateRange?: DateRange,
  allowedStatuses: string[] = BILLABLE_STATUSES
): DashboardMetrics {
  // Filter appointments by date range if provided
  const filteredAppointments = dateRange 
    ? appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return isWithinInterval(aptDate, { start: dateRange.from, end: dateRange.to });
      })
    : appointments;
  
  // Filter for only billable appointments for revenue calculations
  const billableAppointments = filteredAppointments.filter(apt => 
    isAppointmentBillable(apt, allowedStatuses)
  );
  
  // Calculate total revenue (only billable appointments)
  const totalRevenue = billableAppointments.reduce((sum, apt) => 
    sum + calculateAppointmentRevenue(apt, services, allowedStatuses), 0
  );
  
  // Calculate average booking value (only billable appointments)
  const averageBookingValue = billableAppointments.length > 0 
    ? totalRevenue / billableAppointments.length 
    : 0;
  
  // Get growth metrics aligned with date range (only billable appointments)
  const { revenueGrowth, appointmentGrowth } = dateRange
    ? calculatePeriodOverPeriodGrowth(appointments, services, dateRange, allowedStatuses)
    : calculateMonthOverMonth(appointments, services);
  
  // Get top services (only billable appointments)
  const topServices = calculateTopServices(billableAppointments, services, 5, allowedStatuses);
  
  // Calculate revenue by status (show all statuses but only billable ones have revenue)
  const revenueByStatus = calculateAppointmentDistribution(filteredAppointments)
    .map(dist => ({
      status: dist.status,
      count: dist.count,
      revenue: allowedStatuses.includes(dist.status.toLowerCase())
        ? filteredAppointments
            .filter(apt => apt.status === dist.status.toLowerCase())
            .reduce((sum, apt) => sum + calculateAppointmentRevenue(apt, services, allowedStatuses), 0)
        : 0
    }));
  
  return {
    totalRevenue,
    totalAppointments: billableAppointments.length, // Only count billable appointments
    averageBookingValue,
    monthOverMonthRevenue: revenueGrowth,
    monthOverMonthAppointments: appointmentGrowth,
    topServices,
    revenueByStatus,
    dailyRevenue: calculateRevenueTrends(billableAppointments, services, 'daily', 30, allowedStatuses),
    weeklyRevenue: calculateRevenueTrends(billableAppointments, services, 'weekly', 84, allowedStatuses), // 12 weeks
    monthlyRevenue: calculateRevenueTrends(billableAppointments, services, 'monthly', 365, allowedStatuses) // 12 months
  };
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Utility function to format percentage
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

// Generate mock historical data for demonstration (when no real historical data exists)
export function generateMockHistoricalData(
  appointments: Appointment[],
  services: Service[],
  monthsBack: number = 12
): RevenueData[] {
  const mockData: RevenueData[] = [];
  const today = new Date();
  
  for (let i = monthsBack; i >= 0; i--) {
    const date = subDays(startOfMonth(today), i * 30);
    const monthKey = format(date, 'yyyy-MM-01');
    
    // Generate realistic mock data based on current appointment patterns
    const baseRevenue = appointments.length > 0 
      ? calculateDashboardMetrics(appointments, services).totalRevenue / appointments.length * 10
      : 2000;
    
    // Add some realistic variance
    const variance = (Math.random() - 0.5) * 0.3; // ±15% variance
    const seasonalBoost = Math.sin((i / monthsBack) * Math.PI * 2) * 0.1; // Seasonal patterns
    
    mockData.push({
      date: monthKey,
      revenue: Math.max(0, baseRevenue * (1 + variance + seasonalBoost)),
      appointments: Math.floor(baseRevenue / 100) + Math.floor(Math.random() * 5)
    });
  }
  
  return mockData.reverse();
}