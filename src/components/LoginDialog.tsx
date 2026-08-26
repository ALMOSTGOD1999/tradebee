import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { loginUser, signupUser } from "../lib/server-actions";
import { toast } from "sonner";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (user: any) => void;
  defaultTab?: "login" | "signup";
  referralId?: string | undefined;
}

export function LoginDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultTab = "login",
  referralId,
}: LoginDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-gradient-amber">
            Welcome to Trading Bee
          </DialogTitle>
          <DialogDescription>
            Login or create an account to get started
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger
                value="login"
                className="data-[state=active]:gradient-amber data-[state=active]:text-white"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:gradient-amber data-[state=active]:text-white"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm
                onSuccess={(user) => {
                  onOpenChange(false);
                  onSuccess(user);
                  navigate({ to: "/dashboard" });
                }}
              />
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm
                referralId={referralId}
                onSuccess={(user) => {
                  onOpenChange(false);
                  onSuccess(user);
                  navigate({ to: "/dashboard" });
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LoginForm({ onSuccess }: { onSuccess: (user: any) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginUser({ data: { email, password } });
      if (result.success && result.user) {
        toast.success("Login successful!");
        onSuccess(result.user);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Login failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="dialog-login-email">Email or User ID</Label>
        <Input
          id="dialog-login-email"
          type="text"
          placeholder="Email or User ID (e.g. TB000001)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dialog-login-password">Password</Label>
        <Input
          id="dialog-login-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-11"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </p>
      )}
      <Button
        type="submit"
        className="w-full h-11 gradient-amber text-white shadow-amber hover:shadow-lg-amber transition-all duration-300"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>
    </form>
  );
}

function SignupForm({
  referralId,
  onSuccess,
}: {
  referralId: string | undefined;
  onSuccess: (user: any) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [refId, setRefId] = useState(referralId || "");
  const [ifscCode, setIfscCode] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [panNo, setPanNo] = useState("");
  const [branchName, setBranchName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (referralId) setRefId(referralId);
  }, [referralId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!refId) {
      setError("Referral ID is required");
      setLoading(false);
      return;
    }
    try {
      const result = await signupUser({
        data: { name, email, phone, password, parentId: refId, ifscCode, accountNo, panNo, branchName },
      });
      if (result.success && result.user) {
        toast.success("Account created! You can now login.");
        onSuccess(result.user);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Signup failed. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="dialog-signup-name">Full Name</Label>
        <Input
          id="dialog-signup-name"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dialog-signup-email">Email</Label>
        <Input
          id="dialog-signup-email"
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dialog-signup-phone">Phone</Label>
        <Input
          id="dialog-signup-phone"
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dialog-signup-password">Password</Label>
        <Input
          id="dialog-signup-password"
          type="password"
          placeholder="Create password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="dialog-signup-ref">Referral ID</Label>
        <Input
          id="dialog-signup-ref"
          placeholder="e.g. TB000001"
          value={refId}
          onChange={(e) => setRefId(e.target.value)}
          required
          className="h-10"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dialog-signup-ifsc">IFSC Code</Label>
          <Input
            id="dialog-signup-ifsc"
            placeholder="e.g. SBIN0001234"
            value={ifscCode}
            onChange={(e) => setIfscCode(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dialog-signup-branch">Branch Name</Label>
          <Input
            id="dialog-signup-branch"
            placeholder="e.g. Andheri West"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="h-10"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dialog-signup-account">Account No</Label>
          <Input
            id="dialog-signup-account"
            placeholder="Bank account number"
            value={accountNo}
            onChange={(e) => setAccountNo(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dialog-signup-pan">PAN No</Label>
          <Input
            id="dialog-signup-pan"
            placeholder="e.g. ABCDE1234F"
            value={panNo}
            onChange={(e) => setPanNo(e.target.value)}
            className="h-10"
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </p>
      )}
      <Button
        type="submit"
        className="w-full h-10 gradient-amber text-white shadow-amber hover:shadow-lg-amber transition-all duration-300"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Sign Up"}
      </Button>
    </form>
  );
}
