import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../../../lib/auth";
import {
  Shield,
  FileText,
  Download,
  ExternalLink,
  IndianRupee,
  Wallet,
  Layers,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/admin/income-report")({
  component: AdminIncomeReportPage,
});

const REPORT_HTML = "/reports/income-report-2026-10-30.html";
const REPORT_PDF = "/reports/income-report-2026-10-30.pdf";

const stats = [
  {
    label: "Total income",
    value: "₹1,36,222",
    detail: "All income types combined",
    icon: IndianRupee,
    accent: "text-amber-400 bg-amber-500/10",
  },
  {
    label: "Recorded payouts",
    value: "₹1,24,600",
    detail: "22 transactions in ledger",
    icon: Wallet,
    accent: "text-emerald-400 bg-emerald-500/10",
  },
  {
    label: "Level bonus",
    value: "₹11,622",
    detail: "23 beneficiaries (computed)",
    icon: Layers,
    accent: "text-blue-400 bg-blue-500/10",
  },
  {
    label: "Salary",
    value: "₹0",
    detail: "₹5,00,000 team tier not reached",
    icon: Clock,
    accent: "text-slate-400 bg-slate-500/10",
  },
];

function AdminIncomeReportPage() {
  const { user } = useAuth();

  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-16">
        <Shield className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400 font-bold">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 animate-fade-in-down">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">Income Report</h2>
          <p className="text-slate-400 mt-1">
            Every income type — inception (26 Aug 2026) to 30 Oct 2026 · generated 16 Nov 2026
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <a
            href={REPORT_HTML}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-300 bg-white/10 border border-slate-600 rounded-xl hover:bg-white/15 transition-all"
          >
            <ExternalLink className="h-4 w-4" /> View in browser
          </a>
          <a
            href={REPORT_PDF}
            download
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-amber-500 rounded-xl shadow-lg shadow-amber-500/25 hover:bg-amber-600 transition-all"
          >
            <Download className="h-4 w-4" /> Download PDF
          </a>
        </div>
      </div>

      {/* Key figures */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 animate-fade-in-up stagger-${i + 1}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                {s.label}
              </p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.accent}`}>
                <s.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-slate-500 text-xs mt-1">{s.detail}</p>
          </div>
        ))}
      </div>

      {/* Report preview */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 space-y-4 animate-fade-in-up stagger-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" /> Report preview
          </h3>
          <span className="text-slate-500 text-xs">4-page A4 · 209 KB · PDF</span>
        </div>
        <div className="rounded-xl overflow-hidden border border-slate-600">
          <iframe
            src={REPORT_PDF}
            title="Income report PDF"
            className="w-full h-[75vh] bg-slate-200"
          />
        </div>
        <p className="text-slate-500 text-xs text-center">
          If the preview does not load, use the buttons above —{" "}
          <a
            href={REPORT_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 underline"
          >
            open the PDF in a new tab
          </a>
          .
        </p>
      </div>
    </div>
  );
}
