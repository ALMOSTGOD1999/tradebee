import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Users, Coins } from "lucide-react";

import PublicLayout from "@/components/PublicLayout";
import { levelBonus, salaryPlan } from "@/lib/plan-data";

export const Route = createFileRoute("/income")({
  head: () => ({
    meta: [{ title: "Income — Tradebee" }],
  }),
  component: IncomePage,
});

function IncomePage() {
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
              TEAM INCOME
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Referral, level bonus &amp; fixed salary
            </h2>
            <p className="mt-3 text-muted-foreground">
              Direct referral bonus of 5%, a 21-level bonus pool totalling
              9.15%, and a fixed monthly salary for 12 months on team business.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="card-elevated overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-border p-5">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Level bonus (21 levels)</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card text-xs tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left">Level</th>
                      <th className="p-3 text-left">Benefit</th>
                      <th className="p-3 text-right">Direct required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelBonus.map((l) => (
                      <tr key={l.level} className="border-t border-border/60">
                        <td className="p-3">{l.level}</td>
                        <td className="p-3 text-primary">{l.benefit}</td>
                        <td className="p-3 text-right text-muted-foreground">
                          {l.direct}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t border-border bg-accent/40 font-semibold">
                      <td className="p-3">Total</td>
                      <td className="p-3 text-primary">9.15%</td>
                      <td className="p-3 text-right">6</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="card-elevated overflow-hidden"
            >
              <div className="flex items-center gap-3 border-b border-border p-5">
                <Coins className="h-5 w-5 text-honey" />
                <h3 className="font-semibold">
                  Fixed salary — 12 months (60:40 ratio)
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card text-xs tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3 text-left">Power</th>
                      <th className="p-3 text-left">Weaker</th>
                      <th className="p-3 text-left">Salary p.m.</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryPlan.map((s) => (
                      <tr
                        key={s.total}
                        className="border-t border-border/60"
                      >
                        <td className="p-3">{s.power}</td>
                        <td className="p-3 text-muted-foreground">{s.weak}</td>
                        <td className="p-3 text-primary">{s.salary}</td>
                        <td className="p-3 text-right">{s.totalSalary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
