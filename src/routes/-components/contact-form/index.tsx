import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useAction } from "convex/react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { clientEnv } from "@/lib/config/client";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(
    undefined,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const sendMessage = useAction(api.contact.actions.sendMessage);

  const handleSubmit = useCallback(
    async (event: React.SyntheticEvent) => {
      event.preventDefault();

      if (!turnstileToken) {
        return;
      }

      setIsSubmitting(true);

      try {
        await sendMessage({
          email,
          message,
          name,
          turnstileToken,
        });

        setIsSubmitted(true);
      } finally {
        setIsSubmitting(false);
        turnstileRef.current?.reset();
        setTurnstileToken(undefined);
      }
    },
    [name, email, message, turnstileToken, sendMessage],
  );

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border p-6 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
          <CheckCircle2 className="size-12 text-green-500" />
          <h3 className="font-semibold text-lg">Message sent!</h3>
          <p className="text-muted-foreground text-sm">
            Thanks for reaching out. I&apos;ll get back to you soon.
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
            required
            disabled={isSubmitting}
            id="name"
            placeholder="What's your name?"
            type="text"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="email">
            Email
          </Label>
          <Input
            required
            disabled={isSubmitting}
            id="email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
          />
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="message">
            Message
          </Label>
          <Textarea
            required
            className="min-h-[140px] resize-none"
            disabled={isSubmitting}
            id="message"
            placeholder="What's on your mind?"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
            }}
          />
        </div>

        <Turnstile
          ref={turnstileRef}
          siteKey={clientEnv.VITE_TURNSTILE_SITE_KEY}
          onExpire={() => {
            setTurnstileToken(undefined);
          }}
          onSuccess={setTurnstileToken}
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
