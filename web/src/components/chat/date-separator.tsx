import { Separator } from "@/components/ui/separator";
import { formatDateSeparator } from "@/lib/format";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="relative flex items-center py-3">
      <Separator className="flex-1" />
      <span className="mx-3 shrink-0 text-xs text-muted-foreground">
        {formatDateSeparator(date)}
      </span>
      <Separator className="flex-1" />
    </div>
  );
}
