// Script to create admin user manually
import { db } from './server/db.js';
import { adminUsers } from './shared/schema.js';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  try {
    console.log('Checking for existing admin user...');
    
    // Check if admin already exists
    const existingAdmin = await db.select().from(adminUsers).limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('✓ Admin user already exists');
      console.log('Username:', existingAdmin[0].username);
      console.log('Email:', existingAdmin[0].email);
      process.exit(0);
    }
    
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await db.insert(adminUsers).values({
      username: 'admin',
      email: 'admin@charislooks.com',
      password: hashedPassword
    }).returning();
    
    console.log('✓ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('\nYou can now login at: https://charislooks-production.up.railway.app/admin');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

