import { Button } from '@/components/ui/button'
import { Calendar, Palette, Star, Scissors, Sparkles } from 'lucide-react'
import { Link } from 'wouter'
import salonInteriorImage from '@assets/generated_images/Salon_interior_photo_cb762670.png'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-ring/5 overflow-hidden">
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
            {/* Main Image Container */}
            <div className="relative group">
              {/* Professional Image Frame */}
              <div className="relative bg-white rounded-2xl p-1 shadow-xl border border-gray-100 overflow-hidden">
                <div 
                  className="w-full h-[500px] lg:h-[600px] bg-cover bg-center bg-no-repeat rounded-xl transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${salonInteriorImage})` }}
                >
                  {/* Elegant overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-ring/10 via-transparent to-transparent rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 rounded-xl" />
                </div>
              </div>
              
              {/* Professional UI Elements */}
              {/* Top Badge */}
              <div className="absolute -top-4 left-6 bg-gradient-to-r from-ring to-ring/80 text-white rounded-full px-4 py-2 shadow-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="text-sm font-medium">Professional Salon</span>
                </div>
              </div>
              
              {/* Bottom Right Badge */}
              <div className="absolute -bottom-3 -right-3 bg-white rounded-full p-4 shadow-xl border border-gray-100">
                <div className="flex items-center justify-center w-8 h-8 bg-ring/10 rounded-full">
                  <Scissors className="h-5 w-5 text-ring" />
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-12 -right-6 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg border border-white/20">
                <Palette className="h-5 w-5 text-ring" />
              </div>
              
              {/* Decorative Accent */}
              <div className="absolute bottom-16 -left-4 w-16 h-16 bg-gradient-to-br from-ring/20 to-ring/10 rounded-full blur-xl"></div>
              <div className="absolute top-20 -left-2 w-12 h-12 bg-gradient-to-br from-amber-400/20 to-amber-400/10 rounded-full blur-lg"></div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  )
}