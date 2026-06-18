import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider, DEFAULT_MODEL } from "./ai-gateway.server";

function getGateway() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key);
}

/* ---------------- Email Generator ---------------- */
const EmailInput = z.object({
  purpose: z.string().min(1).max(2000),
  recipient: z.enum(["Client", "Manager", "Team Member"]),
  tone: z.enum(["Formal", "Friendly", "Persuasive"]),
  instructions: z.string().max(2000).optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(DEFAULT_MODEL),
      output: Output.object({
        schema: z.object({
          subject: z.string(),
          body: z.string(),
          closing: z.string(),
        }),
      }),
      system:
        "You are an expert business communication assistant. Generate a professional email based on the user's purpose, audience, and selected tone. Produce a concise subject line, a polished body (with greeting and well-structured paragraphs), and a professional closing statement. Avoid placeholders like [Name]; use natural defaults when unknown.",
      prompt: `Purpose: ${data.purpose}\nRecipient type: ${data.recipient}\nTone: ${data.tone}\nAdditional instructions: ${data.instructions || "(none)"}`,
    });
    return output;
  });

/* ---------------- Meeting Summarizer ---------------- */
const MeetingInput = z.object({
  notes: z.string().min(10).max(20000),
});

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => MeetingInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(DEFAULT_MODEL),
      output: Output.object({
        schema: z.object({
          executiveSummary: z.string(),
          keyDiscussionPoints: z.array(z.string()),
          decisionsMade: z.array(z.string()),
          actionItems: z.array(
            z.object({
              task: z.string(),
              owner: z.string(),
              dueDate: z.string(),
            }),
          ),
        }),
      }),
      system:
        "You are an executive meeting assistant. Summarize the notes into a concise executive summary, the key discussion points, decisions made, and action items with responsible person and due date. If an owner or date is missing, use 'Unassigned' or 'TBD'.",
      prompt: data.notes,
    });
    return output;
  });

/* ---------------- Task Planner ---------------- */
const PlannerInput = z.object({
  tasks: z.string().min(1).max(5000),
  workingHours: z.string().min(1).max(200),
  horizon: z.enum(["Daily", "Weekly"]),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => PlannerInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(DEFAULT_MODEL),
      output: Output.object({
        schema: z.object({
          schedule: z.array(
            z.object({
              timeBlock: z.string(),
              task: z.string(),
              priority: z.enum(["High", "Medium", "Low"]),
              notes: z.string(),
            }),
          ),
          priorityMatrix: z.object({
            urgentImportant: z.array(z.string()),
            importantNotUrgent: z.array(z.string()),
            urgentNotImportant: z.array(z.string()),
            neither: z.array(z.string()),
          }),
          suggestedOrder: z.array(z.string()),
          optimizationTips: z.array(z.string()),
        }),
      }),
      system:
        "You are a productivity coach. Prioritize tasks using urgency and importance (Eisenhower matrix) and generate an optimized schedule for the given horizon. Provide time blocks, a priority matrix, suggested order of completion, and concrete time-optimization recommendations.",
      prompt: `Horizon: ${data.horizon}\nAvailable working hours: ${data.workingHours}\nTasks with deadlines & priorities:\n${data.tasks}`,
    });
    return output;
  });

/* ---------------- Research Assistant ---------------- */
const ResearchInput = z.object({
  content: z.string().min(3).max(20000),
});

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const { output } = await generateText({
      model: gateway(DEFAULT_MODEL),
      output: Output.object({
        schema: z.object({
          summary: z.string(),
          keyInsights: z.array(z.string()),
          importantFacts: z.array(z.string()),
          recommendations: z.array(z.string()),
          conclusion: z.string(),
        }),
      }),
      system:
        "You are an AI research analyst. Summarize the provided content, extract key insights and important facts, propose actionable recommendations, and explain the findings in clear, simple language. If the input is only a topic, perform analysis from general knowledge while being transparent about assumptions.",
      prompt: data.content,
    });
    return output;
  });
