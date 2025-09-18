import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Award, Star, Clock } from 'lucide-react'
import { Link } from 'wouter'

export default function StatsSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Three Container Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Specialties Container */}
          <Card className="p-6 bg-muted/30">
            <h3 className="font-serif text-lg font-bold mb-4 text-center">Specialties & Certifications</h3>
            <div className="space-y-2">
              <Badge className="bg-ring/10 text-ring border-ring/30 w-full justify-center py-2">Bridal Hair & Makeup</Badge>
              <Badge className="bg-ring/10 text-ring border-ring/30 w-full justify-center py-2">Precision Cutting</Badge>
              <Badge className="bg-ring/10 text-ring border-ring/30 w-full justify-center py-2">Airbrush Certified</Badge>
              <Badge className="bg-ring/10 text-ring border-ring/30 w-full justify-center py-2">Extensions & Volume</Badge>
              <Badge className="bg-ring/10 text-ring border-ring/30 w-full justify-center py-2">Editorial Styling</Badge>
              <Badge className="bg-ring/10 text-ring border-ring/30 w-full justify-center py-2">Photography Makeup</Badge>
            </div>
          </Card>

          {/* Stats Container */}
          <Card className="p-6 bg-gradient-to-br from-ring/5 to-ring/10 border-ring/20">
            <h3 className="font-serif text-lg font-bold mb-4 text-center text-ring">Our Achievements</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-ring mr-3" />
                <div>
                  <div className="text-lg font-bold text-ring">1000+</div>
                  <div className="text-xs text-muted-foreground">Happy Clients</div>
                </div>
              </div>
              <div className="flex items-center">
                <Award className="h-5 w-5 text-ring mr-3" />
                <div>
                  <div className="text-lg font-bold text-ring">8+</div>
                  <div className="text-xs text-muted-foreground">Years Experience</div>
                </div>
              </div>
              <div className="flex items-center">
                <Star className="h-5 w-5 text-ring mr-3" />
                <div>
                  <div className="text-lg font-bold text-ring">4.9</div>
                  <div className="text-xs text-muted-foreground">Average Rating</div>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-ring mr-3" />
                <div>
                  <div className="text-lg font-bold text-ring">200+</div>
                  <div className="text-xs text-muted-foreground">Weddings & Events</div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Container */}
          <Card className="p-6 bg-ring/5 border-ring/20 flex flex-col justify-center items-center text-center">
            <h3 className="font-serif text-lg font-bold mb-4">Ready to Transform?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Book your appointment today and let us create your perfect look.
            </p>
            <Link href="/booking">
              <Button size="lg" className="w-full" data-testid="button-book-appointment">
                Book Your Appointment
              </Button>
            </Link>
          </Card>
          
        </div>
      </div>
    </section>
  )
}