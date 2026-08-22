import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth";
import { getAllUsers, updateUserInvestment } from "../../../lib/server-actions";
import type { User } from "../../../lib/store";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";
import { Search, Users, IndianRupee } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/all-users")({
  component: AdminAllUsersPage,
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function AdminAllUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState("");

  useEffect(() => {
    getAllUsers().then(setUsers);
  }, []);

  if (!user || user.role !== "admin") return null;

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveInvestment = async (userId: string) => {
    const amount = parseInt(investAmount.replace(/[^\d]/g, ""), 10);
    if (isNaN(amount) || amount <= 0) { toast.error("Please enter a valid amount"); return; }
    const result = await updateUserInvestment({ data: { userId, amount } });
    if (result.success) {
      toast.success(result.message);
      const updated = await getAllUsers();
      setUsers(updated);
      setEditingId(null);
      setInvestAmount("");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold">All Users</h2>
        <p className="text-muted-foreground mt-1">{users.length} total users in the system</p>
      </div>

      <div className="flex items-center gap-2 animate-fade-in-up stagger-1">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, ID, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm h-10" />
      </div>

      <div className="space-y-3">
        {filtered.map((u, idx) => {
          const inv = Number(u.investment) || 0;
          const stagger = `stagger-${Math.min(idx + 2, 8)}`;
          return (
            <div key={u.id} className={`animate-fade-in-up ${stagger}`}>
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-amber flex items-center justify-center text-white font-bold shrink-0">{u.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{u.name}</span>
                          <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono">{u.id}</p>
                        <p className="text-xs text-muted-foreground">{u.email} | {u.phone}</p>
                        {u.parentId && <p className="text-xs text-muted-foreground">Parent: <span className="font-mono">{u.parentId}</span></p>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-sm"><IndianRupee className="h-3 w-3" /><span className="font-bold">{formatCurrency(inv)}</span></div>
                      {u.investmentTier && <p className="text-xs text-muted-foreground">{u.investmentTier}</p>}
                      <button onClick={() => { setEditingId(u.id); setInvestAmount(inv.toString()); }} className="text-xs text-amber-600 hover:underline mt-1">Edit Investment</button>
                    </div>
                  </div>
                  {editingId === u.id && (
                    <div className="mt-4 pt-4 border-t border-amber-100 flex items-end gap-2 flex-col sm:flex-row">
                      <div className="flex-1 w-full">
                        <Label className="text-xs">Investment Amount</Label>
                        <Input type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} placeholder="e.g. 500000" className="h-10" />
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleSaveInvestment(u.id)} className="px-4 py-2 gradient-amber text-white rounded-xl text-sm font-semibold shadow-amber transition-all">Save</button>
                        <button onClick={() => { setEditingId(null); setInvestAmount(""); }} className="px-4 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">Cancel</button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No users found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
