import { Button } from "@/components/ui/button";
import { Copy, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function OutputActions({
  text,
  filename,
  onRegenerate,
  loading,
}: {
  text: string;
  filename: string;
  onRegenerate?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(text);
          toast.success("Copied to clipboard");
        }}
      >
        <Copy className="mr-2 h-3.5 w-3.5" /> Copy
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const blob = new Blob([text], { type: "text/markdown" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        }}
      >
        <Download className="mr-2 h-3.5 w-3.5" /> Export
      </Button>
      {onRegenerate ? (
        <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Regenerate
        </Button>
      ) : null}
      <span className="ml-auto text-xs text-muted-foreground">{text.length} chars</span>
    </div>
  );
}
