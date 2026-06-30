import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Loader2 } from "lucide-react";
import { summarizeMeeting } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { OutputActions } from "@/components/output-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useActivityStore } from "@/stores/activity";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meeting Notes — Workly AI" }] }),
  component: MeetingsPage,
});

type Output = {
  summary: string;
  keyDecisions: string[];
  actionItems: { task: string; owner: string; deadline: string }[];
  followUps: string[];
};

function MeetingsPage() {
  const call = useServerFn(summarizeMeeting);
  const addActivity = useActivityStore((s) => s.add);
  const [notes, setNotes] = useState("");
  const [out, setOut] = useState<Output | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!notes.trim()) {
      toast.error("Paste meeting notes first");
      return;
    }
    setLoading(true);
    try {
      const result = await call({ data: { notes } });
      setOut(result);
      addActivity({
        type: "meeting",
        title: "Meeting summary",
        snippet: result.summary.slice(0, 120),
      });
    } catch (e) {
      toast.error((e as Error).message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  const flat = out
    ? `# Summary\n${out.summary}\n\n## Key Decisions\n${out.keyDecisions.map((d) => `- ${d}`).join("\n")}\n\n## Action Items\n${out.actionItems.map((a) => `- ${a.task} (${a.owner}, ${a.deadline})`).join("\n")}\n\n## Follow-ups\n${out.followUps.map((f) => `- ${f}`).join("\n")}`
    : "";

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
      <div>
        <PageHeader
          title="Meeting Notes Summarizer"
          description="Turn raw notes into a clear briefing."
          icon={<FileText className="h-5 w-5" />}
        />
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <Label htmlFor="notes">Meeting notes / transcript</Label>
              <Textarea
                id="notes"
                rows={18}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your meeting notes here…"
              />
              <div className="mt-1 text-right text-xs text-muted-foreground">
                {notes.length} chars
              </div>
            </div>
            <Button onClick={run} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Summarize
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <PageHeader title="Structured summary" description="Editable sections." />
        <Card>
          <CardContent className="space-y-4 p-5">
            {!out ? (
              <p className="text-sm text-muted-foreground">Your summary will appear here.</p>
            ) : (
              <>
                <Section label="Summary">
                  <Textarea
                    rows={5}
                    value={out.summary}
                    onChange={(e) => setOut({ ...out, summary: e.target.value })}
                  />
                </Section>
                <Section label="Key Decisions">
                  <Textarea
                    rows={4}
                    value={out.keyDecisions.join("\n")}
                    onChange={(e) => setOut({ ...out, keyDecisions: e.target.value.split("\n") })}
                  />
                </Section>
                <Section label="Action Items">
                  <div className="space-y-2">
                    {out.actionItems.map((a, i) => (
                      <div key={i} className="grid gap-2 sm:grid-cols-3">
                        <input
                          className="rounded-md border bg-background px-2 py-1 text-sm"
                          value={a.task}
                          onChange={(e) => {
                            const items = [...out.actionItems];
                            items[i] = { ...a, task: e.target.value };
                            setOut({ ...out, actionItems: items });
                          }}
                        />
                        <input
                          className="rounded-md border bg-background px-2 py-1 text-sm"
                          value={a.owner}
                          onChange={(e) => {
                            const items = [...out.actionItems];
                            items[i] = { ...a, owner: e.target.value };
                            setOut({ ...out, actionItems: items });
                          }}
                        />
                        <input
                          className="rounded-md border bg-background px-2 py-1 text-sm"
                          value={a.deadline}
                          onChange={(e) => {
                            const items = [...out.actionItems];
                            items[i] = { ...a, deadline: e.target.value };
                            setOut({ ...out, actionItems: items });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </Section>
                <Section label="Follow-ups">
                  <Textarea
                    rows={3}
                    value={out.followUps.join("\n")}
                    onChange={(e) => setOut({ ...out, followUps: e.target.value.split("\n") })}
                  />
                </Section>
              </>
            )}
            <OutputActions text={flat} filename="meeting-summary.md" onRegenerate={run} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}
