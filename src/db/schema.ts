import {
  pgTable,
  varchar,
  text,
  numeric,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id", { length: 8 }).primaryKey(),
  parentId: varchar("parent_id", { length: 8 }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  role: varchar("role", { length: 10 }).notNull().default("user"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  investment: numeric("investment", { precision: 15, scale: 2 })
    .notNull()
    .default("0"),
  investmentDate: timestamp("investment_date"),
  investmentTier: varchar("investment_tier", { length: 10 }),
  isActive: boolean("is_active").notNull().default(true),
  ifscCode: text("ifsc_code"),
  accountNo: text("account_no"),
  panNo: text("pan_no"),
  branchName: text("branch_name"),
  // Activation package fields
  activationPackage: varchar("activation_package", { length: 10 }), // "5000" or "10000" or null (free/admin-activated)
  paymentProof: text("payment_proof"), // base64 or URL of payment screenshot
  activationStatus: varchar("activation_status", { length: 10 }), // "pending", "approved", "rejected" or null (admin-activated)
  // Balance field for bonuses/income
  balance: numeric("balance", { precision: 15, scale: 2 }).notNull().default("0"),
});

export const payouts = pgTable("payouts", {
  id: varchar("id", { length: 16 }).primaryKey(),
  userId: varchar("user_id", { length: 8 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  referenceId: varchar("reference_id", { length: 8 }),
  level: numeric("level", { precision: 2, scale: 0 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  month: varchar("month", { length: 7 }),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Payout = typeof payouts.$inferSelect;
export type NewPayout = typeof payouts.$inferInsert;
