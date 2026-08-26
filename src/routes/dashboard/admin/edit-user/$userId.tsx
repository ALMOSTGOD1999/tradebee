import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../lib/auth";
import { getUser, adminUpdateUser } from "../../../../lib/server-actions";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { toast } from "sonner";
import { Save, ArrowLeft, Loader2, UserCog } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/edit-user/$userId")({
  component: AdminEditUserPage,
});

function AdminEditUserPage() {
  const { user } = useAuth();
  const { userId } = Route.useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("user");
  const [isActive, setIsActive] = useState(true);
  const [parentId, setParentId] = useState("");

  // KYC fields
  const [ifscCode, setIfscCode] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [panNo, setPanNo] = useState("");
  const [branchName, setBranchName] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    getUser({ data: { id: userId } }).then((u) => {
      if (!u) {
        toast.error("User not found");
        navigate({ to: "/dashboard/admin/all-users" });
        return;
      }
      setName(u.name);
      setEmail(u.email);
      setPhone(u.phone);
      setRole(u.role);
      setIsActive(u.isActive);
      setParentId(u.parentId || "");
      setIfscCode(u.ifscCode || "");
      setAccountNo(u.accountNo || "");
      setPanNo(u.panNo || "");
      setBranchName(u.branchName || "");
      setLoading(false);
    });
  }, [user, userId, navigate]);

  if (!user || user.role !== "admin") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await adminUpdateUser({
        data: {
          userId,
          name,
          email,
          phone,
          role,
          isActive,
          parentId: parentId || "",
          ifscCode,
          accountNo,
          panNo,
          branchName,
        },
      });
      if (result.success) {
        toast.success("User updated successfully!");
        navigate({ to: "/dashboard/admin/all-users" });
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold text-stone-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center shadow-lg shadow-blue-200/50">
            <UserCog className="h-5 w-5 text-white" />
          </div>
          Edit User
        </h2>
        <p className="text-stone-500 mt-1 ml-13">
          Editing <span className="font-mono font-bold text-amber-600">{userId}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile */}
        <Card className="animate-fade-in-up stagger-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              Profile Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">Parent User ID</Label>
              <Input id="edit-parent" value={parentId} onChange={(e) => setParentId(e.target.value.toUpperCase())} placeholder="None (root user)" className="h-11 font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <select
                  id="edit-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="h-11 flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 rounded border-stone-300 text-amber-500 focus:ring-amber-500/20"
                    />
                    <span className="text-sm font-medium text-stone-700">
                      {isActive ? (
                        <Badge variant="outline" className="border-green-200 text-green-600 bg-green-50">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50">Inactive</Badge>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KYC */}
        <Card className="animate-fade-in-up stagger-2 border-0 shadow-md bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              KYC / Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ifsc">IFSC Code</Label>
              <Input id="edit-ifsc" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} placeholder="SBIN0001234" className="h-11 font-mono" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-account">Account Number</Label>
              <Input id="edit-account" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} placeholder="Bank account number" className="h-11" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-pan">PAN Number</Label>
                <Input id="edit-pan" value={panNo} onChange={(e) => setPanNo(e.target.value.toUpperCase())} placeholder="ABCDE1234F" className="h-11 font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-branch">Branch Name</Label>
                <Input id="edit-branch" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="Bank branch" className="h-11" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 animate-fade-in-up stagger-3">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/dashboard/admin/all-users" })} className="flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg shadow-blue-200/50 transition-all">
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
