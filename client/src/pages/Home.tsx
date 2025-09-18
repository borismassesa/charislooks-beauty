import Hero from '@/components/Hero'
import PortfolioGallery from '@/components/PortfolioGallery'
import ServicesSection from '@/components/ServicesSection'
import AboutSection from '@/components/AboutSection'
import StatsSection from '@/components/StatsSection'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="pt-16">
      <Hero />
      <AboutSection />
      <StatsSection />
      <PortfolioGallery />
      <ServicesSection />
      <ContactSection />
      <Footer />
    </div>
  )
}