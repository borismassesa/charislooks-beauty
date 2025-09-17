import BookingCalendar from '@/components/BookingCalendar'

export default function Booking() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Book Your Appointment
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Schedule your beauty transformation with our easy online booking system. 
            Choose your service, pick your perfect time, and get ready to look amazing!
          </p>
        </div>
        
        <BookingCalendar />
      </div>
    </div>
  )
}