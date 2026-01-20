import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not found", { status: 404 });
  }

  const root = process.cwd();
  const schemaPath = path.join(root, "supabase", "schema.sql");
  const seedPath = path.join(root, "supabase", "seed.sql");

  const [schema, seed] = await Promise.all([
    readFile(schemaPath, "utf8").catch(() => ""),
    readFile(seedPath, "utf8").catch(() => ""),
  ]);

  const body = `-- schema.sql\n\n${schema}\n\n-- seed.sql\n\n${seed}\n`;
  return new NextResponse(body, {
    status: 200,
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
