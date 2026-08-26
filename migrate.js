import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS ifsc_code text");
  await sql.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_no text");
  await sql.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_no text");
  await sql.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS branch_name text");
  console.log("Done! All 4 columns added.");
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
