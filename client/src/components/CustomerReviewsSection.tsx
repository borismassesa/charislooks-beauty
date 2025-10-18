import { useQuery } from '@tanstack/react-query'
import type { Testimonial } from '@shared/schema'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Star, Quote } from 'lucide-react'

function ReviewCard({ review, isDuplicate = false }: { review: Testimonial; isDuplicate?: boolean }) {
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
          "{review.testimonial}"
        </blockquote>
        
        {/* Rating */}
        <div className="flex mb-4">
          {[...Array(review.rating)].map((_, i) => (
            <Star
              key={i}
              className="h-5 w-5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
        
        {/* Customer info */}
        <div className="flex items-center">
          <Avatar className="w-12 h-12 mr-3">
            <AvatarFallback className="bg-ring text-white font-semibold text-sm">
              {review.avatarInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 
              className="font-semibold text-foreground"
              data-testid={isDuplicate ? undefined : `text-reviewer-name-${review.id}`}
            >
              {review.clientName}
            </h4>
            <p className="text-sm text-muted-foreground">{review.service}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

function MarqueeRow({ reviews, direction }: { reviews: Testimonial[]; direction: 'ltr' | 'rtl' }) {
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
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"]
  });
  
  // Filter and split active testimonials into two rows
  const activeTestimonials = testimonials?.filter(t => t.active) || [];
  const firstRowReviews = activeTestimonials.slice(0, Math.ceil(activeTestimonials.length / 2));
  const secondRowReviews = activeTestimonials.slice(Math.ceil(activeTestimonials.length / 2));

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real stories from real clients who trusted us with their beauty journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-6 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-5 w-24 mb-4" />
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!activeTestimonials.length) {
    return null;
  }

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
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

        {/* Marquee Rows */}
        <div className="space-y-6 overflow-hidden">
          {/* First row: Right to Left */}
          {firstRowReviews.length > 0 && <MarqueeRow reviews={firstRowReviews} direction="rtl" />}
          
          {/* Second row: Left to Right */}
          {secondRowReviews.length > 0 && <MarqueeRow reviews={secondRowReviews} direction="ltr" />}
        </div>
      </div>
    </section>
  )
}