import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Phone, Mail, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// TODO: remove mock functionality - replace with real booking system
const availableSlots = [
  '9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM'
]

const services = [
  { id: 'bridal', name: 'Bridal Makeup', duration: '3-4 hours', price: '$350-500' },
  { id: 'event', name: 'Special Event', duration: '1.5-2 hours', price: '$150-250' },
  { id: 'everyday', name: 'Everyday Glam', duration: '1 hour', price: '$80-120' },
  { id: 'lesson', name: 'Makeup Lesson', duration: '2 hours', price: '$200' },
  { id: 'group', name: 'Group Session', duration: '2-4 hours', price: '$100-150/person' }
]

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
    console.log('Booking submitted:', {
      date: selectedDate,
      time: selectedTime,
      service: selectedService,
      ...formData
    })
    setIsBooked(true)
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
              {services.map((service) => (
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">Duration: {service.duration}</p>
                    </div>
                    <Badge variant="outline">{service.price}</Badge>
                  </div>
                </div>
              ))}
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
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((time) => (
                      <button
                        key={time}
                        className={`p-2 text-sm rounded-md border transition-colors hover-elevate ${
                          selectedTime === time
                            ? 'border-ring bg-ring/10 text-ring'
                            : 'border-border hover:border-ring/50'
                        }`}
                        onClick={() => setSelectedTime(time)}
                        data-testid={`time-${time.replace(/[:\s]/g, '').toLowerCase()}`}
                      >
                        <Clock className="w-3 h-3 inline mr-1" />
                        {time}
                      </button>
                    ))}
                  </div>
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
                    {services.find(s => s.id === selectedService)?.duration}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-medium">
                    {services.find(s => s.id === selectedService)?.price}
                  </span>
                </div>
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
            data-testid="button-confirm-booking"
          >
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  )
}