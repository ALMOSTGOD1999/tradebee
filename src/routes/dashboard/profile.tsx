import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { getInvestmentTier } from "../../lib/store";
import { getUser } from "../../lib/server-actions";
import type { User } from "../../lib/store";
import { Copy, Check, UserCircle, TrendingUp, Link2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [parent, setParent] = useState<User | null>(null);

  useEffect(() => {
    if (user?.parentId) {
      getUser({ data: { id: user.parentId } }).then(setParent);
    }
  }, [user]);

  if (!user) return null;

  const tierInfo = getInvestmentTier(user.investmentTier);
  const inviteLink = typeof window !== "undefined" ? `${window.location.origin}?ref=${user.id}` : "";
  const investment = Number(user.investment) || 0;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold">My Profile</h2>
        <p className="text-muted-foreground mt-1">Your account details</p>
      </div>

      <Card className="animate-fade-in-up stagger-1 border-0 shadow-md bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="gradient-amber h-24 relative">
          <div className="absolute -bottom-8 left-6">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-amber-600 text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        <CardContent className="pt-12">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-xl font-bold">{user.name}</h3>
            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
              {user.role === "admin" ? "Administrator" : "Member"}
            </Badge>
          </div>
          <div className="grid gap-3">
            <div className="flex justify-between py-2 border-b border-amber-50">
              <span className="text-muted-foreground flex items-center gap-2"><UserCircle className="h-4 w-4" /> User ID</span>
              <span className="font-mono font-bold text-amber-600">{user.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-amber-50">
              <span className="text-muted-foreground">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-amber-50">
              <span className="text-muted-foreground">Phone</span>
              <span>{user.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-amber-50">
              <span className="text-muted-foreground">Joined</span>
              <span>{new Date(user.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Sponsored By</span>
              <span className="font-mono">{parent ? `${parent.name} (${parent.id})` : "--"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-2 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-500" />
            Investment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-1">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-bold text-lg">{formatCurrency(investment)}</span>
          </div>
          {tierInfo && (
            <>
              <div className="flex justify-between py-1"><span className="text-muted-foreground">Tier</span><span>{tierInfo.label}</span></div>
              <div className="flex justify-between py-1"><span className="text-muted-foreground">Capital Return</span><span>{tierInfo.capitalReturn}% / month</span></div>
              <div className="flex justify-between py-1"><span className="text-muted-foreground">ROI</span><span>{tierInfo.roi}% / month</span></div>
              <div className="flex justify-between py-1"><span className="text-muted-foreground">Total Income</span><span className="font-bold text-green-600">{tierInfo.totalIncome}% / month</span></div>
              <div className="flex justify-between py-1"><span className="text-muted-foreground">Total Return (20mo)</span><span className="font-bold">{tierInfo.totalReturnPct}%</span></div>
            </>
          )}
          {investment === 0 && <p className="text-sm text-muted-foreground">No investment yet</p>}
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-3 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-amber-500" />
            Your Invite Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">Share this link to invite new members to your downline.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-amber-50 rounded-lg text-sm break-all border border-amber-100">{inviteLink}</code>
            <button onClick={copyInvite} className="p-3 hover:bg-amber-50 rounded-lg transition-colors border border-amber-100">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-amber-600" />}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
