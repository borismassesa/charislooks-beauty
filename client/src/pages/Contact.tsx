import ContactSection from '@/components/ContactSection'
import FAQSection from '@/components/FAQSection'

export default function Contact() {
  return (
    <div className="pt-16 bg-background">
      {/* Contact Content */}
      <ContactSection />

      {/* FAQ Section */}
      <FAQSection />
    </div>
  )
}