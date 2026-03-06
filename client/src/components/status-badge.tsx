import { cn } from "@/lib/utils";
import { Clock, PlayCircle, CheckCircle2 } from "lucide-react";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  let label = "Unknown";
  let colorClass = "bg-muted text-muted-foreground border-muted-foreground/20";
  let Icon = Clock;

  switch (status) {
    case "new":
      label = "New Account";
      colorClass = "bg-[hsl(var(--status-new))/15] text-[hsl(var(--status-new))] border-[hsl(var(--status-new))/30]";
      Icon = Clock;
      break;
    case "demo_processed":
      label = "Demo Processed";
      colorClass = "bg-[hsl(var(--status-demo))/15] text-[hsl(var(--status-demo))] border-[hsl(var(--status-demo))/30]";
      Icon = PlayCircle;
      break;
    case "onboarding_processed":
      label = "Onboarding Complete";
      colorClass = "bg-[hsl(var(--status-onboarding))/15] text-[hsl(var(--status-onboarding))] border-[hsl(var(--status-onboarding))/30]";
      Icon = CheckCircle2;
      break;
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border", colorClass, className)}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </div>
  );
}
