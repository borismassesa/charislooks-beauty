import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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

  // Filter functions for each category
  const getMakeupServices = (services: Service[]) => {
    return services.filter(service => 
      ['everyday', 'event', 'lesson', 'group'].includes(service.category.toLowerCase()) ||
      (service.category.toLowerCase() === 'bridal' && service.name.toLowerCase().includes('makeup'))
    )
  }

  const getHairServices = (services: Service[]) => {
    return services.filter(service => 
      service.category.toLowerCase() === 'hair' ||
      (service.category.toLowerCase() === 'bridal' && service.name.toLowerCase().includes('hair'))
    )
  }

  const getPackageServices = (services: Service[]) => {
    return services.filter(service => 
      service.category.toLowerCase() === 'package' ||
      (service.category.toLowerCase() === 'bridal' && service.name.toLowerCase().includes('package'))
    )
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} min`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}min`
  }

  // Component to render services grid
  const ServicesGrid = ({ services, tabName }: { services: Service[], tabName: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {services.map((service, index) => (
        <Card key={service.id} className="relative hover-elevate group border-0 shadow-lg bg-gradient-to-br from-card to-card/50" data-testid={`card-service-${tabName.toLowerCase()}-${service.id}`}>
          {(service.category === 'bridal' || index === 0) && (
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-gradient-to-r from-ring to-ring/80 text-white shadow-lg border-0 px-3 py-1">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Most Popular
              </Badge>
            </div>
          )}
          
          <CardContent className="p-8">
            {/* Service Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-serif font-bold text-foreground leading-tight">
                  {service.name}
                </h3>
                <Badge variant="secondary" className="text-xs font-medium bg-ring/10 text-ring border-ring/20">
                  {service.category}
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                {service.description}
              </p>
            </div>

            {/* Elegant Divider */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-ring/30 to-transparent mb-6"></div>

            {/* Price and Duration */}
            <div className="flex items-center justify-between mb-6 p-4 bg-ring/5 rounded-lg border border-ring/10">
              <div className="text-left">
                <div className="text-2xl font-bold text-ring">${service.price}</div>
                <div className="text-xs text-muted-foreground">Starting price</div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm font-medium text-foreground">
                  <Clock className="h-4 w-4 mr-1 text-ring" />
                  {formatDuration(service.duration)}
                </div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>

            {/* Book Now Button */}
            <Link href="/booking">
              <Button 
                className="w-full h-12 bg-gradient-to-r from-ring to-ring/90 text-white hover:from-ring/90 hover:to-ring/80 font-medium shadow-lg border-0 transition-all duration-300" 
                data-testid={`button-book-${service.id}`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book This Service
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Hair & Beauty Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional hair styling and makeup services tailored to your unique style and occasion
          </p>
        </div>

        {/* Services Tabs */}
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
          <Tabs defaultValue="makeup" className="w-full" data-testid="tabs-services">
            <TabsList className="grid w-full grid-cols-3 mb-8 max-w-md mx-auto">
              <TabsTrigger value="makeup" data-testid="tab-trigger-makeup">
                Makeup
              </TabsTrigger>
              <TabsTrigger value="hair" data-testid="tab-trigger-hair">
                Hair
              </TabsTrigger>
              <TabsTrigger value="packages" data-testid="tab-trigger-packages">
                Packages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="makeup" data-testid="tab-content-makeup">
              {getMakeupServices(services).length > 0 ? (
                <ServicesGrid services={getMakeupServices(services)} tabName="Makeup" />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No makeup services available at the moment.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="hair" data-testid="tab-content-hair">
              {getHairServices(services).length > 0 ? (
                <ServicesGrid services={getHairServices(services)} tabName="Hair" />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No hair services available at the moment.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="packages" data-testid="tab-content-packages">
              {getPackageServices(services).length > 0 ? (
                <ServicesGrid services={getPackageServices(services)} tabName="Packages" />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No package services available at the moment.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Contact for Custom Services */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className="font-serif text-xl font-bold mb-3">
                Need Something Custom?
              </h3>
              <p className="text-muted-foreground mb-6">
                Don't see exactly what you're looking for? We offer custom hair and beauty packages 
                and can create a personalized service just for you.
              </p>
              <Link href="/contact">
                <Button className="bg-white hover:bg-white/90 text-black" data-testid="button-contact-custom">
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