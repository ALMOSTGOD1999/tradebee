import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

import PublicLayout from "@/components/PublicLayout";
import { roiPlans } from "@/lib/plan-data";

export const Route = createFileRoute("/plans")({
  head: () => ({
    meta: [{ title: "Investment Plans — Tradebee" }],
  }),
  component: PlansPage,
});

function PlansPage() {
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
              INVESTOR PASSIVE INCOME
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Monthly ROI plans
            </h2>
            <p className="mt-3 text-muted-foreground">
              Capital return plus ROI paid every month for up to 20 months (5%
              capital return per month).
            </p>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {roiPlans.map((p, i) => (
              <motion.div
                key={p.range}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="card-elevated flex flex-col p-6"
              >
                <p className="text-xs tracking-[0.25em] text-muted-foreground">
                  PLAN {i + 1}
                </p>
                <p className="mt-2 text-lg font-semibold">{p.range}</p>
                <p className="mt-6 text-4xl font-bold text-gradient-gold">
                  {p.total}
                </p>
                <p className="text-xs tracking-wide text-muted-foreground">
                  TOTAL INCOME P.M.
                </p>
                <ul className="mt-6 space-y-2 border-t border-border pt-4 text-sm text-muted-foreground">
                  <li className="flex justify-between">
                    <span>Capital p.m.</span>
                    <span className="text-foreground">{p.capital}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>ROI p.m.</span>
                    <span className="text-foreground">{p.roi}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>20 months</span>
                    <span className="font-semibold text-primary">
                      {p.months}
                    </span>
                  </li>
                </ul>
              </motion.div>
            ))}
          </div>

          <div className="card-elevated mt-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
            <ShieldCheck className="h-8 w-8 shrink-0 text-primary" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="text-base font-semibold text-foreground">
                Pre-launching security offer
              </p>
              <p>
                Investors placing more than ₹5 lakh receive a Post-Dated Cheque
                (PDC) of ₹5 lakh as security. The cheque stays valid until the
                full return is realised, after which it holds no value.
              </p>
              <p>
                Deposited funds are held securely by the company and paid out
                periodically on schedule. The principal cannot be withdrawn
                before the scheduled time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
