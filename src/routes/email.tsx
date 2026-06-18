import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { generateEmail } from "@/lib/ai.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { OutputActions } from "@/components/output-actions";
import { bump } from "@/lib/activity";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace" },
      { name: "description", content: "Generate professional emails with AI." },
    ],
  }),
  component: EmailPage,
});

type EmailOut = { subject: string; body: string; closing: string };

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState<"Client" | "Manager" | "Team Member">("Client");
  const [tone, setTone] = useState<"Formal" | "Friendly" | "Persuasive">("Formal");
  const [instructions, setInstructions] = useState("");
  const [out, setOut] = useState<EmailOut | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!purpose.trim()) {
      toast.error("Please describe the email purpose");
      return;
    }
    setLoading(true);
    try {
      const result = await run({ data: { purpose, recipient, tone, instructions } });
      setOut(result);
      bump("emails", purpose.slice(0, 60));
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Smart Email Generator</h1>
          <p className="text-sm text-muted-foreground">
            Draft polished emails tailored to your audience and tone.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email purpose</Label>
              <Textarea
                rows={4}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Request a project deadline extension for the Q3 launch"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Recipient</Label>
                <Select value={recipient} onValueChange={(v) => setRecipient(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Client">Client</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Team Member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Formal">Formal</SelectItem>
                    <SelectItem value="Friendly">Friendly</SelectItem>
                    <SelectItem value="Persuasive">Persuasive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Additional instructions (optional)</Label>
              <Textarea
                rows={3}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Keep it under 150 words, mention next steps..."
              />
            </div>
            <Button onClick={submit} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                "Generate Email"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Output</CardTitle>
          </CardHeader>
          <CardContent>
            {!out && !loading && (
              <p className="text-sm text-muted-foreground">
                Your generated email will appear here.
              </p>
            )}
            {loading && (
              <div className="space-y-3">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-24 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
              </div>
            )}
            {out && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input value={out.subject} onChange={(e) => setOut({ ...out, subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea
                    rows={10}
                    value={out.body}
                    onChange={(e) => setOut({ ...out, body: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Closing</Label>
                  <Textarea
                    rows={3}
                    value={out.closing}
                    onChange={(e) => setOut({ ...out, closing: e.target.value })}
                  />
                </div>
                <OutputActions
                  loading={loading}
                  onRegenerate={submit}
                  onCopy={() => `Subject: ${out.subject}\n\n${out.body}\n\n${out.closing}`}
                />
                <AiDisclaimer />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
