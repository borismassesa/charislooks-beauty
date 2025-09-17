import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ContactMessage } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, User, MessageSquare, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function AdminMessages() {
  const { toast } = useToast();
  const { data: messages, isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/contact"]
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest(`/api/admin/contact/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      toast({ title: "Message status updated" });
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return <div>Loading messages...</div>;
  }

  const unreadMessages = messages?.filter(m => m.status === 'unread') || [];
  const readMessages = messages?.filter(m => m.status === 'read') || [];
  const repliedMessages = messages?.filter(m => m.status === 'replied') || [];

  const markAsRead = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'read' });
  };

  const markAsReplied = (id: string) => {
    updateStatusMutation.mutate({ id, status: 'replied' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Contact Messages</h2>
        <p className="text-muted-foreground mt-2">
          Manage inquiries from potential clients
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{unreadMessages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{readMessages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{repliedMessages.length}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <Card 
              key={message.id} 
              className={message.status === 'unread' ? 'border-orange-500/50' : ''}
              data-testid={`card-message-${message.id}`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {message.firstName} {message.lastName}
                    </CardTitle>
                    <CardDescription>{message.subject}</CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-xs ${
                    message.status === 'unread' 
                      ? 'bg-orange-500/10 text-orange-500' 
                      : message.status === 'read'
                      ? 'bg-blue-500/10 text-blue-500'
                      : 'bg-green-500/10 text-green-500'
                  }`}>
                    {message.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{message.email}</span>
                    </div>
                    {message.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{message.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-muted rounded-md">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-sm">{message.message}</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                    <div className="flex gap-2">
                      {message.status === 'unread' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsRead(message.id)}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-mark-read-${message.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark as Read
                        </Button>
                      )}
                      {message.status !== 'replied' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => markAsReplied(message.id)}
                          disabled={updateStatusMutation.isPending}
                          data-testid={`button-mark-replied-${message.id}`}
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Mark as Replied
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No messages yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}