import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Image, DollarSign, Phone, Clock } from 'lucide-react'
import { Link } from 'wouter'

export default function StatsSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Card className="p-8 text-center">
          {/* Headline */}
          <h2 className="font-serif text-3xl font-bold mb-4">Ready to Transform Your Look?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            From bridal perfection to everyday glamour, let's create something beautiful together.
          </p>

          {/* Primary CTA */}
          <div className="mb-8">
            <Link href="/booking">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-lg px-8 py-4" data-testid="button-book-now">
                <Calendar className="h-5 w-5 mr-2" />
                Book Your Look Now
              </Button>
            </Link>
          </div>

          {/* Secondary CTAs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/portfolio">
              <Button variant="outline" size="lg" className="w-full h-auto py-4 flex flex-col gap-2" data-testid="button-portfolio">
                <Image className="h-5 w-5" />
                <span>Explore Portfolio</span>
              </Button>
            </Link>
            
            <Link href="/services">
              <Button variant="outline" size="lg" className="w-full h-auto py-4 flex flex-col gap-2" data-testid="button-services">
                <DollarSign className="h-5 w-5" />
                <span>View Services & Pricing</span>
              </Button>
            </Link>
            
            <Link href="/booking">
              <Button variant="outline" size="lg" className="w-full h-auto py-4 flex flex-col gap-2" data-testid="button-availability">
                <Clock className="h-5 w-5" />
                <span>Check Availability</span>
              </Button>
            </Link>
            
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full h-auto py-4 flex flex-col gap-2" data-testid="button-contact">
                <Phone className="h-5 w-5" />
                <span>Contact Us</span>
              </Button>
            </Link>
          </div>
        </Card>
        
      </div>
    </section>
  )
}