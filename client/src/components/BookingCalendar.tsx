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
    const selectedServiceDetails = services.find(s => s.id === selectedService)
    const depositAmount = selectedServiceDetails 
      ? (parseFloat(selectedServiceDetails.price) * 0.20).toFixed(2) 
      : '0.00'

    const resetBooking = () => {
      setIsBooked(false)
      setCurrentStep(1)
      setSelectedDate('')
      setSelectedTime('')
      setSelectedService('')
      setFormData({
        name: '',
        email: '',
        phone: '',
        notes: ''
      })
    }

    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6 sm:p-8">
            {/* Success Icon and Message */}
            <div className="text-center mb-6">
              <CheckCircle 
                className="h-20 w-20 text-ring mx-auto mb-4" 
                data-testid="icon-success"
              />
              <h2 
                className="font-serif text-3xl sm:text-4xl font-bold mb-3 text-foreground" 
                data-testid="heading-booking-confirmed"
              >
                Booking Confirmed!
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg">
                Thank you for choosing Charis Looks! Your appointment has been successfully reserved.
              </p>
            </div>

            {/* Appointment Details Card */}
            <div className="bg-muted/30 rounded-lg p-4 sm:p-6 mb-6 border border-border" data-testid="card-appointment-details">
              <h3 className="font-serif text-xl font-bold mb-4 text-foreground">Appointment Summary</h3>
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Service</span>
                  <span className="font-semibold text-foreground" data-testid="text-service-name">
                    {selectedServiceDetails?.name}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Service Price</span>
                  <span className="font-semibold text-foreground" data-testid="text-service-price">
                    ${selectedServiceDetails?.price}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Date</span>
                  <span className="font-semibold text-foreground" data-testid="text-appointment-date">
                    {selectedDate}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Time</span>
                  <span className="font-semibold text-foreground" data-testid="text-appointment-time">
                    {selectedTime}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                  <span className="text-muted-foreground font-medium">Client Name</span>
                  <span className="font-semibold text-foreground" data-testid="text-client-name">
                    {formData.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Prominent Deposit Payment Section */}
            <div 
              className="bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 rounded-lg p-6 sm:p-8 mb-6 border-2 border-rose-300 dark:border-rose-700" 
              data-testid="section-deposit-payment"
            >
              {/* Large Deposit Amount */}
              <div className="text-center mb-6">
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 uppercase tracking-wide mb-2">
                  Required Deposit
                </p>
                <p 
                  className="text-5xl sm:text-6xl font-bold text-rose-600 dark:text-rose-400" 
                  data-testid="text-deposit-amount"
                >
                  ${depositAmount}
                </p>
                <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mt-2">
                  (20% of total service price)
                </p>
              </div>

              {/* Payment Instructions */}
              <div className="bg-white/80 dark:bg-gray-900/50 rounded-md p-5 border border-rose-200 dark:border-rose-800">
                <h3 
                  className="font-serif text-xl font-bold mb-4 text-rose-900 dark:text-rose-100 flex items-center gap-2" 
                  data-testid="heading-payment-instructions"
                >
                  <Mail className="h-5 w-5" />
                  Payment Instructions
                </h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-rose-600 dark:bg-rose-500 text-white flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-1">Send Interac e-Transfer to:</p>
                      <p 
                        className="text-lg font-bold text-rose-600 dark:text-rose-400" 
                        data-testid="text-payment-email"
                      >
                        contact@charislooks.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-rose-600 dark:bg-rose-500 text-white flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-1">Amount:</p>
                      <p className="text-lg font-bold text-foreground" data-testid="text-payment-amount">
                        ${depositAmount} <span className="text-sm font-normal text-muted-foreground">(20% deposit)</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-rose-600 dark:bg-rose-500 text-white flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        Please send deposit before your appointment date
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-rose-600 dark:bg-rose-500 text-white flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-1">
                        Include in the e-Transfer message:
                      </p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Your appointment date: <span className="font-medium text-foreground">{selectedDate}</span></li>
                        <li>Your name: <span className="font-medium text-foreground">{formData.name}</span></li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-rose-200 dark:border-rose-800">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> Your appointment is confirmed once we receive your deposit. 
                    You will receive a confirmation email shortly with all the details.
                  </p>
                </div>
              </div>
            </div>

            {/* Book Another Appointment Button */}
            <div className="text-center">
              <Button 
                onClick={resetBooking}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
                data-testid="button-book-another"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Another Appointment
              </Button>
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
            <CardContent className="space-y-4">
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading services...</span>
                </div>
              ) : (
                <>
                  {/* Service Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Choose a Service</Label>
                    <Select 
                      value={selectedService} 
                      onValueChange={setSelectedService}
                      data-testid="select-service"
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a service..." />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Makeup Services */}
                        {services.filter(s => s.category === 'makeup').length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Makeup Services
                            </div>
                            {services
                              .filter(s => s.category === 'makeup')
                              .map((service) => (
                                <SelectItem 
                                  key={service.id} 
                                  value={service.id}
                                  data-testid={`option-service-${service.id}`}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span>{service.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">${service.price}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </>
                        )}
                        
                        {/* Hair Services */}
                        {services.filter(s => s.category === 'hair').length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Hair Services
                            </div>
                            {services
                              .filter(s => s.category === 'hair')
                              .map((service) => (
                                <SelectItem 
                                  key={service.id} 
                                  value={service.id}
                                  data-testid={`option-service-${service.id}`}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span>{service.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">${service.price}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </>
                        )}
                        
                        {/* Package Services */}
                        {services.filter(s => s.category === 'packages').length > 0 && (
                          <>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              Package Services
                            </div>
                            {services
                              .filter(s => s.category === 'packages')
                              .map((service) => (
                                <SelectItem 
                                  key={service.id} 
                                  value={service.id}
                                  data-testid={`option-service-${service.id}`}
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span>{service.name}</span>
                                    <span className="text-xs text-muted-foreground ml-2">${service.price}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selected Service Details */}
                  {selectedService && (() => {
                    const service = services.find(s => s.id === selectedService)
                    if (!service) return null
                    
                    return (
                      <div className="p-4 bg-ring/5 rounded-lg border border-ring/20" data-testid="selected-service-details">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-foreground">{service.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Duration: {Math.floor(service.duration / 60)}h {service.duration % 60 > 0 ? `${service.duration % 60}min` : ''}
                              </p>
                              {service.description && (
                                <p className="text-xs text-muted-foreground mt-1">{service.description}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant="outline" className="border-ring/30">${service.price}</Badge>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-ring/20">
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-yellow-600 font-medium">
                                Required Deposit: ${(parseFloat(service.price) * 0.20).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                (20% of total price)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </>
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