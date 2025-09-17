import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from 'lucide-react'

export default function ContactSection() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form submitted')
    // TODO: remove mock functionality - implement real form submission
  }

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to book your appointment or have questions about our services? 
            We'd love to hear from you!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Studio Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Visit our beautiful studio located in the heart of downtown, 
                  featuring professional lighting and a relaxing atmosphere.
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Bella Beauty Studio</p>
                  <p className="text-muted-foreground">123 Beauty Lane</p>
                  <p className="text-muted-foreground">Downtown District</p>
                  <p className="text-muted-foreground">City, ST 12345</p>
                </div>
              </CardContent>
            </Card>

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
                      <p className="text-sm text-muted-foreground">(555) 123-4567</p>
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
                      <p className="text-sm text-muted-foreground">hello@bellabeauty.com</p>
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
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Follow Us</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button variant="outline" size="sm" data-testid="button-instagram">
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-facebook">
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Follow us for daily inspiration, makeup tips, and behind-the-scenes content!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      type="text" 
                      placeholder="John"
                      data-testid="input-first-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      type="text" 
                      placeholder="Doe"
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
                    data-testid="input-contact-email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="(555) 123-4567"
                    data-testid="input-contact-phone"
                  />
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    type="text" 
                    placeholder="General Inquiry"
                    data-testid="input-subject"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your event, preferred dates, or any questions you have..."
                    rows={4}
                    data-testid="textarea-message"
                  />
                </div>

                <Button type="submit" className="w-full" data-testid="button-send-message">
                  Send Message
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  We'll get back to you within 24 hours!
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}