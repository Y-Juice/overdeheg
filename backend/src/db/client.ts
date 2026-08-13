import { Pool } from "pg";

/**
 * Gedeelde PostgreSQL connection pool voor de hele backend.
 * Services krijgen deze pool via constructor injectie,
 * zodat er nergens losse connecties worden geopend.
 */
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/**
 * Controleert of de database bereikbaar is met een simpele query.
 * Wordt gebruikt door het health-endpoint.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
