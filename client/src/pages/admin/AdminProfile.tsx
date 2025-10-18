import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Lock, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminProfile() {
  const { toast } = useToast();

  const { data: admin, isLoading } = useQuery({
    queryKey: ["/api/admin/check"],
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      return apiRequest("POST", "/api/admin/update-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    },
  });

  const getInitials = (name: string) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AD';
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-6" data-testid="page-admin-profile">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground">
          Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Card data-testid="card-profile-info">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {getInitials(admin?.admin?.username || '')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold" data-testid="text-profile-username">
                {admin?.admin?.username}
              </p>
              <p className="text-sm text-muted-foreground">
                Administrator
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Username
              </label>
              <Input
                value={admin?.admin?.username || ''}
                disabled
                className="bg-muted"
                data-testid="input-username"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <Input
                value={admin?.admin?.email || ''}
                disabled
                className="bg-muted"
                data-testid="input-email"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-change-password">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit((data) =>
                updatePasswordMutation.mutate(data)
              )}
              className="space-y-4"
            >
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your current password"
                        {...field}
                        data-testid="input-current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your new password"
                        {...field}
                        data-testid="input-new-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your new password"
                        {...field}
                        data-testid="input-confirm-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={updatePasswordMutation.isPending}
                data-testid="button-update-password"
              >
                {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
