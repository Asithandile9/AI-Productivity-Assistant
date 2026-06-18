import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { planTasks } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CalendarCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { OutputActions } from "@/components/output-actions";
import { Badge } from "@/components/ui/badge";
import { bump } from "@/lib/activity";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace" },
      { name: "description", content: "Plan tasks with an AI productivity coach." },
    ],
  }),
  component: TasksPage,
});

type Out = {
  schedule: { timeBlock: string; task: string; priority: "High" | "Medium" | "Low"; notes: string }[];
  priorityMatrix: {
    urgentImportant: string[];
    importantNotUrgent: string[];
    urgentNotImportant: string[];
    neither: string[];
  };
  suggestedOrder: string[];
  optimizationTips: string[];
};

const priorityColor: Record<string, string> = {
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
  Low: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
};

function TasksPage() {
  const run = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState("9am - 5pm, 1h lunch");
  const [horizon, setHorizon] = useState<"Daily" | "Weekly">("Daily");
  const [out, setOut] = useState<Out | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!tasks.trim()) {
      toast.error("Add at least one task");
      return;
    }
    setLoading(true);
    try {
      const r = await run({ data: { tasks, workingHours: hours, horizon } });
      setOut(r);
      bump("tasks", `${horizon} plan generated`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <CalendarCheck className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Task Planner</h1>
          <p className="text-sm text-muted-foreground">
            Generate an optimized schedule with a priority matrix.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inputs</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2 lg:col-span-2">
            <Label>Tasks (one per line, include deadline and priority)</Label>
            <Textarea
              rows={6}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={`Finish Q3 report - due Friday - High\nReview team PRs - today - Medium\nUpdate website copy - next week - Low`}
            />
          </div>
          <div className="space-y-2">
            <Label>Available working hours</Label>
            <Input value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Horizon</Label>
            <Select value={horizon} onValueChange={(v) => setHorizon(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-2">
            <Button onClick={submit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Planning...
                </>
              ) : (
                "Generate Plan"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {out && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{horizon} schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="relative space-y-3 border-l-2 border-border pl-5">
                {out.schedule.map((s, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[26px] top-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Clock className="h-2.5 w-2.5" />
                    </span>
                    <div className="rounded-lg border border-border bg-card p-3 transition hover:shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{s.timeBlock}</p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-xs font-medium ${priorityColor[s.priority]}`}
                        >
                          {s.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{s.task}</p>
                      {s.notes && (
                        <p className="mt-1 text-xs text-muted-foreground">{s.notes}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Priority Matrix</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  { label: "Urgent & Important", items: out.priorityMatrix.urgentImportant },
                  { label: "Important, Not Urgent", items: out.priorityMatrix.importantNotUrgent },
                  { label: "Urgent, Not Important", items: out.priorityMatrix.urgentNotImportant },
                  { label: "Neither", items: out.priorityMatrix.neither },
                ].map((q) => (
                  <div key={q.label} className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {q.label}
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {q.items.length === 0 ? (
                        <li className="text-xs text-muted-foreground">—</li>
                      ) : (
                        q.items.map((it, i) => <li key={i}>• {it}</li>)
                      )}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suggested order & tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold">Suggested order</p>
                  <ol className="space-y-1 text-sm">
                    {out.suggestedOrder.map((s, i) => (
                      <li key={i} className="flex gap-2">
                        <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                          {i + 1}
                        </Badge>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ol>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold">Optimization tips</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm">
                    {out.optimizationTips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <OutputActions
            loading={loading}
            onRegenerate={submit}
            onCopy={() => JSON.stringify(out, null, 2)}
          />
          <AiDisclaimer />
        </div>
      )}
    </div>
  );
}
