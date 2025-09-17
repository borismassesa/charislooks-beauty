import { drizzle } from 'drizzle-orm/node-postgres';
import { eq, desc, and, gte, lt } from 'drizzle-orm';
import pg from 'pg';
import { 
  services,
  appointments,
  portfolioItems,
  contactMessages,
  adminUsers,
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
import { IStorage } from './storage';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

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