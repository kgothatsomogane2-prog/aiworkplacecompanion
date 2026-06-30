import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Search, Loader2 } from "lucide-react";
import { researchTopic } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { OutputActions } from "@/components/output-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useActivityStore } from "@/stores/activity";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Research — Workly AI" }] }),
  component: ResearchPage,
});

type Output = {
  executiveSummary: string;
  keyInsights: string[];
  statistics: string[];
  references: string[];
  recommendations: string[];
};

function ResearchPage() {
  const call = useServerFn(researchTopic);
  const addActivity = useActivityStore((s) => s.add);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState("standard");
  const [industry, setIndustry] = useState("");
  const [out, setOut] = useState<Output | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!topic.trim()) return toast.error("Enter a topic");
    setLoading(true);
    try {
      const result = await call({ data: { topic, depth, industry } });
      setOut(result);
      addActivity({
        type: "research",
        title: `Research: ${topic}`,
        snippet: result.executiveSummary.slice(0, 120),
      });
    } catch (e) {
      toast.error((e as Error).message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  const flat = out
    ? `# ${topic}\n\n## Executive Summary\n${out.executiveSummary}\n\n## Key Insights\n${out.keyInsights.map((i) => `- ${i}`).join("\n")}\n\n## Statistics\n${out.statistics.map((i) => `- ${i}`).join("\n")}\n\n## References\n${out.references.map((i) => `- ${i}`).join("\n")}\n\n## Recommendations\n${out.recommendations.map((i) => `- ${i}`).join("\n")}`
    : "";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="AI Research Assistant"
        description="Structured briefings on any workplace topic."
        icon={<Search className="h-5 w-5" />}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Hybrid work policies in 2026" />
            </div>
            <div>
              <Label>Depth</Label>
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["overview", "standard", "deep-dive"].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="industry">Industry (optional)</Label>
              <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="SaaS, healthcare, finance…" />
            </div>
            <Button onClick={run} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Research
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            {!out ? (
              <p className="text-sm text-muted-foreground">Results will appear here.</p>
            ) : (
              <>
                <Section label="Executive Summary">
                  <Textarea rows={4} value={out.executiveSummary} onChange={(e) => setOut({ ...out, executiveSummary: e.target.value })} />
                </Section>
                <Section label="Key Insights">
                  <Textarea rows={5} value={out.keyInsights.join("\n")} onChange={(e) => setOut({ ...out, keyInsights: e.target.value.split("\n") })} />
                </Section>
                <Section label="Statistics">
                  <Textarea rows={4} value={out.statistics.join("\n")} onChange={(e) => setOut({ ...out, statistics: e.target.value.split("\n") })} />
                </Section>
                <Section label="References">
                  <Textarea rows={3} value={out.references.join("\n")} onChange={(e) => setOut({ ...out, references: e.target.value.split("\n") })} />
                </Section>
                <Section label="Recommendations">
                  <Textarea rows={4} value={out.recommendations.join("\n")} onChange={(e) => setOut({ ...out, recommendations: e.target.value.split("\n") })} />
                </Section>
              </>
            )}
            <OutputActions text={flat} filename="research.md" onRegenerate={run} loading={loading} />
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
