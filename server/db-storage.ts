import { eq, desc, and, gte, lt } from 'drizzle-orm';
import { 
  services,
  appointments,
  portfolioItems,
  contactMessages,
  adminUsers,
  promotionalBanners,
  testimonials,
  contactFAQs,
  contactInfo,
  socialMediaLinks,
  type Service, 
  type InsertService,
  type Appointment, 
  type InsertAppointment,
  type PortfolioItem, 
  type InsertPortfolioItem,
  type ContactMessage, 
  type InsertContactMessage,
  type AdminUser,
  type InsertAdminUser,
  type PromotionalBanner,
  type InsertPromotionalBanner,
  type Testimonial,
  type InsertTestimonial,
  type ContactFAQ,
  type InsertContactFAQ,
  type ContactInfo,
  type InsertContactInfo,
  type SocialMediaLink,
  type InsertSocialMediaLink
} from "@shared/schema";
import { IStorage } from './storage';
import bcrypt from 'bcryptjs';
import { db } from './db';

export class DrizzleStorage implements IStorage {
  // Services
  async getServices(): Promise<Service[]> {
    const result = await db.select().from(services).where(eq(services.active, true));
    return result.map(s => ({
      ...s,
      price: s.price.toString()
    }));
  }

  async getService(id: string): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id)).limit(1);
    if (result.length === 0) return undefined;
    return {
      ...result[0],
      price: result[0].price.toString()
    };
  }

  async createService(service: InsertService): Promise<Service> {
    const result = await db.insert(services).values(service).returning();
    return {
      ...result[0],
      price: result[0].price.toString()
    };
  }

  async updateService(id: string, serviceUpdate: Partial<InsertService>): Promise<Service | undefined> {
    const result = await db.update(services)
      .set(serviceUpdate)
      .where(eq(services.id, id))
      .returning();
    if (result.length === 0) return undefined;
    return {
      ...result[0],
      price: result[0].price.toString()
    };
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services)
      .where(eq(services.id, id))
      .returning();
    return result.length > 0;
  }
  
  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const result = await db.select().from(appointments).orderBy(appointments.appointmentDate);
    return result;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const result = await db.select().from(appointments).where(eq(appointments.id, id)).limit(1);
    return result[0];
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const result = await db.select()
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfDay),
          lt(appointments.appointmentDate, endOfDay),
          eq(appointments.status, 'confirmed')
        )
      );
    return result;
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await db.insert(appointments).values({
      ...appointment,
      appointmentDate: new Date(appointment.appointmentDate)
    }).returning();
    return result[0];
  }

  async updateAppointment(id: string, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const updateData = appointmentUpdate.appointmentDate 
      ? { ...appointmentUpdate, appointmentDate: new Date(appointmentUpdate.appointmentDate) }
      : appointmentUpdate;
      
    const result = await db.update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id))
      .returning();
    return result[0];
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id)).returning();
    return result.length > 0;
  }

  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<Appointment[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const result = await db.select()
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, start),
          lt(appointments.appointmentDate, end)
        )
      )
      .orderBy(appointments.appointmentDate);
    return result;
  }

  async searchAppointments(filters: {
    clientName?: string;
    status?: string;
    serviceId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Appointment[]> {
    const { sql: dsql } = await import('drizzle-orm');
    const { like, or } = await import('drizzle-orm');
    
    const conditions = [];
    
    if (filters.clientName) {
      conditions.push(
        or(
          like(appointments.clientName, `%${filters.clientName}%`),
          like(appointments.clientEmail, `%${filters.clientName}%`)
        )
      );
    }
    
    if (filters.status) {
      conditions.push(eq(appointments.status, filters.status));
    }
    
    if (filters.serviceId) {
      conditions.push(eq(appointments.serviceId, filters.serviceId));
    }
    
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      conditions.push(
        and(
          gte(appointments.appointmentDate, start),
          lt(appointments.appointmentDate, end)
        )
      );
    }
    
    const result = await db.select()
      .from(appointments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(appointments.appointmentDate);
    
    return result;
  }

  async updateAppointmentStatus(id: string, status: string): Promise<Appointment | undefined> {
    const result = await db.update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return result[0];
  }

  async bulkUpdateAppointmentStatus(ids: string[], status: string): Promise<Appointment[]> {
    const { inArray } = await import('drizzle-orm');
    const result = await db.update(appointments)
      .set({ status })
      .where(inArray(appointments.id, ids))
      .returning();
    return result;
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
    let appointmentsList: Appointment[] = [];
    
    if (startDate && endDate) {
      appointmentsList = await this.getAppointmentsByDateRange(startDate, endDate);
    } else {
      appointmentsList = await this.getAppointments();
    }
    
    // Basic stats
    const totalAppointments = appointmentsList.length;
    const confirmed = appointmentsList.filter(apt => apt.status === 'confirmed').length;
    const completed = appointmentsList.filter(apt => apt.status === 'completed').length;
    const cancelled = appointmentsList.filter(apt => apt.status === 'cancelled').length;
    const noShows = appointmentsList.filter(apt => apt.status === 'no-show').length;
    
    // Calculate revenue for completed appointments
    let totalRevenue = 0;
    const completedAppointments = appointmentsList.filter(apt => apt.status === 'completed');
    for (const apt of completedAppointments) {
      const service = await this.getService(apt.serviceId);
      if (service) {
        totalRevenue += parseFloat(service.price);
      }
    }
    
    // Popular services
    const serviceCount = new Map<string, { name: string; count: number }>();
    for (const apt of appointmentsList) {
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
    for (const apt of appointmentsList) {
      const hour = new Date(apt.appointmentDate).getHours();
      timeSlotCount.set(hour, (timeSlotCount.get(hour) || 0) + 1);
    }
    
    const popularTimeSlots = Array.from(timeSlotCount.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Client retention (simplified)
    const clientEmails = new Set(appointmentsList.map(apt => apt.clientEmail));
    const clientAppointmentCounts = new Map<string, number>();
    
    for (const apt of appointmentsList) {
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
  
  // Portfolio
  async getPortfolioItems(): Promise<PortfolioItem[]> {
    const result = await db.select().from(portfolioItems).orderBy(desc(portfolioItems.createdAt));
    return result;
  }

  async getPortfolioItem(id: string): Promise<PortfolioItem | undefined> {
    const result = await db.select().from(portfolioItems).where(eq(portfolioItems.id, id)).limit(1);
    return result[0];
  }

  async createPortfolioItem(item: InsertPortfolioItem): Promise<PortfolioItem> {
    const result = await db.insert(portfolioItems).values(item).returning();
    return result[0];
  }

  async updatePortfolioItem(id: string, itemUpdate: Partial<InsertPortfolioItem>): Promise<PortfolioItem | undefined> {
    const result = await db.update(portfolioItems)
      .set(itemUpdate)
      .where(eq(portfolioItems.id, id))
      .returning();
    return result[0];
  }

  async deletePortfolioItem(id: string): Promise<boolean> {
    const result = await db.delete(portfolioItems).where(eq(portfolioItems.id, id)).returning();
    return result.length > 0;
  }
  
  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    const result = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
    return result;
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
    return result[0];
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const result = await db.insert(contactMessages).values(message).returning();
    return result[0];
  }

  async updateContactMessage(id: string, messageUpdate: Partial<InsertContactMessage>): Promise<ContactMessage | undefined> {
    const result = await db.update(contactMessages)
      .set(messageUpdate)
      .where(eq(contactMessages.id, id))
      .returning();
    return result[0];
  }
  
  // Admin Users
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
    return result[0];
  }
  
  async getAdminById(id: string): Promise<AdminUser | undefined> {
    const result = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
    return result[0];
  }
  
  async createAdmin(admin: InsertAdminUser): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const result = await db.insert(adminUsers).values({
      ...admin,
      password: hashedPassword
    }).returning();
    return result[0];
  }

  async updateAdmin(id: string, adminUpdate: Partial<InsertAdminUser>): Promise<AdminUser | undefined> {
    const result = await db.update(adminUsers)
      .set(adminUpdate)
      .where(eq(adminUsers.id, id))
      .returning();
    return result[0];
  }
  
  // Promotional Banners
  async getBanners(): Promise<PromotionalBanner[]> {
    const result = await db.select().from(promotionalBanners).orderBy(desc(promotionalBanners.priority));
    return result;
  }

  async getBanner(id: string): Promise<PromotionalBanner | undefined> {
    const result = await db.select().from(promotionalBanners).where(eq(promotionalBanners.id, id)).limit(1);
    return result[0];
  }

  async createBanner(banner: InsertPromotionalBanner): Promise<PromotionalBanner> {
    const result = await db.insert(promotionalBanners).values(banner).returning();
    return result[0];
  }

  async updateBanner(id: string, bannerUpdate: Partial<InsertPromotionalBanner>): Promise<PromotionalBanner | undefined> {
    const result = await db.update(promotionalBanners)
      .set(bannerUpdate)
      .where(eq(promotionalBanners.id, id))
      .returning();
    return result[0];
  }

  async deleteBanner(id: string): Promise<boolean> {
    const result = await db.delete(promotionalBanners).where(eq(promotionalBanners.id, id)).returning();
    return result.length > 0;
  }
  
  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  }

  async getTestimonial(id: string): Promise<Testimonial | undefined> {
    const result = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const result = await db.insert(testimonials).values(testimonial).returning();
    return result[0];
  }

  async updateTestimonial(id: string, testimonialUpdate: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const result = await db.update(testimonials)
      .set(testimonialUpdate)
      .where(eq(testimonials.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const result = await db.delete(testimonials).where(eq(testimonials.id, id)).returning();
    return result.length > 0;
  }
  
  // Contact Page Management Methods
  
  // Contact FAQs
  async getContactFAQs(): Promise<ContactFAQ[]> {
    return await db.select().from(contactFAQs).orderBy(contactFAQs.order);
  }
  
  async getActiveContactFAQs(): Promise<ContactFAQ[]> {
    return await db.select().from(contactFAQs)
      .where(eq(contactFAQs.active, true))
      .orderBy(contactFAQs.order);
  }
  
  async getContactFAQ(id: string): Promise<ContactFAQ | undefined> {
    const result = await db.select().from(contactFAQs).where(eq(contactFAQs.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createContactFAQ(faq: InsertContactFAQ): Promise<ContactFAQ> {
    const result = await db.insert(contactFAQs).values(faq).returning();
    return result[0];
  }
  
  async updateContactFAQ(id: string, faqUpdate: Partial<InsertContactFAQ>): Promise<ContactFAQ | undefined> {
    const result = await db.update(contactFAQs)
      .set(faqUpdate)
      .where(eq(contactFAQs.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteContactFAQ(id: string): Promise<boolean> {
    const result = await db.delete(contactFAQs).where(eq(contactFAQs.id, id)).returning();
    return result.length > 0;
  }
  
  // Contact Info
  async getContactInfo(): Promise<ContactInfo[]> {
    return await db.select().from(contactInfo);
  }
  
  async getActiveContactInfo(): Promise<ContactInfo | undefined> {
    const result = await db.select().from(contactInfo)
      .where(eq(contactInfo.active, true))
      .limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async getContactInfoById(id: string): Promise<ContactInfo | undefined> {
    const result = await db.select().from(contactInfo).where(eq(contactInfo.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createContactInfo(info: InsertContactInfo): Promise<ContactInfo> {
    const result = await db.insert(contactInfo).values(info).returning();
    return result[0];
  }
  
  async updateContactInfo(id: string, infoUpdate: Partial<InsertContactInfo>): Promise<ContactInfo | undefined> {
    const result = await db.update(contactInfo)
      .set(infoUpdate)
      .where(eq(contactInfo.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteContactInfo(id: string): Promise<boolean> {
    const result = await db.delete(contactInfo).where(eq(contactInfo.id, id)).returning();
    return result.length > 0;
  }
  
  // Social Media Links
  async getSocialMediaLinks(): Promise<SocialMediaLink[]> {
    return await db.select().from(socialMediaLinks).orderBy(socialMediaLinks.order);
  }
  
  async getActiveSocialMediaLinks(): Promise<SocialMediaLink[]> {
    return await db.select().from(socialMediaLinks)
      .where(eq(socialMediaLinks.active, true))
      .orderBy(socialMediaLinks.order);
  }
  
  async getSocialMediaLink(id: string): Promise<SocialMediaLink | undefined> {
    const result = await db.select().from(socialMediaLinks).where(eq(socialMediaLinks.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }
  
  async createSocialMediaLink(link: InsertSocialMediaLink): Promise<SocialMediaLink> {
    const result = await db.insert(socialMediaLinks).values(link).returning();
    return result[0];
  }
  
  async updateSocialMediaLink(id: string, linkUpdate: Partial<InsertSocialMediaLink>): Promise<SocialMediaLink | undefined> {
    const result = await db.update(socialMediaLinks)
      .set(linkUpdate)
      .where(eq(socialMediaLinks.id, id))
      .returning();
    return result.length > 0 ? result[0] : undefined;
  }
  
  async deleteSocialMediaLink(id: string): Promise<boolean> {
    const result = await db.delete(socialMediaLinks).where(eq(socialMediaLinks.id, id)).returning();
    return result.length > 0;
  }
}

// Initialize database with default services and admin if empty
async function initializeDatabase() {
  const existingServices = await db.select().from(services).limit(1);
  
  if (existingServices.length === 0) {
    const defaultServices: InsertService[] = [
      {
        name: 'Bridal Makeup',
        description: 'Complete bridal makeup service including consultation, trial, and wedding day application.',
        duration: 240, // 4 hours
        price: '425',
        category: 'bridal',
        active: true
      },
      {
        name: 'Special Event Makeup',
        description: 'Professional makeup for parties, galas, photoshoots, and other special occasions.',
        duration: 120, // 2 hours
        price: '200',
        category: 'event',
        active: true
      },
      {
        name: 'Everyday Glam',
        description: 'Natural, everyday makeup that enhances your features for work, dates, or daily wear.',
        duration: 60, // 1 hour
        price: '100',
        category: 'everyday',
        active: true
      },
      {
        name: 'Makeup Lesson',
        description: 'Learn professional makeup techniques with personalized one-on-one instruction.',
        duration: 120, // 2 hours
        price: '200',
        category: 'lesson',
        active: true
      },
      {
        name: 'Group Session',
        description: 'Perfect for bridal parties, bachelorette parties, or girls\' nights out.',
        duration: 180, // 3 hours
        price: '125',
        category: 'group',
        active: true
      }
    ];

    for (const service of defaultServices) {
      await db.insert(services).values(service);
    }
    console.log('Database initialized with default services');
  }
  
  // Initialize admin user if none exists
  const existingAdmin = await db.select().from(adminUsers).limit(1);
  if (existingAdmin.length === 0) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.insert(adminUsers).values({
      username: 'admin',
      email: 'admin@beautyportfolio.com',
      password: hashedPassword
    });
    console.log('Default admin user created - Username: admin, Password: admin123');
  }
}

// Run initialization
initializeDatabase().catch(console.error);

export const dbStorage = new DrizzleStorage();