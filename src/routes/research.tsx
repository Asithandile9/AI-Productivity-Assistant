import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { runResearch } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { OutputActions } from "@/components/output-actions";
import { bump } from "@/lib/activity";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace" },
      { name: "description", content: "Summarize topics or articles into key insights." },
    ],
  }),
  component: ResearchPage,
});

type Out = {
  summary: string;
  keyInsights: string[];
  importantFacts: string[];
  recommendations: string[];
  conclusion: string;
};

function ResearchPage() {
  const run = useServerFn(runResearch);
  const [content, setContent] = useState("");
  const [out, setOut] = useState<Out | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!content.trim()) {
      toast.error("Enter a topic, article, or notes");
      return;
    }
    setLoading(true);
    try {
      const r = await run({ data: { content } });
      setOut(r);
      bump("research", content.slice(0, 60));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to research");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    if (!out) return "";
    return [
      `Summary:\n${out.summary}`,
      `\nKey Insights:\n- ${out.keyInsights.join("\n- ")}`,
      `\nImportant Facts:\n- ${out.importantFacts.join("\n- ")}`,
      `\nRecommendations:\n- ${out.recommendations.join("\n- ")}`,
      `\nConclusion:\n${out.conclusion}`,
    ].join("\n");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Research Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Paste an article, notes, or a topic to get a structured analysis.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Label className="sr-only">Content</Label>
          <Textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste an article, notes, or enter a topic like 'Impact of remote work on team productivity'..."
          />
          <Button onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              "Run Research"
            )}
          </Button>
        </CardContent>
      </Card>

      {out && (
        <div className="grid gap-4 animate-fade-in lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                value={out.summary}
                onChange={(e) => setOut({ ...out, summary: e.target.value })}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {out.keyInsights.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Important Facts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {out.importantFacts.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {out.recommendations.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Conclusion</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                value={out.conclusion}
                onChange={(e) => setOut({ ...out, conclusion: e.target.value })}
              />
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
