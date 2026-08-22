import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CandlestickChart,
  BarChart3,
  Coins,
  GraduationCap,
} from "lucide-react";

import PublicLayout from "@/components/PublicLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [{ title: "About — Tradebee" }],
  }),
  component: AboutPage,
});

const services = [
  {
    icon: CandlestickChart,
    title: "Forex Trading",
    text: "Major, minor and exotic currency pairs traded by a desk that lives on the charts.",
  },
  {
    icon: BarChart3,
    title: "Share Market",
    text: "Equity, index and derivative positions built around disciplined risk management.",
  },
  {
    icon: Coins,
    title: "Managed Portfolios",
    text: "Capital pooled into structured plans with clearly published monthly returns.",
  },
  {
    icon: GraduationCap,
    title: "Trader Training",
    text: "Workshops and mentorship programs that turn beginners into confident traders.",
  },
];

function AboutPage() {
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
              WHAT WE DO
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              A trading desk, an investment plan and a community
            </h2>
            <p className="mt-3 text-muted-foreground">
              Our team works the currency and equity markets daily, while our
              plans let members participate without staring at charts.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card-elevated p-6"
              >
                <s.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
