import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Phone, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import type { Service } from '@shared/schema'

export default function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedService, setSelectedService] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [isBooked, setIsBooked] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  // Fetch services from API
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await fetch('/api/services')
      if (!response.ok) throw new Error('Failed to fetch services')
      return response.json() as Promise<Service[]>
    }
  })

  // Fetch available time slots for selected date
  const { data: availableSlots = [], isLoading: slotsLoading } = useQuery({
    queryKey: ['/api/availability', selectedDate],
    queryFn: async () => {
      if (!selectedDate) return []
      const response = await fetch(`/api/availability/${selectedDate}`)
      if (!response.ok) throw new Error('Failed to fetch availability')
      return response.json() as Promise<string[]>
    },
    enabled: !!selectedDate
  })

  // Book appointment mutation
  const bookingMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to book appointment')
      }
      return response.json()
    },
    onSuccess: () => {
      setIsBooked(true)
      queryClient.invalidateQueries({ queryKey: ['/api/availability'] })
      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully booked.",
      })
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message,
      })
    }
  })

  // Generate next 30 days for date selection
  const generateDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      // Skip Sundays (0) and Mondays (1)
      if (date.getDay() !== 0 && date.getDay() !== 1) {
        dates.push(date)
      }
    }
    return dates
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) return

    // Parse time and create appointment datetime
    const [time, period] = selectedTime.split(' ')
    const [hours, minutes] = time.split(':').map(Number)
    const adjustedHours = period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours
    
    const appointmentDateTime = new Date(selectedDate)
    appointmentDateTime.setHours(adjustedHours, minutes || 0, 0, 0)

    const appointmentData = {
      serviceId: selectedService,
      clientName: formData.name,
      clientEmail: formData.email,
      clientPhone: formData.phone,
      appointmentDate: appointmentDateTime.toISOString(),
      notes: formData.notes || null
    }

    bookingMutation.mutate(appointmentData)
  }

  const canProceedToStep2 = selectedDate && selectedTime && selectedService
  const canProceedToStep3 = formData.name && formData.email && formData.phone

  if (isBooked) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Card>
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-bold mb-3">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for booking with us. You will receive a confirmation email shortly 
              with all the details and preparation instructions.
            </p>
            <div className="bg-muted/50 rounded-lg p-4 text-left">
              <h3 className="font-semibold mb-2">Appointment Details:</h3>
              <p><span className="font-medium">Service:</span> {services.find(s => s.id === selectedService)?.name}</p>
              <p><span className="font-medium">Date:</span> {selectedDate}</p>
              <p><span className="font-medium">Time:</span> {selectedTime}</p>
              <p><span className="font-medium">Name:</span> {formData.name}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-ring text-white' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-ring' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Service and DateTime Selection */}
      {currentStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Select Service
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading services...</span>
                </div>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover-elevate ${
                      selectedService === service.id 
                        ? 'border-ring bg-ring/10' 
                        : 'border-border hover:border-ring/50'
                    }`}
                    onClick={() => setSelectedService(service.id)}
                    data-testid={`service-${service.id}`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Duration: {Math.floor(service.duration / 60)}h {service.duration % 60 > 0 ? `${service.duration % 60}min` : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">${service.price}</Badge>
                          <p className="text-xs text-yellow-500 mt-1">
                            Deposit: ${(parseFloat(service.price) * 0.20).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {selectedService === service.id && (
                        <div className="pt-2 border-t border-yellow-500/20">
                          <p className="text-xs text-yellow-500/90">
                            ⚠️ 20% deposit required to secure your appointment
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Date and Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Select Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Date Selection */}
              <div className="mb-6">
                <Label className="text-sm font-medium mb-3 block">Choose Date</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {generateDates().slice(0, 14).map((date) => {
                    const dateStr = formatDate(date)
                    return (
                      <button
                        key={dateStr}
                        className={`p-2 text-xs rounded-md border transition-colors hover-elevate ${
                          selectedDate === dateStr
                            ? 'border-ring bg-ring/10 text-ring'
                            : 'border-border hover:border-ring/50'
                        }`}
                        onClick={() => setSelectedDate(dateStr)}
                        data-testid={`date-${date.toISOString().split('T')[0]}`}
                      >
                        {date.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <Label className="text-sm font-medium mb-3 block">Available Times</Label>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm">Loading available times...</span>
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No available time slots for this date. Please choose another date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((time) => {
                        // Convert 24h format to 12h format for display
                        const [hours, minutes] = time.split(':').map(Number)
                        const period = hours >= 12 ? 'PM' : 'AM'
                        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
                        const displayTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
                        
                        return (
                          <button
                            key={time}
                            className={`p-2 text-sm rounded-md border transition-colors hover-elevate ${
                              selectedTime === displayTime
                                ? 'border-ring bg-ring/10 text-ring'
                                : 'border-border hover:border-ring/50'
                            }`}
                            onClick={() => setSelectedTime(displayTime)}
                            data-testid={`time-${time.replace(/[:\s]/g, '').toLowerCase()}`}
                          >
                            <Clock className="w-3 h-3 inline mr-1" />
                            {displayTime}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Contact Information */}
      {currentStep === 2 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Your full name"
                  data-testid="input-name"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  data-testid="input-phone"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your.email@example.com"
                data-testid="input-email"
              />
            </div>
            <div>
              <Label htmlFor="notes">Special Requests or Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any specific requests, skin concerns, or additional information..."
                rows={3}
                data-testid="textarea-notes"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirmation */}
      {currentStep === 3 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5" />
              Confirm Your Booking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-6 mb-6">
              <h3 className="font-serif text-lg font-bold mb-4">Appointment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-medium">
                    {services.find(s => s.id === selectedService)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">
                    {(() => {
                      const service = services.find(s => s.id === selectedService)
                      if (!service) return ''
                      const hours = Math.floor(service.duration / 60)
                      const minutes = service.duration % 60
                      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Price:</span>
                  <span className="font-medium">
                    ${services.find(s => s.id === selectedService)?.price}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-yellow-500 font-semibold">20% Deposit Due Now:</span>
                  <span className="text-yellow-500 font-bold">
                    ${(parseFloat(services.find(s => s.id === selectedService)?.price || '0') * 0.20).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Deposit Notice */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-4 mt-4">
                <p className="text-sm text-yellow-200 font-medium">
                  💳 Important: A 20% deposit is required to confirm your booking
                </p>
                <p className="text-xs text-yellow-200/80 mt-1">
                  The remaining balance will be due on the day of your appointment
                </p>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium mb-2">Contact Details:</h4>
                <p className="text-sm text-muted-foreground">{formData.name}</p>
                <p className="text-sm text-muted-foreground">{formData.email}</p>
                <p className="text-sm text-muted-foreground">{formData.phone}</p>
                {formData.notes && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium">Notes:</span> {formData.notes}
                  </p>
                )}
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              By confirming this booking, you agree to our cancellation policy. 
              We require 24-hour notice for any changes or cancellations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          data-testid="button-back"
        >
          Back
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={
              (currentStep === 1 && !canProceedToStep2) ||
              (currentStep === 2 && !canProceedToStep3)
            }
            data-testid="button-next"
          >
            Next Step
          </Button>
        ) : (
          <Button
            onClick={handleBooking}
            disabled={bookingMutation.isPending}
            data-testid="button-confirm-booking"
          >
            {bookingMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}