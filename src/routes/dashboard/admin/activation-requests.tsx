import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth";
import {
  getPendingActivationRequests,
  approveActivation,
  rejectActivation,
  adminDirectActivate,
  searchUsers,
  ACTIVATION_PACKAGES,
} from "../../../lib/server-actions";
import { formatCurrency } from "../../../lib/store";
import {
  Shield,
  Check,
  X,
  Eye,
  UserCheck,
  Clock,
  IndianRupee,
  RefreshCw,
  Search,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import type { User } from "../../../lib/store";

export const Route = createFileRoute("/dashboard/admin/activation-requests")({
  component: ActivationRequestsPage,
});

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  activationPackage: string | null;
  paymentProof: string | null;
  activationStatus: string | null;
  createdAt: Date | string;
}

function ActivationRequestsPage() {
  const { user } = useAuth();

  // Pending requests state
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  // Admin activate state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    const data = await getPendingActivationRequests();
    setRequests(data as PendingRequest[]);
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-16">
        <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 font-bold">Admin access required</p>
      </div>
    );
  }

  // Search users by ID, name, or email
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSelectedUser(null);
    setSelectedPackage(null);
    try {
      const results = await searchUsers({ data: { query: searchQuery.trim() } });
      setSearchResults(results as User[]);
    } catch {
      toast.error("Search failed");
    }
    setSearching(false);
  };

  const handleApprove = async (userId: string) => {
    const result = await approveActivation({ data: { userId } });
    if (result.success) {
      toast.success(result.message);
      loadRequests();
    } else {
      toast.error(result.message);
    }
  };

  const handleReject = async (userId: string) => {
    const result = await rejectActivation({ data: { userId } });
    if (result.success) {
      toast.success(result.message);
      loadRequests();
    } else {
      toast.error(result.message);
    }
  };

  const handleAdminActivate = async () => {
    if (!selectedUser) {
      toast.error("Select a user first");
      return;
    }
    if (!selectedPackage) {
      toast.error("Select a package first");
      return;
    }
    setActivating(true);
    const result = await adminDirectActivate({
      data: { userId: selectedUser.id, package: selectedPackage },
    });
    if (result.success) {
      toast.success(result.message);
      setSelectedUser(null);
      setSelectedPackage(null);
      setSearchQuery("");
      setSearchResults([]);
    } else {
      toast.error(result.message);
    }
    setActivating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            Activation Management
          </h2>
          <p className="text-slate-400 mt-1">
            Search users, assign packages, and manage activation requests
          </p>
        </div>
        <button
          onClick={loadRequests}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 bg-white/10 border border-slate-600 rounded-xl hover:bg-white/15 transition-all"
        >
          <RefreshCw
            className={cn("h-4 w-4", loading && "animate-spin")}
          />{" "}
          Refresh
        </button>
      </div>

      {/* Admin Activate: Search + Package Select */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 space-y-5">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-400" /> Activate User with Package
        </h3>
        <p className="text-slate-400 text-sm">
          Search for any user, select a package, and activate their account directly.
          No payment proof required.
        </p>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by User ID, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !searchQuery.trim()}
            className="px-5 py-2.5 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:bg-amber-600 transition-all disabled:opacity-50"
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Search results */}
        {searchResults.length > 0 && !selectedUser && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">
              Results ({searchResults.length})
            </p>
            {searchResults.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-slate-600 hover:border-amber-400 hover:bg-amber-400/5 transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">
                    {u.name}
                  </p>
                  <p className="text-slate-400 text-xs font-mono">{u.id}</p>
                  <p className="text-slate-500 text-xs truncate">{u.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      u.isActive
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected user */}
        {selectedUser && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-white">{selectedUser.name}</p>
                  <p className="text-slate-400 text-sm font-mono">
                    {selectedUser.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedPackage(null);
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Package selection */}
            <div>
              <p className="text-slate-300 text-sm font-semibold mb-3">
                Select Package:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {ACTIVATION_PACKAGES.map((pkg) => (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id)}
                    className={cn(
                      "p-4 rounded-xl border-2 text-left transition-all",
                      selectedPackage === pkg.id
                        ? "border-amber-400 bg-amber-400/10 ring-1 ring-amber-400/30"
                        : "border-slate-600 bg-white/5 hover:border-slate-500"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{pkg.label}</p>
                        <p className="text-slate-400 text-xs">
                          {pkg.description}
                        </p>
                      </div>
                      <span className="text-amber-400 font-bold text-lg">
                        {formatCurrency(pkg.amount)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Activate button */}
            <button
              onClick={handleAdminActivate}
              disabled={activating || !selectedPackage}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activating
                ? "Activating..."
                : `Activate with ${selectedPackage ? ACTIVATION_PACKAGES.find((p) => p.id === selectedPackage)?.label : "Package"}`}
            </button>
          </div>
        )}
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-400" /> Pending Requests (
          {requests.length})
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/5 rounded-2xl border border-slate-700 p-6 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-32" />
                    <div className="h-3 bg-slate-700 rounded w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white/5 rounded-2xl border border-slate-700 p-12 text-center">
            <Check className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-white font-bold text-lg">All caught up!</p>
            <p className="text-slate-400 mt-1">No pending activation requests</p>
          </div>
        ) : (
          requests.map((req) => {
            const pkg = ACTIVATION_PACKAGES.find(
              (p) => p.id === req.activationPackage
            );
            return (
              <div
                key={req.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* User info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                      {req.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{req.name}</p>
                      <p className="text-slate-400 text-sm font-mono">
                        {req.id}
                      </p>
                      <p className="text-slate-500 text-xs truncate">
                        {req.email}
                      </p>
                    </div>
                  </div>

                  {/* Package info */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
                      <IndianRupee className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-amber-300 font-bold text-sm">
                        {pkg?.label || req.activationPackage}
                      </span>
                    </div>
                    <span className="text-amber-400 font-bold">
                      {formatCurrency(Number(req.activationPackage))}
                    </span>
                  </div>

                  {/* Payment proof */}
                  {req.paymentProof && (
                    <button
                      onClick={() => setViewingProof(req.paymentProof)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 text-sm hover:bg-blue-500/20 transition-all"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Proof
                    </button>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all text-sm"
                    >
                      <Check className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-500/80 text-white font-bold rounded-xl hover:bg-red-500 transition-all text-sm"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Proof Modal */}
      {viewingProof && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingProof(null)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={viewingProof}
              alt="Payment proof"
              className="w-full rounded-2xl border border-slate-600 shadow-2xl"
            />
            <button
              onClick={() => setViewingProof(null)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg hover:bg-red-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
