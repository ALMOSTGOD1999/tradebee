import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { getGenealogyTree } from "../../lib/server-actions";
import { formatCurrency } from "../../lib/store";
import { ChevronDown, User as UserIcon, Users, TreePine, TrendingUp, Layers, Sparkles, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "../../lib/utils";

export const Route = createFileRoute("/dashboard/genealogy")({ component: GenealogyPage });

interface TreeNode {
  id: string;
  name: string;
  investment: number;
  tier: string | null;
  depth: number;
  children: TreeNode[];
}

const TIER_STYLES: Record<string, { gradient: string; ring: string; badge: string }> = {
  Starter: { gradient: "from-stone-400 to-stone-500", ring: "ring-stone-200", badge: "bg-stone-100 text-stone-600 border-stone-200" },
  Bronze: { gradient: "from-amber-400 to-orange-400", ring: "ring-amber-200", badge: "bg-amber-50 text-amber-600 border-amber-200" },
  Silver: { gradient: "from-slate-400 to-slate-500", ring: "ring-slate-200", badge: "bg-slate-50 text-slate-600 border-slate-300" },
  Gold: { gradient: "from-yellow-400 to-amber-500", ring: "ring-yellow-200", badge: "bg-yellow-50 text-yellow-600 border-yellow-300" },
  Platinum: { gradient: "from-violet-400 to-purple-400", ring: "ring-violet-200", badge: "bg-violet-50 text-violet-600 border-violet-200" },
  Diamond: { gradient: "from-cyan-400 to-blue-400", ring: "ring-cyan-200", badge: "bg-cyan-50 text-cyan-600 border-cyan-200" },
};

function getTierStyle(tier: string | null) {
  if (!tier) return TIER_STYLES.Starter;
  return TIER_STYLES[tier] ?? TIER_STYLES.Starter;
}

// --- Animated expand/collapse wrapper ---
function AnimatedExpand({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | "auto">(open ? "auto" : 0);
  const [render, setRender] = useState(open);
  const [measuring, setMeasuring] = useState(false);

  useEffect(() => {
    if (open) setRender(true);
  }, [open]);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      setMeasuring(true);
      const h0 = ref.current.scrollHeight;
      setH(h0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setH("auto");
          setMeasuring(false);
        });
      });
    } else {
      const h0 = ref.current.scrollHeight;
      setH(h0);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setH(0);
        });
      });
    }
  }, [open]);

  const onEnd = useCallback(() => {
    if (!open) setRender(false);
  }, [open]);

  return (
    <div
      style={{ height: h === "auto" ? "auto" : h + "px", overflow: "hidden" }}
      className="transition-[height] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
      onTransitionEnd={onEnd}
    >
      <div ref={ref}>{render && children}</div>
    </div>
  );
}

