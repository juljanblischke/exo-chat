import { useOnlineStatus } from "@/hooks/use-online-status";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OnlineStatusIndicatorProps {
  userId: string | undefined;
  showLastSeen?: boolean;
  size?: "sm" | "md";
  className?: string;
}

function formatLastSeen(lastSeenAt: string | null): string {
  if (!lastSeenAt) return "Offline";
  const date = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Last seen just now";
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Last seen yesterday";
  return `Last seen ${diffDays}d ago`;
}

export function OnlineStatusIndicator({
  userId,
  showLastSeen = false,
  size = "sm",
  className,
}: OnlineStatusIndicatorProps) {
  const { isOnline, lastSeenAt } = useOnlineStatus(userId);

  const dotSize = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
  const tooltipText = isOnline ? "Online" : formatLastSeen(lastSeenAt);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex items-center gap-1", className)}>
            <span
              className={cn(
                "rounded-full border-2 border-background",
                dotSize,
                isOnline ? "bg-green-500" : "bg-gray-400"
              )}
            />
            {showLastSeen && !isOnline && lastSeenAt && (
              <span className="text-xs text-muted-foreground">
                {formatLastSeen(lastSeenAt)}
              </span>
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
