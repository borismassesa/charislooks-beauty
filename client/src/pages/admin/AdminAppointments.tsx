import { useQuery } from "@tanstack/react-query";
import type { Appointment } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Mail, Phone, User } from "lucide-react";
import { format } from "date-fns";

export default function AdminAppointments() {
  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"]
  });

  if (isLoading) {
    return <div>Loading appointments...</div>;
  }

  const confirmedAppointments = appointments?.filter(a => a.status === 'confirmed') || [];
  const completedAppointments = appointments?.filter(a => a.status === 'completed') || [];
  const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled') || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Appointments</h2>
        <p className="text-muted-foreground mt-2">
          View and manage customer appointments
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{confirmedAppointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{completedAppointments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{cancelledAppointments.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
        <div className="space-y-4">
          {confirmedAppointments.length > 0 ? (
            confirmedAppointments.map((appointment) => (
              <Card key={appointment.id} data-testid={`card-appointment-${appointment.id}`}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.clientName}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{appointment.clientEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{appointment.clientPhone}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(appointment.appointmentDate), 'MMMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(appointment.appointmentDate), 'h:mm a')}
                        </span>
                      </div>
                      <span className={`inline-flex px-2 py-1 rounded-md text-xs ${
                        appointment.status === 'confirmed' 
                          ? 'bg-green-500/10 text-green-500' 
                          : appointment.status === 'completed'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                  {appointment.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Notes:</span> {appointment.notes}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No upcoming appointments
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}