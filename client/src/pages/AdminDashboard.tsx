import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Home,
  Settings,
  Image,
  Calendar,
  MessageSquare,
  LogOut,
  Briefcase,
} from "lucide-react";

// Simple admin components for now
function AdminOverview() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
      <p>Welcome to the admin panel. Use the sidebar to navigate.</p>
    </div>
  );
}

function AdminServices() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Services</h2>
      <p>Service management coming soon.</p>
    </div>
  );
}

function AdminPortfolio() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Portfolio</h2>
      <p>Portfolio management coming soon.</p>
    </div>
  );
}

function AdminAppointments() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Appointments</h2>
      <p>Appointment management coming soon.</p>
    </div>
  );
}

function AdminMessages() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Messages</h2>
      <p>Message management coming soon.</p>
    </div>
  );
}

const menuItems = [
  {
    title: "Overview",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Services",
    url: "/admin/dashboard/services",
    icon: Briefcase,
  },
  {
    title: "Portfolio",
    url: "/admin/dashboard/portfolio",
    icon: Image,
  },
  {
    title: "Appointments",
    url: "/admin/dashboard/appointments",
    icon: Calendar,
  },
  {
    title: "Messages",
    url: "/admin/dashboard/messages",
    icon: MessageSquare,
  },
];

function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      toast({ title: "Logged out successfully" });
      setLocation("/admin");
    }
  });

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={location === item.url ? "bg-sidebar-accent" : ""}
                    data-testid={`link-admin-${item.title.toLowerCase()}`}
                  >
                    <a href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  data-testid="button-admin-logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Check authentication
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/admin/check"],
    retry: false
  });
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication required",
        description: "Please login to access the admin panel",
        variant: "destructive"
      });
      setLocation("/admin");
    }
  }, [error, setLocation, toast]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!data || !(data as any).authenticated) {
    return null;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-semibold">Admin Panel</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Welcome, {(data as any).admin?.username || 'Admin'}
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Switch>
              <Route path="/admin/dashboard" component={AdminOverview} />
              <Route path="/admin/dashboard/services" component={AdminServices} />
              <Route path="/admin/dashboard/portfolio" component={AdminPortfolio} />
              <Route path="/admin/dashboard/appointments" component={AdminAppointments} />
              <Route path="/admin/dashboard/messages" component={AdminMessages} />
              <Route>
                <div>Page not found</div>
              </Route>
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}