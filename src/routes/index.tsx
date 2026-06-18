import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  FileText,
  CalendarCheck,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { getCounts, getRecent, type ActivityKey } from "@/lib/activity";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Overview of your AI-powered productivity activity and quick actions.",
      },
    ],
  }),
  component: Dashboard,
});

const cards: { key: ActivityKey; label: string; icon: any; to: string; color: string }[] = [
  { key: "emails", label: "Emails Generated", icon: Mail, to: "/email", color: "from-blue-500/15" },
  { key: "meetings", label: "Meetings Summarized", icon: FileText, to: "/meetings", color: "from-teal-500/15" },
  { key: "tasks", label: "Tasks Planned", icon: CalendarCheck, to: "/tasks", color: "from-emerald-500/15" },
  { key: "research", label: "Research Sessions", icon: BookOpen, to: "/research", color: "from-amber-500/15" },
  { key: "chats", label: "AI Conversations", icon: MessageSquare, to: "/chat", color: "from-violet-500/15" },
];

function Dashboard() {
  const [counts, setCounts] = useState(() => getCounts());
  const [recent, setRecent] = useState(() => getRecent());

  useEffect(() => {
    const refresh = () => {
      setCounts(getCounts());
      setRecent(getRecent());
    };
    refresh();
    window.addEventListener("aiwpa:activity", refresh);
    return () => window.removeEventListener("aiwpa:activity", refresh);
  }, []);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered workspace
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Welcome back</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Draft emails, summarize meetings, plan your day, and run research — all in one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/chat">
                <MessageSquare className="mr-2 h-4 w-4" /> Open Assistant
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/email">
                <Mail className="mr-2 h-4 w-4" /> Quick Email
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {cards.map((c) => (
          <Card
            key={c.key}
            className={`relative overflow-hidden border-border bg-gradient-to-br ${c.color} to-card transition-all hover:-translate-y-0.5 hover:shadow-md`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {c.label}
                </CardTitle>
                <c.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tracking-tight">{counts[c.key] ?? 0}</p>
              <Link
                to={c.to}
                className="mt-1 inline-flex items-center text-xs font-medium text-primary hover:underline"
              >
                Open <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {cards.map((c) => (
              <Button
                key={c.key}
                asChild
                variant="outline"
                className="h-auto justify-start py-3"
              >
                <Link to={c.to}>
                  <c.icon className="mr-3 h-5 w-5 text-primary" />
                  <div className="text-left">
                    <p className="text-sm font-semibold">{c.label}</p>
                    <p className="text-xs text-muted-foreground">Launch tool</p>
                  </div>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing yet. Use any tool to see activity here.
              </p>
            ) : (
              <ul className="space-y-3">
                {recent.slice(0, 6).map((r) => (
                  <li key={r.id} className="flex items-start gap-3">
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
