import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";

import logo from "@/assets/tradebee-logo.png";
import WelcomeAnimation from "@/components/WelcomeAnimation";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tradebee — Forex & Share Market Investment Company" },
      {
        name: "description",
        content:
          "Tradebee helps investors grow with forex and share market strategies, monthly ROI plans, referral income and reward programs. Own your success.",
      },
      { property: "og:title", content: "Tradebee — Forex & Share Market Investment Company" },
      {
        property: "og:description",
        content:
          "Forex and share market investment plans, monthly ROI, referral bonuses and rewards with Tradebee.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <PublicLayout>
      <WelcomeAnimation />

      {/* Hero */}
      <section className="hero-surface relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="section-shell relative grid gap-12 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs tracking-widest text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-honey" /> PRE-LAUNCHING
              OFFER LIVE
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] sm:text-6xl">
              Turn every <span className="text-bear">red</span> candle into a{" "}
              <span className="text-bull">green</span> one.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Tradebee is a forex and share market company built for patient
              capital — structured monthly returns, transparent plans and a
              community that grows together.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/plans">
                  View Investment Plans <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">How it works</Link>
              </Button>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
              {[
                { k: "Up to 13%", v: "Total income p.m." },
                { k: "20 Months", v: "Payout cycle" },
                { k: "9.15%", v: "Level bonus pool" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-2xl font-bold text-primary">{s.k}</dt>
                  <dd className="text-xs tracking-wide text-muted-foreground">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="relative mx-auto w-full max-w-md"
          >
            {/* glow */}
            <div className="animate-glow-pulse pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary/25 blur-3xl" />

            {/* orbit rings */}
            <div className="animate-spin-slow pointer-events-none absolute inset-0 rounded-full border border-primary/25">
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-bull shadow-[0_0_16px_currentColor] text-bull" />
            </div>
            <div className="animate-spin-reverse pointer-events-none absolute inset-6 rounded-full border border-dashed border-honey/30">
              <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-honey shadow-[0_0_14px_currentColor] text-honey" />
            </div>

            <div className="card-elevated animate-float relative p-8">
              <motion.img
                src={logo}
                alt="Tradebee — own your success"
                className="w-full rounded-lg"
                animate={{ y: [0, -8, 0], rotate: [0, 1.2, 0, -1.2, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* floating candles */}
              <div className="mt-6 flex items-end justify-center gap-2">
                {[14, 26, 18, 34, 24, 42, 30].map((h, i) => (
                  <motion.span
                    key={i}
                    className={`w-2.5 rounded-sm ${i % 3 === 1 ? "bg-bear/80" : "bg-bull/80"}`}
                    style={{ height: h }}
                    animate={{ scaleY: [0.6, 1.15, 0.85, 1] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* floating badges */}
            <motion.div
              className="card-elevated absolute -left-4 top-10 hidden px-3 py-2 text-xs font-semibold text-bull sm:block"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              +13% p.m.
            </motion.div>
            <motion.div
              className="card-elevated absolute -right-4 bottom-16 hidden px-3 py-2 text-xs font-semibold text-honey sm:block"
              animate={{ y: [0, 12, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            >
              20 months payout
            </motion.div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
