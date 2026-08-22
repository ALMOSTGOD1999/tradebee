import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { getInvestmentTier } from "../../lib/store";
import { getDirectReferrals } from "../../lib/server-actions";
import type { User } from "../../lib/store";
import { ChevronDown, ChevronRight, User as UserIcon } from "lucide-react";
import { cn } from "../../lib/utils";

export const Route = createFileRoute("/dashboard/genealogy")({
  component: GenealogyPage,
});

interface TreeNodeData {
  userId: string;
  name: string;
  id: string;
  investment: number;
  children: TreeNodeData[];
  isExpanded: boolean;
  onToggle: () => void;
}

function TreeNode({ node, depth = 0 }: { node: TreeNodeData; depth?: number }) {
  const hasChildren = node.children.length > 0;
  return (
    <div>
      <div
        className={cn("flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-amber-50/80 cursor-pointer text-sm transition-all duration-200 group")}
        style={{ paddingLeft: `${depth * 28 + 12}px` }}
        onClick={node.onToggle}
      >
        {hasChildren ? (
          node.isExpanded ? <ChevronDown className="h-4 w-4 text-amber-500 shrink-0 transition-transform" /> : <ChevronRight className="h-4 w-4 text-amber-500 shrink-0 transition-transform" />
        ) : <div className="w-4 shrink-0" />}
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shrink-0 group-hover:from-amber-200 group-hover:to-orange-200 transition-colors">
          <UserIcon className="h-3.5 w-3.5 text-amber-600" />
        </div>
        <span className="font-mono text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded shrink-0">{node.id}</span>
        <span className="font-medium truncate">{node.name}</span>
        {node.investment > 0 && (
          <span className="text-xs font-semibold text-green-600 ml-auto shrink-0 bg-green-50 px-2 py-0.5 rounded-full">
            {(node.investment / 100000).toFixed(1)}L
          </span>
        )}
        {hasChildren && <span className="text-xs text-muted-foreground ml-1 shrink-0">({node.children.length})</span>}
      </div>
      {node.isExpanded && node.children.map((child) => <TreeNode key={child.id} node={child} depth={depth + 1} />)}
    </div>
  );
}

function GenealogyPage() {
  const { user } = useAuth();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([user?.id || ""]));
  const [userMap, setUserMap] = useState<Map<string, User>>(new Map());

  useEffect(() => {
    if (!user) return;
    const loadTree = async () => {
      const direct = await getDirectReferrals({ data: { parentId: user.id } });
      const map = new Map<string, User>();
      map.set(user.id, user);
      const queue = [...direct];
      while (queue.length > 0) {
        const u = queue.shift()!;
        map.set(u.id, u);
        const children = await getDirectReferrals({ data: { parentId: u.id } });
        queue.push(...children);
      }
      setUserMap(map);
    };
    loadTree();
  }, [user]);

  if (!user) return null;

  const toggleNode = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const buildTree = (userId: string): TreeNodeData => {
    const direct = Array.from(userMap.values()).filter((u) => u.parentId === userId);
    return {
      userId,
      name: userMap.get(userId)?.name || userId,
      id: userId,
      investment: Number(userMap.get(userId)?.investment) || 0,
      children: direct.map((r) => buildTree(r.id)),
      isExpanded: expandedIds.has(userId),
      onToggle: () => toggleNode(userId),
    };
  };

  const treeData = buildTree(user.id);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in-down">
        <h2 className="text-2xl lg:text-3xl font-bold">Genealogy Tree</h2>
        <p className="text-muted-foreground mt-1">Your downline network hierarchy</p>
      </div>

      <Card className="animate-fade-in-up stagger-1 border-0 shadow-md bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            {user.name} ({user.id})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {treeData.children.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">No referrals yet. Share your invite link to start building your team.</p>
          ) : (
            <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
              <TreeNode node={treeData} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
