import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";

import PublicLayout from "@/components/PublicLayout";
import { rewards } from "@/lib/plan-data";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [{ title: "Rewards — Tradebee" }],
  }),
  component: RewardsPage,
});

function RewardsPage() {
  return (
    <PublicLayout>
      <section className="py-20">
        <div className="section-shell">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold tracking-[0.35em] text-primary">
              AWARD &amp; REWARD
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Target based one-time rewards
            </h2>
            <p className="mt-3 text-muted-foreground">
              Maintained on a 60:40 power-to-weaker side ratio.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rewards.map((r, i) => (
              <motion.div
                key={r.total}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                className="card-elevated p-5"
              >
                <p className="text-xs tracking-[0.2em] text-muted-foreground">
                  BUSINESS {r.total}
                </p>
                <p className="mt-2 font-semibold">{r.reward}</p>
                <p className="mt-3 text-sm text-primary">
                  Cumulative value {r.value}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
