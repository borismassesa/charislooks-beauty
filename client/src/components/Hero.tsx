import { Button } from '@/components/ui/button'
import { Calendar, Palette, Star } from 'lucide-react'
import { Link } from 'wouter'
import salonInteriorImage from '@assets/generated_images/Salon_interior_photo_cb762670.png'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${salonInteriorImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-primary/40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-primary-foreground">
              Award-Winning Makeup Artist
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
            Transform Your Beauty with 
            <span className="block text-ring"> Professional Artistry</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
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
                className="bg-background/20 backdrop-blur-sm border-primary-foreground/30 text-primary-foreground hover:bg-background/30 w-full sm:w-auto"
                data-testid="button-view-portfolio"
              >
                <Palette className="mr-2 h-5 w-5" />
                View Portfolio
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-primary-foreground/20">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary-foreground">500+</div>
                <div className="text-sm text-primary-foreground/80">Happy Clients</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary-foreground">5+</div>
                <div className="text-sm text-primary-foreground/80">Years Experience</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-primary-foreground">100+</div>
                <div className="text-sm text-primary-foreground/80">Wedding Looks</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}