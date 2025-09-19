import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from 'bcryptjs';
import { 
  insertAppointmentSchema, 
  insertContactMessageSchema,
  insertServiceSchema,
  insertPortfolioItemSchema 
} from "@shared/schema";

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
      
      // In a real app, you'd send confirmation email here
      console.log(`New appointment created: ${appointment.id} for ${appointment.clientName}`);
      
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

  const httpServer = createServer(app);
  return httpServer;
}
