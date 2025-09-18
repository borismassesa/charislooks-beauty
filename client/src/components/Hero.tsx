import { Button } from '@/components/ui/button'
import { Calendar, Palette, Star, Scissors } from 'lucide-react'
import { Link } from 'wouter'
import TypingAnimation from '@/components/TypingAnimation'
import salonInteriorImage from '@assets/generated_images/Salon_interior_photo_cb762670.png'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Dark Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${salonInteriorImage})` }}
      >
        {/* Dark gradient overlay for better contrast in dark theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Main Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Transform your beauty with CharisLooks
            <span className="block text-ring h-20 sm:h-24 lg:h-28 flex items-center justify-center">
              <TypingAnimation 
                words={[
                  'Professional Hair Styling',
                  'Stunning Makeup Artistry',
                  'Bridal Beauty Services',
                  'Hair Cutting & Styling',
                  'Complete Transformations'
                ]}
                className="text-ring"
                typingSpeed={80}
                deletingSpeed={40}
                pauseTime={2500}
              />
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Your complete beauty destination for professional hair services and makeup artistry. 
            From stunning hair transformations to flawless makeup, we create looks that enhance your natural beauty.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/booking">
              <Button 
                size="lg" 
                className="bg-ring hover:bg-ring/90 text-white border-ring/20 backdrop-blur-sm w-full sm:w-auto"
                data-testid="button-book-appointment"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Appointment
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 w-full sm:w-auto"
                data-testid="button-view-portfolio"
              >
                <Palette className="mr-2 h-5 w-5" />
                View Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}