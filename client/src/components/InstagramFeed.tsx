import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, ExternalLink, X } from 'lucide-react';
import { SiInstagram } from 'react-icons/si';

interface InstagramPost {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
}

interface InstagramFeedProps {
  posts: InstagramPost[];
  instagramHandle?: string;
}

export default function InstagramFeed({ posts, instagramHandle = 'charislooks' }: InstagramFeedProps) {
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SiInstagram className="h-8 w-8 text-ring" />
            <h2 className="font-serif text-3xl sm:text-4xl font-bold">
              Follow Our Journey
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Stay inspired with our latest transformations, beauty tips, and behind-the-scenes moments
          </p>
          <a 
            href={`https://instagram.com/${instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" data-testid="button-instagram-follow">
              <SiInstagram className="mr-2 h-4 w-4" />
              @{instagramHandle}
            </Button>
          </a>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-md hover-elevate"
              onClick={() => setSelectedPost(post)}
              data-testid={`instagram-post-${post.id}`}
            >
              <img
                src={post.imageUrl}
                alt={post.caption}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center gap-6 opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-2 text-white">
                  <Heart className="h-5 w-5 fill-white" />
                  <span className="font-semibold">{post.likes}</span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <MessageCircle className="h-5 w-5 fill-white" />
                  <span className="font-semibold">{post.comments}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedPost && (
          <div 
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPost(null)}
          >
            <div 
              className="relative max-w-4xl w-full bg-card rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedPost(null)}
                data-testid="button-close-instagram-modal"
              >
                <X className="h-5 w-5" />
              </Button>
              
              <div className="grid md:grid-cols-2">
                {/* Image */}
                <div className="relative aspect-square md:aspect-auto">
                  <img
                    src={selectedPost.imageUrl}
                    alt={selectedPost.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col">
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <SiInstagram className="h-6 w-6 text-ring" />
                    <span className="font-semibold">@{instagramHandle}</span>
                  </div>
                  
                  <p className="text-foreground mb-6 flex-1">
                    {selectedPost.caption}
                  </p>
                  
                  <div className="flex items-center gap-6 mb-4 pb-4 border-b">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-ring" />
                      <span className="font-semibold">{selectedPost.likes} likes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-ring" />
                      <span className="font-semibold">{selectedPost.comments} comments</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="default"
                    className="w-full"
                    data-testid="button-view-instagram-post"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Instagram
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
