import { Send } from "lucide-react";
import { Button } from "@/routes/-shadcn/components/ui/button";
import { Input } from "@/routes/-shadcn/components/ui/input";
import { Label } from "@/routes/-shadcn/components/ui/label";
import { Textarea } from "@/routes/-shadcn/components/ui/textarea";

export function ContactForm() {
  return (
    <div className="rounded-2xl border p-6 shadow-sm">
      <form className="space-y-5">
        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="name">
            Your name
          </Label>
          <Input id="name" placeholder="What's your name?" type="text" />
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="email">
            Email
          </Label>
          <Input id="email" placeholder="you@example.com" type="email" />
        </div>

        <div className="space-y-2">
          <Label className="font-medium text-sm" htmlFor="message">
            Message
          </Label>
          <Textarea
            className="min-h-[140px] resize-none"
            id="message"
            placeholder="What's on your mind?"
          />
        </div>

        <Button className="w-full gap-2" size="lg" type="submit">
          <Send className="size-4" />
          Send message
        </Button>
      </form>
    </div>
  );
}
