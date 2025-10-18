import Hero from '@/components/Hero'
import PortfolioGallery from '@/components/PortfolioGallery'
import ServicesSection from '@/components/ServicesSection'
import AboutSection from '@/components/AboutSection'
import StatsSection from '@/components/StatsSection'
import CustomerReviewsSection from '@/components/CustomerReviewsSection'
import ContactSection from '@/components/ContactSection'
export default function Home() {
  return (
    <div className="pt-16">
      <Hero />
      <AboutSection />
      <StatsSection />
      <PortfolioGallery />
      
      {/* Services Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our range of professional beauty services tailored to enhance your natural beauty
          </p>
        </div>
        <ServicesSection />
      </section>
      
      <CustomerReviewsSection />
      <ContactSection />
    </div>
  )
}