import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ExternalLink } from 'lucide-react'
import bridalImage from '@assets/generated_images/Bridal_makeup_portfolio_photo_ed6ec900.png'
import eveningImage from '@assets/generated_images/Evening_makeup_portfolio_photo_d489780d.png'
import naturalImage from '@assets/generated_images/Natural_makeup_portfolio_photo_d7dfc25f.png'

// TODO: remove mock functionality - replace with real portfolio data
const portfolioItems = [
  {
    id: 1,
    title: 'Romantic Bridal Look',
    category: 'Bridal',
    image: bridalImage,
    description: 'Soft, romantic bridal makeup with natural glow and subtle shimmer for the perfect wedding day look.',
    tags: ['Bridal', 'Natural', 'Romantic']
  },
  {
    id: 2,
    title: 'Dramatic Evening Glam',
    category: 'Evening',
    image: eveningImage,
    description: 'Bold smoky eyes with perfect contouring for a stunning evening event transformation.',
    tags: ['Evening', 'Dramatic', 'Smoky Eyes']
  },
  {
    id: 3,
    title: 'Fresh Natural Glow',
    category: 'Everyday',
    image: naturalImage,
    description: 'Effortless everyday makeup that enhances natural beauty with a fresh, glowing finish.',
    tags: ['Natural', 'Everyday', 'Glowing']
  },
  {
    id: 4,
    title: 'Classic Elegance',
    category: 'Special Event',
    image: bridalImage,
    description: 'Timeless elegant makeup perfect for special occasions and formal events.',
    tags: ['Elegant', 'Classic', 'Formal']
  },
  {
    id: 5,
    title: 'Editorial Artistry',
    category: 'Editorial',
    image: eveningImage,
    description: 'Creative editorial makeup showcasing artistic techniques and bold color choices.',
    tags: ['Editorial', 'Creative', 'Artistic']
  },
  {
    id: 6,
    title: 'Bohemian Bride',
    category: 'Bridal',
    image: naturalImage,
    description: 'Free-spirited bridal look with earthy tones and natural textures.',
    tags: ['Bridal', 'Bohemian', 'Natural']
  }
]

const categories = ['All', 'Bridal', 'Evening', 'Everyday', 'Special Event', 'Editorial']

export default function PortfolioGallery() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedImage, setSelectedImage] = useState<typeof portfolioItems[0] | null>(null)

  const filteredItems = selectedCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory)

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl lg:text-4xl font-bold mb-4">
            Portfolio Gallery
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore my latest work and discover the artistry behind each transformation
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              data-testid={`button-category-${category.toLowerCase()}`}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card 
              key={item.id} 
              className="group cursor-pointer hover-elevate transition-all duration-300"
              onClick={() => setSelectedImage(item)}
              data-testid={`card-portfolio-${item.id}`}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-md">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>
                <div className="p-4">
                  <Badge variant="secondary" className="mb-2">
                    {item.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div 
              className="relative max-w-4xl max-h-[90vh] bg-card rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedImage(null)}
                data-testid="button-close-modal"
              >
                <X className="h-5 w-5" />
              </Button>
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedImage.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-serif text-2xl font-bold mb-2">{selectedImage.title}</h3>
                <p className="text-muted-foreground">{selectedImage.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}