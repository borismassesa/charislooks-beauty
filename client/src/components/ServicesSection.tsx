import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, Star, Calendar } from 'lucide-react'
import { Link } from 'wouter'

// TODO: remove mock functionality - replace with real services data
const services = [
  {
    id: 1,
    title: 'Bridal Makeup',
    description: 'Complete bridal makeup service including consultation, trial, and wedding day application. Perfect for your special day.',
    duration: '3-4 hours',
    price: '$350-500',
    popular: true,
    features: [
      'Consultation & trial session',
      'Wedding day application',
      'Touch-up kit included',
      'Lashes & lipstick provided'
    ]
  },
  {
    id: 2,
    title: 'Special Event Makeup',
    description: 'Professional makeup for parties, galas, photoshoots, and other special occasions.',
    duration: '1.5-2 hours',
    price: '$150-250',
    popular: false,
    features: [
      'Custom look design',
      'High-quality products',
      'Photo-ready finish',
      'Complimentary touch-ups'
    ]
  },
  {
    id: 3,
    title: 'Everyday Glam',
    description: 'Natural, everyday makeup that enhances your features for work, dates, or daily wear.',
    duration: '1 hour',
    price: '$80-120',
    popular: true,
    features: [
      'Natural enhancement',
      'Long-lasting formula',
      'Skincare consultation',
      'Product recommendations'
    ]
  },
  {
    id: 4,
    title: 'Makeup Lesson',
    description: 'Learn professional makeup techniques with personalized one-on-one instruction.',
    duration: '2 hours',
    price: '$200',
    popular: false,
    features: [
      'Personalized instruction',
      'Product recommendations',
      'Technique demonstrations',
      'Take-home guide'
    ]
  },
  {
    id: 5,
    title: 'Group Sessions',
    description: 'Perfect for bridal parties, bachelorette parties, or girls\' nights out.',
    duration: '2-4 hours',
    price: '$100-150/person',
    popular: false,
    features: [
      'Group discounts available',
      'Mobile service',
      'Customized looks',
      'Fun & relaxing atmosphere'
    ]
  },
  {
    id: 6,
    title: 'Editorial & Commercial',
    description: 'Professional makeup for photoshoots, fashion shows, and commercial projects.',
    duration: 'Varies',
    price: 'Contact for quote',
    popular: false,
    features: [
      'Creative artistry',
      'Trend-focused looks',
      'Industry experience',
      'Flexible scheduling'
    ]
  }
]

export default function ServicesSection() {
  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Beauty Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional makeup services tailored to your unique style and occasion
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="relative hover-elevate group">
              {service.popular && (
                <div className="absolute -top-3 left-6">
                  <Badge className="bg-ring text-white">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-serif">{service.title}</CardTitle>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Price and Duration */}
                <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{service.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{service.price}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-ring rounded-full" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link href="/booking">
                  <Button 
                    className="w-full" 
                    variant={service.popular ? 'default' : 'outline'}
                    data-testid={`button-book-${service.id}`}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact for Custom Services */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="font-serif text-xl font-bold mb-3">
                Need Something Custom?
              </h3>
              <p className="text-muted-foreground mb-6">
                Don't see exactly what you're looking for? I offer custom packages 
                and can create a personalized service just for you.
              </p>
              <Link href="/contact">
                <Button variant="outline" data-testid="button-contact-custom">
                  Get Custom Quote
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}