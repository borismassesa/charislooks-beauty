import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { 
  insertAppointmentSchema, 
  insertContactMessageSchema,
  insertServiceSchema,
  insertPortfolioItemSchema,
  insertPromotionalBannerSchema,
  insertTestimonialSchema,
  insertContactFAQSchema,
  insertContactInfoSchema,
  insertSocialMediaLinkSchema
} from "@shared/schema";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { sendBookingConfirmationEmail } from "./email";

// Extend Express Request type to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
  }
}

// Authentication middleware
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.session && (req.session as any).adminId) {
    next();
  } else {
    res.status(401).json({ error: "Authentication required" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set session
      (req.session as any).adminId = admin.id;
      res.json({ 
        message: "Login successful",
        admin: { id: admin.id, username: admin.username, email: admin.email }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  app.get("/api/admin/check", isAuthenticated, async (req, res) => {
    try {
      const admin = await storage.getAdminById((req.session as any).adminId);
      if (!admin) {
        return res.status(401).json({ error: "Session invalid" });
      }
      res.json({ 
        authenticated: true,
        admin: { id: admin.id, username: admin.username, email: admin.email }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check authentication" });
    }
  });

  app.post("/api/admin/update-password", isAuthenticated, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new passwords are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "New password must be at least 6 characters" });
      }

      const admin = await storage.getAdminById((req.session as any).adminId);
      if (!admin) {
        return res.status(401).json({ error: "Session invalid" });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Hash new password and update
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateAdmin(admin.id, { password: hashedPassword });

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
  });
  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/by-date/:date", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByDate(req.params.date);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments by date:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      // Validate input
      const validatedData = insertAppointmentSchema.parse(req.body);

      // Check for scheduling conflicts
      const appointmentDate = new Date(validatedData.appointmentDate);
      const existingAppointments = await storage.getAppointmentsByDate(appointmentDate.toISOString());
      
      // Get service to check duration
      const service = await storage.getService(validatedData.serviceId);
      if (!service) {
        return res.status(400).json({ error: "Invalid service selected" });
      }

      // Check for time conflicts (simplified - checks if same hour)
      const appointmentHour = appointmentDate.getHours();
      const serviceHours = Math.ceil(service.duration / 60);
      
      const hasConflict = existingAppointments.some(apt => {
        const existingDate = new Date(apt.appointmentDate);
        const existingHour = existingDate.getHours();
        const existingService = storage.getService(apt.serviceId);
        // This is a simplified conflict check - in production you'd want more sophisticated logic
        return Math.abs(existingHour - appointmentHour) < serviceHours;
      });

      if (hasConflict) {
        return res.status(409).json({ 
          error: "Time slot conflicts with existing appointment. Please choose a different time." 
        });
      }

      // Create appointment
      const appointment = await storage.createAppointment(validatedData);
      
      // Send booking confirmation email
      try {
        await sendBookingConfirmationEmail(appointment, service);
        console.log(`✅ Booking confirmation email sent to ${appointment.clientEmail}`);
      } catch (emailError) {
        console.error('⚠️ Failed to send booking confirmation email, but appointment was created:', emailError);
        // Don't fail the booking if email fails - just log it
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid appointment data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const appointment = await storage.updateAppointment(req.params.id, req.body);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAppointment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json({ message: "Appointment cancelled successfully" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ error: "Failed to cancel appointment" });
    }
  });

  // Enhanced appointment management routes
  app.get("/api/appointments/search", async (req, res) => {
    try {
      const filters = {
        clientName: req.query.clientName as string,
        status: req.query.status as string,
        serviceId: req.query.serviceId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };
      
      const appointments = await storage.searchAppointments(filters);
      res.json(appointments);
    } catch (error) {
      console.error("Error searching appointments:", error);
      res.status(500).json({ error: "Failed to search appointments" });
    }
  });

  app.get("/api/appointments/range/:startDate/:endDate", async (req, res) => {
    try {
      const appointments = await storage.getAppointmentsByDateRange(
        req.params.startDate,
        req.params.endDate
      );
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments by date range:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }
      
      const appointment = await storage.updateAppointmentStatus(req.params.id, status);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ error: "Failed to update appointment status" });
    }
  });

  app.patch("/api/appointments/bulk/status", async (req, res) => {
    try {
      const { appointmentIds, status } = req.body;
      if (!appointmentIds || !Array.isArray(appointmentIds) || !status) {
        return res.status(400).json({ error: "appointmentIds array and status are required" });
      }
      
      const updatedAppointments = await storage.bulkUpdateAppointmentStatus(appointmentIds, status);
      res.json(updatedAppointments);
    } catch (error) {
      console.error("Error bulk updating appointment status:", error);
      res.status(500).json({ error: "Failed to bulk update appointment status" });
    }
  });

  app.get("/api/appointments/analytics", async (req, res) => {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      const analytics = await storage.getAppointmentAnalytics(startDate, endDate);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching appointment analytics:", error);
      res.status(500).json({ error: "Failed to fetch appointment analytics" });
    }
  });

  // Portfolio routes
  app.get("/api/portfolio", async (req, res) => {
    try {
      const items = await storage.getPortfolioItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/portfolio", async (req, res) => {
    try {
      const validatedData = insertPortfolioItemSchema.parse(req.body);
      const item = await storage.createPortfolioItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating portfolio item:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid portfolio data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Failed to create portfolio item" });
    }
  });

  // Contact messages routes
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      
      // In a real app, you'd send notification email here
      console.log(`New contact message from: ${message.firstName} ${message.lastName}`);
      
      res.status(201).json({ message: "Message sent successfully", id: message.id });
    } catch (error) {
      console.error("Error creating contact message:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid contact data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/contact", async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });
  
  // Admin-protected routes for managing services
  app.post("/api/admin/services", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(validatedData);
      res.status(201).json(service);
    } catch (error) {
      console.error("Error creating service:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid service data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Failed to create service" });
    }
  });
  
  app.patch("/api/admin/services/:id", isAuthenticated, async (req, res) => {
    try {
      const service = await storage.updateService(req.params.id, req.body);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  app.delete("/api/admin/services/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json({ message: "Service deleted successfully" });
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ error: "Failed to delete service" });
    }
  });
  
  // Testimonials routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const testimonials = await storage.getTestimonials();
      // Filter only active testimonials for public view
      const activeTestimonials = testimonials.filter(t => t.active);
      res.json(activeTestimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });
  
  // Admin-protected routes for managing testimonials
  app.post("/api/admin/testimonials", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(validatedData);
      res.status(201).json(testimonial);
    } catch (error) {
      console.error("Error creating testimonial:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid testimonial data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Failed to create testimonial" });
    }
  });
  
  app.patch("/api/admin/testimonials/:id", isAuthenticated, async (req, res) => {
    try {
      const testimonial = await storage.updateTestimonial(req.params.id, req.body);
      if (!testimonial) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.json(testimonial);
    } catch (error) {
      console.error("Error updating testimonial:", error);
      res.status(500).json({ error: "Failed to update testimonial" });
    }
  });

  app.delete("/api/admin/testimonials/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteTestimonial(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Testimonial not found" });
      }
      res.json({ message: "Testimonial deleted successfully" });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      res.status(500).json({ error: "Failed to delete testimonial" });
    }
  });
  
  // Admin-protected routes for managing portfolio
  app.patch("/api/admin/portfolio/:id", isAuthenticated, async (req, res) => {
    try {
      const item = await storage.updatePortfolioItem(req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: "Portfolio item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error updating portfolio item:", error);
      res.status(500).json({ error: "Failed to update portfolio item" });
    }
  });
  
  app.delete("/api/admin/portfolio/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deletePortfolioItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Portfolio item not found" });
      }
      res.json({ message: "Portfolio item deleted successfully" });
    } catch (error) {
      console.error("Error deleting portfolio item:", error);
      res.status(500).json({ error: "Failed to delete portfolio item" });
    }
  });

  // Bulk operations for portfolio items
  app.post("/api/admin/portfolio/bulk/delete", isAuthenticated, async (req, res) => {
    try {
      const { ids } = req.body;
      if (!ids || !Array.isArray(ids)) {
        return res.status(400).json({ error: "ids array is required" });
      }

      const results = await Promise.allSettled(
        ids.map(id => storage.deletePortfolioItem(id))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      res.json({ 
        message: `${successful} items deleted successfully`,
        successful,
        failed,
        total: ids.length
      });
    } catch (error) {
      console.error("Error bulk deleting portfolio items:", error);
      res.status(500).json({ error: "Failed to bulk delete portfolio items" });
    }
  });

  app.post("/api/admin/portfolio/bulk/feature", isAuthenticated, async (req, res) => {
    try {
      const { ids, featured } = req.body;
      if (!ids || !Array.isArray(ids) || typeof featured !== 'boolean') {
        return res.status(400).json({ error: "ids array and featured boolean are required" });
      }

      const results = await Promise.allSettled(
        ids.map(id => storage.updatePortfolioItem(id, { featured }))
      );

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      res.json({ 
        message: `${successful} items ${featured ? 'featured' : 'unfeatured'} successfully`,
        successful,
        failed,
        total: ids.length
      });
    } catch (error) {
      console.error("Error bulk updating portfolio items:", error);
      res.status(500).json({ error: "Failed to bulk update portfolio items" });
    }
  });
  
  // Admin-protected route to update contact message status
  app.patch("/api/admin/contact/:id", isAuthenticated, async (req, res) => {
    try {
      const message = await storage.updateContactMessage(req.params.id, req.body);
      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }
      res.json(message);
    } catch (error) {
      console.error("Error updating message status:", error);
      res.status(500).json({ error: "Failed to update message status" });
    }
  });

  // Available time slots endpoint
  app.get("/api/availability/:date", async (req, res) => {
    try {
      const date = req.params.date;
      const existingAppointments = await storage.getAppointmentsByDate(date);
      
      // Standard business hours: 9 AM to 6 PM
      const businessHours = [
        '09:00', '10:30', '12:00', '13:30', '15:00', '16:30'
      ];

      // Filter out booked slots (simplified logic)
      const bookedHours = existingAppointments.map(apt => {
        const time = new Date(apt.appointmentDate);
        return time.getHours();
      });

      const availableSlots = businessHours.filter(slot => {
        const hour = parseInt(slot.split(':')[0]);
        return !bookedHours.includes(hour);
      });

      res.json(availableSlots);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  // Promotional Banners routes
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  app.post("/api/admin/banners", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPromotionalBannerSchema.parse(req.body);
      const banner = await storage.createBanner(validatedData);
      res.status(201).json(banner);
    } catch (error) {
      console.error("Error creating banner:", error);
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid banner data", details: (error as any).errors });
      }
      res.status(500).json({ error: "Failed to create banner" });
    }
  });

  app.patch("/api/admin/banners/:id", isAuthenticated, async (req, res) => {
    try {
      const banner = await storage.updateBanner(req.params.id, req.body);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.json(banner);
    } catch (error) {
      console.error("Error updating banner:", error);
      res.status(500).json({ error: "Failed to update banner" });
    }
  });

  app.delete("/api/admin/banners/:id", isAuthenticated, async (req, res) => {
    try {
      const deleted = await storage.deleteBanner(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.json({ message: "Banner deleted successfully" });
    } catch (error) {
      console.error("Error deleting banner:", error);
      res.status(500).json({ error: "Failed to delete banner" });
    }
  });

  // General file upload endpoint (requires admin auth)
  const upload = multer({ storage: multer.memoryStorage() });
  
  app.post("/api/upload", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const adminId = (req.session as any).adminId;
      const objectStorageService = new ObjectStorageService();
      
      // Get upload URL
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      
      // Upload file to object storage
      const uploadResponse = await fetch(uploadURL, {
        method: 'PUT',
        body: req.file.buffer,
        headers: {
          'Content-Type': req.file.mimetype,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to object storage');
      }

      // Normalize the object path
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      // Set ACL policy to make it public
      const publicPath = await objectStorageService.trySetObjectEntityAclPolicy(
        objectPath,
        {
          owner: adminId,
          visibility: "public",
        }
      );

      // Return the public URL
      res.json({ url: publicPath });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Object storage routes for portfolio images
  // GET /objects/:objectPath(*) - Serve uploaded portfolio images publicly (NO auth required)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // POST /api/admin/portfolio/upload - Get presigned URL for upload (requires admin auth)
  app.post("/api/admin/portfolio/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // PUT /api/admin/portfolio/:id/image - Update portfolio item with uploaded image path (requires admin auth)
  app.put("/api/admin/portfolio/:id/image", isAuthenticated, async (req, res) => {
    if (!req.body.imageUrl) {
      return res.status(400).json({ error: "imageUrl is required" });
    }

    const adminId = (req.session as any).adminId;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageUrl,
        {
          owner: adminId,
          visibility: "public",
        },
      );

      const item = await storage.updatePortfolioItem(req.params.id, {
        imageUrl: objectPath,
      });

      if (!item) {
        return res.status(404).json({ error: "Portfolio item not found" });
      }

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting portfolio image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Contact Page CRUD API Endpoints
  
  // Contact FAQs CRUD
  app.get("/api/admin/contact/faqs", isAuthenticated, async (req, res) => {
    try {
      const faqs = await storage.getContactFAQs();
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching contact FAQs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/contact/faqs", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContactFAQSchema.parse(req.body);
      const faq = await storage.createContactFAQ(validatedData);
      res.status(201).json(faq);
    } catch (error) {
      console.error("Error creating contact FAQ:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid data", details: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/admin/contact/faqs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertContactFAQSchema.parse(req.body);
      const faq = await storage.updateContactFAQ(id, validatedData);
      if (!faq) {
        return res.status(404).json({ error: "FAQ not found" });
      }
      res.json(faq);
    } catch (error) {
      console.error("Error updating contact FAQ:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid data", details: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.delete("/api/admin/contact/faqs/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteContactFAQ(id);
      if (!success) {
        return res.status(404).json({ error: "FAQ not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contact FAQ:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Contact Info CRUD
  app.get("/api/admin/contact/info", isAuthenticated, async (req, res) => {
    try {
      const info = await storage.getContactInfo();
      res.json(info);
    } catch (error) {
      console.error("Error fetching contact info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/contact/info", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertContactInfoSchema.parse(req.body);
      const info = await storage.createContactInfo(validatedData);
      res.status(201).json(info);
    } catch (error) {
      console.error("Error creating contact info:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid data", details: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/admin/contact/info/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertContactInfoSchema.parse(req.body);
      const info = await storage.updateContactInfo(id, validatedData);
      if (!info) {
        return res.status(404).json({ error: "Contact info not found" });
      }
      res.json(info);
    } catch (error) {
      console.error("Error updating contact info:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid data", details: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  // Social Media Links CRUD
  app.get("/api/admin/contact/social-media", isAuthenticated, async (req, res) => {
    try {
      const links = await storage.getSocialMediaLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching social media links:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/admin/contact/social-media", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertSocialMediaLinkSchema.parse(req.body);
      const link = await storage.createSocialMediaLink(validatedData);
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating social media link:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid data", details: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.put("/api/admin/contact/social-media/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertSocialMediaLinkSchema.parse(req.body);
      const link = await storage.updateSocialMediaLink(id, validatedData);
      if (!link) {
        return res.status(404).json({ error: "Social media link not found" });
      }
      res.json(link);
    } catch (error) {
      console.error("Error updating social media link:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        res.status(400).json({ error: "Invalid data", details: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.delete("/api/admin/contact/social-media/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSocialMediaLink(id);
      if (!success) {
        return res.status(404).json({ error: "Social media link not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting social media link:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Public API endpoints (no auth required)
  app.get("/api/contact/faqs", async (req, res) => {
    try {
      const faqs = await storage.getActiveContactFAQs();
      res.json(faqs);
    } catch (error) {
      console.error("Error fetching active contact FAQs:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/contact/info", async (req, res) => {
    try {
      const info = await storage.getActiveContactInfo();
      res.json(info);
    } catch (error) {
      console.error("Error fetching active contact info:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/contact/social-media", async (req, res) => {
    try {
      const links = await storage.getActiveSocialMediaLinks();
      res.json(links);
    } catch (error) {
      console.error("Error fetching active social media links:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
