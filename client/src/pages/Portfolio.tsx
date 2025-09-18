import PortfolioGallery from '@/components/PortfolioGallery'
import { Button } from '@/components/ui/button'
import { Palette, Star, ExternalLink } from 'lucide-react'
import { Link } from 'wouter'
import bridalImage from '@assets/generated_images/Bridal_makeup_portfolio_photo_ed6ec900.png'

export default function Portfolio() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${bridalImage})` }}
        >
          {/* Dark gradient overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl text-left">

            {/* Main Heading */}
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Artistry in Every
              <span className="block text-ring">Transformation</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl leading-relaxed drop-shadow-lg">
              Explore our collection of stunning beauty transformations. From elegant bridal looks to bold evening styles, 
              each creation tells a unique story of artistry and expertise that enhances natural beauty.
            </p>

            {/* Decorative Elements */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-white/30 flex-1 max-w-24"></div>
              <Palette className="h-6 w-6 text-ring" />
              <div className="h-px bg-gradient-to-r from-white/30 via-white/30 to-transparent flex-1 max-w-24"></div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-start">
              <Link href="/booking">
                <Button 
                  size="lg" 
                  className="bg-ring hover:bg-ring/90 text-white border-ring/20 backdrop-blur-sm"
                  data-testid="button-book-consultation"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Book Your Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Content */}
      <section className="py-16 lg:py-24">
        <PortfolioGallery />
      </section>
    </div>
  )
}