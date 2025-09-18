import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
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
              <Button size="lg" className="bg-white hover:bg-white/90 text-black text-lg px-8 py-4" data-testid="button-book-now">
                <Calendar className="h-5 w-5 mr-2" />
                Book Your Appointment
              </Button>
            </Link>
          </div>

        </Card>
        
      </div>
    </section>
  )
}