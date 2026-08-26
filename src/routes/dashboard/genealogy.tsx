import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { getGenealogyTree } from "../../lib/server-actions";
import { formatCurrency } from "../../lib/store";
import {
  ChevronDown,
  ChevronRight,
  User as UserIcon,
  Users,
  TreePine,
  TrendingUp,
  Layers,
  Sparkles,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { cn } from "../../lib/utils";

export const Route = createFileRoute("/dashboard/genealogy")({
  component: GenealogyPage,
});

interface TreeNode {
  id: string;
  name: string;
  investment: number;
  tier: string | null;
  depth: number;
  children: TreeNode[];
}

// ─── Tier Colors ─────────────────────────────────────────────────────────────

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; glow: string; avatar: string }> = {
  Starter: { bg: "bg-stone-50", text: "text-stone-600", border: "border-stone-200", glow: "shadow-stone-100", avatar: "from-stone-300 to-stone-400" },
  Bronze: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", glow: "shadow-amber-100", avatar: "from-amber-400 to-orange-400" },
  Silver: { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-300", glow: "shadow-slate-200", avatar: "from-slate-400 to-slate-500" },
  Gold: { bg: "bg-yellow-50", text: "text-yellow-600", border: "border-yellow-300", glow: "shadow-yellow-200", avatar: "from-yellow-400 to-amber-500" },
  Platinum: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", glow: "shadow-violet-100", avatar: "from-violet-400 to-purple-400" },
  Diamond: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200", glow: "shadow-cyan-100", avatar: "from-cyan-400 to-blue-400" },
};

const DEFAULT_TIER = { bg: "bg-stone-50", text: "text-stone-600", border: "border-stone-200", glow: "shadow-stone-100", avatar: "from-stone-300 to-stone-400" };

function getTierColor(tier: string | null) {
  if (!tier) return DEFAULT_TIER;
  return TIER_COLORS[tier] ?? DEFAULT_TIER;
}

// ─── Animated Height Wrapper ─────────────────────────────────────────────────

function AnimatedHeight({ open, children }: { open: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [shouldRender, setShouldRender] = useState(open);

  useEffect(() => {
    if (open) {
      setShouldRender(true);
    }
  }, [open]);

  const onTransitionEnd = useCallback(() => {
    if (!open) setShouldRender(false);
  }, [open]);

  useEffect(() => {
    if (ref.current) {
      if (open) {
        setHeight(ref.current.scrollHeight);
        const timer = setTimeout(() => setHeight(undefined), 300);
        return () => clearTimeout(timer);
      } else {
        setHeight(ref.current.scrollHeight);
        requestAnimationFrame(() => setHeight(0));
        return undefined;
      }
    }
    return undefined;
  }, [open, shouldRender]);

  return (
    <div
      style={{ height: height !== undefined ? `${height}px` : "auto" }}
      className="overflow-hidden transition-all duration-300 ease-in-out"
      onTransitionEnd={onTransitionEnd}
    >
      <div ref={ref}>{shouldRender && children}</div>
    </div>
  );
}

// ─── Recursive Tree Node Component ───────────────────────────────────────────

function TreeNodeCard({
  node,
  expandedIds,
  onToggle,
  depth,
}: {
  node: TreeNode;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  depth: number;
}) {
  const hasChildren = node.children.length > 0;
  const isActive = node.investment > 0;
  const isExpanded = expandedIds.has(node.id);
  const tier = getTierColor(node.tier);
  const isRoot = depth === 0;

  return (
    <div className={cn("relative", depth > 0 && "mt-1.5")}>
      {/* Connecting line from parent */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px">
          <div className="absolute left-0 top-5 w-5 h-px bg-gradient-to-r from-stone-300 to-transparent" />
        </div>
      )}

      {/* Node Card */}
      <div
        className={cn(
          "relative flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-300 cursor-pointer group",
          "hover:scale-[1.01] hover:shadow-lg active:scale-[0.99]",
          isActive
            ? cn("bg-gradient-to-r from-amber-50/80 to-orange-50/50 border-amber-200/60 hover:border-amber-300", tier.glow, "hover:shadow-xl")
            : "bg-white/60 border-stone-200/60 hover:border-stone-300 hover:shadow-md",
          isRoot && "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50/30 shadow-md ring-1 ring-amber-100/50",
          isActive && "animate-node-glow"
        )}
        onClick={() => onToggle(node.id)}
      >
        {/* Expand/Collapse Chevron */}
        <div className="flex-shrink-0 mt-1">
          {hasChildren ? (
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300",
                isExpanded
                  ? "bg-amber-100 text-amber-600 rotate-0"
                  : "bg-stone-100 text-stone-500 group-hover:bg-amber-50 group-hover:text-amber-500"
              )}
            >
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  !isExpanded && "-rotate-90"
                )}
              />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-stone-50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-300 group-hover:bg-amber-400 transition-colors" />
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div
          className={cn(
            "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all duration-300",
            "group-hover:shadow-md group-hover:scale-110",
            isRoot
              ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white ring-2 ring-amber-200"
              : isActive
                ? cn("bg-gradient-to-br text-white", tier.avatar)
                : "bg-gradient-to-br from-stone-100 to-stone-200 text-stone-500"
          )}
        >
          {isRoot ? (
            <Sparkles className="h-5 w-5" />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="font-mono text-[10px] sm:text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 transition-colors group-hover:bg-amber-100">
              {node.id}
            </span>
            {isRoot && (
              <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-600 bg-amber-50 animate-pulse-subtle">
                You
              </Badge>
            )}
            {node.tier && (
              <Badge
                variant="outline"
                className={cn("text-[10px]", tier.border, tier.text, tier.bg)}
              >
                {node.tier}
              </Badge>
            )}
          </div>
          <p className="font-semibold text-sm text-stone-800 mt-0.5 truncate group-hover:text-amber-700 transition-colors">
            {node.name}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 mt-1">
            {node.investment > 0 ? (
              <span className="text-xs font-medium text-green-600 flex items-center gap-1 bg-green-50 px-1.5 py-0.5 rounded-md">
                <TrendingUp className="h-3 w-3" />
                {formatCurrency(node.investment)}
              </span>
            ) : (
              <span className="text-xs text-stone-400 italic">No investment</span>
            )}
            {hasChildren && (
              <span className="text-xs text-stone-500 flex items-center gap-1 bg-stone-50 px-1.5 py-0.5 rounded-md">
                <Users className="h-3 w-3" />
                {node.children.length}
              </span>
            )}
          </div>
        </div>

        {/* Active Pulse */}
        <div className="flex-shrink-0 mt-2">
          <div className="relative">
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full transition-all duration-300",
                isActive ? "bg-green-400 shadow-sm shadow-green-200" : "bg-stone-300 group-hover:bg-stone-400"
              )}
            />
            {isActive && (
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400 animate-ping opacity-30" />
            )}
          </div>
        </div>
      </div>

      {/* Children with animation */}
      <AnimatedHeight open={isExpanded && hasChildren}>
        <div className="relative ml-4 sm:ml-6 mt-1 pl-4 sm:pl-5 border-l-2 border-dashed border-stone-200/80">
          {/* Animated connector dots */}
          <div className="absolute left-[-5px] top-3 w-2 h-2 rounded-full bg-stone-200" />
          {node.children.map((child, idx) => (
            <div
              key={child.id}
              className="animate-tree-node-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <TreeNodeCard
                node={child}
                expandedIds={expandedIds}
                onToggle={onToggle}
                depth={depth + 1}
              />
            </div>
          ))}
        </div>
      </AnimatedHeight>
    </div>
  );
}

