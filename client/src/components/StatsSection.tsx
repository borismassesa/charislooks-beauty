import { Card } from '@/components/ui/card'
import { SiInstagram, SiFacebook, SiTiktok } from 'react-icons/si'

export default function StatsSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Card className="p-8 text-center">
          {/* Headline */}
          <h2 className="font-serif text-3xl font-bold mb-4">See Our Beautiful Work</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Browse our portfolio of stunning transformations and get inspired for your next look.
          </p>

          {/* Social Media - Main Focus */}
          <div className="flex flex-col items-center justify-center gap-6">
            <span className="text-muted-foreground text-lg">Follow us for daily inspiration:</span>
            <div className="flex items-center gap-6">
              <a
                href="https://instagram.com/charislooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-ring transition-colors duration-200 p-3 hover-elevate rounded-lg bg-muted/30 hover:bg-muted/50"
                data-testid="link-instagram-cta"
                aria-label="See our work on Instagram"
              >
                <SiInstagram className="h-8 w-8" />
              </a>
              <a
                href="https://facebook.com/charislooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-ring transition-colors duration-200 p-3 hover-elevate rounded-lg bg-muted/30 hover:bg-muted/50"
                data-testid="link-facebook-cta"
                aria-label="See our work on Facebook"
              >
                <SiFacebook className="h-8 w-8" />
              </a>
              <a
                href="https://tiktok.com/@charislooks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-ring transition-colors duration-200 p-3 hover-elevate rounded-lg bg-muted/30 hover:bg-muted/50"
                data-testid="link-tiktok-cta"
                aria-label="See our work on TikTok"
              >
                <SiTiktok className="h-8 w-8" />
              </a>
            </div>
          </div>

        </Card>
        
      </div>
    </section>
  )
}