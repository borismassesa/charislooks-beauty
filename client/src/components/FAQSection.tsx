import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, HelpCircle, Instagram, Facebook, MessageCircle, Calendar } from 'lucide-react'
import { FaTiktok } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'


export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const [showAll, setShowAll] = useState(false)

  // Fetch dynamic FAQs
  const { data: faqs = [], isLoading: faqsLoading } = useQuery({
    queryKey: ['contact-faqs'],
    queryFn: async () => {
      const response = await fetch('/api/contact/faqs')
      if (!response.ok) return []
      return response.json()
    }
  })

  // Fetch dynamic social media links
  const { data: socialLinks = [] } = useQuery({
    queryKey: ['social-media-links'],
    queryFn: async () => {
      const response = await fetch('/api/contact/social-media')
      if (!response.ok) return []
      return response.json()
    }
  })

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const openAll = () => {
    setOpenItems(faqs.map((faq: any) => faq.id))
  }

  const closeAll = () => {
    setOpenItems([])
  }

  const toggleShowAll = () => {
    setShowAll(!showAll)
    if (!showAll) {
      // When showing all, close all items first
      setOpenItems([])
    }
  }

  // Show only first 6 FAQs initially, all if showAll is true
  const visibleFAQs = showAll ? faqs : faqs.slice(0, 6)

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-ring" />
            <h2 className="font-serif text-3xl lg:text-4xl font-bold">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our services, booking process, and policies
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-8">
          {visibleFAQs.map((faq: any) => (
            <Card key={faq.id} className="overflow-hidden">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-6 h-auto text-left"
                  onClick={() => toggleItem(faq.id)}
                >
                  <span className="font-medium text-lg pr-4">{faq.question}</span>
                  {openItems.includes(faq.id) ? (
                    <ChevronUp className="h-5 w-5 text-ring flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-ring flex-shrink-0" />
                  )}
                </Button>
                {openItems.includes(faq.id) && (
                  <div className="px-6 pb-6 pt-0">
                    <div className="border-t pt-4">
                      <p className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        {!showAll && (
          <div className="flex justify-center mb-8">
            <Button
              variant="outline"
              onClick={toggleShowAll}
              className="flex items-center gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              View All {faqs.length} Questions
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        {showAll && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              variant="outline"
              onClick={openAll}
              className="flex items-center gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              Expand All
            </Button>
            <Button
              variant="outline"
              onClick={closeAll}
              className="flex items-center gap-2"
            >
              <ChevronUp className="h-4 w-4" />
              Collapse All
            </Button>
            <Button
              variant="outline"
              onClick={toggleShowAll}
              className="flex items-center gap-2"
            >
              <ChevronUp className="h-4 w-4" />
              Show Less
            </Button>
          </div>
        )}

        {/* Contact CTA */}
        <div className="text-center mt-12 p-6 bg-muted/30 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Ready to Book Your Appointment?</h3>
          <p className="text-muted-foreground mb-6">
            Let's discuss your beauty needs and create your perfect look together
          </p>
          
          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button 
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-ring hover:bg-ring/90 text-white"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Send Message
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/booking'}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Now
            </Button>
          </div>

          {/* Social Media Connection */}
          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Or connect with us on social media for daily inspiration and updates
            </p>
                        <div className="flex justify-center gap-4">
                          {socialLinks.map((link: any) => (
                            <Button
                              key={link.id}
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(link.url, '_blank')}
                              className="flex items-center gap-2"
                            >
                              {link.platform === 'Instagram' && <Instagram className="h-4 w-4" />}
                              {link.platform === 'Facebook' && <Facebook className="h-4 w-4" />}
                              {link.platform === 'TikTok' && <FaTiktok className="h-4 w-4" />}
                              {link.platform}
                            </Button>
                          ))}
                        </div>
          </div>
        </div>
      </div>
    </section>
  )
}
