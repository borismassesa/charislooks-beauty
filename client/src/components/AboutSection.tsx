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
              Meet Your Hair & Beauty Team
            </h2>
            
            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Welcome to CharisLooks! With over 8 years of experience in the hair and beauty industry, 
                our talented team has had the privilege of helping thousands of clients look and feel their most beautiful 
                and confident selves.
              </p>
              
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our passion for hair and beauty artistry drives us to stay current with the latest trends 
                and techniques. From precision hair cutting and creative coloring to flawless makeup application, 
                we specialize in creating looks that enhance your natural beauty while 
                ensuring everything photographs beautifully and lasts throughout your special day.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Whether you're preparing for your wedding day, need a stunning new hairstyle, want vibrant color, 
                or desire flawless makeup for any occasion, our expert team is here to help you achieve the perfect look 
                that reflects your unique style and personality.
              </p>
            </div>

          </div>

          {/* Image */}
          <div className="lg:order-first">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={artistPhoto}
                  alt="CharisLooks Team - Professional Hair & Makeup Artists"
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
                    — CharisLooks Team
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