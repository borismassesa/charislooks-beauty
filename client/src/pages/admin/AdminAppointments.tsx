import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Appointment, Service } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, Mail, Phone, User, Plus, Edit, Trash2, CalendarDays, List, BarChart3, Search, Filter, MoreHorizontal, CheckCircle2, X, RefreshCw, Download, Send } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay, parseISO } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Status configuration
const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-500", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-green-500/10 text-green-500", icon: CheckCircle2 },
  completed: { label: "Completed", color: "bg-blue-500/10 text-blue-500", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-500", icon: X },
  "no-show": { label: "No Show", color: "bg-gray-500/10 text-gray-500", icon: X }
};

type ViewMode = "list" | "calendar" | "analytics";

// Simple Calendar Grid Component
interface SimpleCalendarGridProps {
  selectedDate: Date;
  appointments: Appointment[];
  services: Service[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (date: Date, time: string) => void;
}

function SimpleCalendarGrid({ 
  selectedDate, 
  appointments, 
  services, 
  onAppointmentClick, 
  onTimeSlotClick 
}: SimpleCalendarGridProps) {
  // Generate week days starting from the selected date
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Time slots (9 AM to 6 PM)
  const timeSlots = Array.from({ length: 10 }, (_, i) => {
    const hour = 9 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  // Get appointments for the current week
  const weekAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate >= weekStart && aptDate <= endOfWeek(weekStart, { weekStartsOn: 1 });
  });

  // Group appointments by date and time
  const appointmentsByDateTime = weekAppointments.reduce((acc, apt) => {
    const aptDate = new Date(apt.appointmentDate);
    const dateKey = format(aptDate, 'yyyy-MM-dd');
    const timeKey = format(aptDate, 'HH:00');
    const key = `${dateKey}-${timeKey}`;
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(apt);
    
    return acc;
  }, {} as Record<string, Appointment[]>);

  const getAppointmentStyle = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    return config.color;
  };

  const isToday = (date: Date) => isSameDay(date, new Date());

