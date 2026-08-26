import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "../../lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { getDirectReferrals } from "../../lib/server-actions";
import { formatCurrency } from "../../lib/store";
import {
  Layers,
  Users,
  TrendingUp,
  Lock,
  Unlock,
  ChevronRight,
  Award,
  Zap,
} from "lucide-react";
import { cn } from "../../lib/utils";

export const Route = createFileRoute("/dashboard/levels")({
  component: LevelsPage,
});

// ─── Level Definitions ───────────────────────────────────────────────────────

interface LevelDef {
  level: number;
  bonus: number;
  requiredReferrals: number;
}

const LEVELS: LevelDef[] = [
  { level: 1, bonus: 2.0, requiredReferrals: 1 },
  { level: 2, bonus: 1.0, requiredReferrals: 1 },
  { level: 3, bonus: 1.0, requiredReferrals: 2 },
  { level: 4, bonus: 1.0, requiredReferrals: 3 },
  { level: 5, bonus: 0.75, requiredReferrals: 3 },
  { level: 6, bonus: 0.5, requiredReferrals: 3 },
  { level: 7, bonus: 0.25, requiredReferrals: 4 },
  { level: 8, bonus: 0.25, requiredReferrals: 4 },
  { level: 9, bonus: 0.25, requiredReferrals: 4 },
  { level: 10, bonus: 0.25, requiredReferrals: 4 },
  { level: 11, bonus: 0.2, requiredReferrals: 5 },
  { level: 12, bonus: 0.2, requiredReferrals: 5 },
  { level: 13, bonus: 0.2, requiredReferrals: 5 },
  { level: 14, bonus: 0.2, requiredReferrals: 5 },
  { level: 15, bonus: 0.2, requiredReferrals: 5 },
  { level: 16, bonus: 0.15, requiredReferrals: 6 },
  { level: 17, bonus: 0.15, requiredReferrals: 6 },
  { level: 18, bonus: 0.15, requiredReferrals: 6 },
  { level: 19, bonus: 0.15, requiredReferrals: 6 },
  { level: 20, bonus: 0.15, requiredReferrals: 6 },
  { level: 21, bonus: 0.15, requiredReferrals: 6 },
];

const TOTAL_BONUS = LEVELS.reduce((sum, l) => sum + l.bonus, 0); // 9.15

// ─── Derived Stats ───────────────────────────────────────────────────────────

function getUnlockedLevel(directCount: number): number {
  let maxUnlocked = 0;
  for (const l of LEVELS) {
    if (directCount >= l.requiredReferrals) {
      maxUnlocked = l.level;
    }
  }
  return maxUnlocked;
}

function getMaxRequiredReferrals(): number {
  return Math.max(...LEVELS.map((l) => l.requiredReferrals));
}

// ─── Level Card ──────────────────────────────────────────────────────────────

