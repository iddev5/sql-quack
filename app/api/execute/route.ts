import type { NextRequest } from 'next/server'
import Database from "better-sqlite3";

async function executeSqlite(query: string) {
  const db = new Database(":memory:");

  try {
    db.pragma("trusted_schema = OFF");

    db.exec(query);
    const stmt = db.prepare('select * from users');
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
  const { sql, query } = body as { sql: string; query: string };

  const result = await executeSqlite(query);

  return Response.json(result)
}
