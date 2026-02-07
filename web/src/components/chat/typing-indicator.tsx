import type { User } from "@/types";

interface TypingIndicatorProps {
  users: User[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const text =
    users.length === 1
      ? `${users[0].displayName} is typing...`
      : users.length === 2
        ? `${users[0].displayName} and ${users[1].displayName} are typing...`
        : `${users[0].displayName} and ${users.length - 1} others are typing...`;

  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="flex gap-0.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
      </div>
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  );
}
