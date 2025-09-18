import { Button } from '@/components/ui/button'
import { Calendar, Palette, Star, Scissors, Sparkles } from 'lucide-react'
import { Link } from 'wouter'
import salonInteriorImage from '@assets/generated_images/Salon_interior_photo_cb762670.png'

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-black via-gray-900 to-black overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-ring/20 to-amber-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-ring/15 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40"></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          <Star className="absolute top-20 left-20 w-3 h-3 text-ring/40 animate-pulse" />
          <Star className="absolute top-40 right-32 w-2 h-2 text-amber-400/50 animate-pulse delay-500" />
          <Star className="absolute bottom-32 left-16 w-4 h-4 text-ring/30 animate-pulse delay-1000" />
          <Star className="absolute bottom-20 right-20 w-3 h-3 text-amber-400/40 animate-pulse delay-700" />
          <Sparkles className="absolute top-32 left-1/3 w-4 h-4 text-ring/50 animate-pulse delay-300" />
          <Sparkles className="absolute bottom-40 right-1/3 w-3 h-3 text-amber-400/40 animate-pulse delay-800" />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center space-y-12">
            
            {/* Elegant Brand Introduction */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-6 py-3">
                <div className="w-2 h-2 bg-ring rounded-full animate-pulse"></div>
                <span className="text-white/90 text-sm font-medium tracking-wide">CHARISMA • ELEGANCE • TRANSFORMATION</span>
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-500"></div>
              </div>
              
              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-bold text-white leading-tight">
                  <span className="bg-gradient-to-r from-white via-ring to-white bg-clip-text text-transparent">
                    CharisLooks
                  </span>
                </h1>
                <p className="font-serif text-2xl sm:text-3xl lg:text-4xl text-ring font-light tracking-wide">
                  Where Beauty Meets Artistry
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-white/80 leading-relaxed font-light">
                Step into a world of unparalleled beauty transformation. Our master artisans specialize in 
                <span className="text-ring font-medium"> women's hair styling, intricate braiding, </span>
                and <span className="text-ring font-medium">stunning makeup artistry</span>. 
                Every service is a masterpiece, every client a work of art.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Scissors, title: "Hair Artistry", desc: "Braids, strings & styling" },
                { icon: Palette, title: "Makeup Mastery", desc: "Flawless beauty transformations" },
                { icon: Star, title: "Bridal Excellence", desc: "Your perfect day, perfected" }
              ].map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-ring to-ring/60 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-medium text-lg mb-2">{feature.title}</h3>
                    <p className="text-white/60 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link href="/booking">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-ring to-ring/80 hover:from-ring/90 hover:to-ring/70 text-white font-medium px-10 py-4 text-lg rounded-full shadow-2xl shadow-ring/25 border border-ring/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
                    data-testid="button-book-transformation"
                  >
                    <Calendar className="mr-3 h-6 w-6" />
                    Book Your Transformation
                  </Button>
                </Link>
                <Link href="/portfolio">
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 font-medium px-10 py-4 text-lg rounded-full transition-all duration-300 hover:scale-105"
                    data-testid="button-explore-portfolio"
                  >
                    <Palette className="mr-3 h-6 w-6" />
                    Explore Our Artistry
                  </Button>
                </Link>
              </div>
              
              {/* Scroll Indicator */}
              <div className="flex justify-center">
                <div className="flex flex-col items-center space-y-2 text-white/50">
                  <span className="text-xs uppercase tracking-wider">Discover More</span>
                  <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent"></div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </section>
  )
}