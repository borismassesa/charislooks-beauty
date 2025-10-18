# CharisLooks Beauty

A comprehensive beauty salon portfolio application for "CharisLooks" specializing in women's hair styling and makeup services.

## Features

### Client-Facing Features
- **Portfolio Gallery**: Showcase makeup transformations with before/after sliders, videos, and image galleries
- **Service Listings**: Browse professional beauty services with pricing and duration
- **Online Booking**: Book appointments with 20% deposit via Interac e-Transfer
- **Client Testimonials**: Read reviews from satisfied clients with profile pictures
- **Contact Form**: Get in touch for inquiries and bookings

### Admin Dashboard
- **Service Management**: Complete CRUD operations for beauty services
- **Appointment Management**: View, confirm, and manage client bookings with payment tracking
- **Portfolio Management**: Upload and organize portfolio items with multimedia support
- **Testimonial Management**: Manage client reviews with avatar uploads
- **Analytics Dashboard**: Track revenue, bookings, and business metrics
- **Promotional Banners**: Create seasonal announcements and special offers

## Tech Stack

### Frontend
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for state management
- Shadcn/ui components with Radix UI
- Tailwind CSS for styling

### Backend
- Node.js with Express
- PostgreSQL database via Neon
- Drizzle ORM
- Session-based authentication
- Object storage for images

### Features
- Responsive design with mobile-first approach
- Dark theme with professional beauty brand aesthetics
- Secure admin authentication
- Real-time form validation
- Image upload with cloud storage

## Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_session_secret
```

3. Push database schema:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`

**Important**: Change these credentials in production!

## Project Structure

```
├── client/          # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities and helpers
├── server/          # Backend Express server
│   ├── routes.ts    # API routes
│   ├── storage.ts   # Storage interface
│   └── db-storage.ts # Database implementation
├── shared/          # Shared TypeScript types
│   └── schema.ts    # Database schema definitions
└── attached_assets/ # Static assets

```

## Key Features Implemented

### Payment System
- Intelligent 20% deposit calculation
- Interac e-Transfer payment tracking
- Payment status management
- Client payment instructions

### Portfolio Showcase
- Before/after image sliders
- Video content support
- Category filtering
- Masonry grid layout
- Modal lightbox view

### Testimonials
- Animated marquee carousel
- Star ratings
- Avatar/profile picture uploads
- Featured testimonials
- Active/inactive status management

### Admin Dashboard
- Revenue tracking and KPIs
- Interactive charts
- Appointment analytics
- Comprehensive CRUD interfaces

## License

Private - All rights reserved

## Contact

For inquiries about CharisLooks Beauty services, please visit the website or contact through the contact form.
