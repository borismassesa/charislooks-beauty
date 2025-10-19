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

      {/* Masonry/Bento Box Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(280px,_auto)]">
        {filteredItems.map((item, index) => {
          const isBeforeAfter = item.beforeImageUrl && item.afterImageUrl;
          const isVideo = item.videoUrl;
          const isFeatured = item.featured;
          
          // Determine grid span based on content type and featured status
          let gridSpan = "";
          if (isFeatured) {
            gridSpan = "md:col-span-2 md:row-span-2"; // Bento box for featured
          } else if (isBeforeAfter) {
            gridSpan = "md:col-span-2"; // Prominent for before/after
          } else {
            gridSpan = ""; // Regular single cell
          }

          return (
            <Card 
              key={item.id} 
              className={`group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${gridSpan}`}
              onClick={() => setSelectedItem(item)}
              data-testid={`card-portfolio-${item.id}`}
            >
              <CardContent className="p-0 h-full flex flex-col">
                <div className="relative overflow-hidden rounded-t-md flex-1">
                  {isBeforeAfter ? (
                    <>
                      <div className="aspect-[4/3] md:aspect-[3/2]">
                        <BeforeAfterSlider 
                          beforeImage={item.beforeImageUrl || ''}
                          afterImage={item.afterImageUrl || ''}
                          className="w-full h-full"
                        />
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="absolute top-3 left-3 bg-gradient-to-r from-ring/90 to-ring text-white border-white/20 shadow-lg"
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          Before/After
                        </div>
                      </Badge>
                    </>
                  ) : isVideo ? (
                    <>
                      <div className="aspect-[4/3] md:aspect-[3/2]">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
                          <div className="w-16 h-16 bg-white/95 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
                            <Play className="h-8 w-8 text-ring ml-1" />
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="absolute top-3 left-3 bg-gradient-to-r from-blue-600/90 to-blue-500 text-white border-white/20 shadow-lg"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Video
                      </Badge>
                    </>
                  ) : (
                    <div className="aspect-[4/3] md:aspect-[3/2]">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <ExternalLink className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>

                  {/* Featured indicator */}
                  {isFeatured && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-3 right-3 bg-gradient-to-r from-yellow-500/90 to-yellow-400 text-white border-white/20 shadow-lg"
                    >
                      ⭐ Featured
                    </Badge>
                  )}
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    {isFeatured && (
                      <div className="text-xs text-muted-foreground">Featured</div>
                    )}
                  </div>
                  <h3 className="font-serif text-lg font-semibold mb-2 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{item.description}</p>
                  
                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {item.tags.slice(0, 3).map((tag, tagIndex) => (
                        <span 
                          key={tagIndex}
                          className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative max-w-6xl w-full max-h-[95vh] bg-card rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-20 bg-black/60 text-white hover:bg-black/80 rounded-full"
              onClick={() => setSelectedItem(null)}
              data-testid="button-close-modal"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Modal Content */}
            <div className="flex flex-col lg:flex-row h-full">
              {/* Media Section */}
              <div className="flex-1 bg-black flex items-center justify-center p-4">
                {selectedItem.beforeImageUrl && selectedItem.afterImageUrl ? (
                  <div className="w-full max-w-4xl">
                    <BeforeAfterSlider 
                      beforeImage={selectedItem.beforeImageUrl}
                      afterImage={selectedItem.afterImageUrl}
                      className="w-full rounded-lg"
                    />
                  </div>
                ) : selectedItem.videoUrl ? (
                  <video
                    src={selectedItem.videoUrl}
                    controls
                    className="w-full h-auto max-h-[70vh] rounded-lg"
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                  />
                )}
              </div>
              
              {/* Details Section */}
              <div className="w-full lg:w-96 bg-card p-6 overflow-y-auto">
                <div className="space-y-4">
                  {/* Category and Featured Badge */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-sm">
                      {selectedItem.category}
                    </Badge>
                    {selectedItem.featured && (
                      <Badge variant="secondary" className="bg-gradient-to-r from-yellow-500/90 to-yellow-400 text-white">
                        ⭐ Featured
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-2xl font-bold leading-tight">{selectedItem.title}</h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground leading-relaxed">{selectedItem.description}</p>
                  
                  {/* Tags */}
                  {selectedItem.tags && selectedItem.tags.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Media Type Indicator */}
                  <div className="pt-4 border-t">
                    {selectedItem.beforeImageUrl && selectedItem.afterImageUrl ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-ring rounded-full animate-pulse"></div>
                        Before & After Transformation
                      </div>
                    ) : selectedItem.videoUrl ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Play className="w-4 h-4" />
                        Video Content
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                        Portfolio Image
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
