import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../lib/auth";
import { getGenealogyTree } from "../../lib/server-actions";
import { formatCurrency } from "../../lib/store";
import { Users, TreePine, TrendingUp, Layers, RotateCcw, ZoomIn, ZoomOut, Plus, Minus } from "lucide-react";
import { cn } from "../../lib/utils";

export const Route = createFileRoute("/dashboard/genealogy")({ component: GenealogyPage });

interface TreeNode {
  id: string; name: string; investment: number; tier: string | null; depth: number; children: TreeNode[];
}

// ---- Tier-based avatar colors ----
const TIER_AVATAR: Record<string, string> = {
  Bronze: "bg-amber-500",
  Silver: "bg-slate-500",
  Gold: "bg-yellow-500",
  Platinum: "bg-violet-500",
  Diamond: "bg-blue-500",
};
function getAvatarColor(tier: string | null) {
  return tier && TIER_AVATAR[tier] ? TIER_AVATAR[tier] : "bg-sky-500";
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length >= 2 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  if (first && last) return (first + last).toUpperCase();
  return (first + (parts[0]?.[1] ?? "")).toUpperCase();
}

// ---- Animated expand/collapse wrapper ----
function TreeBranch({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | "auto">(0);
  const [show, setShow] = useState(open);

  useEffect(() => { if (open) setShow(true); }, [open]);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      setH(0);
      requestAnimationFrame(() => {
        setH(ref.current?.scrollHeight ?? 0);
        setTimeout(() => setH("auto"), 400);
      });
    } else {
      setH(ref.current.scrollHeight);
      requestAnimationFrame(() => setH(0));
    }
  }, [open]);

  return (
    <div style={{ maxHeight: h === "auto" ? undefined : h + "px", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
      <div ref={ref}>{show && children}</div>
    </div>
  );
}

// ---- Org-chart card for a single node ----
function OrgCard({ node, expanded, onToggle }: {
  node: TreeNode; expanded: Set<string>; onToggle: (id: string) => void;
}) {
  const open = expanded.has(node.id);
  const hasKids = node.children.length > 0;
  const active = node.investment > 0;
  const isRoot = node.depth === 0;

  return (
    <div className="flex flex-col items-center">
      {/* The card */}
      <div
        onClick={() => onToggle(node.id)}
        className={cn(
          "relative w-[160px] sm:w-[180px] rounded-2xl border cursor-pointer select-none transition-all duration-300 group",
          "hover:shadow-xl hover:-translate-y-1 active:scale-[0.97]",
          isRoot
            ? "bg-white border-sky-200 shadow-lg shadow-sky-200/40 ring-2 ring-sky-100"
            : "bg-white border-slate-200 shadow-md hover:border-sky-300 hover:shadow-sky-100/40"
        )}
      >
        {/* Sponsored ribbon */}
        {node.tier && (
          <div className="absolute -top-1 -right-1 z-10">
            <div className="bg-red-500 text-white text-[7px] font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-xl shadow-sm rotate-0">
              {node.tier}
            </div>
          </div>
        )}

        <div className="p-3 flex flex-col items-center text-center">
          {/* Avatar circle with initials + status dot */}
          <div className="relative mb-2">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-transform duration-300 group-hover:scale-110",
              active ? getAvatarColor(node.tier) : "bg-slate-300"
            )}>
              {getInitials(node.name)}
              {active && <div className="absolute inset-0 rounded-full ring-2 ring-emerald-300/50 animate-ping opacity-30" />}
            </div>
            {/* Green/Red status dot */}
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm",
              active ? "bg-emerald-500" : "bg-red-500"
            )} />
          </div>

          {/* Name */}
          <p className="font-bold text-xs text-slate-800 leading-tight truncate w-full">{node.name}</p>

          {/* ID */}
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{node.id}</p>

          {/* Active / Inactive + Level */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={cn(
              "text-[9px] font-semibold px-2 py-0.5 rounded-full",
              active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
            )}>
              {active ? "Active" : "Inactive"}
            </span>
            <span className="text-[9px] text-slate-400 font-medium">Lvl {node.depth}</span>
          </div>

          {/* Investment & Income row */}
          <div className="flex items-center justify-between w-full mt-2 pt-2 border-t border-slate-100">
            <div className="flex-1 text-center">
              <p className="text-[8px] text-slate-400 uppercase font-semibold tracking-wider">Investment</p>
              <p className={cn("text-[11px] font-bold", active ? "text-sky-600" : "text-slate-400")}>{formatCurrency(node.investment)}</p>
            </div>
          </div>
        </div>

        {/* Expand/collapse button at bottom center */}
        {hasKids && (
          <div
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10"
            onClick={(e) => { e.stopPropagation(); onToggle(node.id); }}
          >
            <div className={cn(
              "w-6 h-6 rounded-full border-2 flex items-center justify-center shadow-md transition-all duration-300",
              open
                ? "bg-sky-500 border-sky-500 text-white"
                : "bg-white border-slate-300 text-slate-500 hover:border-sky-400 hover:text-sky-500"
            )}>
              {open ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            </div>
          </div>
        )}
      </div>

      {/* Children connector lines + subtree */}
      {hasKids && (
        <TreeBranch open={open}>
          <div className="flex flex-col items-center pt-4">
            {/* Vertical line down from parent */}
            <div className="w-[2px] h-4 bg-slate-300" />

            {/* Horizontal connector bar */}
            {node.children.length > 1 && (
              <div className="relative w-full">
                <div className="absolute top-0 left-1/2 right-auto h-[2px] bg-slate-300"
                  style={{
                    width: `calc(100% - ${100 / node.children.length}%)`,
                    left: `${50 / node.children.length}%`,
                  }}
                />
              </div>
            )}

            {/* Children cards */}
            <div className="flex items-start justify-center gap-3 sm:gap-5 pt-0 flex-wrap">
              {node.children.map((child) => (
                <div key={child.id} className="flex flex-col items-center relative pt-0">
                  {/* Vertical line from horizontal bar down to card */}
                  <div className="w-[2px] h-4 bg-slate-300" />
                  {/* Dot at junction */}
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300 ring-2 ring-white -mt-[5px] z-[1]" />

                  {/* Recursive child */}
                  <div className="pt-1">
                    <OrgCard node={child} expanded={expanded} onToggle={onToggle} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TreeBranch>
      )}
    </div>
  );
}

// ---- Stats ----
function TreeStats({ tree }: { tree: TreeNode | null }) {
  if (!tree) return null;
  let members = 0, active = 0, invest = 0, depth = 0;
  (function walk(n: TreeNode) { if (n.depth > 0) members++; if (n.investment > 0) { active++; invest += n.investment; } if (n.depth > depth) depth = n.depth; n.children.forEach(walk); })(tree);
  const s = [
    { l: "Members", v: members, i: Users, c: "text-sky-600", bg: "from-sky-50 to-blue-50", bd: "border-sky-200/60" },
    { l: "Active", v: active, i: TrendingUp, c: "text-emerald-600", bg: "from-emerald-50 to-green-50/30", bd: "border-emerald-200/60" },
    { l: "Business", v: invest, i: TrendingUp, c: "text-amber-600", bg: "from-amber-50 to-orange-50/30", bd: "border-amber-200/60", cur: true },
    { l: "Depth", v: depth, i: Layers, c: "text-indigo-600", bg: "from-indigo-50 to-violet-50/30", bd: "border-indigo-200/60" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {s.map((x, i) => (
        <div key={x.l} className={cn("rounded-2xl border bg-gradient-to-br p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up", x.bg, x.bd)} style={{ animationDelay: i * 80 + "ms" }}>
          <div className={cn("flex items-center gap-1.5 mb-1", x.c)}><x.i className="h-3.5 w-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">{x.l}</span></div>
          <p className="text-2xl font-bold text-slate-800">{x.cur ? formatCurrency(x.v) : x.v.toLocaleString("en-IN")}</p>
        </div>
      ))}
    </div>
  );
}

// ---- Main page ----
function GenealogyPage() {
  const { user } = useAuth();
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getGenealogyTree({ data: { userId: user.id } })
      .then((r) => {
        setTree(r);
        if (r) {
          const init = new Set<string>([r.id]);
          r.children.forEach((c) => init.add(c.id));
          setExpanded(init);
        }
      })
      .catch((e) => { console.error(e); setError("Failed to load tree."); })
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = (id: string) => setExpanded((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const expandAll = () => { if (!tree) return; const a = new Set<string>(); (function c(n: TreeNode) { a.add(n.id); n.children.forEach(c); })(tree); setExpanded(a); };
  const collapseAll = () => { if (tree) setExpanded(new Set([tree.id])); };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/60 to-indigo-50/40 -m-6 p-6">
      <style dangerouslySetInnerHTML={{ __html: [
        "@keyframes fade-in-up { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }",
        ".animate-fade-in-up { animation: fade-in-up 0.4s ease-out both; }",
        "@keyframes fade-in-down { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform: translateY(0); } }",
        ".animate-fade-in-down { animation: fade-in-down 0.35s ease-out both; }",
      ].join("\n") }} />

      {/* Header */}
      <div className="animate-fade-in-down flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-lg shadow-sky-300/40">
            <TreePine className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Network Tree</h2>
            <p className="text-slate-500 text-sm mt-0.5">Click any node to expand its branches</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="px-4 py-2 text-xs font-semibold text-sky-700 bg-white border border-sky-200 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm">
            <ZoomIn className="h-3.5 w-3.5" /> Expand All
          </button>
          <button onClick={collapseAll} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm">
            <ZoomOut className="h-3.5 w-3.5" /> Collapse All
          </button>
        </div>
      </div>

      <TreeStats tree={tree} />

      {/* Tree container */}
      <div className="mt-5 bg-white/70 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/30 overflow-hidden">
        {error ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Users className="h-8 w-8 text-red-400" /></div>
            <p className="text-red-500 font-medium">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-3 text-sm text-sky-600 hover:underline flex items-center gap-1.5 mx-auto"><RotateCcw className="h-3.5 w-3.5" /> Try again</button>
          </div>
        ) : loading ? (
          <div className="p-8 flex justify-center">
            <div className="space-y-4 w-full max-w-md">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-sky-50 animate-pulse" style={{ animationDelay: i * 100 + "ms" }}>
                  <div className="w-12 h-12 rounded-full bg-sky-200" />
                  <div className="flex-1 space-y-2"><div className="h-3 bg-sky-200 rounded w-24" /><div className="h-4 bg-sky-200 rounded w-36" /></div>
                </div>
              ))}
            </div>
          </div>
        ) : !tree || tree.children.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-100 to-blue-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Users className="h-12 h-12 text-sky-300" />
            </div>
            <p className="text-slate-600 font-bold text-lg">No referrals yet</p>
            <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Share your invite link to start growing your tree</p>
          </div>
        ) : (
          <div className="overflow-x-auto p-6 sm:p-8">
            <div className="flex justify-center min-w-max">
              <OrgCard node={tree} expanded={expanded} onToggle={toggle} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
