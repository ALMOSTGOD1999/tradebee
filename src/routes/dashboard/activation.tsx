import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { requestActivation, getActivationStatus, ACTIVATION_PACKAGES } from "../../lib/server-actions";
import { formatCurrency } from "../../lib/store";
import { Shield, Upload, CheckCircle, Clock, XCircle, IndianRupee, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

export const Route = createFileRoute("/dashboard/activation")({ component: ActivationPage });

function ActivationPage() {
  const { user, refreshUser } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [proof, setProof] = useState<string | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (!user) return;
    getActivationStatus({ data: { userId: user.id } }).then((r) => {
      setStatus(r);
      setLoadingStatus(false);
    });
  }, [user]);

  if (!user) return null;

  const isActivated = user.isActive && user.activationPackage;
  const hasPending = status?.activationStatus === "pending";
  const isRejected = status?.activationStatus === "rejected";

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setProof(result);
      setProofPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!selectedPkg) { toast.error("Select a package first"); return; }
    if (!proof) { toast.error("Upload payment proof"); return; }
    setSubmitting(true);
    const result = await requestActivation({ data: { userId: user.id, package: selectedPkg, paymentProof: proof } });
    if (result.success) {
      toast.success(result.message);
      const s = await getActivationStatus({ data: { userId: user.id } });
      setStatus(s);
    } else {
      toast.error(result.message);
    }
    setSubmitting(false);
  };

  // Already activated with a paid package
  if (isActivated) {
    const pkg = ACTIVATION_PACKAGES.find(p => p.id === user.activationPackage);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Activation</h2>
          <p className="text-slate-400 mt-1">Your account activation status</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-emerald-500/30 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Account Activated</h3>
          <p className="text-slate-300 mb-4">Your account is active with the following package:</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <IndianRupee className="h-4 w-4 text-emerald-400" />
            <span className="text-emerald-300 font-bold">{pkg?.label || "Premium Pack"}</span>
            <span className="text-emerald-400/60">—</span>
            <span className="text-emerald-300">{formatCurrency(Number(user.activationPackage))}</span>
          </div>
        </div>
      </div>
    );
  }

  // Pending status
  if (hasPending) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Activation</h2>
          <p className="text-slate-400 mt-1">Your account activation status</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-amber-500/30 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-amber-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Request Pending</h3>
          <p className="text-slate-300">Your activation request is being reviewed by admin. Please wait for approval.</p>
          {status?.activationPackage && (
            <p className="text-slate-400 mt-2 text-sm">Package: {formatCurrency(Number(status.activationPackage))}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl lg:text-3xl font-bold text-white">Activation</h2>
        <p className="text-slate-400 mt-1">Choose a package and submit payment proof to activate your account</p>
      </div>

      {isRejected && (
        <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl border border-red-500/30 p-4 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">Your previous request was rejected. Please submit a new request with valid payment proof.</p>
        </div>
      )}

      {/* Package selection */}
      <div className="grid gap-4 sm:grid-cols-2">
        {ACTIVATION_PACKAGES.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => setSelectedPkg(pkg.id)}
            className={cn(
              "relative p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:shadow-lg",
              selectedPkg === pkg.id
                ? "bg-white/15 border-amber-400 shadow-amber-500/20 ring-1 ring-amber-400/30"
                : "bg-white/5 border-slate-700 hover:border-slate-500"
            )}
          >
            {selectedPkg === pkg.id && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="h-5 w-5 text-amber-400" />
              </div>
            )}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                <IndianRupee className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{pkg.label}</h3>
                <p className="text-slate-400 text-sm">{pkg.description}</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-amber-400">{formatCurrency(pkg.amount)}</div>
          </button>
        ))}
      </div>

      {/* Payment proof upload */}
      {selectedPkg && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 space-y-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Upload className="h-4 w-4 text-amber-400" /> Upload Payment Proof
          </h3>
          <p className="text-slate-400 text-sm">Upload a screenshot of your payment transaction as proof.</p>

          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-400/5 transition-all">
              <Upload className="h-5 w-5 text-slate-400" />
              <span className="text-slate-400 text-sm">{proofPreview ? "Change image" : "Click to upload"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleProofUpload} />
            </label>
          </div>

          {proofPreview && (
            <div className="relative">
              <img src={proofPreview} alt="Payment proof" className="max-h-64 rounded-xl border border-slate-600 mx-auto" />
              <button
                onClick={() => { setProof(null); setProofPreview(null); }}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white hover:bg-red-500"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !proof}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Activation Request"}
          </button>
        </div>
      )}
    </div>
  );
}
