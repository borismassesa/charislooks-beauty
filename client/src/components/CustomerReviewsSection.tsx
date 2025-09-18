import { Card } from '@/components/ui/card'
import { Star, Quote } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface Review {
  id: number
  name: string
  service: string
  rating: number
  review: string
  avatar: string
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    service: "Bridal Makeup & Hair",
    rating: 5,
    review: "Absolutely stunning work! CharisLooks made me feel like a princess on my wedding day. The attention to detail was incredible.",
    avatar: "SJ"
  },
  {
    id: 2,
    name: "Emily Chen",
    service: "Editorial Makeup",
    rating: 5,
    review: "Professional, creative, and exceeded all expectations. Perfect for my photoshoot - every shot was flawless!",
    avatar: "EC"
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    service: "Hair Styling & Extensions",
    rating: 5,
    review: "My hair has never looked better! The extensions blend perfectly and the styling is simply gorgeous. Highly recommend!",
    avatar: "MR"
  },
  {
    id: 4,
    name: "Jessica Thompson",
    service: "Special Event Makeup",
    rating: 5,
    review: "Made me feel confident and beautiful for my anniversary dinner. The makeup lasted all night and looked perfect in photos!",
    avatar: "JT"
  },
  {
    id: 5,
    name: "Aisha Patel",
    service: "Precision Hair Cut",
    rating: 5,
    review: "Best haircut I've ever had! The precision and skill is unmatched. My hair looks amazing and styles so easily now.",
    avatar: "AP"
  },
  {
    id: 6,
    name: "Rachel Kim",
    service: "Airbrush Makeup",
    rating: 5,
    review: "The airbrush technique is incredible! Flawless finish that looked natural yet glamorous. Perfect for my special event.",
    avatar: "RK"
  }
]

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    
    const rect = cardRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const deltaX = (e.clientX - centerX) / (rect.width / 2)
    const deltaY = (e.clientY - centerY) / (rect.height / 2)
    
    setMousePosition({ x: deltaX, y: deltaY })
  }

  const handleMouseLeave = () => {
    setMousePosition({ x: 0, y: 0 })
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const tiltX = mousePosition.y * -15
  const tiltY = mousePosition.x * 15

  return (
    <div
      ref={cardRef}
      className="relative group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      data-testid={`review-card-${review.id}`}
      style={{
        transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${isHovered ? 1.05 : 1})`,
        transition: isHovered ? 'none' : 'transform 0.5s ease-out',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Shadow layers for depth effect */}
      <div
        className="absolute inset-0 bg-black/5 rounded-xl"
        style={{ 
          transform: 'translateZ(-20px)',
          filter: 'blur(2px)',
          opacity: isHovered ? 0.6 : 0.3,
          transition: 'opacity 0.3s ease'
        }}
      />
      <div
        className="absolute inset-0 bg-black/3 rounded-xl"
        style={{ 
          transform: 'translateZ(-10px)',
          filter: 'blur(1px)',
          opacity: isHovered ? 0.4 : 0.2,
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {/* Main card */}
      <Card
        className="relative bg-white p-6 h-full border-0 shadow-xl overflow-hidden"
        style={{
          transform: 'translateZ(0px)',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Shimmer effect overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            transform: `translateX(${isHovered ? '100%' : '-100%'})`,
            transition: 'transform 0.6s ease-in-out',
            opacity: isHovered ? 1 : 0
          }}
        />
        
        {/* Quote icon */}
        <div
          className="absolute top-4 left-4 text-accent/20"
          style={{ transform: 'translateZ(10px)' }}
        >
          <Quote className="h-8 w-8" />
        </div>

        {/* Content */}
        <div
          className="relative z-10 h-full flex flex-col"
          style={{ transform: 'translateZ(20px)' }}
        >
          {/* Avatar and name */}
          <div className="flex items-center mb-4">
            <div
              className="w-12 h-12 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center text-white font-bold mr-3"
              style={{ transform: 'translateZ(5px)' }}
            >
              {review.avatar}
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{review.name}</h4>
              <p className="text-sm text-muted-foreground">{review.service}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex mb-3">
            {[...Array(review.rating)].map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                style={{ transform: `translateZ(${5 + i}px)` }}
              />
            ))}
          </div>

          {/* Review text */}
          <blockquote
            className="text-sm leading-relaxed text-foreground flex-1 italic"
            style={{ transform: 'translateZ(10px)' }}
          >
            "{review.review}"
          </blockquote>

          {/* Verified badge */}
          <div
            className="mt-4 inline-flex items-center text-xs text-accent font-medium"
            style={{ transform: 'translateZ(15px)' }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
            Verified Customer
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function CustomerReviewsSection() {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger animation for cards
            reviews.forEach((_, index) => {
              setTimeout(() => {
                setVisibleCards(prev => [...prev, index])
              }, index * 150)
            })
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from real clients who trusted us with their beauty journey
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div
              key={review.id}
              className={`transition-all duration-700 ease-out ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{
                transitionDelay: `${index * 100}ms`
              }}
            >
              <ReviewCard review={review} index={index} />
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">1000+</div>
              <div className="text-sm text-muted-foreground">Happy Clients</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-accent">200+</div>
              <div className="text-sm text-muted-foreground">Special Events</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}