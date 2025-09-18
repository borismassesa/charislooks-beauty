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
    title: 'Romantic Bridal Hair & Makeup',
    category: 'Bridal',
    image: bridalImage,
    description: 'Complete bridal transformation with elegant updo and soft, romantic makeup for the perfect wedding day look.',
    tags: ['Bridal', 'Hair Styling', 'Makeup']
  },
  {
    id: 2,
    title: 'Glamorous Evening Styling',
    category: 'Evening',
    image: eveningImage,
    description: 'Bold smoky eye makeup paired with sleek hair styling for stunning evening event transformation.',
    tags: ['Evening', 'Hair Styling', 'Makeup']
  },
  {
    id: 3,
    title: 'Textured Waves & Natural Glow',
    category: 'Hair Styling',
    image: naturalImage,
    description: 'Beautiful textured waves with effortless natural makeup that enhances your everyday beauty.',
    tags: ['Hair Styling', 'Natural', 'Waves']
  },
  {
    id: 4,
    title: 'Braided Elegance & Color',
    category: 'Hair Styling',
    image: bridalImage,
    description: 'Beautiful braided styles with creative coloring techniques to create your perfect new look.',
    tags: ['Braiding', 'Color', 'Styling']
  },
  {
    id: 5,
    title: 'Creative Editorial Looks',
    category: 'Editorial',
    image: eveningImage,
    description: 'Artistic hair and makeup combinations showcasing creative techniques and bold styling choices.',
    tags: ['Editorial', 'Creative', 'Hair & Makeup']
  },
  {
    id: 6,
    title: 'Voluminous Curls & Glam',
    category: 'Hair Styling',
    image: naturalImage,
    description: 'Beautiful voluminous curls with coordinated makeup for special occasions.',
    tags: ['Curls', 'Volume', 'Special Event']
  }
]

const categories = ['All', 'Bridal', 'Hair Styling', 'Evening', 'Special Event', 'Editorial']

export default function PortfolioGallery() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedImage, setSelectedImage] = useState<typeof portfolioItems[0] | null>(null)

  const filteredItems = selectedCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-16">
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
                <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
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
  )
}