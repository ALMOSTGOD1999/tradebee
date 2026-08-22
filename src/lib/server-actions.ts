import { createServerFn } from "@tanstack/react-start";
import { db } from "../db";
import { users, payouts } from "../db/schema";
import { eq, and, or, sql } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateUserId(): string {
  const digits = Math.floor(100000 + Math.random() * 900000).toString();
  return `TB${digits}`;
}

function generatePayoutId(): string {
  const hex = randomBytes(6).toString("hex");
  return `PO${hex}`;
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return password === stored;
  const verify = createHash("sha256")
    .update(salt + password)
    .digest("hex");
  return verify === hash;
}

const INVESTMENT_TIERS = [
  { tier: "10k-1l", min: 10000, max: 100000 },
  { tier: "1.01l-2.5l", min: 101000, max: 250000 },
  { tier: "2.51l-10l", min: 251000, max: 1000000 },
  { tier: "10l-25l", min: 1000000, max: 2500000 },
];

const LEVEL_REQUIREMENTS = [
  { level: 1, percentage: 2.0 },
  { level: 2, percentage: 1.0 },
  { level: 3, percentage: 1.0 },
  { level: 4, percentage: 1.0 },
  { level: 5, percentage: 0.75 },
  { level: 6, percentage: 0.5 },
  { level: 7, percentage: 0.25 },
  { level: 8, percentage: 0.25 },
  { level: 9, percentage: 0.25 },
  { level: 10, percentage: 0.25 },
  { level: 11, percentage: 0.2 },
  { level: 12, percentage: 0.2 },
  { level: 13, percentage: 0.2 },
  { level: 14, percentage: 0.2 },
  { level: 15, percentage: 0.2 },
  { level: 16, percentage: 0.15 },
  { level: 17, percentage: 0.15 },
  { level: 18, percentage: 0.15 },
  { level: 19, percentage: 0.15 },
  { level: 20, percentage: 0.15 },
  { level: 21, percentage: 0.15 },
];

const SALARY_TIERS = [
  { totalBusiness: 500000, monthlySalary: 3000, totalSalary: 36000 },
  { totalBusiness: 1000000, monthlySalary: 5000, totalSalary: 60000 },
  { totalBusiness: 1500000, monthlySalary: 10000, totalSalary: 120000 },
  { totalBusiness: 2500000, monthlySalary: 15000, totalSalary: 180000 },
  { totalBusiness: 5000000, monthlySalary: 20000, totalSalary: 240000 },
  { totalBusiness: 7500000, monthlySalary: 40000, totalSalary: 480000 },
  { totalBusiness: 10000000, monthlySalary: 50000, totalSalary: 600000 },
  { totalBusiness: 15000000, monthlySalary: 100000, totalSalary: 1200000 },
  { totalBusiness: 20000000, monthlySalary: 200000, totalSalary: 2400000 },
];

// ─── Database Initialization ────────────────────────────────────────────────

export const initializeDB = createServerFn({ method: "POST" }).handler(
  async () => {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.id, "TB000001"));
    if (existing.length === 0) {
      await db.insert(users).values({
        id: "TB000001",
        parentId: null,
        name: "Admin",
        email: "admin@tradebee.in",
        phone: "0000000000",
        password: hashPassword("Tradebee@202610"),
        role: "admin",
      });
    }
  }
);

// ─── Authentication ─────────────────────────────────────────────────────────

export const loginUser = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    // Auto-seed admin if no users exist
    const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
    if (userCount[0]?.count === 0) {
      await db.insert(users).values({
        id: "TB000001",
        parentId: null,
        name: "Admin",
        email: "admin@tradebee.in",
        phone: "0000000000",
        password: hashPassword("Tradebee@202610"),
        role: "admin",
      });
    }

    const result = await db
      .select()
      .from(users)
      .where(or(eq(users.email, data.email), eq(users.id, data.email)));
    const user = result[0];
    if (!user) {
      return { success: false, message: "Invalid email/ID or password" };
    }
    if (!verifyPassword(data.password, user.password)) {
      return { success: false, message: "Invalid email/ID or password" };
    }
    if (!user.isActive) {
      return { success: false, message: "Account has been deactivated" };
    }
    return { success: true, user, message: "Login successful" };
  });

