import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { getGenealogyTree } from "../../lib/server-actions";
import { formatCurrency } from "../../lib/store";
import { ChevronDown, User as UserIcon, Users, TreePine, TrendingUp, Layers, Sparkles, RotateCcw, ZoomIn, ZoomOut, Minus } from "lucide-react";
import { cn } from "../../lib/utils";

export const Route = createFileRoute("/dashboard/genealogy")({ component: GenealogyPage });

interface TreeNode {
  id: string; name: string; investment: number; tier: string | null; depth: number; children: TreeNode[];
}

const TIER_STYLES: Record<string, { gradient: string; badge: string }> = {
  Bronze: { gradient: "from-amber-400 to-orange-400", badge: "bg-amber-50 text-amber-600 border-amber-200" },
  Silver: { gradient: "from-slate-400 to-slate-500", badge: "bg-slate-50 text-slate-600 border-slate-300" },
  Gold: { gradient: "from-yellow-400 to-amber-500", badge: "bg-yellow-50 text-yellow-600 border-yellow-300" },
  Platinum: { gradient: "from-violet-400 to-purple-400", badge: "bg-violet-50 text-violet-600 border-violet-200" },
  Diamond: { gradient: "from-cyan-400 to-blue-400", badge: "bg-cyan-50 text-cyan-600 border-cyan-200" },
};
function getTierStyle(tier: string | null) { return tier && TIER_STYLES[tier] ? TIER_STYLES[tier] : { gradient: "from-stone-400 to-stone-500", badge: "bg-stone-100 text-stone-600 border-stone-200" }; }

