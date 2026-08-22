import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { INVESTMENT_TIERS, getInvestmentTier } from "../../lib/store";
import { updateUserInvestment } from "../../lib/server-actions";
import { toast } from "sonner";
import { IndianRupee, TrendingUp, Calendar, Percent, Shield } from "lucide-react";

export const Route = createFileRoute("/dashboard/investment")({
  component: InvestmentPage,
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function InvestmentPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  if (!user) return null;

  const handleInvest = async (tierMin: number, tierMax: number) => {
    const amountStr = window.prompt(`Enter investment amount (${formatCurrency(tierMin)} - ${formatCurrency(tierMax)}):`);
    if (!amountStr) return;
    const numAmount = parseInt(amountStr.replace(/[^\d]/g, ""), 10);
    if (isNaN(numAmount) || numAmount < tierMin || numAmount > tierMax) {
      toast.error(`Amount must be between ${formatCurrency(tierMin)} and ${formatCurrency(tierMax)}`);
      return;
    }
    setLoading(true);
    const result = await updateUserInvestment({ data: { userId: user.id, amount: numAmount } });
    if (result.success) {
      toast.success(result.message);
      await refreshUser();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold">Investment Plans</h2>
        <p className="text-muted-foreground mt-1">Choose an investment tier to start earning returns</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {INVESTMENT_TIERS.map((tier, idx) => {
          const stagger = `stagger-${idx + 1}`;
          return (
            <div key={tier.tier} className={`animate-fade-in-up ${stagger}`}>
              <Card className={`border-0 shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${user.investmentTier === tier.tier ? "ring-2 ring-amber-400 shadow-amber" : ""}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg gradient-amber flex items-center justify-center">
                      <IndianRupee className="h-4 w-4 text-white" />
                    </div>
                    {tier.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-amber-50 rounded-xl text-center border border-amber-100">
                      <div className="text-xs text-amber-700 flex items-center justify-center gap-1"><Percent className="h-3 w-3" /> Capital Return</div>
                      <div className="text-xl font-bold text-amber-600">{tier.capitalReturn}%</div>
                      <div className="text-[10px] text-amber-600">per month</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-xl text-center border border-green-100">
                      <div className="text-xs text-green-700 flex items-center justify-center gap-1"><TrendingUp className="h-3 w-3" /> ROI</div>
                      <div className="text-xl font-bold text-green-600">{tier.roi}%</div>
                      <div className="text-[10px] text-green-600">per month</div>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl text-center border border-green-100">
                    <div className="text-xs text-green-700">Total Monthly Income</div>
                    <div className="text-2xl font-bold text-green-600">{tier.totalIncome}%</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Duration</span>
                    <span className="font-medium">20 months</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Return</span>
                    <span className="font-bold text-amber-600">{tier.totalReturnPct}%</span>
                  </div>
                  {user.investmentTier === tier.tier ? (
                    <div className="text-center py-2.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-xl text-sm font-semibold">
                      Current Plan
                    </div>
                  ) : (
                    <button onClick={() => handleInvest(tier.min, tier.max)} disabled={loading} className="w-full py-2.5 gradient-amber text-white rounded-xl text-sm font-semibold shadow-amber hover:shadow-lg-amber transition-all duration-300 disabled:opacity-50">
                      Invest Now
                    </button>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <Card className="animate-fade-in-up stagger-6 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-amber-500" /> Investment Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p><span className="font-medium text-foreground">Capital Return:</span> Your invested capital is returned in installments over 20 months.</p>
          <p><span className="font-medium text-foreground">ROI:</span> Return on Investment paid monthly on top of capital return.</p>
          <p><span className="font-medium text-foreground">PDC Security:</span> Investments above ₹5 lakh receive a Post-Dated Cheque of ₹5 lakh as security.</p>
          <p><span className="font-medium text-foreground">No Early Withdrawal:</span> Full principal cannot be withdrawn before the scheduled 20-month period.</p>
        </CardContent>
      </Card>
    </div>
  );
}
