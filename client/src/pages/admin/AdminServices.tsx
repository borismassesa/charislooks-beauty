import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertServiceSchema } from "@shared/schema";
import type { Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, DollarSign, Clock } from "lucide-react";
import { z } from "zod";

type ServiceFormData = z.infer<typeof insertServiceSchema>;

function ServiceDialog({ service, onClose }: { service?: Service; onClose: () => void }) {
  const { toast } = useToast();
  const isEditing = !!service;
  
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(insertServiceSchema),
    defaultValues: service ? {
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      category: service.category,
      active: service.active
    } : {
      name: "",
      description: "",
      duration: 60,
      price: "100",
      category: "everyday",
      active: true
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      return apiRequest("POST", "/api/admin/services", data);
    },
    onSuccess: () => {
      toast({ title: "Service created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create service",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      return apiRequest("PATCH", `/api/admin/services/${service!.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Service updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update service",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: ServiceFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Update service details' : 'Create a new service offering'}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g., Bridal Makeup" data-testid="input-service-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Describe the service..." 
                    className="min-h-[100px]"
                    data-testid="input-service-description"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      onChange={e => field.onChange(parseInt(e.target.value))}
                      data-testid="input-service-duration"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price ($)</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="100.00" data-testid="input-service-price" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-service-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="bridal">Bridal</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="everyday">Everyday</SelectItem>
                      <SelectItem value="lesson">Lesson</SelectItem>
                      <SelectItem value="group">Group</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Service is available for booking
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-service-active"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="button-submit-service"
            >
              {isEditing ? 'Update Service' : 'Create Service'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}

export default function AdminServices() {
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"]
  });

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedService(undefined);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedService(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Services</h2>
          <p className="text-muted-foreground mt-2">
            Manage your service offerings and pricing
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} data-testid="button-add-service">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          {dialogOpen && (
            <ServiceDialog service={selectedService} onClose={handleCloseDialog} />
          )}
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-9 w-9" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="mt-4">
                    <Skeleton className="h-5 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          services?.map((service) => (
          <Card key={service.id} data-testid={`card-service-${service.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary">
                      {service.category}
                    </span>
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(service)}
                  data-testid={`button-edit-service-${service.id}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {service.description}
              </p>
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{service.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold">${service.price}</span>
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-xs px-2 py-1 rounded-md ${
                  service.active 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-red-500/10 text-red-500'
                }`}>
                  {service.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>
    </div>
  );
}