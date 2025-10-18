import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Calendar, DollarSign, Settings as SettingsIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [isLoading] = useState(false);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    bookingConfirmations: true,
    newAppointmentAlerts: true,
    depositReminders: true,
    upcomingAppointmentReminders: false,
    contactFormNotifications: true,
  });

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    toast({
      title: "Setting updated",
      description: "Your preferences have been saved.",
    });
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6" data-testid="page-admin-settings">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Configure your application preferences and notifications
        </p>
      </div>

      <Card data-testid="card-email-notifications">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Manage when you receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="email-notifications"
                className="text-base font-medium cursor-pointer"
              >
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive all email notifications
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                handleSettingChange("emailNotifications", checked)
              }
              data-testid="switch-email-notifications"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="booking-confirmations"
                className="text-base font-medium cursor-pointer"
              >
                Booking Confirmations
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when clients book appointments
              </p>
            </div>
            <Switch
              id="booking-confirmations"
              checked={settings.bookingConfirmations}
              onCheckedChange={(checked) =>
                handleSettingChange("bookingConfirmations", checked)
              }
              disabled={!settings.emailNotifications}
              data-testid="switch-booking-confirmations"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="new-appointment-alerts"
                className="text-base font-medium cursor-pointer"
              >
                New Appointment Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Instant alerts for new appointment requests
              </p>
            </div>
            <Switch
              id="new-appointment-alerts"
              checked={settings.newAppointmentAlerts}
              onCheckedChange={(checked) =>
                handleSettingChange("newAppointmentAlerts", checked)
              }
              disabled={!settings.emailNotifications}
              data-testid="switch-new-appointment-alerts"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="contact-form-notifications"
                className="text-base font-medium cursor-pointer"
              >
                Contact Form Messages
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified about new contact inquiries
              </p>
            </div>
            <Switch
              id="contact-form-notifications"
              checked={settings.contactFormNotifications}
              onCheckedChange={(checked) =>
                handleSettingChange("contactFormNotifications", checked)
              }
              disabled={!settings.emailNotifications}
              data-testid="switch-contact-notifications"
            />
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-appointment-reminders">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Reminders
          </CardTitle>
          <CardDescription>
            Configure reminder preferences for appointments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="upcoming-reminders"
                className="text-base font-medium cursor-pointer"
              >
                Upcoming Appointment Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Daily summary of upcoming appointments
              </p>
            </div>
            <Switch
              id="upcoming-reminders"
              checked={settings.upcomingAppointmentReminders}
              onCheckedChange={(checked) =>
                handleSettingChange("upcomingAppointmentReminders", checked)
              }
              data-testid="switch-upcoming-reminders"
            />
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-payment-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Settings
          </CardTitle>
          <CardDescription>
            Manage deposit and payment notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label
                htmlFor="deposit-reminders"
                className="text-base font-medium cursor-pointer"
              >
                Deposit Payment Reminders
              </Label>
              <p className="text-sm text-muted-foreground">
                Notify clients about pending deposit payments
              </p>
            </div>
            <Switch
              id="deposit-reminders"
              checked={settings.depositReminders}
              onCheckedChange={(checked) =>
                handleSettingChange("depositReminders", checked)
              }
              data-testid="switch-deposit-reminders"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
