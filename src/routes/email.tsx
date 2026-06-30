import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Mail, Loader2 } from "lucide-react";
import { generateEmail } from "@/lib/ai.functions";
import { PageHeader } from "@/components/page-header";
import { OutputActions } from "@/components/output-actions";
import { Card, CardContent } from "@/components/ui/card";
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
import { useActivityStore } from "@/stores/activity";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Smart Email — Workly AI" }] }),
  component: EmailPage,
});

function EmailPage() {
  const call = useServerFn(generateEmail);
  const addActivity = useActivityStore((s) => s.add);
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [details, setDetails] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!purpose || !recipient) {
      toast.error("Add a purpose and recipient");
      return;
    }
    setLoading(true);
    try {
      const out = await call({ data: { purpose, recipient, tone, length, details } });
      setSubject(out.subject);
      setBody(out.body);
      addActivity({
        type: "email",
        title: `Email: ${out.subject}`,
        snippet: out.body.slice(0, 120),
      });
    } catch (e) {
      toast.error((e as Error).message || "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
      <div>
        <PageHeader
          title="Smart Email Generator"
          description="Draft polished professional emails from a brief."
          icon={<Mail className="h-5 w-5" />}
        />
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Input id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="Request meeting reschedule" />
            </div>
            <div>
              <Label htmlFor="recipient">Recipient</Label>
              <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Hiring manager at Acme" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Professional", "Friendly", "Formal", "Persuasive", "Apologetic"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Length</Label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Short", "Medium", "Long"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="details">Additional details</Label>
              <Textarea id="details" rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Key points to include…" />
            </div>
            <Button onClick={run} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate email
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <PageHeader title="Output" description="Edit before sending." />
        <Card>
          <CardContent className="space-y-3 p-5">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Generated subject line will appear here" />
            </div>
            <div>
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" rows={16} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Generated email body will appear here" />
            </div>
            <OutputActions
              text={`Subject: ${subject}\n\n${body}`}
              filename="email.md"
              onRegenerate={run}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