export const signupUser = createServerFn({ method: "POST" })
  .validator(
    (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
      parentId: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));
    if (existing.length > 0) {
      return { success: false, message: "Email already registered" };
    }

    const parentResult = await db
      .select()
      .from(users)
      .where(eq(users.id, data.parentId));
    if (parentResult.length === 0) {
      return { success: false, message: "Invalid referral ID" };
    }

    let id = generateUserId();
    let idExists = true;
    while (idExists) {
      const check = await db.select().from(users).where(eq(users.id, id));
      idExists = check.length > 0;
      if (idExists) id = generateUserId();
    }

    const newUser = {
      id,
      parentId: data.parentId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashPassword(data.password),
      role: "user" as const,
    };

    await db.insert(users).values(newUser);
    return {
      success: true,
      user: { ...newUser, password: "" },
      message: "Account created successfully",
    };
  });

// ─── Admin: User Management ─────────────────────────────────────────────────

export const adminCreateUser = createServerFn({ method: "POST" })
  .validator(
    (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
      parentId: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email));
    if (existing.length > 0) {
      return { success: false, message: "Email already registered" };
    }

    const parentResult = await db
      .select()
      .from(users)
      .where(eq(users.id, data.parentId));
    if (parentResult.length === 0) {
      return { success: false, message: "Parent ID not found" };
    }

    let id = generateUserId();
    let idExists = true;
    while (idExists) {
      const check = await db.select().from(users).where(eq(users.id, id));
      idExists = check.length > 0;
      if (idExists) id = generateUserId();
    }

    const newUser = {
      id,
      parentId: data.parentId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: hashPassword(data.password),
      role: "user" as const,
    };

    await db.insert(users).values(newUser);
    return {
      success: true,
      user: { ...newUser, password: "" },
      message: "User created successfully",
    };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId));
    const [found] = user;
    if (!found) {
      return { success: false, message: "User not found" };
    }
    if (found.role === "admin") {
      return { success: false, message: "Cannot delete admin user" };
    }

    const children = await db
      .select()
      .from(users)
      .where(eq(users.parentId, data.userId));
    if (children.length > 0) {
      return {
        success: false,
        message: "Cannot delete user with active referrals",
      };
    }

    await db.delete(users).where(eq(users.id, data.userId));
    return { success: true, message: "User deleted successfully" };
  });

export const adminToggleUserActive = createServerFn({ method: "POST" })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId));
    const [found] = user;
    if (!found) {
      return { success: false, message: "User not found" };
    }
    if (found.role === "admin") {
      return { success: false, message: "Cannot deactivate admin" };
    }

    await db
      .update(users)
      .set({ isActive: !found.isActive })
      .where(eq(users.id, data.userId));

    return {
      success: true,
      message: found.isActive ? "User deactivated" : "User activated",
    };
  });

// ─── User Queries ───────────────────────────────────────────────────────────

export const getUser = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const result = await db.select().from(users).where(eq(users.id, data.id));
    return result[0] || null;
  });

export const getAllUsers = createServerFn({ method: "GET" }).handler(
  async () => {
    return await db.select().from(users);
  }
);

export const getDirectReferrals = createServerFn({ method: "GET" })
  .validator((data: { parentId: string }) => data)
  .handler(async ({ data }) => {
    return await db
      .select()
      .from(users)
      .where(eq(users.parentId, data.parentId));
  });

export const getDownlineUsers = createServerFn({ method: "GET" })
  .validator((data: { parentId: string }) => data)
  .handler(async ({ data }) => {
    const allUsers = await db.select().from(users);
    const result: typeof allUsers = [];
    const queue: { id: string; depth: number }[] = [
      { id: data.parentId, depth: 0 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.depth > 0) {
        const user = allUsers.find((u) => u.id === current.id);
        if (user) result.push(user);
      }
      if (current.depth < 21) {
        const children = allUsers.filter((u) => u.parentId === current.id);
        for (const child of children) {
          queue.push({ id: child.id, depth: current.depth + 1 });
        }
      }
    }

    return result;
  });

export const getUserCount = createServerFn({ method: "GET" }).handler(
  async () => {
    const result = await db.select({ count: sql<number>`count(*)` }).from(users);
    return result[0]?.count || 0;
  }
);

export const searchUsers = createServerFn({ method: "GET" })
  .validator((data: { query: string }) => data)
  .handler(async ({ data }) => {
    const allUsers = await db.select().from(users);
    const q = data.query.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
    );
  });

// ─── User Profile Updates ───────────────────────────────────────────────────

