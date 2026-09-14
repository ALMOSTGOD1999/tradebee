import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(import.meta.dirname, "..", ".env") });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env["DATABASE_URL"]!);

console.log("Running migration: add activation fields...");

await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activation_package" varchar(10)`;
console.log("  Added activation_package");

await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "payment_proof" text`;
console.log("  Added payment_proof");

await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "activation_status" varchar(10)`;
console.log("  Added activation_status");

// Verify
const result = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name LIKE '%activation%' OR column_name = 'payment_proof'`;
console.log("\nNew columns:", result);

// done
