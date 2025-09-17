import ServicesSection from '@/components/ServicesSection'

export default function Services() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Beauty Services
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From bridal glam to everyday beauty, we offer a comprehensive range of 
            professional makeup services tailored to your unique style and needs.
          </p>
        </div>
        
        <ServicesSection />
      </div>
    </div>
  )
}