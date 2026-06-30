import { ShieldAlert } from "lucide-react";

export function ResponsibleAi({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border bg-muted/40 text-muted-foreground ${
        compact ? "px-3 py-2 text-xs" : "p-3 text-sm"
      }`}
    >
      <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p>
        <span className="font-medium text-foreground">Responsible AI Notice.</span>{" "}
        AI-generated responses may contain inaccuracies. Review, verify, and edit
        before using for business, legal, financial, or other important decisions.
      </p>
    </div>
  );
}
