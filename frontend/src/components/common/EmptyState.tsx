import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="state-panel">
      {icon ?? <Inbox size={32} />}
      <p className="state-title">{title}</p>
      {description && <p>{description}</p>}
      {action}
    </div>
  );
}
