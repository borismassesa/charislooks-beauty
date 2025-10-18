import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Sparkles } from 'lucide-react';

interface PromotionalBannerProps {
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  backgroundColor?: string;
  textColor?: string;
  dismissible?: boolean;
  bannerId?: string;
}

export default function PromotionalBanner({
  title,
  description,
  ctaText,
  ctaLink,
  onCtaClick,
  backgroundColor = '#340808',
  textColor = '#ffffff',
  dismissible = true,
  bannerId = 'promo-banner'
}: PromotionalBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const storageKey = `banner-dismissed-${bannerId}`;

  useEffect(() => {
    const dismissed = localStorage.getItem(storageKey);
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (dismissible) {
      localStorage.setItem(storageKey, 'true');
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="relative py-3 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor }}
      data-testid="promotional-banner"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Sparkles className="h-5 w-5 flex-shrink-0" style={{ color: textColor }} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base" style={{ color: textColor }}>
                {title}
              </p>
              <p className="text-xs sm:text-sm opacity-90 line-clamp-1" style={{ color: textColor }}>
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {ctaText && (
              <>
                {ctaLink ? (
                  <a href={ctaLink}>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-white/20 backdrop-blur-sm hover-elevate"
                      style={{ color: textColor }}
                      data-testid="button-banner-cta"
                    >
                      {ctaText}
                    </Button>
                  </a>
                ) : (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="border-white/20 backdrop-blur-sm hover-elevate"
                    style={{ color: textColor }}
                    onClick={onCtaClick}
                    data-testid="button-banner-cta"
                  >
                    {ctaText}
                  </Button>
                )}
              </>
            )}

            {dismissible && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 hover:bg-white/10"
                onClick={handleDismiss}
                data-testid="button-dismiss-banner"
              >
                <X className="h-4 w-4" style={{ color: textColor }} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
