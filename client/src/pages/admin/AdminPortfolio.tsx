import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPortfolioItemSchema } from "@shared/schema";
import type { PortfolioItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2, Star, Upload } from "lucide-react";
import { z } from "zod";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

type PortfolioFormData = z.infer<typeof insertPortfolioItemSchema>;

export default function AdminPortfolio() {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: portfolioItems, isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ["/api/portfolio"]
  });
  
  const form = useForm<PortfolioFormData>({
    resolver: zodResolver(insertPortfolioItemSchema),
    defaultValues: selectedItem ? {
      title: selectedItem.title,
      description: selectedItem.description,
      category: selectedItem.category,
      imageUrl: selectedItem.imageUrl,
      tags: selectedItem.tags,
      featured: selectedItem.featured
    } : {
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      tags: [],
      featured: false
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: PortfolioFormData) => {
      return apiRequest("POST", "/api/portfolio", data);
    },
    onSuccess: () => {
      toast({ title: "Portfolio item created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create portfolio item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PortfolioFormData> }) => {
      return apiRequest("PATCH", `/api/admin/portfolio/${id}`, data);
    },
    onSuccess: () => {
      toast({ title: "Portfolio item updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update portfolio item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/portfolio/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Portfolio item deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete portfolio item",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleEdit = (item: PortfolioItem) => {
    setSelectedItem(item);
    form.reset({
      title: item.title,
      description: item.description,
      category: item.category,
      imageUrl: item.imageUrl,
      tags: item.tags,
      featured: item.featured
    });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedItem(undefined);
    form.reset({
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      tags: [],
      featured: false
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(undefined);
    form.reset();
  };

  const onSubmit = (data: PortfolioFormData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
      handleCloseDialog();
    } else {
      createMutation.mutate(data);
    }
  };

  const toggleFeatured = (item: PortfolioItem) => {
    updateMutation.mutate({ 
      id: item.id, 
      data: { featured: !item.featured } 
    });
  };

  if (isLoading) {
    return <div>Loading portfolio...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Portfolio</h2>
          <p className="text-muted-foreground mt-2">
            Manage your portfolio showcase items
          </p>
        </div>
        <Button onClick={handleAdd} data-testid="button-add-portfolio">
          <Plus className="w-4 h-4 mr-2" />
          Add Portfolio Item
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioItems?.map((item) => (
          <Card key={item.id} data-testid={`card-portfolio-${item.id}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFeatured(item)}
                    data-testid={`button-feature-${item.id}`}
                  >
                    <Star className={`w-4 h-4 ${item.featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(item)}
                    data-testid={`button-edit-portfolio-${item.id}`}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(item.id)}
                    data-testid={`button-delete-portfolio-${item.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{item.category}</CardDescription>
            </CardHeader>
            <CardContent>
              {item.imageUrl && (
                <div className="mb-3 aspect-video bg-muted rounded-md overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-3">
                {item.description}
              </p>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</DialogTitle>
            <DialogDescription>
              {selectedItem ? 'Update portfolio item details' : 'Create a new portfolio showcase'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Elegant Bridal Look" data-testid="input-portfolio-title" />
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
                        placeholder="Describe the look or service..." 
                        className="min-h-[100px]"
                        data-testid="input-portfolio-description"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-portfolio-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bridal">Bridal</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="editorial">Editorial</SelectItem>
                        <SelectItem value="natural">Natural</SelectItem>
                        <SelectItem value="glam">Glam</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Portfolio Image</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value && (
                          <div className="aspect-video bg-muted rounded-md overflow-hidden">
                            <img 
                              src={field.value} 
                              alt="Portfolio preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760}
                          buttonTestId="button-upload-image"
                          onGetUploadParameters={async () => {
                            const response: any = await apiRequest("POST", "/api/admin/portfolio/upload");
                            return {
                              method: "PUT" as const,
                              url: response.uploadURL,
                            };
                          }}
                          onComplete={async (result) => {
                            if (result.successful && result.successful.length > 0) {
                              const uploadURL = result.successful[0].uploadURL;
                              
                              if (selectedItem) {
                                const response: any = await apiRequest(
                                  "PUT",
                                  `/api/admin/portfolio/${selectedItem.id}/image`,
                                  { imageUrl: uploadURL }
                                );
                                field.onChange(response.objectPath);
                                toast({ title: "Image uploaded successfully" });
                                queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
                              } else {
                                field.onChange(uploadURL);
                                toast({ title: "Image uploaded. Complete the form to save." });
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span>Upload Image</span>
                          </div>
                        </ObjectUploader>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl>
                      <Input 
                        value={field.value?.join(", ") || ""}
                        onChange={(e) => field.onChange(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                        placeholder="e.g., wedding, elegant, romantic"
                        data-testid="input-portfolio-tags"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Featured</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Show this item prominently on the homepage
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-portfolio-featured"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-portfolio"
                >
                  {selectedItem ? 'Update Item' : 'Create Item'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}