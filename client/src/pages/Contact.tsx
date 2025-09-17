import ContactSection from '@/components/ContactSection'

export default function Contact() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get in touch to discuss your beauty needs, ask questions, or schedule a consultation. 
            We're here to help make your beauty dreams come true!
          </p>
        </div>
        
        <ContactSection />
      </div>
    </div>
  )
}