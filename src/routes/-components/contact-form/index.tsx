import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { clientEnv } from "@/config/env/client";
import { Button } from "@/routes/-shadcn/components/ui/button";
import { Input } from "@/routes/-shadcn/components/ui/input";
import { Label } from "@/routes/-shadcn/components/ui/label";
import { Textarea } from "@/routes/-shadcn/components/ui/textarea";
import { orpcClient } from "@/server/client";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!turnstileToken) {
        return;
      }

      setIsSubmitting(true);

      try {
        await orpcClient.contact.sendMessage({
          email,
          message,
          name,
          turnstileToken,
        });

        setIsSubmitted(true);
      } finally {
        setIsSubmitting(false);
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }
    },
    [name, email, message, turnstileToken]
  );

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <CheckCircle2 className="size-12 text-green-500" />
          <h3 className="font-semibold text-lg">Message sent!</h3>
          <p className="text-muted-foreground text-sm">
            Thanks for reaching out. I'll get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border p-6 shadow-sm">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="name">
            Your name
          </Label>
          <Input
            disabled={isSubmitting}
            id="name"
            onChange={(e) => setName(e.target.value)}
            placeholder="What's your name?"
            required
            type="text"
            value={name}
          />
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="email">
            Email
          </Label>
          <Input
            disabled={isSubmitting}
            id="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="message">
            Message
          </Label>
          <Textarea
            className="min-h-[140px] resize-none"
            disabled={isSubmitting}
            id="message"
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind?"
            required
            value={message}
          />
        </div>

        <Turnstile
          onExpire={() => setTurnstileToken(null)}
          onSuccess={setTurnstileToken}
          ref={turnstileRef}
          siteKey={clientEnv.VITE_TURNSTILE_SITE_KEY}
        />

        <Button
          className="w-full gap-2"
          disabled={isSubmitting || !turnstileToken}
          size="lg"
          type="submit"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Send message
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
