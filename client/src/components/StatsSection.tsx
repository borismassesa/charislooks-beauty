import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Award, Star, Clock, Sparkles, Calendar } from 'lucide-react'
import { Link } from 'wouter'

export default function StatsSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Two-Column Layout: CTA Priority + Info Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Priority CTA Section */}
          <div className="lg:order-1 order-first">
            <Card className="p-8 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
              <div className="text-center">
                <Sparkles className="h-12 w-12 text-accent mx-auto mb-4" />
                <h2 className="font-serif text-2xl font-bold mb-3">Why Choose CharisLooks?</h2>
                <div className="space-y-3 mb-6 text-left">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-accent rounded-full" />
                    <span className="text-sm">Expert certified makeup artistry</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-accent rounded-full" />
                    <span className="text-sm">1000+ satisfied clients</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-accent rounded-full" />
                    <span className="text-sm">Specialized in bridal & events</span>
                  </div>
                </div>
                <Link href="/booking">
                  <Button size="lg" className="w-full bg-accent hover:bg-accent/90" data-testid="button-book-your-look">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Your Perfect Look
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Information Tabs */}
          <div className="lg:order-2">
            <Tabs defaultValue="achievements" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="achievements" data-testid="tab-achievements">Achievements</TabsTrigger>
                <TabsTrigger value="specialties" data-testid="tab-specialties">Specialties</TabsTrigger>
              </TabsList>
              
              <TabsContent value="achievements" className="mt-4">
                <Card className="p-6">
                  <h3 className="font-serif text-lg font-bold mb-6 text-center">Our Track Record</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center" data-testid="stat-clients">
                      <Users className="h-6 w-6 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold text-accent">1000+</div>
                      <div className="text-xs text-muted-foreground">Happy Clients</div>
                    </div>
                    <div className="text-center" data-testid="stat-experience">
                      <Award className="h-6 w-6 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold text-accent">8+</div>
                      <div className="text-xs text-muted-foreground">Years Experience</div>
                    </div>
                    <div className="text-center" data-testid="stat-rating">
                      <Star className="h-6 w-6 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold text-accent">4.9</div>
                      <div className="text-xs text-muted-foreground">Average Rating</div>
                    </div>
                    <div className="text-center" data-testid="stat-events">
                      <Clock className="h-6 w-6 text-accent mx-auto mb-2" />
                      <div className="text-2xl font-bold text-accent">200+</div>
                      <div className="text-xs text-muted-foreground">Weddings & Events</div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="specialties" className="mt-4">
                <Card className="p-6">
                  <h3 className="font-serif text-lg font-bold mb-6 text-center">Certifications & Skills</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Badge className="bg-accent/10 text-accent border-accent/30 justify-center py-2" data-testid="specialty-bridal">
                      Bridal Hair & Makeup
                    </Badge>
                    <Badge className="bg-accent/10 text-accent border-accent/30 justify-center py-2" data-testid="specialty-cutting">
                      Precision Cutting
                    </Badge>
                    <Badge className="bg-accent/10 text-accent border-accent/30 justify-center py-2" data-testid="specialty-airbrush">
                      Airbrush Certified
                    </Badge>
                    <Badge className="bg-accent/10 text-accent border-accent/30 justify-center py-2" data-testid="specialty-extensions">
                      Extensions & Volume
                    </Badge>
                    <Badge className="bg-accent/10 text-accent border-accent/30 justify-center py-2" data-testid="specialty-editorial">
                      Editorial Styling
                    </Badge>
                    <Badge className="bg-accent/10 text-accent border-accent/30 justify-center py-2" data-testid="specialty-photography">
                      Photography Makeup
                    </Badge>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
        </div>
      </div>
    </section>
  )
}