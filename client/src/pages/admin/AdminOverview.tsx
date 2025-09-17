import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MessageSquare, Image, Briefcase } from "lucide-react";
import type { Service, Appointment, PortfolioItem, ContactMessage } from "@shared/schema";

export default function AdminOverview() {
  const { data: services } = useQuery<Service[]>({
    queryKey: ["/api/services"]
  });
  
  const { data: appointments } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"]
  });
  
  const { data: portfolio } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"]
  });
  
  const { data: messages } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact"]
  });

  const stats = [
    {
      title: "Total Services",
      value: services?.length || 0,
      description: "Active services offered",
      icon: Briefcase,
      color: "text-blue-500"
    },
    {
      title: "Appointments",
      value: appointments?.filter(a => a.status === 'confirmed').length || 0,
      description: "Confirmed bookings",
      icon: Calendar,
      color: "text-green-500"
    },
    {
      title: "Portfolio Items",
      value: portfolio?.length || 0,
      description: "Showcase pieces",
      icon: Image,
      color: "text-purple-500"
    },
    {
      title: "Unread Messages",
      value: messages?.filter(m => m.status === 'unread').length || 0,
      description: "New contact messages",
      icon: MessageSquare,
      color: "text-orange-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-muted-foreground mt-2">
          Manage your beauty salon portfolio and business
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Latest confirmed bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments && appointments.length > 0 ? (
              <div className="space-y-2">
                {appointments.slice(0, 5).map((apt) => (
                  <div key={apt.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{apt.clientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(apt.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm px-2 py-1 bg-green-500/10 text-green-500 rounded-md">
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No appointments yet</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest contact inquiries</CardDescription>
          </CardHeader>
          <CardContent>
            {messages && messages.length > 0 ? (
              <div className="space-y-2">
                {messages.slice(0, 5).map((msg) => (
                  <div key={msg.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{msg.firstName} {msg.lastName}</p>
                      <p className="text-sm text-muted-foreground">{msg.subject}</p>
                    </div>
                    <span className={`text-sm px-2 py-1 rounded-md ${
                      msg.status === 'unread' 
                        ? 'bg-orange-500/10 text-orange-500' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {msg.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No messages yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}