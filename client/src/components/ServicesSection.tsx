import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, DollarSign, Star, Calendar, Loader2 } from 'lucide-react'
import { Link } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import type { Service } from '@shared/schema'

export default function ServicesSection() {
  // Fetch services from API
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['/api/services'],
    queryFn: async () => {
      const response = await fetch('/api/services')
      if (!response.ok) throw new Error('Failed to fetch services')
      return response.json() as Promise<Service[]>
    }
  })

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} min`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}min`
  }

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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-3">Loading services...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Failed to load services. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={service.id} className="relative hover-elevate group">
                {(service.category === 'bridal' || index === 0) && (
                  <div className="absolute -top-3 left-6">
                    <Badge className="bg-ring text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-serif">{service.name}</CardTitle>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {service.description}
                  </p>
                </CardHeader>

                <CardContent className="pt-0">
                  {/* Price and Duration */}
                  <div className="flex items-center justify-between mb-4 p-3 bg-muted/50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{formatDuration(service.duration)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">${service.price}</span>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="mb-6">
                    <Badge variant="outline" className="capitalize">
                      {service.category}
                    </Badge>
                  </div>

                  {/* CTA Button */}
                  <Link href="/booking">
                    <Button 
                      className="w-full" 
                      variant={(service.category === 'bridal' || index === 0) ? 'default' : 'outline'}
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
        )}

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