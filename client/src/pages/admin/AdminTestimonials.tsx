import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTestimonialSchema } from "@shared/schema";
import type { Testimonial } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Star, Trash2, Quote, Upload, X } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type TestimonialFormData = z.infer<typeof insertTestimonialSchema>;

function TestimonialDialog({ testimonial, onClose }: { testimonial?: Testimonial; onClose: () => void }) {
  const { toast } = useToast();
  const isEditing = !!testimonial;
  const [avatarUrl, setAvatarUrl] = useState<string | null>(testimonial?.avatarUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  
  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(insertTestimonialSchema),
    defaultValues: testimonial ? {
      clientName: testimonial.clientName,
      service: testimonial.service,
      rating: testimonial.rating,
      testimonial: testimonial.testimonial,
      avatarInitials: testimonial.avatarInitials,
      avatarUrl: testimonial.avatarUrl,
      featured: testimonial.featured,
      active: testimonial.active
    } : {
      clientName: "",
      service: "",
      rating: 5,
      testimonial: "",
      avatarInitials: "",
      avatarUrl: null,
      featured: false,
      active: true
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      return apiRequest("POST", "/api/admin/testimonials", data);
    },
    onSuccess: () => {
      toast({ title: "Testimonial created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create testimonial",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: TestimonialFormData) => {
      return apiRequest("PATCH", `/api/admin/testimonials/${testimonial!.id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Testimonial updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update testimonial",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      setAvatarUrl(url);
      form.setValue('avatarUrl', url);
      
      toast({
        title: "Avatar uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload avatar image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    form.setValue('avatarUrl', null);
  };

  const onSubmit = async (data: TestimonialFormData) => {
    const submitData = {
      ...data,
      avatarUrl
    };
    
    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Testimonial' : 'Add New Testimonial'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Update testimonial details' : 'Add a new client testimonial'}
        </DialogDescription>
      </DialogHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Sarah Johnson" 
                      {...field} 
                      data-testid="input-client-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="avatarInitials"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar Initials</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="SJ" 
                      maxLength={3}
                      {...field} 
                      data-testid="input-avatar-initials"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Avatar Upload */}
          <div className="space-y-2">
            <FormLabel>Profile Picture (Optional)</FormLabel>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt="Avatar" />
                ) : (
                  <AvatarFallback className="text-lg">
                    {form.watch('avatarInitials') || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  disabled={isUploading}
                  data-testid="button-upload-avatar"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Avatar'}
                </Button>
                
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    data-testid="button-remove-avatar"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Upload a profile picture or it will show initials
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Bridal Makeup & Hair" 
                      {...field} 
                      data-testid="input-service"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating (1-5 stars)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={5} 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      data-testid="input-rating"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="testimonial"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Testimonial</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Absolutely stunning work! CharisLooks made me feel like a princess on my wedding day." 
                    rows={4}
                    {...field}
                    data-testid="input-testimonial"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex gap-6">
            <FormField
              control={form.control}
              name="featured"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-featured"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Featured</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-active"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Active</FormLabel>
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
              data-testid="button-submit-testimonial"
            >
              {isEditing ? 'Update Testimonial' : 'Create Testimonial'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
}

export default function AdminTestimonials() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | undefined>();
  const { toast } = useToast();
  
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"]
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/testimonials/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Testimonial deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      setDeleteDialogOpen(false);
      setTestimonialToDelete(undefined);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete testimonial",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleEdit = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedTestimonial(undefined);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTestimonial(undefined);
  };

  const handleDeleteClick = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (testimonialToDelete) {
      deleteMutation.mutate(testimonialToDelete.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Testimonials</h2>
          <p className="text-muted-foreground mt-2">
            Manage customer reviews and testimonials
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} data-testid="button-add-testimonial">
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          {dialogOpen && (
            <TestimonialDialog testimonial={selectedTestimonial} onClose={handleCloseDialog} />
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
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : testimonials && testimonials.length > 0 ? (
          testimonials.map((testimonial) => (
            <Card 
              key={testimonial.id} 
              className="relative"
              data-testid={`card-testimonial-${testimonial.id}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Quote className="h-4 w-4 text-accent/50 flex-shrink-0" />
                      <CardTitle className="text-lg truncate">{testimonial.clientName}</CardTitle>
                    </div>
                    <CardDescription className="truncate">{testimonial.service}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(testimonial)}
                      data-testid={`button-edit-${testimonial.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(testimonial)}
                      data-testid={`button-delete-${testimonial.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm line-clamp-3">{testimonial.testimonial}</p>
                
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={testimonial.active ? "default" : "secondary"} className="text-xs">
                    {testimonial.active ? "Active" : "Inactive"}
                  </Badge>
                  {testimonial.featured && (
                    <Badge variant="outline" className="text-xs">Featured</Badge>
                  )}
                  <Badge variant="outline" className="text-xs">{testimonial.avatarInitials}</Badge>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Quote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Testimonials Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start adding customer testimonials to showcase your work
            </p>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Testimonial
            </Button>
          </div>
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the testimonial from{" "}
              <span className="font-semibold">{testimonialToDelete?.clientName}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
