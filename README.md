# CharisLooks Beauty

A modern, full-stack beauty salon portfolio and booking application built for professional makeup artists and beauty service providers.

![Beauty Salon Application](https://img.shields.io/badge/Status-Production%20Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node](https://img.shields.io/badge/Node-18%2B-green)

## ✨ Features

### 🎨 Client-Facing Features
- **Portfolio Gallery**: Stunning before/after sliders, video showcases, and Instagram-style image galleries
- **Service Listings**: Browse beauty services with detailed descriptions, pricing, and duration
- **Online Booking**: Book appointments with integrated calendar and availability checking
- **Testimonials**: Client reviews with profile pictures and star ratings
- **Contact Form**: Easy inquiry submission with FAQ section
- **Responsive Design**: Beautiful mobile-first design optimized for all devices

### 👨‍💼 Admin Dashboard
- **Service Management**: Full CRUD operations for managing beauty services
- **Appointment Management**: View, confirm, and manage client bookings with payment tracking
- **Portfolio Management**: Upload and organize portfolio items (images, videos, before/after comparisons)
- **Testimonial Management**: Manage client reviews and testimonials
- **Contact Management**: View and respond to client inquiries
- **Analytics Dashboard**: Track revenue, bookings, and business metrics
- **Promotional Banners**: Create and schedule seasonal announcements

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript for type safety
- **Wouter** for lightweight client-side routing
- **TanStack Query** for efficient server state management
- **Shadcn/ui** with Radix UI primitives for beautiful components
- **Tailwind CSS** for modern, responsive styling
- **Framer Motion** for smooth animations

### Backend
- **Node.js** with Express server
- **PostgreSQL** database (Neon, Supabase, or Railway)
- **Drizzle ORM** for type-safe database operations
- **Session-based authentication** for secure admin access
- **Cloud storage** support for images (Google Cloud Storage)

## 📦 Installation

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (we recommend [Neon](https://neon.tech) for free hosting)
- npm or yarn package manager

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/charislooks-beauty.git
cd charislooks-beauty
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy the example environment file and update with your values:
```bash
cp env.example .env
```

Required environment variables:
```bash
DATABASE_URL=your_postgresql_connection_string
SESSION_SECRET=your_secure_random_string
NODE_ENV=development
PORT=5000
```

4. **Set up the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials immediately after first login!

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:prod` | Build for production with optimizations |
| `npm run start` | Start production server |
| `npm run check` | Run TypeScript type checking |
| `npm run db:push` | Push database schema changes |

## 📁 Project Structure

```
charislooks-beauty/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and helpers
│   │   └── hooks/         # Custom React hooks
├── server/                # Backend Express server
│   ├── routes.ts          # API routes
│   ├── db-storage.ts      # Database operations
│   ├── storage.ts         # Storage interface
│   └── index.ts           # Server entry point
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Database schema definitions
├── attached_assets/       # Static assets and images
└── dist/                  # Production build output
```

## 🌐 Deployment

Ready to deploy? Check out our comprehensive [Deployment Guide](./DEPLOYMENT.md) for detailed instructions on deploying to:
- Railway (Recommended - easiest setup)
- Vercel (Great for serverless)
- DigitalOcean App Platform

Quick deploy options:
```bash
# Deploy to Railway
npm run deploy:railway

# Deploy to Vercel
npm run deploy
```

## 🔒 Security Features

- HTTPS-only cookies in production
- Secure session management with bcrypt password hashing
- CORS configuration for production domains
- SQL injection protection via Drizzle ORM
- Environment variable security
- Rate limiting ready (can be added)

## 🎨 Design System

The application features a modern beauty brand aesthetic with:
- Dark theme optimized for showcasing portfolio work
- Elegant serif typography (Playfair Display)
- Professional sans-serif body text (Inter)
- Warm color palette with rose accents
- Mobile-first responsive design
- Smooth animations and transitions

## 📊 Database Schema

The application includes the following main entities:
- **Services**: Beauty services with pricing and categories
- **Appointments**: Client bookings with payment tracking
- **Portfolio Items**: Gallery items with images, videos, and before/after comparisons
- **Testimonials**: Client reviews with ratings and avatars
- **Contact Messages**: Client inquiries and communications
- **Promotional Banners**: Seasonal announcements and special offers
- **Admin Users**: Administrative access accounts

## 🤝 Contributing

This is a private project for CharisLooks Beauty. For authorized contributors:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💼 About CharisLooks Beauty

CharisLooks Beauty specializes in professional makeup artistry and beauty services. This application serves as both a portfolio showcase and a complete booking management system.

## 📞 Support

For issues, questions, or feature requests, please open an issue on the repository or contact the development team.

---

**Built with ❤️ for the beauty industry**
