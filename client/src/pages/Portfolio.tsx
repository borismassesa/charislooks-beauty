import PortfolioGallery from '@/components/PortfolioGallery'

export default function Portfolio() {
  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Our Portfolio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover the artistry behind our makeup creations. Each look tells a story 
            and showcases our commitment to enhancing natural beauty.
          </p>
        </div>
        
        <PortfolioGallery />
      </div>
    </div>
  )
}