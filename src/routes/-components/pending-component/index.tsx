import { Spinner } from "@/components/ui/spinner";

export function PendingComponent() {
  return (
    <div className="flex flex-1 items-center justify-center my-16">
      <Spinner className="size-8" />
    </div>
  );
}
