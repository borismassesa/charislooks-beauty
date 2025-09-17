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

// Import admin sub-pages
import AdminServices from "./admin/AdminServices";
import AdminPortfolio from "./admin/AdminPortfolio";
import AdminAppointments from "./admin/AdminAppointments";
import AdminMessages from "./admin/AdminMessages";
import AdminOverview from "./admin/AdminOverview";

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
      return apiRequest("/api/admin/logout", {
        method: "POST"
      });
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
  
  if (!data || !data.authenticated) {
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
              Welcome, {data.admin.username}
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