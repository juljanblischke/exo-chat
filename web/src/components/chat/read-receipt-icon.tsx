import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ReadStatus = "sent" | "read";

interface ReadReceiptIconProps {
  status: ReadStatus;
  readByCount?: number;
  className?: string;
}

export function ReadReceiptIcon({ status, readByCount, className }: ReadReceiptIconProps) {
  const tooltipText =
    status === "read"
      ? readByCount !== undefined && readByCount > 1
        ? `Read by ${readByCount}`
        : "Read"
      : "Sent";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("inline-flex", className)}>
            {status === "read" ? (
              <CheckCheck className="h-3.5 w-3.5 text-blue-400" />
            ) : (
              <Check className="h-3.5 w-3.5" />
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
