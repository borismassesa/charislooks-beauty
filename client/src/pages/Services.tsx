import ServicesSection from '@/components/ServicesSection'
import { Button } from '@/components/ui/button'
import { Brush, Star, ExternalLink } from 'lucide-react'
import { Link } from 'wouter'
import salonInteriorImage from '@assets/generated_images/Salon_interior_photo_cb762670.png'

export default function Services() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${salonInteriorImage})` }}
        >
          {/* Dark gradient overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">

            {/* Main Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Expert Beauty
              <span className="block text-ring">Services</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              From intricate braids and elegant hair styling to flawless makeup artistry, we specialize in creating 
              stunning looks that enhance your natural beauty. Professional services for every occasion.
            </p>

            {/* Decorative Elements */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-24"></div>
              <Brush className="h-6 w-6 text-ring" />
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-24"></div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Link href="/booking">
                <Button 
                  size="lg" 
                  className="bg-ring hover:bg-ring/90 text-white border-ring/20 backdrop-blur-sm"
                  data-testid="button-book-service"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Book Your Service
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Content */}
      <section className="py-16 lg:py-24">
        <ServicesSection />
      </section>
    </div>
  )
}