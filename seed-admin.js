import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import ws from 'ws';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createAdmin() {
  try {
    // Check if admin exists
    const check = await pool.query("SELECT * FROM admin_users WHERE username = 'admin' LIMIT 1");
    
    if (check.rows.length > 0) {
      console.log('✓ Admin user already exists!');
      console.log('Username:', check.rows[0].username);
      console.log('\nYou can login at: https://charislooks-production.up.railway.app/admin');
      console.log('Username: admin');
      console.log('Password: admin123');
      await pool.end();
      return;
    }
    
    // Create admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO admin_users (username, email, password) 
       VALUES ($1, $2, $3)`,
      ['admin', 'admin@charislooks.com', hashedPassword]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('\n🔐 Login Details:');
    console.log('URL: https://charislooks-production.up.railway.app/admin');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change this password immediately after first login!');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();