// --- Single tree node ---
function TreeNodeCard({ node, expanded, onToggle, depth, isLast }: {
  node: TreeNode; expanded: Set<string>; onToggle: (id: string) => void; depth: number; isLast: boolean;
}) {
  const open = expanded.has(node.id);
  const hasKids = node.children.length > 0;
  const active = node.investment > 0;
  const ts = getTierStyle(node.tier);
  const isRoot = depth === 0;

  return (
    <div className="relative">
      {/* Vertical connector from parent */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 w-px h-full">
          <div className={cn("w-px h-full", isLast ? "bg-gradient-to-b from-stone-300 to-transparent" : "bg-stone-200")} />
        </div>
      )}

      {/* Horizontal connector + node */}
      <div className="relative flex items-start gap-0">
        {/* Horizontal branch line */}
        {depth > 0 && (
          <div className="flex-shrink-0 flex items-start pt-5">
            <div className="w-6 h-px bg-stone-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-stone-300 -ml-px mt-[-2.5px] ring-2 ring-white" />
          </div>
        )}

        {/* The card itself */}
        <div className={cn("flex-1 min-w-0", depth > 0 && "ml-0")}>
          <div
            className={cn(
              "relative flex items-start gap-3 p-3 rounded-2xl border cursor-pointer group transition-all duration-300",
              "hover:shadow-lg active:scale-[0.98]",
              isRoot
                ? "bg-gradient-to-r from-amber-50 via-orange-50/30 to-amber-50 border-amber-200 shadow-amber-500/10 shadow-md ring-1 ring-amber-100/50"
                : active
                  ? "bg-white border-amber-100/60 hover:border-amber-200 hover:shadow-amber-500/10"
                  : "bg-white/70 border-stone-200/60 hover:border-stone-300 hover:shadow-stone-200/30"
            )}
            onClick={() => onToggle(node.id)}
          >
            {/* Expand button */}
            <div
              className={cn(
                "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 mt-0.5",
                hasKids
                  ? open
                    ? "bg-amber-100 text-amber-600 rotate-0 shadow-sm shadow-amber-100"
                    : "bg-stone-100 text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-500"
                  : "bg-stone-50 text-stone-300"
              )}
            >
              {hasKids ? (
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", !open && "-rotate-90")} />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              )}
            </div>

            {/* Avatar */}
            <div className={cn(
              "w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
              "group-hover:scale-110 group-hover:shadow-lg",
              isRoot
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-2 ring-amber-200 shadow-amber-200/50 shadow-md"
                : active
                  ? cn("bg-gradient-to-br text-white shadow-md", ts.gradient, ts.ring, "ring-2")
                  : "bg-gradient-to-br from-stone-100 to-stone-200 text-stone-400"
            )}>
              {isRoot ? <Sparkles className="h-5 w-5" /> : <UserIcon className="h-5 w-5" />}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100 group-hover:bg-amber-100 transition-colors">{node.id}</span>
                {isRoot && <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-600 bg-amber-50 animate-pulse">You</Badge>}
                {node.tier && <Badge variant="outline" className={cn("text-[9px]", ts.badge)}>{node.tier}</Badge>}
              </div>
              <p className="font-semibold text-sm text-stone-800 mt-0.5 truncate group-hover:text-amber-700 transition-colors">{node.name}</p>
              <div className="flex items-center gap-2 mt-1.5">
                {active ? (
                  <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="h-3 w-3" />{formatCurrency(node.investment)}
                  </span>
                ) : (
                  <span className="text-[11px] text-stone-400 italic">No investment</span>
                )}
                {hasKids && (
                  <span className="text-[11px] text-stone-500 flex items-center gap-1 bg-stone-50 px-2 py-0.5 rounded-full">
                    <Users className="h-3 w-3" />{node.children.length}
                  </span>
                )}
              </div>
            </div>

            {/* Status dot */}
            <div className="flex-shrink-0 mt-3 mr-1">
              <div className="relative">
                <div className={cn("w-2.5 h-2.5 rounded-full transition-colors", active ? "bg-emerald-400 shadow-sm shadow-emerald-200" : "bg-stone-300")} />
                {active && <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping opacity-30" />}
              </div>
            </div>
          </div>

          {/* Children */}
          <AnimatedExpand open={open && hasKids}>
            <div className="relative pl-6 sm:pl-8 mt-1 pb-1">
              {node.children.map((child, i) => (
                <div key={child.id} className="animate-fade-in-up" style={{ animationDelay: i * 40 + "ms" }}>
                  <TreeNodeCard
                    node={child}
                    expanded={expanded}
                    onToggle={onToggle}
                    depth={depth + 1}
                    isLast={i === node.children.length - 1}
                  />
                </div>
              ))}
            </div>
          </AnimatedExpand>
        </div>
      </div>
    </div>
  );
}

// --- Stats ---
function TreeStats({ tree }: { tree: TreeNode | null }) {
  if (!tree) return null;
  let members = 0, active = 0, invest = 0, depth = 0;
  function walk(n: TreeNode) {
    members++;
    if (n.investment > 0) { active++; invest += n.investment; }
    if (n.depth > depth) depth = n.depth;
    n.children.forEach(walk);
  }
  walk(tree);

  const s = [
    { label: "Members", value: members, icon: Users, color: "text-stone-500", bg: "bg-stone-50", border: "border-stone-200/60" },
    { label: "Active Investors", value: active, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200/60" },
    { label: "Business", value: invest, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200/60", currency: true },
    { label: "Max Depth", value: depth, icon: Layers, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200/60" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {s.map((item, i) => (
        <div key={item.label} className={cn("rounded-xl border p-3 sm:p-4 transition-all hover:shadow-md hover:scale-[1.02] animate-fade-in-up", item.bg, item.border)} style={{ animationDelay: i * 60 + "ms" }}>
          <div className={cn("flex items-center gap-1.5 mb-1", item.color)}>
            <item.icon className="h-3.5 w-3.5" />
            <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-800">
            {item.currency ? formatCurrency(item.value) : item.value.toLocaleString("en-IN")}
          </p>
        </div>
      ))}
    </div>
  );
}

// --- Main ---
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
      .then((result) => {
        setTree(result);
        if (result) {
          const init = new Set<string>();
          init.add(result.id);
          result.children.forEach((c) => init.add(c.id));
          setExpanded(init);
        }
      })
      .catch((e) => { console.error(e); setError("Failed to load tree."); })
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = (id: string) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const expandAll = () => {
    if (!tree) return;
    const all = new Set<string>();
    (function collect(n: TreeNode) { all.add(n.id); n.children.forEach(collect); })(tree);
    setExpanded(all);
  };

  const collapseAll = () => { if (tree) setExpanded(new Set([tree.id])); };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: [
        "@keyframes tree-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(251,191,36,0); } 50% { box-shadow: 0 0 16px 4px rgba(251,191,36,0.12); } }",
        ".animate-tree-glow { animation: tree-glow 3s ease-in-out infinite; }",
        "@keyframes pulse-dot { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.4); opacity:0.5; } }",
      ].join("\n") }} />

      {/* Header */}
      <div className="animate-fade-in-down flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-200/50">
            <TreePine className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800">Downline Tree</h2>
            <p className="text-stone-500 text-sm mt-0.5">Your network hierarchy</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm">
            <ZoomIn className="h-3.5 w-3.5" /> Expand
          </button>
          <button onClick={collapseAll} className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-400 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm">
            <ZoomOut className="h-3.5 w-3.5" /> Collapse
          </button>
        </div>
      </div>

      <TreeStats tree={tree} />

      <Card className="animate-fade-in-up stagger-2 border-0 shadow-lg bg-white overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-100">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-sm shadow-amber-200" />
              <span>{user.name} <span className="text-stone-400 font-normal">({user.id})</span></span>
            </div>
            {tree && <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600 bg-amber-50">{expanded.size} open</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-5">
          {error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Users className="h-8 w-8 text-red-400" /></div>
              <p className="text-red-500 font-medium">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-3 text-sm text-amber-600 hover:underline flex items-center gap-1.5 mx-auto"><RotateCcw className="h-3.5 w-3.5" /> Try again</button>
            </div>
          ) : loading ? (
            <div className="space-y-3">{[1,2,3,4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 animate-pulse" style={{ animationDelay: i * 80 + "ms" }}>
                <div className="w-8 h-8 rounded-xl bg-stone-200" /><div className="w-11 h-11 rounded-2xl bg-stone-200" />
                <div className="flex-1 space-y-2"><div className="h-3 bg-stone-200 rounded w-20" /><div className="h-4 bg-stone-200 rounded w-32" /></div>
              </div>
            ))}</div>
          ) : !tree || tree.children.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center mx-auto mb-4 shadow-inner animate-float"><Users className="h-10 w-10 text-stone-300" /></div>
              <p className="text-stone-600 font-semibold">No referrals yet</p>
              <p className="text-sm text-stone-400 mt-1">Share your invite link to start building your tree</p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto pr-1">
              <TreeNodeCard node={tree} expanded={expanded} onToggle={toggle} depth={0} isLast={true} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}