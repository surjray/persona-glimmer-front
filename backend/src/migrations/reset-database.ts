import { query } from '../config/database';

async function resetDatabase() {
  console.log('⚠️  WARNING: This will drop ALL existing tables!');
  console.log('Resetting database...\n');

  try {
    // Drop all tables in the correct order (respecting foreign keys)
    const dropTables = [
      'DROP TABLE IF EXISTS post_topic_survey_responses CASCADE;',
      'DROP TABLE IF EXISTS ai_literacy_survey_responses CASCADE;',
      'DROP TABLE IF EXISTS user_topic_interactions CASCADE;',
      'DROP TABLE IF EXISTS messages CASCADE;',
      'DROP TABLE IF EXISTS topics CASCADE;',
      'DROP TABLE IF EXISTS agents CASCADE;',
      'DROP TABLE IF EXISTS users CASCADE;',
      'DROP TABLE IF EXISTS global_guardrails CASCADE;',
      // Drop any other existing tables
      'DROP TABLE IF EXISTS character_interaction_surveys CASCADE;',
      'DROP TABLE IF EXISTS character_messages CASCADE;',
      'DROP TABLE IF EXISTS characters CASCADE;',
      'DROP TABLE IF EXISTS chat_history CASCADE;',
      'DROP TABLE IF EXISTS conversations CASCADE;',
      'DROP TABLE IF EXISTS participant_characters CASCADE;',
      'DROP TABLE IF EXISTS participants CASCADE;',
      'DROP TABLE IF EXISTS password_reset_tokens CASCADE;',
      'DROP TABLE IF EXISTS user_character_interactions CASCADE;',
      'DROP TABLE IF EXISTS user_characters CASCADE;',
      'DROP TABLE IF EXISTS user_signup_surveys CASCADE;',
    ];

    for (const dropSql of dropTables) {
      try {
        await query(dropSql);
      } catch (error: any) {
        // Ignore errors for tables that don't exist
        if (error.code !== '42P01') {
          console.error(`Error dropping table: ${error.message}`);
        }
      }
    }

    // Drop the update function if it exists
    await query('DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;');

    console.log('✓ Database reset complete\n');
    console.log('Now run: npm run migrate');
    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
