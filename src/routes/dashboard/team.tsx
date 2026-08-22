import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { getDirectReferrals } from "../../lib/server-actions";
import { LEVEL_REQUIREMENTS, calculateLevelBonus, calculateSalary, formatCurrency } from "../../lib/store";
import type { User } from "../../lib/store";
import { Users, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard/team")({
  component: TeamPage,
});

function TeamPage() {
  const { user } = useAuth();
  const [directReferrals, setDirectReferrals] = useState<User[]>([]);
  const [allDownline, setAllDownline] = useState<User[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const direct = await getDirectReferrals({ data: { parentId: user.id } });
      setDirectReferrals(direct);
      const all = [user, ...direct];
      setAllDownline(all);
    };
    load();
  }, [user]);

  if (!user) return null;

  const levelBonuses = calculateLevelBonus(user.id, allDownline);
  const salaryTier = calculateSalary(user.id, allDownline);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold">My Team</h2>
        <p className="text-muted-foreground mt-1">Your referral network and level earnings</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="animate-fade-in-up stagger-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4" /> Direct Referrals</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{directReferrals.length}</div></CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-2 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Active Levels</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{levelBonuses.filter((l) => l.bonus > 0).length}</div></CardContent>
        </Card>
        <Card className="animate-fade-in-up stagger-3 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Monthly Salary</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{salaryTier ? formatCurrency(salaryTier.monthlySalary) : "--"}</div></CardContent>
        </Card>
      </div>

      <Card className="animate-fade-in-up stagger-4 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader><CardTitle>Level Bonus Breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-100">
                  <th className="text-left py-2 font-medium text-muted-foreground">Level</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Rate</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Required</th>
                  <th className="text-right py-2 font-medium text-muted-foreground">Bonus Earned</th>
                </tr>
              </thead>
              <tbody>
                {LEVEL_REQUIREMENTS.map((req) => {
                  const bonus = levelBonuses.find((l) => l.level === req.level);
                  return (
                    <tr key={req.level} className="border-b border-amber-50 last:border-0 hover:bg-amber-50/50 transition-colors">
                      <td className="py-2 font-medium">Level {req.level}</td>
                      <td className="py-2 text-right">{req.percentage}%</td>
                      <td className="py-2 text-right text-muted-foreground">{req.directReferrals} direct</td>
                      <td className="py-2 text-right font-mono">
                        {bonus && bonus.bonus > 0 ? (
                          <span className="text-green-600 font-medium">{formatCurrency(bonus.bonus)}</span>
                        ) : (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-5 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader><CardTitle>Direct Referral List</CardTitle></CardHeader>
        <CardContent>
          {directReferrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No team members yet.</p>
          ) : (
            <div className="space-y-2">
              {directReferrals.map((ref) => {
                const inv = Number(ref.investment) || 0;
                return (
                  <div key={ref.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-xl border border-amber-100/50 hover:bg-amber-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg gradient-amber flex items-center justify-center text-white font-bold text-xs">{ref.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-medium">{ref.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{ref.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={inv > 0 ? "default" : "secondary"}>{inv > 0 ? "Active" : "Inactive"}</Badge>
                      {inv > 0 && <p className="text-xs text-muted-foreground mt-1">{formatCurrency(inv)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
