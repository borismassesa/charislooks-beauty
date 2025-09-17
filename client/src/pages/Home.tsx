import Hero from '@/components/Hero'
import PortfolioGallery from '@/components/PortfolioGallery'
import ServicesSection from '@/components/ServicesSection'
import AboutSection from '@/components/AboutSection'
import ContactSection from '@/components/ContactSection'

export default function Home() {
  return (
    <div className="pt-16">
      <Hero />
      <AboutSection />
      <PortfolioGallery />
      <ServicesSection />
      <ContactSection />
    </div>
  )
}