// ---- Animated expand wrapper ----
function TreeBranch({ open, count, children }: { open: boolean; count: number; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  const [show, setShow] = useState(open);

  useEffect(() => { if (open) setShow(true); }, [open]);

  useEffect(() => {
    if (!ref.current) return;
    if (open) {
      setH(ref.current.scrollHeight);
      const t = setTimeout(() => setH(0), 50);
      const t2 = setTimeout(() => setH(ref.current?.scrollHeight ?? 0), 60);
      const t3 = setTimeout(() => setH(0), 300);
      return () => { clearTimeout(t); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setH(0);
    }
  }, [open, show]);

  return (
    <div style={{ height: h === 0 ? "auto" : h + "px", overflow: "hidden" }}
      className="transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
      <div ref={ref}>{show && children}</div>
    </div>
  );
}

// ---- Single node with real tree lines ----
function TreeNode({ node, expanded, onToggle, siblingCount, siblingIndex }: {
  node: TreeNode; expanded: Set<string>; onToggle: (id: string) => void;
  siblingCount: number; siblingIndex: number;
}) {
  const open = expanded.has(node.id);
  const hasKids = node.children.length > 0;
  const active = node.investment > 0;
  const ts = getTierStyle(node.tier);
  const isRoot = node.depth === 0;
  const isLast = siblingIndex === siblingCount - 1;

  return (
    <div className="relative pl-0">
      {/* Vertical trunk line from parent (not for root) */}
      {!isRoot && (
        <div className="absolute left-4 top-0 h-full" style={{ width: "2px" }}>
          <div className={cn("w-full h-full", isLast ? "bg-gradient-to-b from-stone-300 via-stone-300 to-transparent" : "bg-stone-300")} />
        </div>
      )}

      {/* Horizontal branch + node card */}
      <div className="relative flex items-stretch">
        {/* Horizontal connector line */}
        {!isRoot && (
          <div className="relative flex-shrink-0" style={{ width: "40px" }}>
            <div className="absolute top-7 left-4 w-[calc(100%-16px)] h-[2px] bg-stone-300" />
            <div className="absolute top-[26px] left-4 w-2 h-2 rounded-full bg-stone-300 ring-2 ring-white -ml-0.5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* The clickable card */}
          <div
            onClick={() => onToggle(node.id)}
            className={cn(
              "relative flex items-center gap-3 p-3 rounded-2xl border cursor-pointer select-none transition-all duration-300",
              "hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]",
              isRoot
                ? "bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-50 border-amber-200 shadow-lg shadow-amber-500/10 ring-1 ring-amber-100/60"
                : active
                  ? "bg-white border-amber-200/50 hover:border-amber-300 hover:shadow-amber-500/15 shadow-md"
                  : "bg-white/80 border-stone-200/50 hover:border-stone-300 hover:shadow-stone-200/30 shadow-sm"
            )}
          >
            {/* Expand/collapse button */}
            <div className={cn(
              "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
              hasKids ? (
                open
                  ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md shadow-amber-300/30 rotate-0"
                  : "bg-stone-100 text-stone-400 group-hover:bg-amber-50 group-hover:text-amber-500 hover:rotate-90"
              ) : "bg-stone-50 text-stone-300"
            )}>
              {hasKids ? (
                <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", !open && "-rotate-90")} />
              ) : (
                <Minus className="h-3 w-3" />
              )}
            </div>

            {/* Avatar */}
            <div className={cn(
              "relative w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500",
              "hover:scale-110 hover:rotate-3",
              isRoot
                ? "bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 text-white ring-3 ring-amber-200 shadow-lg shadow-amber-300/40"
                : active
                  ? cn("bg-gradient-to-br text-white shadow-lg", ts.gradient, "ring-2 ring-white shadow-black/10")
                  : "bg-gradient-to-br from-stone-100 to-stone-200 text-stone-400 ring-2 ring-white"
            )}>
              {isRoot ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
              {/* Active glow ring */}
              {active && (
                <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-300/50 animate-ping opacity-20" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">{node.id}</span>
                {isRoot && <Badge variant="outline" className="text-[9px] border-amber-300 text-amber-700 bg-amber-100/50">You</Badge>}
                {node.tier && <Badge variant="outline" className={cn("text-[9px]", ts.badge)}>{node.tier}</Badge>}
              </div>
              <p className="font-bold text-sm text-stone-800 mt-0.5 truncate">{node.name}</p>
              <div className="flex items-center gap-2 mt-1">
                {active ? (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <TrendingUp className="h-3 w-3" />{formatCurrency(node.investment)}
                  </span>
                ) : <span className="text-[11px] text-stone-400 italic">No investment</span>}
                {hasKids && (
                  <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-full">
                    <Users className="h-3 w-3" />{node.children.length} direct
                  </span>
                )}
              </div>
            </div>

            {/* Status dot */}
            <div className="relative flex-shrink-0 w-3 h-3">
              <div className={cn("w-3 h-3 rounded-full", active ? "bg-emerald-400 shadow-sm shadow-emerald-300" : "bg-stone-300")} />
              {active && <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-400 animate-ping opacity-40" />}
            </div>
          </div>

          {/* Children branches - animate open */}
          <TreeBranch open={open && hasKids} count={node.children.length}>
            <div className="relative mt-1 ml-4 pb-1">
              {/* Vertical trunk for children */}
              <div className="absolute left-0 top-0 bottom-2 w-[2px] bg-gradient-to-b from-stone-300 via-stone-200 to-stone-100 rounded-full" />

              {node.children.map((child, i) => (
                <div
                  key={child.id}
                  className="tree-child-animate"
                  style={{
                    animationDelay: (i * 80) + "ms",
                    "--branch-index": i,
                  } as React.CSSProperties}
                >
                  {/* Horizontal connector from trunk to child */}
                  <div className="relative h-0" style={{ top: "28px" }}>
                    <div className="absolute left-0 w-6 h-[2px] bg-stone-300" />
                    <div className="absolute left-[22px] w-2 h-2 rounded-full bg-stone-300 -mt-[3px] ring-2 ring-white" />
                  </div>
                  <div className="ml-6">
                    <TreeNode
                      node={child}
                      expanded={expanded}
                      onToggle={onToggle}
                      siblingCount={node.children.length}
                      siblingIndex={i}
                    />
                  </div>
                </div>
              ))}
            </div>
          </TreeBranch>
        </div>
      </div>
    </div>
  );
}

// ---- Stats ----
function TreeStats({ tree }: { tree: TreeNode | null }) {
  if (!tree) return null;
  let members = 0, active = 0, invest = 0, depth = 0;
  (function walk(n: TreeNode) { members++; if (n.investment > 0) { active++; invest += n.investment; } if (n.depth > depth) depth = n.depth; n.children.forEach(walk); })(tree);
  const s = [
    { l: "Members", v: members, i: Users, c: "text-stone-500", bg: "from-stone-50 to-stone-100/50", bd: "border-stone-200/60" },
    { l: "Active", v: active, i: TrendingUp, c: "text-emerald-500", bg: "from-emerald-50 to-green-50/30", bd: "border-emerald-200/60" },
    { l: "Business", v: invest, i: TrendingUp, c: "text-amber-500", bg: "from-amber-50 to-orange-50/30", bd: "border-amber-200/60", cur: true },
    { l: "Depth", v: depth, i: Layers, c: "text-blue-500", bg: "from-blue-50 to-indigo-50/30", bd: "border-blue-200/60" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {s.map((x, i) => (
        <div key={x.l} className={cn("rounded-2xl border bg-gradient-to-br p-4 transition-all hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up", x.bg, x.bd)} style={{ animationDelay: i * 80 + "ms" }}>
          <div className={cn("flex items-center gap-1.5 mb-1", x.c)}><x.i className="h-3.5 w-3.5" /><span className="text-[10px] font-semibold uppercase tracking-wider">{x.l}</span></div>
          <p className="text-2xl font-bold text-stone-800">{x.cur ? formatCurrency(x.v) : x.v.toLocaleString("en-IN")}</p>
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
    <div className="space-y-6">
      <style dangerouslySetInnerHTML={{ __html: [
        "@keyframes branch-grow { from { opacity:0; transform: translateY(-12px) scaleY(0.6); } to { opacity:1; transform: translateY(0) scaleY(1); } }",
        ".tree-child-animate { animation: branch-grow 0.45s cubic-bezier(0.34,1.56,0.64,1) both; transform-origin: top left; }",
        "@keyframes node-pop { from { opacity:0; transform: scale(0.7); } to { opacity:1; transform: scale(1); } }",
        ".tree-child-animate > div:last-child > div { animation: node-pop 0.35s cubic-bezier(0.34,1.56,0.64,1) both; }",
        "@keyframes line-draw { from { width: 0; } to { width: 24px; } }",
      ].join("\n") }} />

      <div className="animate-fade-in-down flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-200/50 animate-float">
            <TreePine className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800">Downline Tree</h2>
            <p className="text-stone-500 text-sm mt-0.5">Click any node to expand its branches</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="px-4 py-2 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm">
            <ZoomIn className="h-3.5 w-3.5" /> Expand All
          </button>
          <button onClick={collapseAll} className="px-4 py-2 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-400 transition-all active:scale-95 flex items-center gap-1.5 shadow-sm">
            <ZoomOut className="h-3.5 w-3.5" /> Collapse All
          </button>
        </div>
      </div>

      <TreeStats tree={tree} />

      <Card className="animate-fade-in-up stagger-2 border-0 shadow-xl bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-100/80 bg-gradient-to-r from-stone-50/50 to-transparent">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-sm shadow-amber-200" />
              <span className="text-stone-700">{user.name} <span className="text-stone-400 font-normal">({user.id})</span></span>
            </div>
            {tree && <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600 bg-amber-50">{expanded.size} branches open</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4"><Users className="h-8 w-8 text-red-400" /></div>
              <p className="text-red-500 font-medium">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-3 text-sm text-amber-600 hover:underline flex items-center gap-1.5 mx-auto"><RotateCcw className="h-3.5 w-3.5" /> Try again</button>
            </div>
          ) : loading ? (
            <div className="space-y-4">{[1,2,3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-stone-50 animate-pulse" style={{ animationDelay: i * 100 + "ms" }}>
                <div className="w-9 h-9 rounded-xl bg-stone-200" /><div className="w-12 h-12 rounded-2xl bg-stone-200" />
                <div className="flex-1 space-y-2"><div className="h-3 bg-stone-200 rounded w-24" /><div className="h-4 bg-stone-200 rounded w-36" /></div>
              </div>
            ))}</div>
          ) : !tree || tree.children.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center mx-auto mb-5 shadow-inner animate-float">
                <Users className="h-12 w-12 text-stone-300" />
              </div>
              <p className="text-stone-600 font-bold text-lg">No referrals yet</p>
              <p className="text-sm text-stone-400 mt-1 max-w-xs mx-auto">Share your invite link to start growing your tree</p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin">
              <TreeNode node={tree} expanded={expanded} onToggle={toggle} siblingCount={1} siblingIndex={0} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}