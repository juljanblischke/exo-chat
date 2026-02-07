import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Smile } from "lucide-react";

export function ChatArea() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Chat header */}
      <div className="flex h-14 items-center border-b px-4">
        <span className="text-sm text-muted-foreground">
          Select a conversation to start chatting
        </span>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No messages yet
          </p>
        </div>
      </ScrollArea>

      {/* Message input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Input
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button variant="ghost" size="icon" className="shrink-0">
            <Smile className="h-4 w-4" />
            <span className="sr-only">Emoji</span>
          </Button>
          <Button size="icon" className="shrink-0">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
