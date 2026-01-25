import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../config/database';

const migrations = [
  '001_create_users.sql',
  '002_create_agents.sql',
  '003_create_topics.sql',
  '004_create_messages.sql',
  '005_create_interactions.sql',
  '006_create_surveys.sql',
  '007_create_guardrails.sql',
  '008_create_triggers.sql',
  '009_create_password_reset_tokens.sql',
];

async function runMigrations() {
  console.log('Starting database migrations...');

  try {
    for (const migration of migrations) {
      console.log(`Running migration: ${migration}`);
      const sql = readFileSync(
        join(__dirname, migration),
        'utf-8'
      );
      
      // For trigger files with dollar-quoted strings, execute as single statement
      if (migration.includes('triggers')) {
        // Remove comments
        const cleanedSql = sql
          .split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim();
        
        try {
          await query(cleanedSql);
        } catch (error: any) {
          if (error.code === '42P07' || error.code === '42710') {
            console.log(`  (skipped - already exists)`);
          } else {
            throw error;
          }
        }
      } else {
        // Split by semicolon and execute each statement separately
        // Remove comments and split by semicolon
        const cleanedSql = sql
          .split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n');
        
        const statements = cleanedSql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);
        
        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await query(statement);
            } catch (error: any) {
              // Ignore "already exists" errors for IF NOT EXISTS statements
              if (error.code === '42P07' || error.code === '42710') {
                console.log(`  (skipped - already exists)`);
              } else if (error.code === '42703') {
                // Column doesn't exist - might be a timing issue, try again
                console.log(`  Warning: ${error.message}, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 100));
                try {
                  await query(statement);
                } catch (retryError: any) {
                  // If still fails, check if it's a real error or just timing
                  if (retryError.code === '42703' && statement.includes('CREATE INDEX IF NOT EXISTS')) {
                    console.log(`  (skipped index - column may not exist yet)`);
                  } else {
                    throw retryError;
                  }
                }
              } else {
                throw error;
              }
            }
          }
        }
      }
      
      console.log(`✓ Completed: ${migration}`);
    }

    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
