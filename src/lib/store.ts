export type UserRole = "admin" | "user";

export interface User {
  id: string;
  parentId: string | null;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  createdAt: Date | string;
  investment: string | number;
  investmentDate: Date | string | null;
  investmentTier: string | null;
  isActive: boolean;
}

export type InvestmentTier =
  | "10k-1l"
  | "1.01l-2.5l"
  | "2.51l-10l"
  | "10l-25l";

export interface InvestmentTierInfo {
  tier: InvestmentTier;
  label: string;
  min: number;
  max: number;
  capitalReturn: number;
  roi: number;
  totalIncome: number;
  totalReturnPct: number;
}

export const INVESTMENT_TIERS: InvestmentTierInfo[] = [
  { tier: "10k-1l", label: "₹10,000 - ₹1,00,000", min: 10000, max: 100000, capitalReturn: 5, roi: 5, totalIncome: 10, totalReturnPct: 200 },
  { tier: "1.01l-2.5l", label: "₹1,01,000 - ₹2,50,000", min: 101000, max: 250000, capitalReturn: 5, roi: 6, totalIncome: 11, totalReturnPct: 220 },
  { tier: "2.51l-10l", label: "₹2,51,000 - ₹10,00,000", min: 251000, max: 1000000, capitalReturn: 5, roi: 7, totalIncome: 12, totalReturnPct: 240 },
  { tier: "10l-25l", label: "₹10,00,000 - ₹25,00,000", min: 1000000, max: 2500000, capitalReturn: 5, roi: 8, totalIncome: 13, totalReturnPct: 260 },
];

export const LEVEL_REQUIREMENTS = [
  { level: 1, percentage: 2.0, directReferrals: 1 },
  { level: 2, percentage: 1.0, directReferrals: 1 },
  { level: 3, percentage: 1.0, directReferrals: 2 },
  { level: 4, percentage: 1.0, directReferrals: 3 },
  { level: 5, percentage: 0.75, directReferrals: 3 },
  { level: 6, percentage: 0.5, directReferrals: 3 },
  { level: 7, percentage: 0.25, directReferrals: 4 },
  { level: 8, percentage: 0.25, directReferrals: 4 },
  { level: 9, percentage: 0.25, directReferrals: 4 },
  { level: 10, percentage: 0.25, directReferrals: 4 },
  { level: 11, percentage: 0.2, directReferrals: 5 },
  { level: 12, percentage: 0.2, directReferrals: 5 },
  { level: 13, percentage: 0.2, directReferrals: 5 },
  { level: 14, percentage: 0.2, directReferrals: 5 },
  { level: 15, percentage: 0.2, directReferrals: 5 },
  { level: 16, percentage: 0.15, directReferrals: 6 },
  { level: 17, percentage: 0.15, directReferrals: 6 },
  { level: 18, percentage: 0.15, directReferrals: 6 },
  { level: 19, percentage: 0.15, directReferrals: 6 },
  { level: 20, percentage: 0.15, directReferrals: 6 },
  { level: 21, percentage: 0.15, directReferrals: 6 },
];

export interface SalaryTier {
  totalBusiness: number;
  powerSide: number;
  weakerSide: number;
  monthlySalary: number;
  totalSalary: number;
}

export const SALARY_TIERS: SalaryTier[] = [
  { totalBusiness: 500000, powerSide: 300000, weakerSide: 200000, monthlySalary: 3000, totalSalary: 36000 },
  { totalBusiness: 1000000, powerSide: 600000, weakerSide: 400000, monthlySalary: 5000, totalSalary: 60000 },
  { totalBusiness: 1500000, powerSide: 900000, weakerSide: 600000, monthlySalary: 10000, totalSalary: 120000 },
  { totalBusiness: 2500000, powerSide: 1500000, weakerSide: 1000000, monthlySalary: 15000, totalSalary: 180000 },
  { totalBusiness: 5000000, powerSide: 3000000, weakerSide: 2000000, monthlySalary: 20000, totalSalary: 240000 },
  { totalBusiness: 7500000, powerSide: 4500000, weakerSide: 3000000, monthlySalary: 40000, totalSalary: 480000 },
  { totalBusiness: 10000000, powerSide: 6000000, weakerSide: 4000000, monthlySalary: 50000, totalSalary: 600000 },
  { totalBusiness: 15000000, powerSide: 9000000, weakerSide: 6000000, monthlySalary: 100000, totalSalary: 1200000 },
  { totalBusiness: 20000000, powerSide: 12000000, weakerSide: 8000000, monthlySalary: 200000, totalSalary: 2400000 },
];

export function getInvestmentTier(tier: string | null): InvestmentTierInfo | undefined {
  return INVESTMENT_TIERS.find((t) => t.tier === tier);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function calculateDirectReferralBonus(userInvestment: number): number {
  return userInvestment * 0.05;
}

export function calculateLevelBonus(
  userId: string,
  allUsers: User[]
): { level: number; bonus: number }[] {
  const results: { level: number; bonus: number }[] = [];
  let currentLevelUsers = allUsers.filter((u) => u.parentId === userId);

  for (let level = 1; level <= 21; level++) {
    const req = LEVEL_REQUIREMENTS[level - 1]!;
    if (currentLevelUsers.length === 0) break;

    let levelBonus = 0;
    for (const user of currentLevelUsers) {
      const inv = Number(user.investment) || 0;
      levelBonus += inv * (req.percentage / 100);
    }
    results.push({ level, bonus: levelBonus });

    const nextLevelUsers: User[] = [];
    for (const user of currentLevelUsers) {
      const children = allUsers.filter((u) => u.parentId === user.id);
      nextLevelUsers.push(...children);
    }
    currentLevelUsers = nextLevelUsers;
  }
  return results;
}

export function calculateSalary(
  userId: string,
  allUsers: User[]
): SalaryTier | null {
  const downline: User[] = [];
  const queue: string[] = [userId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const children = allUsers.filter((u) => u.parentId === current);
    downline.push(...children);
    queue.push(...children.map((c) => c.id));
  }

  const totalBusiness = downline.reduce(
    (sum, u) => sum + (Number(u.investment) || 0),
    0
  );

  let applicableTier: SalaryTier | null = null;
  for (const tier of SALARY_TIERS) {
    if (totalBusiness >= tier.totalBusiness) {
      applicableTier = tier;
    }
  }
  return applicableTier;
}
