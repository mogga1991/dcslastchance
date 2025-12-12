import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const sql = neon(process.env.DATABASE_URL);

// Helper function to execute queries with error handling
export async function query<T = any>(
  queryText: string,
  params?: any[]
): Promise<T[]> {
  try {
    return await sql(queryText, params);
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

// Transaction helper
export async function transaction<T>(
  callback: (sql: typeof neon) => Promise<T>
): Promise<T> {
  try {
    return await callback(sql as any);
  } catch (error) {
    console.error("Transaction error:", error);
    throw error;
  }
}

// Generic CRUD helpers with proper parameter placeholders
export async function insert<T = any>(
  table: string,
  data: Record<string, any>
): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const columns = keys.map(k => `"${k}"`).join(', ');

  const sqlQuery = `
    INSERT INTO "${table}" (${columns})
    VALUES (${placeholders})
    RETURNING *
  `;

  const result = await query<T>(sqlQuery, values);
  return result[0];
}

export async function update<T = any>(
  table: string,
  id: string,
  data: Record<string, any>
): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');

  const sqlQuery = `
    UPDATE "${table}"
    SET ${setClause}
    WHERE "id" = $${keys.length + 1}
    RETURNING *
  `;

  const result = await query<T>(sqlQuery, [...values, id]);
  return result[0];
}

export async function remove<T = any>(
  table: string,
  id: string
): Promise<T> {
  const sqlQuery = `
    DELETE FROM "${table}"
    WHERE "id" = $1
    RETURNING *
  `;

  const result = await query<T>(sqlQuery, [id]);
  return result[0];
}
