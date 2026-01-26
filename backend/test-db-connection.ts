import { query } from './src/config/database';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await query('SELECT NOW() as current_time');
    console.log('✓ Database connection successful');
    console.log('Current time:', result.rows[0].current_time);
    
    // Check if users table exists
    try {
      const usersCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        )
      `);
      console.log('✓ Users table exists:', usersCheck.rows[0].exists);
    } catch (error: any) {
      console.error('✗ Error checking users table:', error.message);
    }
    
    // Check if agents table exists
    try {
      const agentsCheck = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'agents'
        )
      `);
      console.log('✓ Agents table exists:', agentsCheck.rows[0].exists);
      
      if (agentsCheck.rows[0].exists) {
        const agentCount = await query('SELECT COUNT(*) as count FROM agents');
        console.log('✓ Agent count:', agentCount.rows[0].count);
      }
    } catch (error: any) {
      console.error('✗ Error checking agents table:', error.message);
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('✗ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error);
    process.exit(1);
  }
}

testConnection();
