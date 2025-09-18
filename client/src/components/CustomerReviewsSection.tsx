import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, Quote } from 'lucide-react'

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
    review: "Absolutely stunning work! CharisLooks made me feel like a princess on my wedding day.",
    avatar: "SJ"
  },
  {
    id: 2,
    name: "Emily Chen", 
    service: "Editorial Makeup",
    rating: 5,
    review: "Professional, creative, and exceeded all expectations. Perfect for my photoshoot!",
    avatar: "EC"
  },
  {
    id: 3,
    name: "Maria Rodriguez",
    service: "Hair Extensions",
    rating: 5,
    review: "My hair has never looked better! The extensions blend perfectly and look gorgeous.",
    avatar: "MR"
  },
  {
    id: 4,
    name: "Jessica Thompson",
    service: "Special Event Makeup",
    rating: 5,
    review: "Made me feel confident and beautiful. The makeup lasted all night and looked perfect!",
    avatar: "JT"
  },
  {
    id: 5,
    name: "Aisha Patel",
    service: "Precision Hair Cut",
    rating: 5,
    review: "Best haircut I've ever had! The precision and skill is unmatched.",
    avatar: "AP"
  },
  {
    id: 6,
    name: "Rachel Kim",
    service: "Airbrush Makeup",
    rating: 5,
    review: "The airbrush technique is incredible! Flawless finish that looked natural yet glamorous.",
    avatar: "RK"
  },
  {
    id: 7,
    name: "Lisa Garcia",
    service: "Bridal Hair",
    rating: 5,
    review: "Perfect bridal hair styling! Stayed beautiful throughout the entire wedding day.",
    avatar: "LG"
  },
  {
    id: 8,
    name: "Anna Mitchell",
    service: "Photography Makeup",
    rating: 5,
    review: "Amazing work for my portfolio shoot. Every photo came out flawless!",
    avatar: "AM"
  }
]

function ReviewCard({ review, isDuplicate = false }: { review: Review; isDuplicate?: boolean }) {
  return (
    <Card 
      className="flex-shrink-0 w-80 p-6 bg-card hover-elevate"
      data-testid={isDuplicate ? undefined : `card-review-${review.id}`}
      aria-hidden={isDuplicate}
      tabIndex={isDuplicate ? -1 : 0}
    >
      <div className="flex flex-col h-full">
        {/* Quote icon */}
        <Quote className="h-6 w-6 text-accent/30 mb-4" />
        
        {/* Review text */}
        <blockquote className="text-sm leading-relaxed text-foreground mb-4 flex-1">
          "{review.review}"
        </blockquote>
        
        {/* Rating */}
        <div className="flex mb-4">
          {[...Array(review.rating)].map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-accent text-accent"
            />
          ))}
        </div>
        
        {/* Customer info */}
        <div className="flex items-center">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarFallback className="bg-accent/10 text-accent font-semibold">
              {review.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 
              className="font-semibold text-foreground"
              data-testid={isDuplicate ? undefined : `text-reviewer-name-${review.id}`}
            >
              {review.name}
            </h4>
            <p className="text-sm text-muted-foreground">{review.service}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function MarqueeRow({ reviews, direction }: { reviews: Review[]; direction: 'ltr' | 'rtl' }) {
  const animationClass = direction === 'ltr' ? 'animate-marquee-ltr' : 'animate-marquee-rtl'
  
  return (
    <div className="relative overflow-hidden">
      <div className={`flex gap-6 ${animationClass} marquee-track hover:paused`}>
        {/* First set of reviews */}
        {reviews.map((review) => (
          <ReviewCard key={`${direction}-${review.id}`} review={review} />
        ))}
        {/* Duplicate set for seamless loop */}
        {reviews.map((review) => (
          <ReviewCard key={`${direction}-dup-${review.id}`} review={review} isDuplicate />
        ))}
      </div>
    </div>
  )
}

export default function CustomerReviewsSection() {
  // Split reviews into two rows
  const firstRowReviews = reviews.slice(0, 4)
  const secondRowReviews = reviews.slice(4, 8)

  return (
    <section className="py-16 lg:py-24 bg-muted/30 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from real clients who trusted us with their beauty journey
          </p>
        </div>
      </div>

      {/* Marquee Rows */}
      <div className="space-y-6">
        {/* First row: Right to Left */}
        <MarqueeRow reviews={firstRowReviews} direction="rtl" />
        
        {/* Second row: Left to Right */}
        <MarqueeRow reviews={secondRowReviews} direction="ltr" />
      </div>

      {/* Stats */}
      <div className="mt-16 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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