function LevelCard({
  def,
  isUnlocked,
  isCurrent,
  isNext,
  directCount,
  index,
}: {
  def: LevelDef;
  isUnlocked: boolean;
  isCurrent: boolean;
  isNext: boolean;
  directCount: number;
  index: number;
}) {
  const progress = Math.min(1, directCount / def.requiredReferrals);
  const refsNeeded = Math.max(0, def.requiredReferrals - directCount);

  return (
    <div
      className={cn(
        "relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all duration-300",
        "animate-level-in",
        isUnlocked
          ? "bg-gradient-to-r from-amber-50/80 to-orange-50/50 border-amber-200/60 shadow-sm"
          : "bg-white/40 border-stone-200/40 opacity-70",
        isCurrent && "ring-2 ring-amber-400/50 border-amber-300 shadow-md",
        isNext && "border-dashed border-amber-300/60"
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Level Number */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base transition-all",
          isUnlocked
            ? "bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md shadow-amber-200/50"
            : "bg-stone-100 text-stone-400"
        )}
      >
        {isUnlocked ? (
          <Unlock className="h-4 w-4 sm:h-5 sm:w-5" />
        ) : (
          <span>{def.level}</span>
        )}
      </div>

      {/* Level Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-stone-800">
            Level {def.level}
          </span>
          {isCurrent && (
            <Badge
              variant="outline"
              className="text-[10px] border-amber-300 text-amber-600 bg-amber-50 animate-pulse-subtle"
            >
              Current
            </Badge>
          )}
          {isNext && !isUnlocked && (
            <Badge
              variant="outline"
              className="text-[10px] border-blue-200 text-blue-600 bg-blue-50"
            >
              Next
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 mt-1">
          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            {def.bonus}%
          </span>
          <span className="text-xs text-stone-400">•</span>
          <span className="text-xs text-stone-500 flex items-center gap-1">
            <Users className="h-3 w-3" />
            {def.requiredReferrals} referral{def.requiredReferrals > 1 ? "s" : ""}
          </span>
        </div>

        {/* Progress bar (for next locked level) */}
        {isNext && !isUnlocked && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-stone-400 mb-0.5">
              <span>{directCount}/{def.requiredReferrals} referrals</span>
              <span>{refsNeeded} more to unlock</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex-shrink-0">
        {isUnlocked ? (
          <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        ) : (
          <Lock className="h-4 w-4 text-stone-300" />
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

function LevelsPage() {
  const { user } = useAuth();
  const [directCount, setDirectCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getDirectReferrals({ data: { parentId: user.id } })
      .then((refs) => {
        setDirectCount(refs.length);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const unlockedLevel = getUnlockedLevel(directCount);
  const nextLevel = LEVELS.find((l) => l.level === unlockedLevel + 1);
  const allUnlocked = unlockedLevel >= 21;

  return (
    <div className="space-y-5 sm:space-y-6">
      <style>{`
        @keyframes level-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-level-in { animation: level-in 0.3s ease-out both; }
      `}</style>

      {/* Header */}
      <div className="animate-fade-in-down">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-stone-800 flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-200/50">
            <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          Level Bonus
        </h2>
        <p className="text-stone-500 mt-1 ml-[46px] sm:ml-[52px] text-sm">
          Unlock higher levels with direct referrals
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 animate-fade-in-up stagger-1">
        {/* Direct Referrals */}
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-xl border border-blue-200/60 p-3 sm:p-4 hover:shadow-md hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-1.5 sm:gap-2 text-blue-500 mb-1.5">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs font-medium">Direct Referrals</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-800">{directCount}</p>
        </div>

        {/* Current Level */}
        <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/30 rounded-xl border border-amber-200/60 p-3 sm:p-4 hover:shadow-md hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-1.5 sm:gap-2 text-amber-500 mb-1.5">
            <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs font-medium">Current Level</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-800">
            {unlockedLevel > 0 ? unlockedLevel : "—"}
          </p>
        </div>

        {/* Monthly Bonus */}
        <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-xl border border-green-200/60 p-3 sm:p-4 hover:shadow-md hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-1.5 sm:gap-2 text-green-500 mb-1.5">
            <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs font-medium">Your Monthly Bonus</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-800">
            {unlockedLevel > 0
              ? LEVELS.filter((l) => l.level <= unlockedLevel)
                  .reduce((s, l) => s + l.bonus, 0)
                  .toFixed(2)
              : "0.00"}
            %
          </p>
        </div>

        {/* Total Possible */}
        <div className="bg-gradient-to-br from-violet-50/50 to-purple-50/30 rounded-xl border border-violet-200/60 p-3 sm:p-4 hover:shadow-md hover:scale-[1.02] transition-all">
          <div className="flex items-center gap-1.5 sm:gap-2 text-violet-500 mb-1.5">
            <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="text-[10px] sm:text-xs font-medium">Total Possible</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-stone-800">{TOTAL_BONUS.toFixed(2)}%</p>
          <p className="text-[10px] text-stone-400 mt-0.5">All 21 levels</p>
        </div>
      </div>

      {/* Next Level CTA */}
      {nextLevel && (
        <Card className="animate-fade-in-up stagger-2 border-0 shadow-md bg-gradient-to-r from-amber-50 to-orange-50/50 overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">
                  {allUnlocked ? "All Levels Unlocked!" : "Next: Level " + nextLevel.level}
                </p>
                {allUnlocked ? (
                  <p className="text-sm text-stone-600 mt-1">
                    You're earning the full {TOTAL_BONUS.toFixed(2)}% monthly bonus!
                  </p>
                ) : (
                  <p className="text-sm text-stone-600 mt-1">
                    Add <span className="font-bold text-amber-600">{Math.max(0, nextLevel.requiredReferrals - directCount)}</span> more referral{Math.max(0, nextLevel.requiredReferrals - directCount) !== 1 ? "s" : ""} to unlock Level {nextLevel.level} ({nextLevel.bonus}%)
                  </p>
                )}
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md shadow-amber-200/50">
                {allUnlocked ? (
                  <Award className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                ) : (
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level List */}
      <Card className="animate-fade-in-up stagger-3 border-0 shadow-md bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-stone-100">
          <CardTitle className="text-sm sm:text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-sm shadow-amber-200" />
              <span>21 Level Bonus Structure</span>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs border-amber-200 text-amber-600 bg-amber-50 tabular-nums"
            >
              {LEVELS.filter((l) => l.level <= unlockedLevel).length}/21 unlocked
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-stone-50 animate-pulse"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-stone-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-stone-200 rounded w-24" />
                    <div className="h-3 bg-stone-200 rounded w-40" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-stone-200" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {LEVELS.map((def, i) => (
                <LevelCard
                  key={def.level}
                  def={def}
                  isUnlocked={def.level <= unlockedLevel}
                  isCurrent={def.level === unlockedLevel}
                  isNext={def.level === unlockedLevel + 1}
                  directCount={directCount}
                  index={i}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
