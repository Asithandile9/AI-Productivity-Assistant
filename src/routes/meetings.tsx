import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { summarizeMeeting } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { OutputActions } from "@/components/output-actions";
import { Badge } from "@/components/ui/badge";
import { bump } from "@/lib/activity";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace" },
      { name: "description", content: "Turn raw meeting notes into summaries and action items." },
    ],
  }),
  component: MeetingsPage,
});

type Out = {
  executiveSummary: string;
  keyDiscussionPoints: string[];
  decisionsMade: string[];
  actionItems: { task: string; owner: string; dueDate: string }[];
};

export function MeetingsPage() {
  const run = useServerFn(summarizeMeeting);
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState<Out | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (notes.trim().length < 10) {
      toast.error("Paste at least a few sentences of meeting notes");
      return;
    }
    setLoading(true);
    try {
      const r = await run({ data: { notes } });
      setOut(r);
      bump("meetings", "Meeting summarized");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to summarize");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    if (!out) return "";
    return [
      `Executive Summary:\n${out.executiveSummary}`,
      `\nKey Discussion Points:\n- ${out.keyDiscussionPoints.join("\n- ")}`,
      `\nDecisions Made:\n- ${out.decisionsMade.join("\n- ")}`,
      `\nAction Items:\n${out.actionItems
        .map((a) => `- ${a.task} (Owner: ${a.owner}, Due: ${a.dueDate})`)
        .join("\n")}`,
    ].join("\n");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Meeting Notes Summarizer</h1>
          <p className="text-sm text-muted-foreground">
            Get an executive summary, decisions, and action items from raw notes.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Paste meeting notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="sr-only">Notes</Label>
          <Textarea
            rows={10}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste full meeting transcript or notes here..."
          />
          <Button onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Summarizing...
              </>
            ) : (
              "Summarize Meeting"
            )}
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="space-y-3 py-6">
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      )}

      {out && (
        <div className="grid gap-4 animate-fade-in lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={6}
                value={out.executiveSummary}
                onChange={(e) => setOut({ ...out, executiveSummary: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Discussion Points</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {out.keyDiscussionPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Decisions Made</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {out.decisionsMade.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Action Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {out.actionItems.map((a, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-3 transition hover:shadow-sm"
                >
                  <p className="text-sm font-medium">{a.task}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">Owner: {a.owner}</Badge>
                    <Badge variant="outline">Due: {a.dueDate}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <OutputActions loading={loading} onRegenerate={submit} onCopy={copyAll} />
            <AiDisclaimer />
          </div>
        </div>
      )}
    </div>
  );
}
