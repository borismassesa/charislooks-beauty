import { 
  type Service, 
  type InsertService,
  type Appointment, 
  type InsertAppointment,
  type PortfolioItem, 
  type InsertPortfolioItem,
  type ContactMessage, 
  type InsertContactMessage,
  type AdminUser,
  type InsertAdminUser
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Services
  getServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  
  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]>;
  searchAppointments(filters: {
    clientName?: string;
    status?: string;
    serviceId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined>;
  bulkUpdateAppointmentStatus(ids: string[], status: string): Promise<Appointment[]>;
  deleteAppointment(id: string): Promise<boolean>;
  getAppointmentAnalytics(startDate?: string, endDate?: string): Promise<{
    totalAppointments: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShows: number;
    totalRevenue: number;
    popularServices: { serviceId: string; serviceName: string; count: number; }[];
    popularTimeSlots: { hour: number; count: number; }[];
    clientRetention: { returning: number; new: number; };
  }>;
  
  // Portfolio
  getPortfolioItems(): Promise<PortfolioItem[]>;
  getPortfolioItem(id: string): Promise<PortfolioItem | undefined>;
  createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem>;
  updatePortfolioItem(id: string, item: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined>;
  deletePortfolioItem(id: string): Promise<boolean>;
  
  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessage(id: string, message: Partial<InsertContactMessage>): Promise<ContactMessage | undefined>;
  
  // Admin Users
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  getAdminById(id: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
}

export class MemStorage implements IStorage {
  private services: Map<string, Service>;
  private appointments: Map<string, Appointment>;
  private portfolioItems: Map<string, PortfolioItem>;
  private contactMessages: Map<string, ContactMessage>;
  private adminUsers: Map<string, AdminUser>;

  constructor() {
    this.services = new Map();
    this.appointments = new Map();
    this.portfolioItems = new Map();
    this.contactMessages = new Map();
    this.adminUsers = new Map();
    
    // Initialize with default services
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    const defaultServices: InsertService[] = [
      {
        name: 'Bridal Makeup',
        description: 'Complete bridal makeup service including consultation, trial, and wedding day application.',
        duration: 240, // 4 hours
        price: '425.00',
        category: 'Bridal',
        active: true
      },
      {
        name: 'Special Event Makeup',
        description: 'Professional makeup for parties, galas, photoshoots, and other special occasions.',
        duration: 120, // 2 hours
        price: '200.00',
        category: 'Event',
        active: true
      },
      {
        name: 'Everyday Glam',
        description: 'Natural, everyday makeup that enhances your features for work, dates, or daily wear.',
        duration: 60, // 1 hour
        price: '100.00',
        category: 'Everyday',
        active: true
      },
      {
        name: 'Makeup Lesson',
        description: 'Learn professional makeup techniques with personalized one-on-one instruction.',
        duration: 120, // 2 hours
        price: '200.00',
        category: 'Lesson',
        active: true
      },
      {
        name: 'Group Session',
        description: 'Perfect for bridal parties, bachelorette parties, or girls\' nights out.',
        duration: 180, // 3 hours
        price: '125.00',
        category: 'Group',
        active: true
      }
    ];

    for (const service of defaultServices) {
      await this.createService(service);
    }
  }

  // Services
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values()).filter(s => s.active);
  }

  async getService(id: string): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = randomUUID();
    const service: Service = { 
      ...insertService, 
      id, 
      active: insertService.active ?? true,
      createdAt: new Date()
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: string, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;
    
    const updatedService = { ...service, ...serviceUpdate };
    this.services.set(id, updatedService);
    return updatedService;
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).sort(
      (a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime()
    );
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const targetDate = new Date(date);
    return Array.from(this.appointments.values()).filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate.toDateString() === targetDate.toDateString() && apt.status === 'confirmed';
    });
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = randomUUID();
    const appointment: Appointment = {
      ...insertAppointment,
      id,
      notes: insertAppointment.notes ?? null,
      status: 'pending',
      depositAmount: insertAppointment.depositAmount ?? null,
      depositPaid: false,
      paymentStatus: 'unpaid',
      cancellationReason: null,
      createdAt: new Date()
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: string, appointmentUpdate: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...appointmentUpdate };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async bulkUpdateAppointmentStatus(ids: string[], status: string): Promise<Appointment[]> {
    const updatedAppointments: Appointment[] = [];
    
    for (const id of ids) {
      const appointment = await this.updateAppointmentStatus(id, status);
      if (appointment) {
        updatedAppointments.push(appointment);
      }
    }
    
    return updatedAppointments;
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Array.from(this.appointments.values()).filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      return aptDate >= start && aptDate <= end;
    }).sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime());
  }

  async searchAppointments(filters: {
    clientName?: string;
    status?: string;
    serviceId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> {
    let appointments = Array.from(this.appointments.values());
    
    if (filters.clientName) {
      const searchTerm = filters.clientName.toLowerCase();
      appointments = appointments.filter(apt => 
        apt.clientName.toLowerCase().includes(searchTerm) ||
        apt.clientEmail.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.status) {
      appointments = appointments.filter(apt => apt.status === filters.status);
    }
    
    if (filters.serviceId) {
      appointments = appointments.filter(apt => apt.serviceId === filters.serviceId);
    }
    
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      appointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= start && aptDate <= end;
      });
    }
    
    return appointments.sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime());
  }

  async getAppointmentAnalytics(startDate?: string, endDate?: string): Promise<{
    totalAppointments: number;
    confirmed: number;
    completed: number;
    cancelled: number;
    noShows: number;
    totalRevenue: number;
    popularServices: { serviceId: string; serviceName: string; count: number; }[];
    popularTimeSlots: { hour: number; count: number; }[];
    clientRetention: { returning: number; new: number; };
  }> {
    let appointments = Array.from(this.appointments.values());
    
    // Filter by date range if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      appointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= start && aptDate <= end;
      });
    }
    
    // Basic stats
    const totalAppointments = appointments.length;
    const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length;
    const noShows = appointments.filter(apt => apt.status === 'no-show').length;
    
    // Calculate revenue for completed appointments
    let totalRevenue = 0;
    const completedAppointments = appointments.filter(apt => apt.status === 'completed');
    for (const apt of completedAppointments) {
      const service = await this.getService(apt.serviceId);
      if (service) {
        totalRevenue += parseFloat(service.price);
      }
    }
    
    // Popular services
    const serviceCount = new Map<string, { name: string; count: number }>();
    for (const apt of appointments) {
      const service = await this.getService(apt.serviceId);
      if (service) {
        const current = serviceCount.get(apt.serviceId) || { name: service.name, count: 0 };
        serviceCount.set(apt.serviceId, { name: current.name, count: current.count + 1 });
      }
    }
    
    const popularServices = Array.from(serviceCount.entries())
      .map(([serviceId, data]) => ({
        serviceId,
        serviceName: data.name,
        count: data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Popular time slots
    const timeSlotCount = new Map<number, number>();
    for (const apt of appointments) {
      const hour = new Date(apt.appointmentDate).getHours();
      timeSlotCount.set(hour, (timeSlotCount.get(hour) || 0) + 1);
    }
    
    const popularTimeSlots = Array.from(timeSlotCount.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Client retention (simplified)
    const clientEmails = new Set(appointments.map(apt => apt.clientEmail));
    const clientAppointmentCounts = new Map<string, number>();
    
    for (const apt of appointments) {
      const count = clientAppointmentCounts.get(apt.clientEmail) || 0;
      clientAppointmentCounts.set(apt.clientEmail, count + 1);
    }
    
    const returning = Array.from(clientAppointmentCounts.values()).filter(count => count > 1).length;
    const newClients = clientEmails.size - returning;
    
    return {
      totalAppointments,
      confirmed,
      completed,
      cancelled,
      noShows,
      totalRevenue,
      popularServices,
      popularTimeSlots,
      clientRetention: { returning, new: newClients }
    };
  }

  async deleteAppointment(id: string): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Portfolio
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    return Array.from(this.portfolioItems.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getPortfolioItem(id: string): Promise<PortfolioItem | undefined> {
    return this.portfolioItems.get(id);
  }

  async createPortfolioItem(insertItem: InsertPortfolioItem): Promise<PortfolioItem> {
    const id = randomUUID();
    const item: PortfolioItem = {
      ...insertItem,
      id,
      tags: insertItem.tags ?? [],
      featured: insertItem.featured ?? false,
      createdAt: new Date()
    };
    this.portfolioItems.set(id, item);
    return item;
  }

  async updatePortfolioItem(id: string, itemUpdate: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const item = this.portfolioItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, ...itemUpdate };
    this.portfolioItems.set(id, updatedItem);
    return updatedItem;
  }

  async deletePortfolioItem(id: string): Promise<boolean> {
    return this.portfolioItems.delete(id);
  }

  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = {
      ...insertMessage,
      id,
      phone: insertMessage.phone ?? null,
      status: 'unread',
      createdAt: new Date()
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async updateContactMessage(id: string, messageUpdate: Partial<InsertContactMessage>): Promise<ContactMessage | undefined> {
    const message = this.contactMessages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...messageUpdate };
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  // Admin Users
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(admin => admin.username === username);
  }
  
  async getAdminById(id: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }
  
  async createAdmin(insertAdmin: InsertAdminUser): Promise<AdminUser> {
    const id = randomUUID();
    const admin: AdminUser = {
      ...insertAdmin,
      id,
      createdAt: new Date()
    };
    this.adminUsers.set(id, admin);
    return admin;
  }
}

// Use database storage if DATABASE_URL is set, otherwise use memory storage
import { dbStorage } from './db-storage';
export const storage = process.env.DATABASE_URL ? dbStorage : new MemStorage();
