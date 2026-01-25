import { seedAgents } from './agents.seed';
import { seedTopics } from './topics.seed';
import { seedGuardrails } from './guardrails.seed';

async function runSeeds() {
  console.log('Starting database seeding...');

  try {
    await seedAgents();
    await seedTopics();
    await seedGuardrails();

    console.log('All seeds completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds();
