import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Loader2, CheckCircle, MessageCircle, Image, Calendar } from 'lucide-react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'

export default function ContactSection() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState<string>('')
  const { toast } = useToast()

  // Fetch dynamic contact info
  const { data: contactInfo } = useQuery({
    queryKey: ['contact-info'],
    queryFn: async () => {
      const response = await fetch('/api/contact/info')
      if (!response.ok) return null
      return response.json()
    }
  })

  // Fetch dynamic social media links
  const { data: socialLinks = [] } = useQuery({
    queryKey: ['social-media-links'],
    queryFn: async () => {
      const response = await fetch('/api/contact/social-media')
      if (!response.ok) return []
      return response.json()
    }
  })

  const contactMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }
      return response.json()
    },
    onSuccess: (data) => {
      setIsSubmitted(true)
      setSubmissionId(data.id || `MSG-${Date.now().toString().slice(-6)}`)
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to Send",
        description: error.message,
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    contactMutation.mutate(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <section className="bg-muted/30 py-16 lg:py-24" id="contact-form">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {contactInfo?.title || "Let's Create Your"}
            {contactInfo?.subtitle && (
              <span className="block text-ring">{contactInfo.subtitle}</span>
            )}
            {!contactInfo?.subtitle && (
              <span className="block text-ring">Perfect Look</span>
            )}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            {contactInfo?.description || "Connect with our expert beauty professionals for personalized consultations, accessible services, and tailored beauty solutions. Ready to book your appointment or have questions about our services? We're here to listen, understand your vision, and bring your beauty dreams to life."}
          </p>
          
          {/* Decorative Elements */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1 max-w-24"></div>
            <MessageCircle className="h-6 w-6 text-ring" />
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1 max-w-24"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            {/* Studio Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Studio Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Visit our beautiful studio featuring professional lighting and a relaxing atmosphere.
                </p>
                <div className="space-y-2">
                  {contactInfo?.address ? (
                    // If admin provides address, display it as-is (could be single line or multi-line)
                    <div className="text-muted-foreground whitespace-pre-line">
                      {contactInfo.address}
                    </div>
                  ) : (
                    // Fallback multi-line address
                    <>
                      <p className="text-muted-foreground">123 Beauty Lane</p>
                      <p className="text-muted-foreground">Downtown District</p>
                      <p className="text-muted-foreground">City, ST 12345</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Phone and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-ring/10 rounded-lg">
                      <Phone className="h-5 w-5 text-ring" />
                    </div>
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        {contactInfo?.phone || "(555) 123-4567"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-ring/10 rounded-lg">
                      <Mail className="h-5 w-5 text-ring" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {contactInfo?.email || "hello@charislooks.com"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Studio Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {contactInfo?.hours ? (
                    <p className="text-muted-foreground">{contactInfo.hours}</p>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Tuesday - Friday</span>
                        <span className="text-muted-foreground">9:00 AM - 7:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday</span>
                        <span className="text-muted-foreground">8:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday</span>
                        <span className="text-muted-foreground">10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monday</span>
                        <span className="text-muted-foreground">Closed</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                  {/* Success Animation */}
                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-20 w-20 rounded-full bg-green-100 animate-pulse"></div>
                    </div>
                    <CheckCircle className="h-20 w-20 text-green-500 mx-auto relative z-10 animate-bounce" />
                    {/* Celebration dots */}
                    <div className="absolute top-2 left-8 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                    <div className="absolute top-4 right-6 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping delay-100"></div>
                    <div className="absolute bottom-6 left-6 w-1 h-1 bg-green-400 rounded-full animate-ping delay-200"></div>
                    <div className="absolute bottom-4 right-8 w-2 h-2 bg-green-400 rounded-full animate-ping delay-300"></div>
                  </div>
                  
                  {/* Success Message */}
                  <div className="space-y-4 mb-8">
                    <h3 className="text-2xl font-bold text-green-600">Message Sent Successfully!</h3>
                    <p className="text-lg text-muted-foreground">
                      Thank you for reaching out, <span className="font-semibold text-foreground">{formData.firstName}</span>!
                    </p>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-sm text-green-800">
                        <strong>What happens next?</strong><br />
                        We'll review your message and get back to you within 24 hours via email or phone.
                      </p>
                      {submissionId && (
                        <div className="mt-3 pt-3 border-t border-green-200">
                          <p className="text-xs text-green-700">
                            <strong>Reference ID:</strong> {submissionId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-4 mb-8">
                    <p className="text-sm text-muted-foreground">While you wait, feel free to:</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = '/portfolio'}
                        className="flex items-center gap-2"
                      >
                        <Image className="h-4 w-4" />
                        View Our Work
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = '/booking'}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        Book Appointment
                      </Button>
                      {socialLinks.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(socialLinks[0]?.url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          {socialLinks[0]?.platform === 'Instagram' && <Instagram className="h-4 w-4" />}
                          {socialLinks[0]?.platform === 'Facebook' && <Facebook className="h-4 w-4" />}
                          {socialLinks[0]?.platform === 'TikTok' && <span className="h-4 w-4">🎵</span>}
                          Follow Us
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-muted/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-muted-foreground mb-2">Need immediate assistance?</p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
                      {contactInfo?.phone && (
                        <a 
                          href={`tel:${contactInfo.phone}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          <Phone className="h-4 w-4" />
                          {contactInfo.phone}
                        </a>
                      )}
                      {contactInfo?.email && (
                        <a 
                          href={`mailto:${contactInfo.email}`}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                        >
                          <Mail className="h-4 w-4" />
                          {contactInfo.email}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Reset Form Button */}
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsSubmitted(false)
                      setSubmissionId('')
                      setFormData({
                        firstName: '',
                        lastName: '',
                        email: '',
                        phone: '',
                        subject: '',
                        message: ''
                      })
                    }}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in-0 slide-in-from-top-4 duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        type="text" 
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        type="text" 
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      data-testid="input-contact-email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="(555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      data-testid="input-contact-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      type="text" 
                      placeholder="General Inquiry"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      required
                      data-testid="input-subject"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us about your event, preferred dates, or any questions you have..."
                      rows={4}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      required
                      data-testid="textarea-message"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={contactMutation.isPending}
                    data-testid="button-send-message"
                  >
                    {contactMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>

                  <p className="text-sm text-muted-foreground text-center">
                    We'll get back to you within 24 hours!
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}