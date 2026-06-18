import { ShieldAlert } from "lucide-react";

export function AiDisclaimer() {
  return (
    <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p>
        AI-generated content may contain inaccuracies or incomplete information. Please review and
        verify outputs before using them for business, legal, financial, or professional decisions.
      </p>
    </div>
  );
}
