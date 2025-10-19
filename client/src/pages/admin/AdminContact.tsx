import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, Save, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Validation schemas
const contactFAQSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  order: z.number().min(0),
  active: z.boolean()
})

const contactInfoSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().min(1, 'Subtitle is required'),
  description: z.string().min(1, 'Description is required'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  hours: z.string().optional(),
  active: z.boolean()
})

const socialMediaLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Must be a valid URL'),
  icon: z.string().min(1, 'Icon is required'),
  active: z.boolean(),
  order: z.number().min(0)
})

type ContactFAQ = z.infer<typeof contactFAQSchema> & { id: string; createdAt: string }
type ContactInfo = z.infer<typeof contactInfoSchema> & { id: string; createdAt: string }
type SocialMediaLink = z.infer<typeof socialMediaLinkSchema> & { id: string; createdAt: string }

export default function AdminContact() {
  const [activeTab, setActiveTab] = useState('faqs')
  const [editingFAQ, setEditingFAQ] = useState<ContactFAQ | null>(null)
  const [editingInfo, setEditingInfo] = useState<ContactInfo | null>(null)
  const [editingSocial, setEditingSocial] = useState<SocialMediaLink | null>(null)
  const [faqDialogOpen, setFaqDialogOpen] = useState(false)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)
  const [socialDialogOpen, setSocialDialogOpen] = useState(false)
  
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // FAQ Form
  const faqForm = useForm<z.infer<typeof contactFAQSchema>>({
    resolver: zodResolver(contactFAQSchema),
    defaultValues: {
      question: '',
      answer: '',
      order: 0,
      active: true
    }
  })

  // Contact Info Form
  const infoForm = useForm<z.infer<typeof contactInfoSchema>>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      title: '',
      subtitle: '',
      description: '',
      phone: '',
      email: '',
      address: '',
      hours: '',
      active: true
    }
  })

  // Social Media Form
  const socialForm = useForm<z.infer<typeof socialMediaLinkSchema>>({
    resolver: zodResolver(socialMediaLinkSchema),
    defaultValues: {
      platform: '',
      url: '',
      icon: '',
      active: true,
      order: 0
    }
  })

  // Queries
  const { data: faqs = [], isLoading: faqsLoading } = useQuery({
    queryKey: ['contact-faqs'],
    queryFn: async () => {
      const response = await fetch('/api/admin/contact/faqs')
      if (!response.ok) throw new Error('Failed to fetch FAQs')
      return response.json()
    }
  })

  const { data: contactInfo = [], isLoading: infoLoading } = useQuery({
    queryKey: ['contact-info'],
    queryFn: async () => {
      const response = await fetch('/api/admin/contact/info')
      if (!response.ok) throw new Error('Failed to fetch contact info')
      return response.json()
    }
  })

  const { data: socialLinks = [], isLoading: socialLoading } = useQuery({
    queryKey: ['social-media-links'],
    queryFn: async () => {
      const response = await fetch('/api/admin/contact/social-media')
      if (!response.ok) throw new Error('Failed to fetch social media links')
      return response.json()
    }
  })

  // FAQ Mutations
  const createFaqMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactFAQSchema>) => {
      const response = await fetch('/api/admin/contact/faqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create FAQ')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-faqs'] })
      toast({ title: 'FAQ created successfully' })
      setFaqDialogOpen(false)
      faqForm.reset()
    }
  })

  const updateFaqMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof contactFAQSchema> }) => {
      const response = await fetch(`/api/admin/contact/faqs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update FAQ')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-faqs'] })
      toast({ title: 'FAQ updated successfully' })
      setEditingFAQ(null)
      faqForm.reset()
    }
  })

  const deleteFaqMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/contact/faqs/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete FAQ')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-faqs'] })
      toast({ title: 'FAQ deleted successfully' })
    }
  })

  // Contact Info Mutations
  const createInfoMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contactInfoSchema>) => {
      const response = await fetch('/api/admin/contact/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create contact info')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-info'] })
      toast({ title: 'Contact info created successfully' })
      setInfoDialogOpen(false)
      infoForm.reset()
    }
  })

  const updateInfoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof contactInfoSchema> }) => {
      const response = await fetch(`/api/admin/contact/info/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update contact info')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-info'] })
      toast({ title: 'Contact info updated successfully' })
      setEditingInfo(null)
      infoForm.reset()
    }
  })

  // Social Media Mutations
  const createSocialMutation = useMutation({
    mutationFn: async (data: z.infer<typeof socialMediaLinkSchema>) => {
      const response = await fetch('/api/admin/contact/social-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create social media link')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-links'] })
      toast({ title: 'Social media link created successfully' })
      setSocialDialogOpen(false)
      socialForm.reset()
    }
  })

  const updateSocialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof socialMediaLinkSchema> }) => {
      const response = await fetch(`/api/admin/contact/social-media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update social media link')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-links'] })
      toast({ title: 'Social media link updated successfully' })
      setEditingSocial(null)
      socialForm.reset()
    }
  })

  const deleteSocialMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/contact/social-media/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete social media link')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-media-links'] })
      toast({ title: 'Social media link deleted successfully' })
    }
  })

  // Handlers
  const handleEditFAQ = (faq: ContactFAQ) => {
    setEditingFAQ(faq)
    faqForm.reset({
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
      active: faq.active
    })
    setFaqDialogOpen(true)
  }

  const handleEditInfo = (info: ContactInfo) => {
    setEditingInfo(info)
    infoForm.reset({
      title: info.title,
      subtitle: info.subtitle,
      description: info.description,
      phone: info.phone || '',
      email: info.email || '',
      address: info.address || '',
      hours: info.hours || '',
      active: info.active
    })
    setInfoDialogOpen(true)
  }

  const handleEditSocial = (social: SocialMediaLink) => {
    setEditingSocial(social)
    socialForm.reset({
      platform: social.platform,
      url: social.url,
      icon: social.icon,
      active: social.active,
      order: social.order
    })
    setSocialDialogOpen(true)
  }

  const handleFaqSubmit = (data: z.infer<typeof contactFAQSchema>) => {
    if (editingFAQ) {
      updateFaqMutation.mutate({ id: editingFAQ.id, data })
    } else {
      createFaqMutation.mutate(data)
    }
  }

  const handleInfoSubmit = (data: z.infer<typeof contactInfoSchema>) => {
    if (editingInfo) {
      updateInfoMutation.mutate({ id: editingInfo.id, data })
    } else {
      createInfoMutation.mutate(data)
    }
  }

  const handleSocialSubmit = (data: z.infer<typeof socialMediaLinkSchema>) => {
    if (editingSocial) {
      updateSocialMutation.mutate({ id: editingSocial.id, data })
    } else {
      createSocialMutation.mutate(data)
    }
  }

  const handleCloseDialogs = () => {
    setFaqDialogOpen(false)
    setInfoDialogOpen(false)
    setSocialDialogOpen(false)
    setEditingFAQ(null)
    setEditingInfo(null)
    setEditingSocial(null)
    faqForm.reset()
    infoForm.reset()
    socialForm.reset()
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Page Management</h1>
        <p className="text-muted-foreground">
          Manage FAQs, contact information, and social media links for the contact page.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faqs">FAQs ({faqs.length})</TabsTrigger>
          <TabsTrigger value="info">Contact Info ({contactInfo.length})</TabsTrigger>
          <TabsTrigger value="social">Social Media ({socialLinks.length})</TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
            <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingFAQ(null); faqForm.reset() }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add FAQ
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={faqForm.handleSubmit(handleFaqSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="question">Question</Label>
                    <Input
                      id="question"
                      {...faqForm.register('question')}
                      placeholder="Enter the question"
                    />
                    {faqForm.formState.errors.question && (
                      <p className="text-sm text-red-500 mt-1">
                        {faqForm.formState.errors.question.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="answer">Answer</Label>
                    <Textarea
                      id="answer"
                      {...faqForm.register('answer')}
                      placeholder="Enter the answer"
                      rows={4}
                    />
                    {faqForm.formState.errors.answer && (
                      <p className="text-sm text-red-500 mt-1">
                        {faqForm.formState.errors.answer.message}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <Label htmlFor="order">Order</Label>
                      <Input
                        id="order"
                        type="number"
                        {...faqForm.register('order', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={faqForm.watch('active')}
                        onCheckedChange={(checked) => faqForm.setValue('active', checked)}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialogs}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createFaqMutation.isPending || updateFaqMutation.isPending}>
                      {editingFAQ ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {faqsLoading ? (
              <div className="text-center py-8">Loading FAQs...</div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No FAQs found. Create your first FAQ to get started.
              </div>
            ) : (
              faqs.map((faq: ContactFAQ) => (
                <Card key={faq.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={faq.active ? 'default' : 'secondary'}>
                            {faq.active ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                            {faq.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">Order: {faq.order}</Badge>
                        </div>
                        <h3 className="font-semibold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground text-sm">{faq.answer}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFAQ(faq)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this FAQ? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteFaqMutation.mutate(faq.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Contact Information</h2>
            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingInfo(null); infoForm.reset() }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact Info
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingInfo ? 'Edit Contact Info' : 'Add Contact Info'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={infoForm.handleSubmit(handleInfoSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...infoForm.register('title')}
                      placeholder="e.g., Let's Create Your Perfect Look"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      {...infoForm.register('subtitle')}
                      placeholder="e.g., Connect with our expert beauty professionals"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...infoForm.register('description')}
                      placeholder="Enter detailed description"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...infoForm.register('phone')}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...infoForm.register('email')}
                        placeholder="contact@charislooks.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      {...infoForm.register('address')}
                      placeholder="123 Beauty Street, City, State 12345"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hours">Hours</Label>
                    <Input
                      id="hours"
                      {...infoForm.register('hours')}
                      placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="active"
                      checked={infoForm.watch('active')}
                      onCheckedChange={(checked) => infoForm.setValue('active', checked)}
                    />
                    <Label htmlFor="active">Active</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialogs}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createInfoMutation.isPending || updateInfoMutation.isPending}>
                      {editingInfo ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {infoLoading ? (
              <div className="text-center py-8">Loading contact info...</div>
            ) : contactInfo.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No contact info found. Create contact information to get started.
              </div>
            ) : (
              contactInfo.map((info: ContactInfo) => (
                <Card key={info.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={info.active ? 'default' : 'secondary'}>
                            {info.active ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                            {info.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{info.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{info.subtitle}</p>
                        <p className="text-sm mb-2">{info.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          {info.phone && <div>📞 {info.phone}</div>}
                          {info.email && <div>✉️ {info.email}</div>}
                          {info.address && <div>📍 {info.address}</div>}
                          {info.hours && <div>🕒 {info.hours}</div>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditInfo(info)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Social Media Links</h2>
            <Dialog open={socialDialogOpen} onOpenChange={setSocialDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingSocial(null); socialForm.reset() }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Link
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingSocial ? 'Edit Social Media Link' : 'Add Social Media Link'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={socialForm.handleSubmit(handleSocialSubmit)} className="space-y-4">
                  <div>
                    <Label htmlFor="platform">Platform</Label>
                    <Input
                      id="platform"
                      {...socialForm.register('platform')}
                      placeholder="e.g., Instagram, Facebook, TikTok"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      {...socialForm.register('url')}
                      placeholder="https://instagram.com/charislooks"
                    />
                  </div>
                  <div>
                    <Label htmlFor="icon">Icon Name</Label>
                    <Input
                      id="icon"
                      {...socialForm.register('icon')}
                      placeholder="e.g., Instagram, Facebook, Music (for TikTok)"
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <Label htmlFor="order">Order</Label>
                      <Input
                        id="order"
                        type="number"
                        {...socialForm.register('order', { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={socialForm.watch('active')}
                        onCheckedChange={(checked) => socialForm.setValue('active', checked)}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={handleCloseDialogs}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createSocialMutation.isPending || updateSocialMutation.isPending}>
                      {editingSocial ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {socialLoading ? (
              <div className="text-center py-8">Loading social media links...</div>
            ) : socialLinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No social media links found. Create your first social media link to get started.
              </div>
            ) : (
              socialLinks.map((link: SocialMediaLink) => (
                <Card key={link.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={link.active ? 'default' : 'secondary'}>
                            {link.active ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                            {link.active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">Order: {link.order}</Badge>
                        </div>
                        <h3 className="font-semibold mb-1">{link.platform}</h3>
                        <p className="text-sm text-muted-foreground mb-1">Icon: {link.icon}</p>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {link.url}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSocial(link)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Social Media Link</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this social media link? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSocialMutation.mutate(link.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
