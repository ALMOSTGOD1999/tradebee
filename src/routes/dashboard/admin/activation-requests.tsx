import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../../lib/auth";
import { getPendingActivationRequests, approveActivation, rejectActivation, adminDirectActivate, ACTIVATION_PACKAGES } from "../../../lib/server-actions";
import { formatCurrency } from "../../../lib/store";
import { Shield, Check, X, Eye, UserCheck, Clock, IndianRupee, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";

export const Route = createFileRoute("/dashboard/admin/activation-requests")({ component: ActivationRequestsPage });

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
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [directUserId, setDirectUserId] = useState("");
  const [directActivating, setDirectActivating] = useState(false);
  const [viewingProof, setViewingProof] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    const data = await getPendingActivationRequests();
    setRequests(data as PendingRequest[]);
    setLoading(false);
  };

  useEffect(() => { loadRequests(); }, []);

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-16">
        <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 font-bold">Admin access required</p>
      </div>
    );
  }

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

  const handleDirectActivate = async () => {
    if (!directUserId.trim()) { toast.error("Enter a user ID"); return; }
    setDirectActivating(true);
    const result = await adminDirectActivate({ data: { userId: directUserId.trim() } });
    if (result.success) {
      toast.success(result.message);
      setDirectUserId("");
    } else {
      toast.error(result.message);
    }
    setDirectActivating(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Activation Requests</h2>
          <p className="text-slate-400 mt-1">Review and approve user activation requests</p>
        </div>
        <button onClick={loadRequests} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 bg-white/10 border border-slate-600 rounded-xl hover:bg-white/15 transition-all">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Direct Activate (Admin only) */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <UserCheck className="h-5 w-5 text-emerald-400" /> Direct Activate (Free)
        </h3>
        <p className="text-slate-400 text-sm mb-4">Activate any user directly without a payment package.</p>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter User ID (e.g. TB123456)"
            value={directUserId}
            onChange={(e) => setDirectUserId(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white/5 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 font-mono"
          />
          <button
            onClick={handleDirectActivate}
            disabled={directActivating || !directUserId.trim()}
            className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all disabled:opacity-50"
          >
            {directActivating ? "Activating..." : "Activate"}
          </button>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-400" /> Pending Requests ({requests.length})
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 rounded-2xl border border-slate-700 p-6 animate-pulse">
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
            const pkg = ACTIVATION_PACKAGES.find(p => p.id === req.activationPackage);
            return (
              <div key={req.id} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* User info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shrink-0">
                      {req.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{req.name}</p>
                      <p className="text-slate-400 text-sm font-mono">{req.id}</p>
                      <p className="text-slate-500 text-xs truncate">{req.email}</p>
                    </div>
                  </div>

                  {/* Package info */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
                      <IndianRupee className="h-3.5 w-3.5 text-amber-400" />
                      <span className="text-amber-300 font-bold text-sm">{pkg?.label || req.activationPackage}</span>
                    </div>
                    <span className="text-amber-400 font-bold">{formatCurrency(Number(req.activationPackage))}</span>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewingProof(null)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={viewingProof} alt="Payment proof" className="w-full rounded-2xl border border-slate-600 shadow-2xl" />
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
