import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
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

// ─── Recursive Tree Node Component ───────────────────────────────────────────

function TreeNodeCard({
  node,
  expandedIds,
  onToggle,
}: {
  node: TreeNode;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isActive = node.investment > 0;
  const isExpanded = expandedIds.has(node.id);
  const depth = node.depth;

  return (
    <div className={cn("relative", depth > 0 && "mt-1")}>
      {/* Node Card */}
      <div
        className={cn(
          "relative flex items-start gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer group",
          isActive
            ? "bg-gradient-to-r from-amber-50/80 to-orange-50/50 border-amber-200/60 hover:border-amber-300 hover:shadow-md"
            : "bg-white/60 border-stone-200/60 hover:border-stone-300 hover:shadow-sm",
          depth === 0 && "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50/30 shadow-sm"
        )}
        onClick={() => onToggle(node.id)}
      >
        {/* Expand/Collapse Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {hasChildren ? (
            <div
              className={cn(
                "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
                isExpanded
                  ? "bg-amber-100 text-amber-600"
                  : "bg-stone-100 text-stone-500 group-hover:bg-amber-50 group-hover:text-amber-500"
              )}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          ) : (
            <div className="w-6 h-6 rounded-lg bg-stone-50 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm transition-all",
            isActive
              ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white"
              : "bg-gradient-to-br from-stone-100 to-stone-200 text-stone-500"
          )}
        >
          <UserIcon className="h-5 w-5" />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
              {node.id}
            </span>
            {depth === 0 && (
              <Badge
                variant="outline"
                className="text-[10px] border-amber-300 text-amber-600 bg-amber-50"
              >
                You
              </Badge>
            )}
            {node.tier && (
              <Badge
                variant="outline"
                className="text-[10px] border-orange-200 text-orange-600 bg-orange-50"
              >
                {node.tier}
              </Badge>
            )}
          </div>
          <p className="font-semibold text-sm text-stone-800 mt-0.5 truncate">
            {node.name}
          </p>
          <div className="flex items-center gap-3 mt-1">
            {node.investment > 0 ? (
              <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {formatCurrency(node.investment)}
              </span>
            ) : (
              <span className="text-xs text-stone-400">No investment</span>
            )}
            {hasChildren && (
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {node.children.length} direct
              </span>
            )}
          </div>
        </div>

        {/* Active Status Dot */}
        <div className="flex-shrink-0">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              isActive ? "bg-green-400 shadow-sm shadow-green-200" : "bg-stone-300"
            )}
          />
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="relative ml-6 mt-1 pl-5 border-l-2 border-stone-200/80">
          {node.children.map((child) => (
            <TreeNodeCard
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stats Component ─────────────────────────────────────────────────────────

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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/60 p-3">
        <div className="flex items-center gap-2 text-stone-500 mb-1">
          <Users className="h-4 w-4" />
          <span className="text-xs font-medium">Total Members</span>
        </div>
        <p className="text-2xl font-bold text-stone-800">{totalMembers}</p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/60 p-3">
        <div className="flex items-center gap-2 text-green-500 mb-1">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-medium">Active Investors</span>
        </div>
        <p className="text-2xl font-bold text-stone-800">{activeInvestors}</p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/60 p-3">
        <div className="flex items-center gap-2 text-amber-500 mb-1">
          <TrendingUp className="h-4 w-4" />
          <span className="text-xs font-medium">Total Business</span>
        </div>
        <p className="text-2xl font-bold text-stone-800">
          {totalInvestment >= 100000
            ? `${(totalInvestment / 100000).toFixed(1)}L`
            : formatCurrency(totalInvestment)}
        </p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-stone-200/60 p-3">
        <div className="flex items-center gap-2 text-blue-500 mb-1">
          <Layers className="h-4 w-4" />
          <span className="text-xs font-medium">Max Depth</span>
        </div>
        <p className="text-2xl font-bold text-stone-800">{maxDepth}</p>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function GenealogyPage() {
  const { user } = useAuth();
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getGenealogyTree({ data: { userId: user.id } })
      .then((result) => {
        setTree(result);
        // Auto-expand root and first level
        if (result) {
          const initial = new Set<string>();
          initial.add(result.id);
          result.children.forEach((c) => {
            initial.add(c.id);
          });
          setExpandedIds(initial);
        }
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
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-down flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-stone-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-200/50">
              <TreePine className="h-5 w-5 text-white" />
            </div>
            Downline Tree
          </h2>
          <p className="text-stone-500 mt-1 ml-13">
            Your network hierarchy and referrals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="animate-fade-in-up stagger-1">
        <TreeStats tree={tree} />
      </div>

      {/* Tree */}
      <Card className="animate-fade-in-up stagger-2 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span>
                {user.name} ({user.id})
              </span>
            </div>
            {tree && (
              <Badge
                variant="outline"
                className="text-xs border-amber-200 text-amber-600 bg-amber-50"
              >
                {expandedIds.size} expanded
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-stone-100 rounded-xl animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          ) : !tree || tree.children.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-stone-400" />
              </div>
              <p className="text-stone-500 font-medium">No referrals yet</p>
              <p className="text-sm text-stone-400 mt-1">
                Share your invite link to start building your team
              </p>
            </div>
          ) : (
            <div className="max-h-[65vh] overflow-y-auto pr-2 -mr-2">
              <TreeNodeCard
                node={tree}
                expandedIds={expandedIds}
                onToggle={toggleNode}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
