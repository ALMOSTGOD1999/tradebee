import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { getInvestmentTier, calculateDirectReferralBonus, calculateLevelBonus, calculateSalary, formatCurrency } from "../../lib/store";
import { getDirectReferrals, getDownlineUsers } from "../../lib/server-actions";
import type { User } from "../../lib/store";
import { Button } from "../../components/ui/button";
import { Users, TrendingUp, Wallet, Award, ArrowUpRight, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { user } = useAuth();
  const [directReferrals, setDirectReferrals] = useState<User[]>([]);
  const [downline, setDownline] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [direct, down] = await Promise.all([
        getDirectReferrals({ data: { parentId: user.id } }),
        getDownlineUsers({ data: { parentId: user.id } }),
      ]);
      setDirectReferrals(direct);
      setDownline(down);
      setAllUsers([...direct, ...down]);
    };
    load();
  }, [user]);

  if (!user) return null;

  const investment = Number(user.investment) || 0;
  const tierInfo = getInvestmentTier(user.investmentTier);
  const referralBonus = calculateDirectReferralBonus(investment);
  const levelBonuses = calculateLevelBonus(user.id, allUsers);
  const totalLevelBonus = levelBonuses.reduce((sum, l) => sum + l.bonus, 0);
  const salaryTier = calculateSalary(user.id, allUsers);
  const totalEarnings = referralBonus + totalLevelBonus + (salaryTier?.monthlySalary || 0);

  const stats = [
    { label: "Total Investment", value: formatCurrency(investment), icon: Wallet, color: "gradient-amber", detail: tierInfo ? `${tierInfo.label}` : "No investment yet" },
    { label: "Direct Referrals", value: directReferrals.length.toString(), icon: Users, color: "gradient-blue", detail: `Downline: ${downline.length} members` },
    { label: "Monthly Earnings", value: formatCurrency(totalEarnings), icon: TrendingUp, color: "gradient-green", detail: "All sources combined" },
    { label: "Salary Tier", value: salaryTier ? formatCurrency(salaryTier.monthlySalary) : "--", icon: Award, color: "gradient-purple", detail: salaryTier ? `${formatCurrency(salaryTier.totalBusiness)} business` : "Build your team" },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold">Welcome, {user.name}!</h2>
        <p className="text-muted-foreground mt-1">Here's your account overview</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <Card key={stat.label} className={`animate-fade-in-up stagger-${idx + 1} border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur-sm`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</CardTitle>
              <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="animate-fade-in-left stagger-5 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Referral Bonus (5%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{formatCurrency(referralBonus)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              From {directReferrals.length} direct referral{directReferrals.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-right stagger-6 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              Level Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalLevelBonus)}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Across {levelBonuses.filter((l) => l.bonus > 0).length} active levels
            </p>
          </CardContent>
        </Card>
      </div>

      {investment === 0 && (
        <Card className="animate-fade-in-up stagger-7 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardContent className="pt-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-amber flex items-center justify-center shrink-0">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-amber-800">Start Investing</p>
              <p className="text-sm text-amber-700">Contact your upline or visit the Investment section to get started.</p>
            </div>
            <a href="/dashboard/investment" className="ml-auto">
              <Button size="sm" className="gradient-amber text-white border-0">
                Invest <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