// ─── Stats Component ─────────────────────────────────────────────────────────

function AnimatedCounter({ value, prefix = "" }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const duration = 600;
    const startTime = performance.now();
    let animFrame: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + diff * eased));
      if (progress < 1) {
        animFrame = requestAnimationFrame(tick);
      }
    }

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN")}
    </span>
  );
}

function TreeStats({ tree }: { tree: TreeNode | null }) {
  if (!tree) return null;

  let totalMembers = 0;
  let activeInvestors = 0;
  let totalInvestment = 0;
  let maxDepth = 0;

  function traverse(node: TreeNode) {
    totalMembers++;
    if (node.investment > 0) {
      activeInvestors++;
      totalInvestment += node.investment;
    }
    if (node.depth > maxDepth) maxDepth = node.depth;
    node.children.forEach(traverse);
  }
  traverse(tree);

  const stats = [
    { label: "Total Members", value: totalMembers, icon: Users, color: "text-stone-500", bgColor: "from-stone-50 to-stone-100/50", borderColor: "border-stone-200/60" },
    { label: "Active Investors", value: activeInvestors, icon: TrendingUp, color: "text-green-500", bgColor: "from-green-50/50 to-emerald-50/30", borderColor: "border-green-200/60" },
    { label: "Total Business", value: totalInvestment, icon: TrendingUp, color: "text-amber-500", bgColor: "from-amber-50/50 to-orange-50/30", borderColor: "border-amber-200/60", format: "currency" as const },
    { label: "Max Depth", value: maxDepth, icon: Layers, color: "text-blue-500", bgColor: "from-blue-50/50 to-indigo-50/30", borderColor: "border-blue-200/60" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={cn(
            "bg-gradient-to-br backdrop-blur-sm rounded-xl border p-3 sm:p-4 transition-all duration-300 hover:shadow-md hover:scale-[1.02] animate-stat-in",
            stat.bgColor,
            stat.borderColor
          )}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className={cn("flex items-center gap-1.5 sm:gap-2 mb-1.5", stat.color)}>
            <stat.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs font-medium">{stat.label}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-800">
            {stat.format === "currency" ? (
              stat.value >= 100000 ? (
                <AnimatedCounter value={Math.round(stat.value / 1000)} prefix="" /> 
              ) : (
                <AnimatedCounter value={stat.value} />
              )
            ) : (
              <AnimatedCounter value={stat.value} />
            )}
            {stat.format === "currency" && stat.value >= 100000 && (
              <span className="text-base sm:text-lg ml-0.5">K</span>
            )}
          </p>
          {stat.format === "currency" && stat.value >= 100000 && (
            <p className="text-[10px] text-stone-400 mt-0.5">
              {formatCurrency(stat.value)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function GenealogyPage() {
  const { user } = useAuth();
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    getGenealogyTree({ data: { userId: user.id } })
      .then((result) => {
        setTree(result);
        if (result) {
          const initial = new Set<string>();
          initial.add(result.id);
          result.children.forEach((c) => {
            initial.add(c.id);
          });
          setExpandedIds(initial);
        }
      })
      .catch((e) => {
        console.error("Failed to load genealogy tree:", e);
        setError("Failed to load genealogy tree. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const toggleNode = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (!tree) return;
    const allIds = new Set<string>();
    function collect(node: TreeNode) {
      allIds.add(node.id);
      node.children.forEach(collect);
    }
    collect(tree);
    setExpandedIds(allIds);
  };

  const collapseAll = () => {
    if (!tree) return;
    setExpandedIds(new Set([tree.id]));
  };

  if (!user) return null;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Inline keyframes */}
      <style>{`
        @keyframes tree-node-in {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes stat-in {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes node-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
          50% { box-shadow: 0 0 12px 2px rgba(251, 191, 36, 0.15); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .animate-tree-node-in { animation: tree-node-in 0.3s ease-out both; }
        .animate-stat-in { animation: stat-in 0.4s ease-out both; }
        .animate-node-glow { animation: node-glow 2s ease-in-out infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 2s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="animate-fade-in-down flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800 flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-200/50">
              <TreePine className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            Downline Tree
          </h2>
          <p className="text-stone-500 mt-1 ml-[46px] sm:ml-[52px] text-sm">
            Your network hierarchy and referrals
          </p>
        </div>
        <div className="flex items-center gap-2 ml-[46px] sm:ml-0">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 transition-all duration-200 active:scale-95 flex items-center gap-1.5"
          >
            <ZoomIn className="h-3 w-3" />
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-400 transition-all duration-200 active:scale-95 flex items-center gap-1.5"
          >
            <ZoomOut className="h-3 w-3" />
            Collapse
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="animate-fade-in-up stagger-1">
        <TreeStats tree={tree} />
      </div>

      {/* Tree */}
      <Card className="animate-fade-in-up stagger-2 border-0 shadow-md bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-100">
          <CardTitle className="text-sm sm:text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-sm shadow-amber-200" />
              <span className="truncate">
                {user.name} <span className="text-stone-400 font-normal">({user.id})</span>
              </span>
            </div>
            {tree && (
              <Badge
                variant="outline"
                className="text-[10px] sm:text-xs border-amber-200 text-amber-600 bg-amber-50 tabular-nums"
              >
                {expandedIds.size} open
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-red-400" />
              </div>
              <p className="text-red-500 font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1.5 mx-auto transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-7 h-7 rounded-lg bg-stone-200" />
                  <div className="w-10 h-10 rounded-xl bg-stone-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-stone-200 rounded w-20" />
                    <div className="h-4 bg-stone-200 rounded w-32" />
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
                </div>
              ))}
            </div>
          ) : !tree || tree.children.length === 0 ? (
            <div className="text-center py-12 sm:py-16">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Users className="h-8 w-8 text-stone-300" />
              </div>
              <p className="text-stone-500 font-medium">No referrals yet</p>
              <p className="text-sm text-stone-400 mt-1 max-w-xs mx-auto">
                Share your invite link to start building your team
              </p>
            </div>
          ) : (
            <div className="max-h-[65vh] overflow-y-auto pr-1 sm:pr-2 -mr-1 sm:-mr-2 scrollbar-thin">
              <TreeNodeCard
                node={tree}
                expandedIds={expandedIds}
                onToggle={toggleNode}
                depth={0}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
