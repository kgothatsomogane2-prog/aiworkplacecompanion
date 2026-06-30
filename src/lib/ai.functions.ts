import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

const MODEL = "google/gemini-3-flash-preview";

// ---------- Email ----------
const EmailInput = z.object({
  purpose: z.string().min(1),
  recipient: z.string().min(1),
  tone: z.string().min(1),
  length: z.string().min(1),
  details: z.string().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(MODEL),
      output: Output.object({
        schema: z.object({
          subject: z.string(),
          body: z.string(),
        }),
      }),
      system:
        "You are a professional business communication assistant. Generate clear, concise, polite, well-structured emails.",
      prompt: `Generate a professional email.
Purpose: ${data.purpose}
Recipient: ${data.recipient}
Tone: ${data.tone}
Length: ${data.length}
Additional Details: ${data.details || "(none)"}

Return a subject line and the email body. The body should include a greeting, body paragraphs, and sign-off.`,
    });
    return output;
  });

// ---------- Meeting ----------
const MeetingInput = z.object({ notes: z.string().min(1) });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => MeetingInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(MODEL),
      output: Output.object({
        schema: z.object({
          summary: z.string(),
          keyDecisions: z.array(z.string()),
          actionItems: z.array(
            z.object({
              task: z.string(),
              owner: z.string(),
              deadline: z.string(),
            }),
          ),
          followUps: z.array(z.string()),
        }),
      }),
      system: "You summarize meeting notes precisely and professionally.",
      prompt: `Summarize the following meeting notes.

Meeting Notes:
${data.notes}`,
    });
    return output;
  });

// ---------- Tasks ----------
const TaskInput = z.object({
  goals: z.string().min(1),
  deadline: z.string().default(""),
  workingHours: z.string().default("8"),
  priority: z.string().default("balanced"),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TaskInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(MODEL),
      output: Output.object({
        schema: z.object({
          tasks: z.array(
            z.object({
              priority: z.string(),
              task: z.string(),
              timeEstimate: z.string(),
              status: z.string(),
            }),
          ),
          schedule: z.string(),
        }),
      }),
      system: "You are an expert productivity planner.",
      prompt: `Create a productivity plan.
Goals: ${data.goals}
Deadline: ${data.deadline || "(open)"}
Available working hours per day: ${data.workingHours}
Overall priority focus: ${data.priority}

Prioritize tasks (High/Medium/Low), estimate completion time, set status to "Pending", and suggest a brief logical schedule.`,
    });
    return output;
  });

// ---------- Research ----------
const ResearchInput = z.object({
  topic: z.string().min(1),
  depth: z.string().default("standard"),
  industry: z.string().default(""),
});

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(MODEL),
      output: Output.object({
        schema: z.object({
          executiveSummary: z.string(),
          keyInsights: z.array(z.string()),
          statistics: z.array(z.string()),
          references: z.array(z.string()),
          recommendations: z.array(z.string()),
        }),
      }),
      system: "You are a meticulous workplace research assistant.",
      prompt: `Research the following topic and produce a structured report.
Topic: ${data.topic}
Desired depth: ${data.depth}
Industry: ${data.industry || "(general)"}

Provide overview, key findings, important statistics (with context), references (generic, not fabricated URLs), and actionable recommendations.`,
    });
    return output;
  });
