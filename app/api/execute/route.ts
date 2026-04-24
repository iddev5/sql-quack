import type { NextRequest } from 'next/server'
import Database from "better-sqlite3";

async function executeSqlite(schema: string, query: string) {
  const db = new Database(":memory:");

  try {
    if (schema.length > 50_000)
      throw new Error("Schema too large (max 50,000 characters)");

    if (query.length > 5_000)
      throw new Error("Query too large (max 5,000 characters)");

    db.pragma("trusted_schema = OFF");
    db.pragma("foreign_keys = ON");
    db.loadExtension = null;

    const runSchema = db.transaction(() =>
      db.exec(schema)
    );

    runSchema();

    const stmt = db.prepare(query);
    const rows = stmt.all().slice(0, 500);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      columns,
      rows,
    }
  } catch (err) {
    return {
      columns: [],
      rows: [],
      error: err.message
    };
  } finally {
    db.close();
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { sql, schema, query } = body as { sql: string; query: string };

  const result = await executeSqlite(schema, query);

  return Response.json(result)
}