  return (
    <div className="space-y-4">
      {/* Week Header */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={`p-4 text-center rounded-lg border ${
              isToday(day) ? 'bg-primary/10 border-primary' : 'bg-muted/50'
            }`}
          >
            <div className="text-sm font-medium">
              {format(day, 'EEE')}
            </div>
            <div className={`text-xl font-bold ${
              isToday(day) ? 'text-primary' : ''
            }`}>
              {format(day, 'd')}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(day, 'MMM')}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {timeSlots.map((timeSlot) => (
          <div key={timeSlot} className="grid grid-cols-8 gap-2 items-center">
            {/* Time label */}
            <div className="text-sm font-medium text-muted-foreground">
              {timeSlot}
            </div>
            
            {/* Day columns */}
            {weekDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const appointmentKey = `${dateKey}-${timeSlot}`;
              const dayAppointments = appointmentsByDateTime[appointmentKey] || [];
              
              return (
                <div
                  key={`${day.toISOString()}-${timeSlot}`}
                  className={`min-h-[60px] p-2 border rounded-lg hover-elevate cursor-pointer ${
                    isToday(day) ? 'bg-muted/10 border-muted' : 'border-muted/50'
                  }`}
                  onClick={() => onTimeSlotClick(day, timeSlot)}
                  data-testid={`time-slot-${format(day, 'yyyy-MM-dd')}-${timeSlot}`}
                >
                  {dayAppointments.map((appointment) => {
                    const service = services.find(s => s.id === appointment.serviceId);
                    
                    return (
                      <div
                        key={appointment.id}
                        className={`p-2 rounded-md text-xs cursor-pointer mb-1 ${getAppointmentStyle(appointment.status)}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(appointment);
                        }}
                        data-testid={`calendar-appointment-${appointment.id}`}
                      >
                        <div className="font-medium truncate">
                          {appointment.clientName}
                        </div>
                        <div className="truncate text-xs opacity-80">
                          {service?.name || 'Unknown Service'}
                        </div>
                        <div className="text-xs opacity-70">
                          {format(new Date(appointment.appointmentDate), 'h:mm a')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {weekAppointments.length === 0 && (
        <div className="p-8 text-center text-muted-foreground border rounded-lg border-dashed">
          <div className="text-lg font-medium mb-2">No appointments this week</div>
          <div className="text-sm">
            Click on any time slot to create a new appointment
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAppointments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Form state for create/edit
  const [formData, setFormData] = useState({
    serviceId: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: ""
  });

  // Data fetching
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"]
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"]
  });

  const { data: analytics } = useQuery({
    queryKey: ["/api/appointments/analytics", dateRange.start, dateRange.end],
    enabled: viewMode === "analytics"
  });

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      // Search filter
      if (searchTerm && !apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !apt.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== "all" && apt.status !== statusFilter) {
        return false;
      }
      
      // Service filter
      if (serviceFilter !== "all" && apt.serviceId !== serviceFilter) {
        return false;
      }
      
      return true;
    });
  }, [appointments, searchTerm, statusFilter, serviceFilter]);

  // Mutations
  const createAppointmentMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/appointments", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setShowCreateDialog(false);
      resetForm();
      toast({ title: "Appointment created successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to create appointment", description: error.message });
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setShowEditDialog(false);
      setEditingAppointment(null);
      resetForm();
      toast({ title: "Appointment updated successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to update appointment", description: error.message });
    }
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setShowDeleteDialog(false);
      setEditingAppointment(null);
      toast({ title: "Appointment deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to delete appointment", description: error.message });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/appointments/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      toast({ title: "Status updated successfully" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to update status", description: error.message });
    }
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ appointmentIds, status }: { appointmentIds: string[]; status: string }) => {
      const response = await apiRequest("PATCH", "/api/appointments/bulk/status", { appointmentIds, status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setSelectedAppointments([]);
      toast({ title: "Bulk status update completed" });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Failed to update statuses", description: error.message });
    }
  });

  // Helper functions
  const resetForm = () => {
    setFormData({
      serviceId: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: ""
    });
  };

  const handleSelectAppointment = (appointmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAppointments(prev => [...prev, appointmentId]);
    } else {
      setSelectedAppointments(prev => prev.filter(id => id !== appointmentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAppointments(filteredAppointments.map(apt => apt.id));
    } else {
      setSelectedAppointments([]);
    }
  };

  const handleStatusChange = (appointmentId: string, status: string) => {
    updateStatusMutation.mutate({ id: appointmentId, status });
  };

  const handleBulkStatusUpdate = (status: string) => {
    if (selectedAppointments.length === 0) return;
    bulkUpdateStatusMutation.mutate({ appointmentIds: selectedAppointments, status });
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const appointmentDate = new Date(appointment.appointmentDate);
    setFormData({
      serviceId: appointment.serviceId,
      clientName: appointment.clientName,
      clientEmail: appointment.clientEmail,
      clientPhone: appointment.clientPhone,
      appointmentDate: format(appointmentDate, 'yyyy-MM-dd'),
      appointmentTime: format(appointmentDate, 'HH:mm'),
      notes: appointment.notes || ""
    });
    setShowEditDialog(true);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowDeleteDialog(true);
  };

  const handleAppointmentMove = async (appointmentId: string, newDate: Date, newTime: string) => {
    try {
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (!appointment) return;

      // Create new appointment date by combining date and time
      const [hours, minutes] = newTime.split(':').map(Number);
      const newDateTime = new Date(newDate);
      newDateTime.setHours(hours, minutes, 0, 0);

      // Check for conflicts
      const conflicts = await checkAppointmentConflicts(
        appointmentId,
        appointment.serviceId,
        newDateTime.toISOString()
      );

      if (conflicts.length > 0) {
        toast({
          variant: "destructive",
          title: "Scheduling Conflict",
          description: "This time slot conflicts with existing appointments.",
        });
        return;
      }

      // Update appointment
      updateAppointmentMutation.mutate({
        id: appointmentId,
        data: { appointmentDate: newDateTime.toISOString() }
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to reschedule",
        description: "Unable to move appointment to the selected time.",
      });
    }
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    const appointmentDateTime = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    setFormData({
      ...formData,
      appointmentDate: format(appointmentDateTime, 'yyyy-MM-dd'),
      appointmentTime: format(appointmentDateTime, 'HH:mm')
    });
    setShowCreateDialog(true);
  };

  const checkAppointmentConflicts = async (
    excludeId: string | null, 
    serviceId: string, 
    appointmentDate: string
  ): Promise<Appointment[]> => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return [];

    const aptDate = new Date(appointmentDate);
    const aptHour = aptDate.getHours();
    const serviceHours = Math.ceil(service.duration / 60);

    return appointments.filter(apt => {
      if (apt.id === excludeId) return false;
      if (apt.status === 'cancelled') return false;

      const existingDate = new Date(apt.appointmentDate);
      const existingHour = existingDate.getHours();
      
      // Check if dates are the same day
      if (!isSameDay(aptDate, existingDate)) return false;

      // Check time overlap
      return Math.abs(existingHour - aptHour) < serviceHours;
    });
  };

  const handleSubmit = () => {
    const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
    
    const data = {
      serviceId: formData.serviceId,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      appointmentDate: appointmentDateTime.toISOString(),
      notes: formData.notes || null
    };

    if (editingAppointment) {
      updateAppointmentMutation.mutate({ id: editingAppointment.id, data });
    } else {
      createAppointmentMutation.mutate(data);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    const IconComponent = config.icon;
    return (
      <Badge className={`${config.color} gap-1`} data-testid={`badge-status-${status}`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const noShows = appointments.filter(a => a.status === 'no-show').length;

    return { total, confirmed, completed, cancelled, pending, noShows };
  }, [appointments]);

  if (appointmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="loading-appointments">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading appointments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Appointment Management</h2>
          <p className="text-muted-foreground mt-2">
            Comprehensive appointment scheduling and management system
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          data-testid="button-create-appointment"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total</div>
            <div className="text-2xl font-bold" data-testid="stat-total">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-yellow-500" data-testid="stat-pending">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Confirmed</div>
            <div className="text-2xl font-bold text-green-500" data-testid="stat-confirmed">{stats.confirmed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Completed</div>
            <div className="text-2xl font-bold text-blue-500" data-testid="stat-completed">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Cancelled</div>
            <div className="text-2xl font-bold text-red-500" data-testid="stat-cancelled">{stats.cancelled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">No Shows</div>
            <div className="text-2xl font-bold text-gray-500" data-testid="stat-no-shows">{stats.noShows}</div>
          </CardContent>
        </Card>
      </div>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="list" data-testid="tab-list">
            <List className="w-4 h-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-calendar">
            <CalendarDays className="w-4 h-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by client name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      data-testid="input-search"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-[150px]" data-testid="select-status-filter">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="no-show">No Show</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-full lg:w-[150px]" data-testid="select-service-filter">
                    <SelectValue placeholder="All Services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedAppointments.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedAppointments.length} appointment(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Select onValueChange={handleBulkStatusUpdate}>
                      <SelectTrigger className="w-[150px]" data-testid="select-bulk-status">
                        <SelectValue placeholder="Update Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirm</SelectItem>
                        <SelectItem value="completed">Complete</SelectItem>
                        <SelectItem value="cancelled">Cancel</SelectItem>
                        <SelectItem value="no-show">Mark No Show</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedAppointments([])}
                      data-testid="button-clear-selection"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Appointments List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedAppointments.length === filteredAppointments.length && filteredAppointments.length > 0}
                    onCheckedChange={handleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                  <Label className="text-sm">Select All</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredAppointments.length > 0 ? (
                <div className="space-y-0">
                  {filteredAppointments.map((appointment, index) => {
                    const service = services.find(s => s.id === appointment.serviceId);
                    const isSelected = selectedAppointments.includes(appointment.id);
                    
                    // Calculate 20% deposit amount
                    const depositAmount = service ? (parseFloat(service.price) * 0.20).toFixed(2) : '0.00';
                    
                    return (
                      <div
                        key={appointment.id}
                        className={`p-4 border-b last:border-b-0 hover-elevate ${isSelected ? 'bg-muted/50' : ''}`}
                        data-testid={`appointment-item-${appointment.id}`}
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectAppointment(appointment.id, checked as boolean)}
                            data-testid={`checkbox-appointment-${appointment.id}`}
                          />
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Client Info */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium" data-testid={`client-name-${appointment.id}`}>
                                  {appointment.clientName}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground" data-testid={`client-email-${appointment.id}`}>
                                {appointment.clientEmail}
                              </div>
                              <div className="text-sm text-muted-foreground" data-testid={`client-phone-${appointment.id}`}>
                                {appointment.clientPhone}
                              </div>
                            </div>

                            {/* Service Info */}
                            <div>
                              <div className="font-medium" data-testid={`service-name-${appointment.id}`}>
                                {service?.name || 'Unknown Service'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {service?.duration ? `${service.duration} min` : ''}
                              </div>
                              <div className="text-sm font-medium">
                                {service?.price ? `$${service.price}` : ''}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                <span className="font-medium">Deposit (20%):</span> ${depositAmount} <span className="text-xs">(Interac)</span>
                              </div>
                              {appointment.depositPaid && (
                                <Badge className="bg-green-500/10 text-green-500 text-xs mt-1">
                                  Deposit Paid
                                </Badge>
                              )}
                            </div>

                            {/* Date & Time */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium" data-testid={`appointment-date-${appointment.id}`}>
                                  {format(new Date(appointment.appointmentDate), 'MMM d, yyyy')}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm" data-testid={`appointment-time-${appointment.id}`}>
                                  {format(new Date(appointment.appointmentDate), 'h:mm a')}
                                </span>
                              </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center justify-between">
                              <div>
                                {getStatusBadge(appointment.status)}
                              </div>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" data-testid={`menu-appointment-${appointment.id}`}>
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleEditAppointment(appointment)} data-testid={`edit-appointment-${appointment.id}`}>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'confirmed')} data-testid={`confirm-appointment-${appointment.id}`}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Confirm
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'completed')} data-testid={`complete-appointment-${appointment.id}`}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Complete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleStatusChange(appointment.id, 'cancelled')} data-testid={`cancel-appointment-${appointment.id}`}>
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleDeleteAppointment(appointment)}
                                    data-testid={`delete-appointment-${appointment.id}`}
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-muted-foreground" data-testid={`appointment-notes-${appointment.id}`}>
                              <span className="font-medium">Notes:</span> {appointment.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground" data-testid="no-appointments">
                  No appointments found matching your criteria
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar">
          <div className="space-y-4">
            {/* Calendar Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="gap-2" data-testid="button-select-date">
                          <CalendarIcon className="w-4 h-4" />
                          {format(selectedDate, 'MMMM yyyy')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(new Date())}
                        data-testid="button-today"
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                        data-testid="button-prev-week"
                      >
                        Previous Week
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                        data-testid="button-next-week"
                      >
                        Next Week
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Legend:</span>
                    {Object.entries(STATUS_CONFIG).map(([status, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <div key={status} className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded-sm ${config.color.split(' ')[0]}`} />
                          <span className="text-xs text-muted-foreground">{config.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Grid */}
            <Card>
              <CardContent className="p-4">
                <SimpleCalendarGrid 
                  selectedDate={selectedDate}
                  appointments={filteredAppointments}
                  services={services}
                  onAppointmentClick={handleEditAppointment}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground" data-testid="analytics-placeholder">
                Analytics dashboard will be implemented in the next iteration
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Appointment Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          setEditingAppointment(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl" data-testid="dialog-appointment-form">
          <DialogHeader>
            <DialogTitle>
              {editingAppointment ? 'Edit Appointment' : 'Create New Appointment'}
            </DialogTitle>
            <DialogDescription>
              {editingAppointment ? 'Update the appointment details below.' : 'Fill in the details to create a new appointment.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service</Label>
              <Select value={formData.serviceId} onValueChange={(value) => setFormData({...formData, serviceId: value})}>
                <SelectTrigger data-testid="select-service">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map(service => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                placeholder="Enter client name"
                data-testid="input-client-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                placeholder="Enter client email"
                data-testid="input-client-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientPhone">Client Phone</Label>
              <Input
                id="clientPhone"
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                placeholder="Enter client phone"
                data-testid="input-client-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentDate">Date</Label>
              <Input
                id="appointmentDate"
                type="date"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({...formData, appointmentDate: e.target.value})}
                data-testid="input-appointment-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointmentTime">Time</Label>
              <Input
                id="appointmentTime"
                type="time"
                value={formData.appointmentTime}
                onChange={(e) => setFormData({...formData, appointmentTime: e.target.value})}
                data-testid="input-appointment-time"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Add any special notes or requirements"
              data-testid="textarea-notes"
            />
          </div>

          {/* Deposit Information */}
          {formData.serviceId && (
            <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Deposit Required (20% via Interac)</div>
                  <div className="text-2xl font-bold text-primary">
                    ${(() => {
                      const service = services.find(s => s.id === formData.serviceId);
                      return service ? (parseFloat(service.price) * 0.20).toFixed(2) : '0.00';
                    })()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Total service cost: ${(() => {
                      const service = services.find(s => s.id === formData.serviceId);
                      return service?.price || '0.00';
                    })()}
                  </div>
                </div>
                {editingAppointment && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="depositPaid"
                      checked={editingAppointment.depositPaid}
                      onCheckedChange={(checked) => {
                        if (editingAppointment) {
                          updateAppointmentMutation.mutate({
                            id: editingAppointment.id,
                            data: { depositPaid: checked === true }
                          });
                        }
                      }}
                      data-testid="checkbox-deposit-paid"
                    />
                    <Label htmlFor="depositPaid" className="text-sm font-medium cursor-pointer">
                      Mark as Paid
                    </Label>
                  </div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <strong>Payment Instructions:</strong> Client should send the deposit via Interac e-Transfer before the appointment date.
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                setEditingAppointment(null);
                resetForm();
              }}
              data-testid="button-cancel-appointment"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
              data-testid="button-save-appointment"
            >
              {(createAppointmentMutation.isPending || updateAppointmentMutation.isPending) && (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingAppointment ? 'Update' : 'Create'} Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this appointment for {editingAppointment?.clientName}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => editingAppointment && deleteAppointmentMutation.mutate(editingAppointment.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}