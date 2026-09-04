import { neon } from "@neondatabase/serverless";

const sql = neon(process.env["DATABASE_URL"]!);

// The 5 test IDs to delete
const testIds = ["TB626271", "TB428996", "TB704139", "TB918070", "TB530688"];

console.log("Deleting test users: test1, test2, test3, test4, test5");
for (const id of testIds) {
  await sql`DELETE FROM users WHERE id = ${id}`;
  console.log(`  Deleted: ${id}`);
}
console.log("\nDone! Deleted 5 test accounts.");

// Verify
const remaining = await sql`SELECT id, name, email FROM users`;
console.log(`\nRemaining users (${remaining.length}):`);
console.log(JSON.stringify(remaining, null, 2));
