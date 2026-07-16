import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  actions?: ReactNode;
  description: string;
  eyebrow: string;
  title: string;
};

export function AdminPageHeader(props: AdminPageHeaderProps) {
  const { actions, description, eyebrow, title } = props;

  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-base-300 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="route-kicker">{eyebrow}</span>
        <h1 className="heading mt-3 text-4xl sm:text-5xl">{title}</h1>
        <p className="muted mt-3 max-w-2xl">{description}</p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
