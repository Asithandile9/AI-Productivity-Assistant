import { Button } from "@/components/ui/button";
import { Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function OutputActions({
  onCopy,
  onRegenerate,
  loading,
}: {
  onCopy: () => string;
  onRegenerate?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          const text = onCopy();
          navigator.clipboard.writeText(text);
          toast.success("Copied to clipboard");
        }}
      >
        <Copy className="mr-2 h-4 w-4" /> Copy
      </Button>
      {onRegenerate && (
        <Button type="button" variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Regenerate
        </Button>
      )}
    </div>
  );
}
