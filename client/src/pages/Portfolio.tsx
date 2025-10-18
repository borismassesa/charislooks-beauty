import { useQuery } from '@tanstack/react-query';
import PortfolioGallery from '@/components/PortfolioGallery';
import VideoHero from '@/components/VideoHero';
import InstagramFeed from '@/components/InstagramFeed';
import PromotionalBanner from '@/components/PromotionalBanner';
import { Button } from '@/components/ui/button';
import { Palette, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import type { PromotionalBanner as PromotionalBannerType } from '@shared/schema';
import bridalImage from '@assets/generated_images/Bridal_makeup_portfolio_photo_ed6ec900.png';
import eveningImage from '@assets/generated_images/Evening_makeup_portfolio_photo_d489780d.png';
import naturalImage from '@assets/generated_images/Natural_makeup_portfolio_photo_d7dfc25f.png';

// Mock Instagram posts - replace with real data from Instagram API later
const instagramPosts = [
  {
    id: '1',
    imageUrl: bridalImage,
    caption: 'Stunning bridal transformation for Sarah\'s big day ✨ Soft glam makeup with classic updo',
    likes: 234,
    comments: 18
  },
  {
    id: '2',
    imageUrl: eveningImage,
    caption: 'Bold and beautiful! Evening glam for a special night out 💄',
    likes: 189,
    comments: 12
  },
  {
    id: '3',
    imageUrl: naturalImage,
    caption: 'Natural beauty enhanced 🌿 Perfect for everyday elegance',
    likes: 156,
    comments: 9
  },
  {
    id: '4',
    imageUrl: bridalImage,
    caption: 'Wedding season is here! Book your bridal trial now 💍',
    likes: 301,
    comments: 24
  },
  {
    id: '5',
    imageUrl: eveningImage,
    caption: 'Smoky eyes and sleek hair for tonight\'s gala event 🖤',
    likes: 178,
    comments: 15
  },
  {
    id: '6',
    imageUrl: naturalImage,
    caption: 'Fresh faced and fabulous ✨ Natural makeup tutorial on stories!',
    likes: 213,
    comments: 11
  },
  {
    id: '7',
    imageUrl: bridalImage,
    caption: 'Behind the scenes of today\'s bridal shoot 📸',
    likes: 267,
    comments: 19
  },
  {
    id: '8',
    imageUrl: eveningImage,
    caption: 'Glam squad goals! Love creating these transformations 💕',
    likes: 195,
    comments: 13
  }
];

export default function Portfolio() {
  const { data: banners = [] } = useQuery<PromotionalBannerType[]>({
    queryKey: ['/api/banners'],
  });

  // Filter active banners and sort by priority
  const activeBanners = banners
    .filter(banner => {
      if (!banner.active) return false;
      const now = new Date();
      if (banner.startDate && new Date(banner.startDate) > now) return false;
      if (banner.endDate && new Date(banner.endDate) < now) return false;
      return true;
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  // Use video hero if available, otherwise fall back to static hero
  const useVideoHero = false; // Set to true when video URL is configured

  return (
    <div className="pt-16">
      {/* Promotional Banners */}
      {activeBanners.map((banner) => (
        <PromotionalBanner
          key={banner.id}
          bannerId={banner.id}
          title={banner.title}
          description={banner.description}
          ctaText={banner.ctaText || undefined}
          ctaLink={banner.ctaLink || undefined}
          backgroundColor={banner.backgroundColor || undefined}
          textColor={banner.textColor || undefined}
        />
      ))}

      {/* Hero Section */}
      {useVideoHero ? (
        <VideoHero
          videoUrl="/path/to/video.mp4"
          posterImage={bridalImage}
          title="Artistry in Every Transformation"
          subtitle="Explore our collection of stunning beauty transformations. From elegant bridal looks to bold evening styles, each creation tells a unique story of artistry and expertise that enhances natural beauty."
          ctaText="Book Your Consultation"
          ctaLink="/booking"
        />
      ) : (
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
          {/* Background Image with Dark Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${bridalImage})` }}
          >
            {/* Dark gradient overlay for better contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">

              {/* Main Heading */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
                Artistry in Every
                <span className="block text-ring">Transformation</span>
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                Explore our collection of stunning beauty transformations. From elegant bridal looks to bold evening styles, 
                each creation tells a unique story of artistry and expertise that enhances natural beauty.
              </p>

              {/* Decorative Elements */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-24"></div>
                <Palette className="h-6 w-6 text-ring" />
                <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1 max-w-24"></div>
              </div>

              {/* CTA Button */}
              <div className="flex justify-center">
                <Link href="/booking">
                  <Button 
                    size="lg" 
                    className="bg-ring hover:bg-ring/90 text-white border-ring/20 backdrop-blur-sm"
                    data-testid="button-book-consultation"
                  >
                    <ExternalLink className="mr-2 h-5 w-5" />
                    Book Your Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Portfolio Gallery */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Our Work
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Browse through our portfolio showcasing beautiful transformations, before-and-after comparisons, and creative styling work
          </p>
        </div>
        <PortfolioGallery />
      </section>

      {/* Instagram Feed */}
      <InstagramFeed posts={instagramPosts} instagramHandle="charislooks" />
    </div>
  );
}
