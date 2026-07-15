export function PendingComponent() {
  return (
    <output
      aria-label="Loading"
      className="flex h-full min-h-64 items-center justify-center"
    >
      <span
        aria-hidden="true"
        className="loading loading-spinner loading-lg text-primary"
      />
    </output>
  );
}
