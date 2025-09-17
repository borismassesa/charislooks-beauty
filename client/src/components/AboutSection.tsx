import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Award, Users, Clock, Star } from 'lucide-react'
import { Link } from 'wouter'
import artistPhoto from '@assets/generated_images/Artist_professional_headshot_39b60e01.png'

export default function AboutSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-6">
              Meet Your Beauty Artist
            </h2>
            
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Hi, I'm Sarah! With over 5 years of experience in the beauty industry, 
                I've had the privilege of helping hundreds of women feel their most beautiful 
                and confident selves.
              </p>
              
              <p className="text-muted-foreground leading-relaxed mb-4">
                My passion for makeup artistry began during my studies at the prestigious 
                Beauty Institute, where I mastered both classic and contemporary techniques. 
                I specialize in creating looks that enhance your natural beauty while 
                ensuring your makeup photographs beautifully and lasts throughout your special day.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Whether you're preparing for your wedding day, a special event, or simply 
                want to learn new techniques, I'm here to help you achieve the perfect look 
                that reflects your unique style and personality.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-ring/10 rounded-lg mb-3 mx-auto">
                  <Users className="h-6 w-6 text-ring" />
                </div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-muted-foreground">Happy Clients</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-ring/10 rounded-lg mb-3 mx-auto">
                  <Award className="h-6 w-6 text-ring" />
                </div>
                <div className="text-2xl font-bold">5+</div>
                <div className="text-sm text-muted-foreground">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-ring/10 rounded-lg mb-3 mx-auto">
                  <Star className="h-6 w-6 text-ring" />
                </div>
                <div className="text-2xl font-bold">4.9</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-ring/10 rounded-lg mb-3 mx-auto">
                  <Clock className="h-6 w-6 text-ring" />
                </div>
                <div className="text-2xl font-bold">100+</div>
                <div className="text-sm text-muted-foreground">Weddings</div>
              </div>
            </div>

            {/* Specialties */}
            <div className="mb-8">
              <h3 className="font-semibold mb-3">Specialties & Certifications</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Bridal Makeup</Badge>
                <Badge variant="outline">Editorial Looks</Badge>
                <Badge variant="outline">Color Theory</Badge>
                <Badge variant="outline">Airbrush Certified</Badge>
                <Badge variant="outline">Special Effects</Badge>
                <Badge variant="outline">Photography Makeup</Badge>
              </div>
            </div>

            {/* CTA */}
            <Link href="/booking">
              <Button size="lg" data-testid="button-book-with-sarah">
                Book with Sarah
              </Button>
            </Link>
          </div>

          {/* Image */}
          <div className="lg:order-first">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={artistPhoto}
                  alt="Sarah - Professional Makeup Artist"
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>
            
            {/* Quote Card */}
            <Card className="mt-6 bg-ring/5 border-ring/20">
              <CardContent className="p-6">
                <blockquote className="text-center">
                  <p className="text-muted-foreground italic mb-3">
                    "Beauty is about enhancing what you have. Let yourself shine through!"
                  </p>
                  <footer className="text-sm font-medium text-ring">
                    — Sarah, Founder & Lead Artist
                  </footer>
                </blockquote>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}