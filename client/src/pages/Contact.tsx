import ContactSection from '@/components/ContactSection'
import { Button } from '@/components/ui/button'
import { MessageCircle, Calendar, ExternalLink } from 'lucide-react'
import { Link } from 'wouter'
import artistHeadshotImage from '@assets/generated_images/Artist_professional_headshot_39b60e01.png'

export default function Contact() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${artistHeadshotImage})` }}
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
              Let's Create Your
              <span className="block text-ring">Perfect Look</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
              Connect with our expert beauty professionals for personalized consultations, accessible services, and 
              tailored beauty solutions. We're here to listen, understand your vision, and bring your beauty dreams to life.
            </p>

            {/* Decorative Elements */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-24"></div>
              <MessageCircle className="h-6 w-6 text-ring" />
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-24"></div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking">
                <Button 
                  size="lg" 
                  className="bg-ring hover:bg-ring/90 text-white border-ring/20 backdrop-blur-sm"
                  data-testid="button-book-consultation"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Free Consultation
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                className="text-white border-white/20 hover:bg-white/10 backdrop-blur-sm"
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-send-message"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Send Us a Message
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 lg:py-24">
        <ContactSection />
      </section>
    </div>
  )
}