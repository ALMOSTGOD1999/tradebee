import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { getDirectReferrals } from "../../lib/server-actions";
import type { User } from "../../lib/store";
import { Copy, Check, Share2, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/referrals")({
  component: ReferralsPage,
});

function ReferralsPage() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [directReferrals, setDirectReferrals] = useState<User[]>([]);

  useEffect(() => {
    if (!user) return;
    getDirectReferrals({ data: { parentId: user.id } }).then(setDirectReferrals);
  }, [user]);

  if (!user) return null;

  const inviteLink = `${window.location.origin}?ref=${user.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: "Join Trading Bee", text: `Join using my link: ${inviteLink}`, url: inviteLink });
    } else {
      copyLink();
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold">Referral Program</h2>
        <p className="text-muted-foreground mt-1">Share your link and earn 5% direct referral bonus</p>
      </div>

      <Card className="animate-fade-in-up stagger-1 border-0 shadow-md bg-gradient-to-br from-amber-500 to-orange-500 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white"><Share2 className="h-5 w-5" /> Your Invite Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <p className="text-sm break-all font-mono">{inviteLink}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLink} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white text-amber-600 rounded-xl text-sm font-semibold hover:bg-amber-50 transition-colors">
              {copied ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy Link</>}
            </button>
            <button onClick={shareLink} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/20 text-white rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors border border-white/30">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-2 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader><CardTitle>How It Works</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {["Share your invite link with friends and colleagues.", "They sign up using your link as your direct referral.", "When they invest, you earn a 5% Direct Referral Bonus.", "You also earn Level Bonuses up to 21 levels deep."].map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-6 h-6 rounded-full gradient-amber flex items-center justify-center text-white font-bold text-xs shrink-0">{i + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="animate-fade-in-up stagger-3 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Direct Referrals ({directReferrals.length})</CardTitle></CardHeader>
        <CardContent>
          {directReferrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No referrals yet. Share your link to get started!</p>
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
                      <p className="text-sm font-medium">{formatCurrency(inv)}</p>
                      <p className="text-xs text-green-600 font-medium">+{formatCurrency(inv * 0.05)} bonus</p>
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}
