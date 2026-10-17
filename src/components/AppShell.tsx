import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Home, MessagesSquare, Gift, IdCard, Radio } from "lucide-react";

const tabs = [
  { to: "/", label: "Show", icon: Home },
  { to: "/messages", label: "Forum", icon: MessagesSquare },
  { to: "/rewards", label: "Rewards", icon: Gift },
  { to: "/pass", label: "Profile", icon: IdCard },
  { to: "/live", label: "Live", icon: Radio },
] as const;

export function AppShell({ title, kicker, children }: { title: string; kicker: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b-2 bg-background px-5 py-3">
        <span className="font-display text-2xl font-extrabold">
          fan<span className="text-accent">drop</span>
        </span>
        <span className="sticker rounded-full bg-primary px-2.5 py-1 pop-sm">T-minus 3d</span>
      </header>
      <main className="flex-1 px-5 pb-28 pt-5">
        <p className="sticker text-accent">{kicker}</p>
        <h1 className="mb-5 mt-1 text-4xl font-extrabold leading-none">{title}</h1>
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-4">
        <div className="grid grid-cols-5 rounded-3xl bg-card p-1.5 pop">
          {tabs.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex flex-col items-center gap-0.5 rounded-2xl py-2 text-xs font-bold text-muted-foreground"
              activeProps={{ className: "bg-foreground !text-primary" }}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
