import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  Settings,
  Image,
  Calendar,
  MessageSquare,
  LogOut,
  Briefcase,
  User,
  ChevronUp,
} from "lucide-react";

// Import actual admin components
import AdminOverview from "./admin/AdminOverview";
import AdminServices from "./admin/AdminServices";
import AdminPortfolio from "./admin/AdminPortfolio";
import AdminAppointments from "./admin/AdminAppointments";
import AdminMessages from "./admin/AdminMessages";

const menuItems = [
  {
    title: "Dashboard",
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

function AdminSidebar({ adminUsername }: { adminUsername: string }) {
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

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AD';
  };

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
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-12"
                  data-testid="button-profile-dropdown"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(adminUsername)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{adminUsername}</span>
                    <span className="truncate text-xs text-muted-foreground">Administrator</span>
                  </div>
                  <ChevronUp className="ml-auto h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="end"
                className="w-56"
                data-testid="dropdown-profile-menu"
              >
                <DropdownMenuLabel data-testid="text-profile-email">
                  {adminUsername}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="button-profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="button-settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  data-testid="button-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
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

  const adminUsername = (data as any).admin?.username || 'Admin';

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar adminUsername={adminUsername} />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-2xl font-semibold">Admin Panel</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Welcome, {adminUsername}
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