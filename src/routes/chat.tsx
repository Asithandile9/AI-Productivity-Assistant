import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, Sparkles, Trash2, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { AiDisclaimer } from "@/components/ai-disclaimer";
import { bump } from "@/lib/activity";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — AI Workplace" },
      { name: "description", content: "Conversational AI workplace assistant." },
    ],
  }),
  component: ChatPage,
});

const transport = new DefaultChatTransport({ api: "/api/chat" });
const examples = [
  "Give me 5 tips to run a focused 1:1 with a direct report.",
  "Draft a polite reminder for an overdue invoice.",
  "Explain OKRs in simple terms with an example.",
  "Brainstorm ideas to improve team async communication.",
];

function ChatPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, setMessages } = useChat({
    id: "workplace-assistant",
    transport,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  async function submit(text?: string) {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;
    setInput("");
    await sendMessage({ text: content });
    bump("chats", content.slice(0, 60));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold">AI Chatbot</h1>
            <p className="text-sm text-muted-foreground">
              Your conversational workplace assistant.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages([])}
          disabled={messages.length === 0}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Clear
        </Button>
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div ref={scrollRef} className="h-[55vh] overflow-y-auto px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="mt-3 text-lg font-semibold">How can I help today?</h2>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Ask for productivity advice, draft workplace content, explain business concepts, or
                  brainstorm ideas.
                </p>
                <div className="mt-5 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                  {examples.map((e) => (
                    <button
                      key={e}
                      onClick={() => submit(e)}
                      className="rounded-xl border border-border bg-card p-3 text-left text-sm transition hover:border-primary/40 hover:bg-accent"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="space-y-5">
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  const text = m.parts
                    .map((p: any) => (p.type === "text" ? p.text : ""))
                    .join("");
                  return (
                    <li
                      key={m.id}
                      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {isUser ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{text}</p>
                        ) : (
                          <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:my-2">
                            <ReactMarkdown>{text || "..."}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
                {status === "submitted" && (
                  <li className="flex gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-foreground">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60" />
                    </div>
                  </li>
                )}
              </ul>
            )}
          </div>

          <div className="border-t border-border bg-background/60 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="flex items-end gap-2"
            >
              <Textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Message the assistant..."
                className="max-h-40 min-h-[44px] resize-none"
                autoFocus
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <AiDisclaimer />
    </div>
  );
}
