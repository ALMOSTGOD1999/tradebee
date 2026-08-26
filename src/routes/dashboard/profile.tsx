import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { getInvestmentTier } from "../../lib/store";
import { getUser, updateUserKYC } from "../../lib/server-actions";
import type { User } from "../../lib/store";
import { Copy, Check, TrendingUp, Link2, Mail, Phone, Calendar, Users, Shield, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [copied, setCopied] = useState(false);
  const [parent, setParent] = useState<User | null>(null);

  // KYC form state
  const [ifscCode, setIfscCode] = useState(user?.ifscCode || "");
  const [accountNo, setAccountNo] = useState(user?.accountNo || "");
  const [panNo, setPanNo] = useState(user?.panNo || "");
  const [branchName, setBranchName] = useState(user?.branchName || "");
  const [kycSaving, setKycSaving] = useState(false);

  useEffect(() => {
    if (user?.parentId) {
      getUser({ data: { id: user.parentId } }).then(setParent);
    }
  }, [user]);

  // Sync KYC fields when user data loads/refreshes
  useEffect(() => {
    if (user) {
      setIfscCode(user.ifscCode || "");
      setAccountNo(user.accountNo || "");
      setPanNo(user.panNo || "");
      setBranchName(user.branchName || "");
    }
  }, [user]);

  if (!user) return null;

  const tierInfo = getInvestmentTier(user.investmentTier);
  const inviteLink = typeof window !== "undefined" ? window.location.origin + "?ref=" + user.id : "";
  const investment = Number(user.investment) || 0;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const saveKYC = async () => {
    setKycSaving(true);
    try {
      const result = await updateUserKYC({
        data: {
          userId: user.id,
          ifscCode,
          accountNo,
          panNo,
          branchName,
        },
      });
      if (result.success) {
        toast.success("KYC details saved!");
        await refreshUser();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to save KYC details");
    } finally {
      setKycSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold text-stone-800">My Profile</h2>
        <p className="text-stone-500 mt-1">Your account details</p>
      </div>

      <Card className="animate-fade-in-up stagger-1 border-0 shadow-lg bg-white overflow-hidden">
        <div className="relative h-32 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center text-amber-600 text-3xl font-bold border-4 border-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
        <CardContent className="pt-14 px-6 pb-6">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-xl font-bold text-stone-800">{user.name}</h3>
            <Badge variant="outline" className={user.role === "admin" ? "border-amber-200 text-amber-600 bg-amber-50" : "border-stone-200 text-stone-600"}>
              {user.role === "admin" ? "Administrator" : "Member"}
            </Badge>
          </div>
          <div className="grid gap-1">
            <div className="flex justify-between py-3 border-b border-stone-100 hover:bg-stone-50/50 px-2 -mx-2 rounded-lg transition-colors">
              <span className="text-stone-500 flex items-center gap-2 text-sm"><Users className="h-4 w-4" /> User ID</span>
              <span className="font-mono font-bold text-amber-600 text-sm">{user.id}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-stone-100 hover:bg-stone-50/50 px-2 -mx-2 rounded-lg transition-colors">
              <span className="text-stone-500 flex items-center gap-2 text-sm"><Mail className="h-4 w-4" /> Email</span>
              <span className="text-sm text-stone-700">{user.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-stone-100 hover:bg-stone-50/50 px-2 -mx-2 rounded-lg transition-colors">
              <span className="text-stone-500 flex items-center gap-2 text-sm"><Phone className="h-4 w-4" /> Phone</span>
              <span className="text-sm text-stone-700">{user.phone}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-stone-100 hover:bg-stone-50/50 px-2 -mx-2 rounded-lg transition-colors">
              <span className="text-stone-500 flex items-center gap-2 text-sm"><Calendar className="h-4 w-4" /> Joined</span>
              <span className="text-sm text-stone-700">{new Date(user.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
            <div className="flex justify-between py-3 hover:bg-stone-50/50 px-2 -mx-2 rounded-lg transition-colors">
              <span className="text-stone-500 text-sm">Sponsored By</span>
              <span className="font-mono text-sm text-stone-700">{parent ? parent.name + " (" + parent.id + ")" : "--"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-2 border-0 shadow-lg bg-white overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-stone-800">Investment Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between py-2 px-3 bg-stone-50 rounded-xl">
            <span className="text-stone-500 text-sm">Amount</span>
            <span className="font-bold text-lg text-stone-800">{formatCurrency(investment)}</span>
          </div>
          {tierInfo && (
            <div className="space-y-2 px-3">
              <div className="flex justify-between py-1"><span className="text-stone-500 text-sm">Tier</span><span className="text-sm text-stone-700">{tierInfo.label}</span></div>
              <div className="flex justify-between py-1"><span className="text-stone-500 text-sm">Capital Return</span><span className="text-sm text-stone-700">{tierInfo.capitalReturn}% / month</span></div>
              <div className="flex justify-between py-1"><span className="text-stone-500 text-sm">ROI</span><span className="text-sm text-stone-700">{tierInfo.roi}% / month</span></div>
              <div className="flex justify-between py-1"><span className="text-stone-500 text-sm">Total Income</span><span className="font-bold text-sm text-emerald-600">{tierInfo.totalIncome}% / month</span></div>
              <div className="flex justify-between py-1"><span className="text-stone-500 text-sm">Total Return (20mo)</span><span className="font-bold text-sm text-amber-600">{tierInfo.totalReturnPct}%</span></div>
            </div>
          )}
          {investment === 0 && <p className="text-sm text-stone-400 px-3">No investment yet</p>}
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-3 border-0 shadow-lg bg-white overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Link2 className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-stone-800">Your Invite Link</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-stone-500 mb-3">Share this link to invite new members to your downline.</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-3 bg-stone-50 rounded-xl text-sm break-all border border-stone-200 text-stone-600">{inviteLink}</code>
            <button onClick={copyInvite} className="p-3 hover:bg-amber-50 rounded-xl transition-all border border-stone-200 hover:border-amber-300 active:scale-95">
              {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-amber-600" />}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}