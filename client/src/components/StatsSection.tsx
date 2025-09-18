import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { Link } from 'wouter'
import { SiInstagram, SiFacebook, SiTiktok } from 'react-icons/si'

export default function StatsSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Card className="p-8 text-center">
          {/* Headline */}
          <h2 className="font-serif text-3xl font-bold mb-4">Ready to Transform Your Look?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            From bridal perfection to everyday glamour, let's create something beautiful together.
          </p>

          {/* Primary CTA */}
          <div className="mb-6">
            <Link href="/booking">
              <Button size="lg" className="bg-white hover:bg-white/90 text-black text-lg px-8 py-4" data-testid="button-book-now">
                <Calendar className="h-5 w-5 mr-2" />
                Book Your Appointment
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <span className="text-muted-foreground text-sm">Or see our work first:</span>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/charislooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-ring transition-colors duration-200 p-2 hover-elevate rounded-md"
                data-testid="link-instagram-cta"
                aria-label="See our work on Instagram"
              >
                <SiInstagram className="h-6 w-6" />
              </a>
              <a
                href="https://facebook.com/charislooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-ring transition-colors duration-200 p-2 hover-elevate rounded-md"
                data-testid="link-facebook-cta"
                aria-label="See our work on Facebook"
              >
                <SiFacebook className="h-6 w-6" />
              </a>
              <a
                href="https://tiktok.com/@charislooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-ring transition-colors duration-200 p-2 hover-elevate rounded-md"
                data-testid="link-tiktok-cta"
                aria-label="See our work on TikTok"
              >
                <SiTiktok className="h-6 w-6" />
              </a>
            </div>
          </div>

        </Card>
        
      </div>
    </section>
  )
}