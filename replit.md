# Beauty Salon & Makeup Portfolio Application

## Overview

This is a full-stack beauty salon and makeup artistry portfolio website built with React, Node.js, Express, and PostgreSQL. The application provides a professional platform for showcasing makeup services, managing appointments, and handling client communications. It features both a public-facing website for clients and an admin dashboard for business management.

The application emphasizes premium beauty brand aesthetics with elegant, minimalist design inspired by brands like Glossier and Sephora. It's built as a complete booking and portfolio management system for professional makeup artists.

## Recent Changes

**October 18, 2025 (Latest)**: Portfolio page transformation with modern beauty industry features:
- **Before/After Image Sliders**: Interactive comparison sliders with smooth drag/touch interaction for showcasing transformations
- **Video Hero Section**: Dynamic video background support with mobile optimization and fallback images
- **Instagram-Style Feed**: Social proof gallery with grid layout, hover effects, and modal lightbox integration
- **Promotional Banners**: Seasonal announcement system with dismissible banners, custom colors, and date-based activation
- **Enhanced Gallery Layout**: Masonry grid design with category filtering, lazy loading, and support for images/videos/before-after content
- **Database Schema Updates**: Added beforeImageUrl, afterImageUrl, videoUrl fields to portfolio_items table; created promotional_banners table
- **Admin Banner Management**: Backend API routes for creating, updating, and deleting promotional banners

**October 18, 2025**: Complete appointment management system with Interac payment tracking:
- **Intelligent Deposit Calculation**: Automatically calculates and displays 20% deposit amount for all appointments based on service pricing
- **Interac Payment Integration**: Full support for Interac e-Transfer deposits with payment status tracking and confirmation
- **Comprehensive Appointment UI**: Enhanced appointment list view displaying deposit amounts, payment status badges, and client payment instructions
- **Admin Payment Management**: Quick deposit payment marking capability directly from appointment edit dialog with visual payment status indicators
- **Payment Instructions**: Clear guidance for clients on sending Interac deposits before appointment dates
- **Production-Ready Dashboard**: Complete analytics dashboard with revenue tracking, KPIs, interactive charts, and business intelligence features

**September 18, 2025**: Major UI/UX enhancements completed:
- **Portfolio Page Transformation**: Completely redesigned from basic layout to professional hero-style page with compelling "Artistry in Every Transformation" headline, background imagery, and engaging visual hierarchy
- **Services Page Enhancement**: Added dramatic hero section with "Expert Beauty Services" headline, salon interior background, and professional styling matching Portfolio page design
- **Contact Page Redesign**: Created engaging "Let's Create Your Perfect Look" hero section with artist professional imagery and consistent branding across all three main pages
- **Cohesive Design System**: Implemented unified 70vh hero sections, dark gradient overlays, serif typography, ring accent color, and decorative elements across Portfolio, Services, and Contact pages
- **User Experience Improvements**: Enhanced visual flow, professional section organization, and consistent call-to-action patterns throughout all transformed pages

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system following beauty industry aesthetics
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Theme System**: Custom theme provider with light/dark mode support (currently defaulting to dark)

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Session Management**: Express sessions for admin authentication
- **Password Hashing**: bcryptjs for secure password storage
- **API Design**: RESTful API with consistent error handling and logging middleware

### Data Layer
- **Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema changes
- **Connection**: @neondatabase/serverless for serverless-compatible database connections

### Authentication & Authorization
- **Admin Authentication**: Session-based authentication with secure password hashing
- **Session Storage**: Express sessions with configurable cookie security
- **Route Protection**: Middleware-based authentication for admin routes
- **Security**: CSRF protection through SameSite cookies and HTTP-only flags

### Core Data Models
- **Services**: Beauty services with pricing, duration, and category information
- **Appointments**: Client bookings with service association, status tracking, and payment management
  - Payment fields: `depositAmount`, `depositPaid`, `paymentStatus`, `cancellationReason`
  - Intelligent 20% deposit calculation based on service pricing
  - Interac e-Transfer payment tracking with status management
- **Portfolio Items**: Showcase gallery with categorization, tagging, and multimedia support
  - Standard fields: `title`, `description`, `category`, `imageUrl`, `tags`, `featured`
  - Before/After fields: `beforeImageUrl`, `afterImageUrl` for transformation comparisons
  - Video support: `videoUrl` for video content integration
- **Promotional Banners**: Seasonal announcements and special offers
  - Content fields: `title`, `description`, `ctaText`, `ctaLink`
  - Styling: `backgroundColor`, `textColor` for custom branding
  - Activation: `active`, `startDate`, `endDate`, `priority` for scheduling
- **Contact Messages**: Client inquiries with status management
- **Admin Users**: Administrative access with username/password authentication

### Development & Build System
- **Build Tool**: Vite for fast development and optimized production builds
- **Development**: Hot module replacement with development-specific error overlays
- **TypeScript**: Strict type checking with path aliases for clean imports
- **Code Quality**: ESLint configuration with consistent formatting standards

### File Structure Organization
- `client/`: Frontend React application with components, pages, and utilities
- `server/`: Backend Express server with routes, middleware, and database logic
- `shared/`: Common TypeScript types and database schema definitions
- `attached_assets/`: Static assets including generated portfolio images

### API Architecture
- **Services API**: CRUD operations for beauty services management
- **Appointments API**: Booking system with availability checking
- **Portfolio API**: Gallery management with image handling
- **Contact API**: Message submission and management system
- **Admin API**: Authentication and administrative operations

### Responsive Design System
- **Breakpoint Strategy**: Mobile-first responsive design with Tailwind breakpoints
- **Component Library**: Consistent component system with variant-based styling
- **Typography**: Inter and Playfair Display fonts for professional beauty brand aesthetic
- **Color System**: Warm color palette with rose accents suitable for beauty industry
- **Spacing System**: Consistent spacing scale using Tailwind's spacing utilities