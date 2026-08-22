import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [{ title: "Contact — Tradebee" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

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
              GET STARTED
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Talk to a Tradebee advisor
            </h2>
            <p className="mt-3 text-muted-foreground">
              Share your details and our team will walk you through the plan
              that fits your capital.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr]">
            <form
              className="card-elevated space-y-4 p-6"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  placeholder="Full name"
                  required
                  aria-label="Full name"
                />
                <Input
                  placeholder="Phone number"
                  required
                  aria-label="Phone number"
                />
              </div>
              <Input
                type="email"
                placeholder="Email address"
                required
                aria-label="Email address"
              />
              <Input
                placeholder="Amount you plan to invest"
                aria-label="Investment amount"
              />
              <Textarea
                placeholder="Your message"
                rows={4}
                aria-label="Message"
              />
              <Button type="submit" size="lg" className="w-full">
                Request a callback
              </Button>
              {sent ? (
                <p className="text-sm text-primary">
                  Thanks! Your request is noted — an advisor will reach out
                  shortly.
                </p>
              ) : null}
            </form>

            <div className="space-y-4">
              {[
                { icon: Phone, label: "Phone", value: "+91 00000 00000" },
                {
                  icon: Mail,
                  label: "Email",
                  value: "support@tradebee.in",
                },
                {
                  icon: MapPin,
                  label: "Office",
                  value: "Kolkata, West Bengal, India",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="card-elevated flex items-center gap-4 p-5"
                >
                  <c.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs tracking-widest text-muted-foreground">
                      {c.label.toUpperCase()}
                    </p>
                    <p className="font-medium">{c.value}</p>
                  </div>
                </div>
              ))}
              <div className="card-elevated p-5 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">
                  Risk disclaimer
                </p>
                <p className="mt-2">
                  Forex and share market investments carry market risk. Returns
                  shown are plan projections and are not guaranteed. Please read
                  all terms before investing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
