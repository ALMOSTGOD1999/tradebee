import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  CandlestickChart,
  BarChart3,
  Coins,
  GraduationCap,
  Target,
  Eye,
  Heart,
  ShieldCheck,
  Users,
  TrendingUp,
  Building2,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

import PublicLayout from "@/components/PublicLayout";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Tradebee" },
      {
        name: "description",
        content:
          "Learn about Tradebee — a forex and share market investment company built for patient capital with transparent plans and a growing community.",
      },
    ],
  }),
  component: AboutPage,
});

const services = [
  {
    icon: CandlestickChart,
    title: "Forex Trading",
    text: "Major, minor and exotic currency pairs traded by a desk that lives on the charts. Our analysts use proven strategies to navigate the world's largest financial market.",
  },
  {
    icon: BarChart3,
    title: "Share Market",
    text: "Equity, index and derivative positions built around disciplined risk management. We focus on high-probability setups with strict stop-loss protocols.",
  },
  {
    icon: Coins,
    title: "Managed Portfolios",
    text: "Capital pooled into structured plans with clearly published monthly returns. Participate in market gains without watching the screen all day.",
  },
  {
    icon: GraduationCap,
    title: "Trader Training",
    text: "Workshops and mentorship programs that turn beginners into confident traders. Learn technical analysis, risk management and portfolio building.",
  },
];

const values = [
  {
    icon: ShieldCheck,
    title: "Transparency",
    text: "Every plan, every return, every risk is disclosed upfront. No hidden terms, no surprises.",
  },
  {
    icon: Users,
    title: "Community First",
    text: "We grow when our members grow. Referral bonuses and team rewards keep the community aligned.",
  },
  {
    icon: TrendingUp,
    title: "Disciplined Growth",
    text: "Patient capital, structured returns. We don't chase hype — we build consistent performance.",
  },
  {
    icon: Heart,
    title: "Integrity",
    text: "Your capital is respected. Our team operates with honesty and accountability at every level.",
  },
];

const milestones = [
  { year: "2023", event: "Founded in Kolkata with a vision for transparent trading" },
  { year: "2024", event: "Launched structured investment plans for retail investors" },
  { year: "2025", event: "Expanded operations across West Bengal and beyond" },
  { year: "2026", event: "Pre-launching offer live — join the growing community" },
];

function AboutPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="hero-surface relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="section-shell relative py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <p className="text-xs font-semibold tracking-[0.35em] text-primary">
              OUR STORY
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Building wealth through{" "}
              <span className="text-primary">patience</span> and{" "}
              <span className="text-primary">precision</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Tradebee is a forex and share market investment company built for
              patient capital — structured monthly returns, transparent plans and
              a community that grows together.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="section-shell">
          <div className="grid gap-8 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <Target className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-2xl font-bold">Our Mission</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                To provide accessible, transparent investment opportunities in
                forex and share markets for individuals who seek consistent
                returns without the complexity of daily trading. We bridge the
                gap between professional trading and retail investors through
                structured plans and expert management.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card-elevated p-8"
            >
              <Eye className="h-10 w-10 text-primary" />
              <h3 className="mt-4 text-2xl font-bold">Our Vision</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                To become India's most trusted forex and equity investment
                platform — where every investor, from first-timer to seasoned
                professional, finds a plan that fits their goals. We envision a
                community built on trust, performance and shared success.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-muted/30">
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
              A trading desk, investment plans and a community
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

      {/* Values */}
      <section className="py-20">
        <div className="section-shell">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold tracking-[0.35em] text-primary">
              OUR VALUES
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              What drives every decision
            </h2>
            <p className="mt-3 text-muted-foreground">
              The principles that guide how we manage capital and build
              relationships with our community.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card-elevated p-6"
              >
                <v.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey / Milestones */}
      <section className="py-20 bg-muted/30">
        <div className="section-shell">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold tracking-[0.35em] text-primary">
              OUR JOURNEY
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              From idea to impact
            </h2>
          </motion.div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card-elevated p-6"
              >
                <p className="text-3xl font-bold text-primary">{m.year}</p>
                <p className="mt-3 text-sm text-muted-foreground">{m.event}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bank Details & QR Code */}
      <section className="py-20">
        <div className="section-shell">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold tracking-[0.35em] text-primary">
              PAYMENT INFORMATION
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Invest with confidence
            </h2>
            <p className="mt-3 text-muted-foreground">
              Use the bank details below for investments. Always verify account
              details before transferring funds.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {/* Bank Details Card */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="card-elevated p-8"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <h3 className="text-xl font-bold">Bank Details</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Transfer to this account for investments
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { label: "Account Name", value: "TRADEONN", field: "name" },
                  {
                    label: "Account Number",
                    value: "4893002100005235",
                    field: "account",
                  },
                  { label: "IFSC Code", value: "PUNB0489300", field: "ifsc" },
                  { label: "Branch", value: "Kestopur", field: "branch" },
                ].map((item) => (
                  <div
                    key={item.field}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-xs tracking-widest text-muted-foreground">
                        {item.label.toUpperCase()}
                      </p>
                      <p className="mt-0.5 font-mono font-semibold">
                        {item.value}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(item.value, item.field)}
                      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Copy to clipboard"
                    >
                      {copied === item.field ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  ⚠️ Please verify all details before making a payment. Contact
                  support if you notice any discrepancies.
                </p>
              </div>
            </motion.div>

            {/* QR Code Section */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="card-elevated flex flex-col items-center justify-center p-8"
            >
              <h3 className="text-xl font-bold">Scan to Pay</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                UPI / QR Payment
              </p>

              {/* Dummy QR Code Placeholder */}
              <div className="mt-8 flex h-56 w-56 flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50">
                <div className="grid grid-cols-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-4 rounded-sm ${
                        [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i)
                          ? "bg-foreground"
                          : [6, 7, 8, 11, 13, 16, 17, 18].includes(i)
                            ? "bg-muted-foreground/30"
                            : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                  QR Code Coming Soon
                </p>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Scan the QR code with any UPI app to make a payment directly to
                our account.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">GPay</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">PhonePe</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Paytm</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-muted/30">
        <div className="section-shell text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to grow with us?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join a community of investors who chose transparency, discipline
              and consistent returns. Start with a plan that fits your capital.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="/plans"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View Investment Plans
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
              >
                Talk to an Advisor
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
