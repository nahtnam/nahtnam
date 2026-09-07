import type { ReactNode } from "react";

type PrivateAiPageProps = {
  children: ReactNode;
  className?: string;
};

export function PrivateAiPage(props: PrivateAiPageProps) {
  const { children, className } = props;
  // PostHog excludes this element and its descendants from autocapture and
  // uses ph-no-capture as its default session-replay blockClass.
  return (
    <main className={`ph-no-capture page-shell max-w-3xl ${className ?? ""}`}>
      {children}
    </main>
  );
}
