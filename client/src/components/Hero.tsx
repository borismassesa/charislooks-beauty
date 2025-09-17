import { Button } from '@/components/ui/button'
import { Calendar, Palette, Star } from 'lucide-react'
import { Link } from 'wouter'
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
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/10">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-white">
              Award-Winning Makeup Artist
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Welcome to CharisLooks
            <span className="block text-ring"> Professional Beauty Artistry</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Specializing in bridal makeup, special events, and everyday glam. 
            Creating stunning looks that enhance your natural beauty and boost your confidence.
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

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">500+</div>
                <div className="text-sm text-white/80">Happy Clients</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">5+</div>
                <div className="text-sm text-white/80">Years Experience</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">100+</div>
                <div className="text-sm text-white/80">Wedding Looks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}