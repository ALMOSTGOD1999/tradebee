import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../../../lib/auth";
import { adminCreateUser } from "../../../lib/server-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/create-user")({
  component: AdminCreateUserPage,
});

function AdminCreateUserPage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [parentId, setParentId] = useState("TB000001");
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== "admin") return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await adminCreateUser({ data: { name, email, phone, password, parentId } });
    if (result.success && result.user) {
      toast.success(`User created! ID: ${result.user.id}`);
      setName(""); setEmail(""); setPhone(""); setPassword("");
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold">Create New User</h2>
        <p className="text-muted-foreground mt-1">Admin can create users under any parent in the genealogy</p>
      </div>

      <Card className="animate-fade-in-up stagger-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5 text-amber-500" /> New User Details</CardTitle>
          <CardDescription>Leave Parent ID as TB000001 to place under Admin</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parent-id">Parent User ID</Label>
              <Input id="parent-id" placeholder="TB000001 (Admin)" value={parentId} onChange={(e) => setParentId(e.target.value)} className="h-11" />
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
              <Input id="user-password" type="password" placeholder="Set password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11" />
            </div>
            <button type="submit" disabled={loading} className="w-full h-11 gradient-amber text-white rounded-xl text-sm font-semibold shadow-amber hover:shadow-lg-amber transition-all duration-300 disabled:opacity-50">
              {loading ? "Creating..." : "Create User"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
