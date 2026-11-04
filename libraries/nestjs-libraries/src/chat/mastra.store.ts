import { PostgresStore } from '@mastra/pg';

export const pStore = new PostgresStore({
  id: 'tl_smp-store',
  connectionString: process.env.DATABASE_URL!,
});
