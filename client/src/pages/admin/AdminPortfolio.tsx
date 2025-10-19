import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPortfolioItemSchema } from "@shared/schema";
import type { PortfolioItem } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2, Star, Upload, CheckSquare, Square } from "lucide-react";
import { z } from "zod";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

type PortfolioFormData = z.infer<typeof insertPortfolioItemSchema>;

export default function AdminPortfolio() {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
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
      beforeImageUrl: selectedItem.beforeImageUrl || "",
      afterImageUrl: selectedItem.afterImageUrl || "",
      videoUrl: selectedItem.videoUrl || "",
      tags: selectedItem.tags,
      featured: selectedItem.featured
    } : {
      title: "",
      description: "",
      category: "",
      imageUrl: "",
      beforeImageUrl: "",
      afterImageUrl: "",
      videoUrl: "",
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return apiRequest("POST", "/api/admin/portfolio/bulk/delete", { ids });
    },
    onSuccess: (response: any) => {
      toast({ title: response.message });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      setSelectedItems([]);
      setBulkDeleteOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete portfolio items",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const bulkFeatureMutation = useMutation({
    mutationFn: async ({ ids, featured }: { ids: string[]; featured: boolean }) => {
      return apiRequest("POST", "/api/admin/portfolio/bulk/feature", { ids, featured });
    },
    onSuccess: (response: any) => {
      toast({ title: response.message });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      setSelectedItems([]);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update portfolio items",
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
      beforeImageUrl: item.beforeImageUrl || "",
      afterImageUrl: item.afterImageUrl || "",
      videoUrl: item.videoUrl || "",
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
      beforeImageUrl: "",
      afterImageUrl: "",
      videoUrl: "",
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

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === portfolioItems?.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(portfolioItems?.map(item => item.id) || []);
    }
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedItems);
  };

  const handleBulkFeature = () => {
    const allFeatured = selectedItems.every(id => 
      portfolioItems?.find(item => item.id === id)?.featured
    );
    bulkFeatureMutation.mutate({ 
      ids: selectedItems, 
      featured: !allFeatured 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Portfolio</h2>
          <p className="text-muted-foreground mt-2">
            Manage your portfolio showcase items
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAdd} data-testid="button-add-portfolio">
            <Plus className="w-4 h-4 mr-2" />
            Add Portfolio Item
          </Button>
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedItems.length > 0 && (
        <div className="bg-muted/50 border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkFeature}
                disabled={bulkFeatureMutation.isPending}
              >
                <Star className="w-4 h-4 mr-2" />
                {selectedItems.every(id => portfolioItems?.find(item => item.id === id)?.featured) ? 'Unfeature' : 'Feature'}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteOpen(true)}
                disabled={bulkDeleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Select All Header */}
      {portfolioItems && portfolioItems.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            {selectedItems.length === portfolioItems.length ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            {selectedItems.length === portfolioItems.length ? 'Deselect All' : 'Select All'}
          </Button>
          <span className="text-sm text-muted-foreground">
            {portfolioItems.length} total items
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-3/4" />
                    <div className="flex gap-1">
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                      <Skeleton className="h-9 w-9" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-24 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full mb-3 rounded-md" />
                  <Skeleton className="h-12 w-full mb-3" />
                  <div className="flex flex-wrap gap-1">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          portfolioItems?.map((item) => (
          <Card key={item.id} data-testid={`card-portfolio-${item.id}`} className="relative">
            {/* Selection Checkbox */}
            <div className="absolute top-3 left-3 z-10">
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onCheckedChange={() => handleSelectItem(item.id)}
                data-testid={`checkbox-portfolio-${item.id}`}
              />
            </div>

            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg pr-8">{item.title}</CardTitle>
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
              {/* Media Preview */}
              <div className="mb-3 aspect-video bg-muted rounded-md overflow-hidden relative">
                {item.beforeImageUrl && item.afterImageUrl ? (
                  <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🔄</div>
                      <div className="text-xs text-muted-foreground">Before/After</div>
                    </div>
                  </div>
                ) : item.videoUrl ? (
                  <div className="w-full h-full bg-gradient-to-r from-red-100 to-pink-100 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎥</div>
                      <div className="text-xs text-muted-foreground">Video</div>
                    </div>
                  </div>
                ) : item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📷</div>
                      <div className="text-xs text-muted-foreground">No Image</div>
                    </div>
                  </div>
                )}
                
                {/* Media Type Badge */}
                <div className="absolute top-2 left-2">
                  {item.beforeImageUrl && item.afterImageUrl ? (
                    <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full">Before/After</span>
                  ) : item.videoUrl ? (
                    <span className="text-xs px-2 py-1 bg-red-500 text-white rounded-full">Video</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-gray-500 text-white rounded-full">Image</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-md">
                      +{item.tags.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Additional Info */}
              <div className="text-xs text-muted-foreground space-y-1">
                {item.beforeImageUrl && item.afterImageUrl && (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Before/After transformation
                  </div>
                )}
                {item.videoUrl && (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Video content available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          ))
        )}
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
                        <SelectItem value="Bridal">Bridal</SelectItem>
                        <SelectItem value="Hair Styling">Hair Styling</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Special Event">Special Event</SelectItem>
                        <SelectItem value="Editorial">Editorial</SelectItem>
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

              {/* Before Image Upload */}
              <FormField
                control={form.control}
                name="beforeImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Before Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value && (
                          <div className="aspect-video bg-muted rounded-md overflow-hidden">
                            <img 
                              src={field.value} 
                              alt="Before image preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760}
                          buttonTestId="button-upload-before-image"
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
                              field.onChange(uploadURL);
                              toast({ title: "Before image uploaded successfully" });
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span>Upload Before Image</span>
                          </div>
                        </ObjectUploader>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("")}
                            className="w-full"
                          >
                            Remove Before Image
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* After Image Upload */}
              <FormField
                control={form.control}
                name="afterImageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>After Image (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        {field.value && (
                          <div className="aspect-video bg-muted rounded-md overflow-hidden">
                            <img 
                              src={field.value} 
                              alt="After image preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <ObjectUploader
                          maxNumberOfFiles={1}
                          maxFileSize={10485760}
                          buttonTestId="button-upload-after-image"
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
                              field.onChange(uploadURL);
                              toast({ title: "After image uploaded successfully" });
                            }
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            <span>Upload After Image</span>
                          </div>
                        </ObjectUploader>
                        {field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => field.onChange("")}
                            className="w-full"
                          >
                            Remove After Image
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Video URL */}
              <FormField
                control={form.control}
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        value={field.value || ''}
                        placeholder="https://example.com/video.mp4" 
                        data-testid="input-portfolio-video-url" 
                      />
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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedItems.length} portfolio item{selectedItems.length > 1 ? 's' : ''}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete {selectedItems.length} Item{selectedItems.length > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}