export const updateUserProfile = createServerFn({ method: "POST" })
  .validator(
    (data: { userId: string; name?: string; phone?: string }) => data
  )
  .handler(async ({ data }) => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId));
    const [found] = user;
    if (!found) {
      return { success: false, message: "User not found" };
    }

    const updates: Record<string, string> = {};
    if (data.name !== undefined) updates["name"] = data.name;
    if (data.phone !== undefined) updates["phone"] = data.phone;

    if (Object.keys(updates).length === 0) {
      return { success: false, message: "No fields to update" };
    }

    await db.update(users).set(updates).where(eq(users.id, data.userId));
    return { success: true, message: "Profile updated successfully" };
  });

export const changePassword = createServerFn({ method: "POST" })
  .validator(
    (data: { userId: string; currentPassword: string; newPassword: string }) =>
      data
  )
  .handler(async ({ data }) => {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId));
    const [found] = user;
    if (!found) {
      return { success: false, message: "User not found" };
    }

    if (!verifyPassword(data.currentPassword, found.password)) {
      return { success: false, message: "Current password is incorrect" };
    }

    if (data.newPassword.length < 6) {
      return {
        success: false,
        message: "New password must be at least 6 characters",
      };
    }

    await db
      .update(users)
      .set({ password: hashPassword(data.newPassword) })
      .where(eq(users.id, data.userId));

    return { success: true, message: "Password changed successfully" };
  });

// ─── Investment ─────────────────────────────────────────────────────────────

export const updateUserInvestment = createServerFn({ method: "POST" })
  .validator((data: { userId: string; amount: number }) => data)
  .handler(async ({ data }) => {
    const tier = INVESTMENT_TIERS.find(
      (t) => data.amount >= t.min && data.amount <= t.max
    );
    if (!tier) {
      return {
        success: false,
        message: "Amount does not match any investment tier",
      };
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, data.userId));
    const [found] = user;
    if (!found) {
      return { success: false, message: "User not found" };
    }

    await db
      .update(users)
      .set({
        investment: data.amount.toString(),
        investmentDate: new Date(),
        investmentTier: tier.tier,
      })
      .where(eq(users.id, data.userId));

    const parentId = found.parentId;
    if (parentId) {
      const refBonus = data.amount * 0.05;
      const payoutId = generatePayoutId();
      await db.insert(payouts).values({
        id: payoutId,
        userId: parentId,
        type: "direct_referral",
        amount: refBonus.toString(),
        referenceId: data.userId,
      });
    }

    return { success: true, message: "Investment updated successfully" };
  });

// ─── Payouts ────────────────────────────────────────────────────────────────

export const getUserPayouts = createServerFn({ method: "GET" })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    return await db
      .select()
      .from(payouts)
      .where(eq(payouts.userId, data.userId));
  });

export const getPayoutSummary = createServerFn({ method: "GET" })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const userPayouts = await db
      .select()
      .from(payouts)
      .where(eq(payouts.userId, data.userId));

    const directReferral = userPayouts
      .filter((p) => p.type === "direct_referral")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const levelBonus = userPayouts
      .filter((p) => p.type === "level_bonus")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const salary = userPayouts
      .filter((p) => p.type === "salary")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      total: directReferral + levelBonus + salary,
      directReferral,
      levelBonus,
      salary,
      count: userPayouts.length,
    };
  });

// ─── Statistics (Admin) ─────────────────────────────────────────────────────

export const getAdminStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;
    const totalInvestment = allUsers.reduce(
      (sum, u) => sum + (Number(u.investment) || 0),
      0
    );
    const activeInvestors = allUsers.filter(
      (u) => (Number(u.investment) || 0) > 0
    ).length;

    const allPayouts = await db.select().from(payouts);
    const totalPayouts = allPayouts.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    return {
      totalUsers,
      totalInvestment,
      activeInvestors,
      totalPayouts,
      pendingPayouts: 0,
    };
  }
);

interface GenealogyNode {
  id: string;
  name: string;
  investment: number;
  tier: string | null;
  depth: number;
  children: GenealogyNode[];
}

export const getGenealogyTree = createServerFn({ method: "GET" })
  .validator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const allUsers = await db.select().from(users);

    function buildNode(userId: string, depth: number): GenealogyNode | null {
      const user = allUsers.find((u) => u.id === userId);
      if (!user) return null;
      const children = allUsers
        .filter((u) => u.parentId === userId)
        .map((c) => buildNode(c.id, depth + 1))
        .filter((n): n is GenealogyNode => n !== null);
      return {
        id: user.id,
        name: user.name,
        investment: Number(user.investment) || 0,
        tier: user.investmentTier,
        depth,
        children,
      };
    }

    return buildNode(data.userId, 0);
  });
