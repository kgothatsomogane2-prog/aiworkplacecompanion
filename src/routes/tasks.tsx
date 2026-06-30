import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ListTodo, Loader2, Trash2 } from "lucide-react";
import { planTasks } from "@/lib/ai.functions";
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
import { Badge } from "@/components/ui/badge";
import { useActivityStore } from "@/stores/activity";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Task Planner — Workly AI" }] }),
  component: TasksPage,
});

type Task = { priority: string; task: string; timeEstimate: string; status: string };
type Output = { tasks: Task[]; schedule: string };

function TasksPage() {
  const call = useServerFn(planTasks);
  const addActivity = useActivityStore((s) => s.add);
  const [goals, setGoals] = useState("");
  const [deadline, setDeadline] = useState("");
  const [workingHours, setWorkingHours] = useState("8");
  const [priority, setPriority] = useState("balanced");
  const [out, setOut] = useState<Output | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!goals.trim()) return toast.error("Add your goals first");
    setLoading(true);
    try {
      const result = await call({ data: { goals, deadline, workingHours, priority } });
      setOut(result);
      addActivity({ type: "task", title: "Task plan", snippet: result.schedule.slice(0, 120) });
    } catch (e) {
      toast.error((e as Error).message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  const flat = out
    ? out.tasks
        .map((t) => `[${t.priority}] ${t.task} — ${t.timeEstimate} (${t.status})`)
        .join("\n") + `\n\nSchedule:\n${out.schedule}`
    : "";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="AI Task Planner"
        description="Generate a prioritized, time-boxed plan."
        icon={<ListTodo className="h-5 w-5" />}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <Label htmlFor="goals">Goals</Label>
              <Textarea id="goals" rows={6} value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="What do you need to accomplish?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="hours">Working hours/day</Label>
                <Input id="hours" type="number" min={1} max={16} value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Priority focus</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["balanced", "speed", "quality", "deep-work"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={run} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate plan
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            {!out ? (
              <p className="text-sm text-muted-foreground">Your plan will appear here.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="pb-2">Priority</th>
                        <th className="pb-2">Task</th>
                        <th className="pb-2">Time</th>
                        <th className="pb-2">Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {out.tasks.map((t, i) => (
                        <tr key={i}>
                          <td className="py-2 pr-2">
                            <Badge variant={t.priority.toLowerCase().startsWith("h") ? "default" : "secondary"}>
                              {t.priority}
                            </Badge>
                          </td>
                          <td className="py-2 pr-2">
                            <input
                              className="w-full rounded-md border bg-background px-2 py-1"
                              value={t.task}
                              onChange={(e) => {
                                const tasks = [...out.tasks];
                                tasks[i] = { ...t, task: e.target.value };
                                setOut({ ...out, tasks });
                              }}
                            />
                          </td>
                          <td className="py-2 pr-2 whitespace-nowrap">{t.timeEstimate}</td>
                          <td className="py-2 pr-2">
                            <Select
                              value={t.status}
                              onValueChange={(v) => {
                                const tasks = [...out.tasks];
                                tasks[i] = { ...t, status: v };
                                setOut({ ...out, tasks });
                              }}
                            >
                              <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {["Pending", "In Progress", "Done"].map((s) => (
                                  <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setOut({ ...out, tasks: out.tasks.filter((_, j) => j !== i) })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <Label>Suggested schedule</Label>
                  <Textarea
                    rows={4}
                    value={out.schedule}
                    onChange={(e) => setOut({ ...out, schedule: e.target.value })}
                  />
                </div>
              </>
            )}
            <OutputActions text={flat} filename="task-plan.md" onRegenerate={run} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
