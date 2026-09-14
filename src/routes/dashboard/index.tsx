import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { getInvestmentTier, calculateDirectReferralBonus, calculateLevelBonus, calculateSalary, formatCurrency } from "../../lib/store";
import { getDirectReferrals, getDownlineUsers } from "../../lib/server-actions";
import type { User } from "../../lib/store";
import { Button } from "../../components/ui/button";
import { Users, TrendingUp, Wallet, Award, ArrowUpRight, ChevronRight, Zap, Star, ArrowRight } from "lucide-react";

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
    {
      label: "Total Investment",
      value: formatCurrency(investment),
      icon: Wallet,
      gradient: "from-amber-400 to-orange-500",
      shadowColor: "shadow-amber-500/20",
      bgLight: "bg-amber-50",
      textColor: "text-amber-600",
      detail: tierInfo ? tierInfo.label : "No investment yet",
      trend: investment > 0 ? "+12%" : null,
    },
    {
      label: "Direct Referrals",
      value: directReferrals.length.toString(),
      icon: Users,
      gradient: "from-blue-400 to-indigo-500",
      shadowColor: "shadow-blue-500/20",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      detail: "Downline: " + downline.length + " members",
      trend: null,
    },
    {
      label: "Monthly Earnings",
      value: formatCurrency(totalEarnings),
      icon: TrendingUp,
      gradient: "from-emerald-400 to-green-500",
      shadowColor: "shadow-green-500/20",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
      detail: "All sources combined",
      trend: totalEarnings > 0 ? "+" + formatCurrency(totalEarnings) : null,
    },
    {
      label: "Total Team",
      value: (directReferrals.length + downline.length).toString(),
      icon: Users,
      gradient: "from-teal-400 to-cyan-500",
      shadowColor: "shadow-teal-500/20",
      bgLight: "bg-teal-50",
      textColor: "text-teal-600",
      detail: directReferrals.length + " direct, " + downline.length + " downline",
      trend: null,
    },
    {
      label: "Salary Tier",
      value: salaryTier ? formatCurrency(salaryTier.monthlySalary) : "--",
      icon: Award,
      gradient: "from-purple-400 to-violet-500",
      shadowColor: "shadow-purple-500/20",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      detail: salaryTier ? salaryTier.totalBusiness + " business" : "Build your team",
      trend: null,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-down">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-stone-800">Welcome back, {user.name}!</h2>
            <p className="text-stone-500 mt-1">Here's what's happening with your account today.</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-amber-200 text-amber-600 bg-amber-50">
              <Zap className="h-3 w-3 mr-1" /> Active
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, idx) => (
          <Card
            key={stat.label}
            className={"animate-fade-in-up border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden stagger-" + (idx + 1)}
          >
            <div className={"absolute inset-x-0 top-0 h-1 bg-gradient-to-r " + stat.gradient} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pt-5">
              <CardTitle className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{stat.label}</CardTitle>
              <div className={"w-10 h-10 rounded-xl bg-gradient-to-br " + stat.gradient + " flex items-center justify-center shadow-lg " + stat.shadowColor}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-stone-800">{stat.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-stone-400">{stat.detail}</p>
                {stat.trend && (
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <ArrowUpRight className="h-2.5 w-2.5" />{stat.trend}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Card className="animate-fade-in-left stagger-5 border-0 shadow-md bg-white overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-stone-700">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              Referral Bonus (5%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{formatCurrency(referralBonus)}</div>
            <p className="text-sm text-stone-400 mt-1">
              From {directReferrals.length} direct referral{directReferrals.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-right stagger-6 border-0 shadow-md bg-white overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-stone-700">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-blue-600" />
              </div>
              Level Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{formatCurrency(totalLevelBonus)}</div>
            <p className="text-sm text-stone-400 mt-1">
              Across {levelBonuses.filter((l) => l.bonus > 0).length} active levels
            </p>
          </CardContent>
        </Card>
      </div>

      {investment === 0 && (
        <Card className="animate-slide-up stagger-7 border-amber-200/50 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 shadow-lg shadow-amber-500/10">
          <CardContent className="pt-6 pb-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-amber flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-amber-900 text-lg">Start Investing</p>
              <p className="text-sm text-amber-700/80">Contact your upline or visit the Investment section to get started.</p>
            </div>
            <a href="/dashboard/investment">
              <Button size="sm" className="gradient-amber text-white border-0 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all">
                Invest <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
