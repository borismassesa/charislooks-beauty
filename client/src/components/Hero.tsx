import { Button } from '@/components/ui/button'
import { Calendar, Palette, Star, Scissors, Sparkles } from 'lucide-react'
import { Link } from 'wouter'
import salonInteriorImage from '@assets/generated_images/Salon_interior_photo_cb762670.png'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-white via-rose-50/30 to-amber-50/40 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Left */}
        <Star className="absolute top-20 left-16 w-6 h-6 text-ring/60 rotate-12" />
        <Sparkles className="absolute top-32 left-32 w-4 h-4 text-amber-400/70 rotate-45" />
        
        {/* Top Right */}
        <Star className="absolute top-24 right-20 w-5 h-5 text-amber-400/60 -rotate-12" />
        <Sparkles className="absolute top-40 right-16 w-6 h-6 text-ring/50 rotate-12" />
        
        {/* Bottom Left */}
        <Star className="absolute bottom-32 left-20 w-4 h-4 text-ring/40 rotate-45" />
        <Sparkles className="absolute bottom-20 left-40 w-5 h-5 text-amber-400/60 -rotate-12" />
        
        {/* Bottom Right */}
        <Star className="absolute bottom-40 right-32 w-6 h-6 text-ring/50 rotate-12" />
        <Sparkles className="absolute bottom-24 right-24 w-4 h-4 text-amber-400/70 -rotate-45" />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          
          {/* Left Content */}
          <div className="text-left space-y-8">
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 bg-ring/10 border border-ring/20 rounded-full px-4 py-2">
              <Star className="h-4 w-4 text-ring fill-current" />
              <span className="text-ring text-sm font-medium">African Beauty Salon & Makeup</span>
            </div>
            
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Experience
                <span className="block">Timeless Beauty</span>
              </h1>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-ring leading-tight">
                Redefined
                <span className="block">with CharisLooks</span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Immerse yourself in a world of bespoke hairstyling, flawless makeup artistry, and luxurious pampering — all crafted in an ambiance of refined elegance. Our master stylists and beauty artisans are devoted to illuminating your unique radiance with every touch.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/booking">
                <Button 
                  size="lg" 
                  className="bg-ring hover:bg-ring/90 text-white font-medium px-8 py-3 w-full sm:w-auto"
                  data-testid="button-book-glam"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your Glam
                </Button>
              </Link>
              <Link href="/services">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-ring text-ring hover:bg-ring/10 font-medium px-8 py-3 w-full sm:w-auto"
                  data-testid="button-discover-services"
                >
                  <Palette className="mr-2 h-5 w-5" />
                  Discover Our Services
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-2 shadow-2xl">
              <div 
                className="w-full h-[500px] lg:h-[600px] bg-cover bg-center bg-no-repeat rounded-2xl"
                style={{ backgroundImage: `url(${salonInteriorImage})` }}
              >
                {/* Subtle overlay to match the aesthetic */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-2xl" />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -top-3 -left-3 bg-white rounded-full p-3 shadow-lg border border-gray-200">
                <Scissors className="h-6 w-6 text-ring" />
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}