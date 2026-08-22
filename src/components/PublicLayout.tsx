import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { LogIn } from "lucide-react";

import logo from "@/assets/tradebee-logo.png";
import { LoginDialog } from "@/components/LoginDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const navLinks = [
  { label: "About", to: "/about" },
  { label: "Plans", to: "/plans" },
  { label: "Income", to: "/income" },
  { label: "Rewards", to: "/rewards" },
  { label: "Contact", to: "/contact" },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const { login: authLogin } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="section-shell flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Tradebee logo"
              className="h-9 w-9 rounded-full object-cover"
            />
            <span className="text-lg font-bold tracking-[0.25em] text-primary">
              TRADEBEE
            </span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm transition-colors hover:text-foreground ${
                  location.pathname === l.to
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLoginOpen(true)}
            >
              <LogIn className="mr-1.5 h-4 w-4" /> Login
            </Button>
            <Button size="sm" onClick={() => setLoginOpen(true)}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-border py-10">
        <div className="section-shell flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
            <div>
              <p className="font-bold tracking-[0.25em] text-primary">
                TRADEBEE
              </p>
              <p className="text-xs tracking-[0.3em] text-muted-foreground">
                OWN YOUR SUCCESS
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Tradebee. All rights reserved.
          </p>
        </div>
      </footer>

      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSuccess={authLogin}
      />
    </div>
  );
}
