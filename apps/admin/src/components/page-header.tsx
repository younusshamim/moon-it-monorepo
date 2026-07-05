import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {description ? <p className="text-muted-foreground">{description}</p> : null}
    </div>
  );
}
