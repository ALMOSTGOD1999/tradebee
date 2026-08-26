import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../../lib/auth";
import { signupUser } from "../../lib/server-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { PasswordInput } from "../../components/ui/password-input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { toast } from "sonner";
import { UserPlus, ArrowLeft, Loader2, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/dashboard/add-user")({
  component: AddUserPage,
});

function AddUserPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [parentId, setParentId] = useState(user?.id || "");
  const [ifscCode, setIfscCode] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [panNo, setPanNo] = useState("");
  const [branchName, setBranchName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<{ id: string; name: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const inviteLink = createdUser
    ? typeof window !== "undefined"
      ? window.location.origin + "?ref=" + createdUser.id
      : ""
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signupUser({
        data: { name, email, phone, password, parentId, ifscCode, accountNo, panNo, branchName },
      });
      if (result.success && result.user) {
        toast.success(`User created! ID: ${result.user.id}`);
        setCreatedUser({ id: result.user.id, name: result.user.name });
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setIfscCode("");
        setAccountNo("");
        setPanNo("");
        setBranchName("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold text-stone-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-200/50">
            <UserPlus className="h-5 w-5 text-white" />
          </div>
          Add New User
        </h2>
        <p className="text-stone-500 mt-1 ml-13">Create a new member under any user in your network</p>
      </div>

      {/* Success Card with Invite Link */}
      {createdUser && (
        <Card className="animate-fade-in-up border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-800">{createdUser.name} created!</p>
                <p className="text-sm text-green-600 font-mono">{createdUser.id}</p>
              </div>
            </div>
            <p className="text-sm text-stone-500 mb-3">Share this invite link so they can set up their account:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-3 bg-white rounded-xl text-sm break-all border border-green-200 text-stone-600">{inviteLink}</code>
              <Button variant="outline" size="icon" onClick={copyInvite} className="shrink-0 border-green-200 hover:bg-green-50">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-green-600" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="animate-fade-in-up stagger-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-amber-500" />
            New User Details
          </CardTitle>
          <CardDescription>
            Parent ID is pre-filled with your ID. Change it to place the new user under someone else.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parent-id">Parent User ID</Label>
              <Input
                id="parent-id"
                placeholder="e.g. TB000002"
                value={parentId}
                onChange={(e) => setParentId(e.target.value.toUpperCase())}
                required
                className="h-11 font-mono"
              />
              <p className="text-xs text-stone-400">
                New user will be placed under this ID. Default: your own ID ({user.id})
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-name">Full Name</Label>
              <Input id="user-name" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-email">Email</Label>
              <Input id="user-email" type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-phone">Phone</Label>
              <Input id="user-phone" type="tel" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-password">Password</Label>
              <PasswordInput id="user-password" placeholder="Set password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
            </div>

            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">Optional: KYC / Bank Details</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="user-ifsc" className="text-sm">IFSC Code</Label>
                <Input id="user-ifsc" placeholder="SBIN0001234" value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-branch" className="text-sm">Branch Name</Label>
                <Input id="user-branch" placeholder="Andheri West" value={branchName} onChange={(e) => setBranchName(e.target.value)} className="h-11" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="user-account" className="text-sm">Account No</Label>
                <Input id="user-account" placeholder="Bank account number" value={accountNo} onChange={(e) => setAccountNo(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-pan" className="text-sm">PAN No</Label>
                <Input id="user-pan" placeholder="ABCDE1234F" value={panNo} onChange={(e) => setPanNo(e.target.value.toUpperCase())} className="h-11" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/dashboard" })} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 gradient-amber text-white h-11 shadow-lg shadow-amber-200/50 hover:shadow-xl hover:shadow-amber-300/50 transition-all">
                {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : <><UserPlus className="h-4 w-4 mr-2" /> Create User</>}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
