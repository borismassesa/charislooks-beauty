import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { X, ExternalLink, Play } from 'lucide-react';
import type { PortfolioItem } from '@shared/schema';
import BeforeAfterSlider from './BeforeAfterSlider';

const categories = ['All', 'Bridal', 'Hair Styling', 'Evening', 'Special Event', 'Editorial'];

export default function PortfolioGallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const { data: portfolioItems = [], isLoading } = useQuery<PortfolioItem[]>({
    queryKey: ['/api/portfolio'],
  });

  const filteredItems = selectedCategory === 'All' 
    ? portfolioItems 
    : portfolioItems.filter(item => item.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-2 mb-16">
          {categories.map((cat) => (
            <Skeleton key={cat} className="h-9 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <Skeleton className="w-full h-64 rounded-t-md" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (portfolioItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No portfolio items yet. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-16">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            data-testid={`button-category-${category.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Masonry Gallery Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {filteredItems.map((item) => (
          <Card 
            key={item.id} 
            className="group cursor-pointer hover-elevate transition-all duration-300 break-inside-avoid"
            onClick={() => setSelectedItem(item)}
            data-testid={`card-portfolio-${item.id}`}
          >
            <CardContent className="p-0">
              <div className="relative overflow-hidden rounded-t-md">
                {item.beforeImageUrl && item.afterImageUrl ? (
                  <>
                    <BeforeAfterSlider 
                      beforeImage={item.beforeImageUrl}
                      afterImage={item.afterImageUrl}
                      className="w-full"
                    />
                    <Badge 
                      variant="secondary" 
                      className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white border-white/20"
                    >
                      Before/After
                    </Badge>
                  </>
                ) : item.videoUrl ? (
                  <>
                    <div className="relative w-full aspect-[4/3]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="h-8 w-8 text-ring ml-1" />
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white border-white/20"
                    >
                      Video
                    </Badge>
                  </>
                ) : (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
              <div className="p-4">
                <Badge variant="secondary" className="mb-2">
                  {item.category}
                </Badge>
                <h3 className="font-serif text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] bg-card rounded-lg overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setSelectedItem(null)}
              data-testid="button-close-modal"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Modal Content */}
            {selectedItem.beforeImageUrl && selectedItem.afterImageUrl ? (
              <div className="p-6">
                <BeforeAfterSlider 
                  beforeImage={selectedItem.beforeImageUrl}
                  afterImage={selectedItem.afterImageUrl}
                  className="w-full mb-6"
                />
              </div>
            ) : selectedItem.videoUrl ? (
              <video
                src={selectedItem.videoUrl}
                controls
                className="w-full h-auto max-h-[60vh] bg-black"
                autoPlay
              />
            ) : (
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            )}
            
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedItem.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">{selectedItem.title}</h3>
              <p className="text-muted-foreground">{selectedItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
