import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:T0ZO7jkk6cZonwkNhlJLeDPk@portfolia-data-gone-jade-pooler.ovh2.cloud.layerbase.dev/portfolia_data?sslmode=require';

// Create a singleton pool for Next.js
declare global {
  var _pgPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === 'production') {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
} else {
  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  pool = global._pgPool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

export default pool;
