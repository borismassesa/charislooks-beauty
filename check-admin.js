import { Pool, neonConfig } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import ws from 'ws';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkAdmin() {
  try {
    // Get admin user
    const result = await pool.query("SELECT * FROM admin_users WHERE username = 'admin'");
    
    if (result.rows.length === 0) {
      console.log('❌ No admin user found!');
      console.log('Creating admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        `INSERT INTO admin_users (username, email, password) 
         VALUES ($1, $2, $3)`,
        ['admin', 'admin@charislooks.com', hashedPassword]
      );
      
      console.log('✅ Admin user created!');
    } else {
      console.log('✓ Admin user found:');
      console.log('  ID:', result.rows[0].id);
      console.log('  Username:', result.rows[0].username);
      console.log('  Email:', result.rows[0].email);
      console.log('  Password hash starts with:', result.rows[0].password.substring(0, 20) + '...');
      
      // Test password
      const isValid = await bcrypt.compare('admin123', result.rows[0].password);
      console.log('\n🔐 Password test:');
      console.log('  Testing "admin123":', isValid ? '✅ VALID' : '❌ INVALID');
      
      if (!isValid) {
        console.log('\n⚠️  Password mismatch! Resetting password...');
        const newHash = await bcrypt.hash('admin123', 10);
        await pool.query(
          `UPDATE admin_users SET password = $1 WHERE username = 'admin'`,
          [newHash]
        );
        console.log('✅ Password reset to: admin123');
      }
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

checkAdmin();

