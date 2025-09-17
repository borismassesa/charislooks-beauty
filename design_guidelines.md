# Beauty Salon & Makeup Portfolio Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from premium beauty and wellness brands like Glossier, Sephora, and high-end salon websites. Focus on elegant, minimalist aesthetics that let the work speak for itself while maintaining professional credibility.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light Mode: 340 15% 15% (Deep charcoal with warm undertones)
- Dark Mode: 340 8% 92% (Warm off-white)

**Secondary Colors:**
- Light Mode: 25 25% 95% (Warm cream background)
- Dark Mode: 340 12% 8% (Rich dark background)

**Accent Color:**
- 340 45% 65% (Soft rose - use sparingly for CTAs and highlights)

### B. Typography
- **Primary Font**: Inter (Google Fonts) - clean, professional
- **Accent Font**: Playfair Display (Google Fonts) - elegant serif for headings
- **Hierarchy**: 
  - Hero titles: 3xl-5xl Playfair Display
  - Section headers: xl-2xl Inter Medium
  - Body text: base Inter Regular
  - Captions: sm Inter Light

### C. Layout System
**Spacing Primitives**: Tailwind units of 4, 6, 8, 12, 16, 24
- Container max-width: 6xl (1152px)
- Grid gaps: 6-8 for cards, 12-16 for sections
- Section padding: py-16 to py-24

### D. Component Library

**Navigation**: Fixed header with transparent background, backdrop blur when scrolled
**Hero Section**: Full-viewport with subtle gradient overlay over background image
**Portfolio Gallery**: Masonry-style grid with hover effects revealing service details
**Service Cards**: Clean cards with service images, descriptions, duration, and pricing
**Booking Interface**: Step-by-step wizard with date picker and time slot selection
**Calendar Display**: Clean monthly/weekly view with appointment indicators

**Forms**: 
- Rounded inputs with subtle borders
- Focus states with accent color
- Floating labels for elegance

**Buttons**:
- Primary: Solid with accent color
- Secondary: Outline with transparent background and backdrop blur when over images
- Ghost: Text-only for tertiary actions

### E. Visual Treatments

**Gradients**: Subtle overlays using primary colors (340 15% 15% to 340 25% 5%) for image overlays and hero sections

**Background Treatments**: 
- Hero: High-quality salon/makeup work image with gradient overlay
- Sections: Alternating between pure backgrounds and subtle texture
- Cards: Soft drop shadows with warm undertones

## Images
**Hero Image**: Large, high-quality image showcasing makeup artistry or salon interior with professional lighting. Should occupy full viewport height.

**Portfolio Images**: High-resolution before/after shots, detailed makeup looks, and salon atmosphere photos arranged in responsive masonry grid.

**Service Images**: Clean, well-lit photos of treatments in progress or results, maintaining consistent lighting and color temperature.

**About Section**: Professional headshot of artist/owner and candid salon workspace shots.

## Key Design Principles
1. **Elegance over Flash**: Sophisticated, timeless design that won't date quickly
2. **Work-Centric**: Portfolio imagery is the hero - design supports, doesn't compete
3. **Trust Building**: Professional presentation builds confidence in services
4. **Mobile-First**: Optimized for clients booking on mobile devices
5. **Accessibility**: High contrast ratios, clear typography, intuitive navigation

## Booking Flow Emphasis
The booking system should feel seamless and luxurious - treat it as part of the service experience itself. Use progress indicators, clear service descriptions with imagery, and confirmation screens that build excitement for the appointment.