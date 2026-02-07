"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageSquare } from "lucide-react";
import { useMessageSearch } from "@/hooks/use-message-search";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const { query, results, isLoading, totalCount, debouncedSearch, clearSearch } =
    useMessageSearch();

  useEffect(() => {
    if (!open) {
      clearSearch();
    }
  }, [open, clearSearch]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    },
    [open, onOpenChange]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleResultClick = (conversationId: string, messageId: string) => {
    onOpenChange(false);
    router.push(`/chat/${conversationId}?messageId=${messageId}`);
  };

  // Group results by conversation
  const groupedResults = results.reduce(
    (groups, result) => {
      const key = result.conversationId;
      if (!groups[key]) {
        groups[key] = {
          conversationId: result.conversationId,
          conversationName: result.conversationName,
          results: [],
        };
      }
      groups[key].results.push(result);
      return groups;
    },
    {} as Record<
      string,
      {
        conversationId: string;
        conversationName: string | null;
        results: typeof results;
      }
    >
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search Messages</DialogTitle>
        </DialogHeader>
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search messages..."
            value={query}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
        </div>
        <ScrollArea className="max-h-[400px]">
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}
          {!isLoading && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found
            </div>
          )}
          {!isLoading && query.length > 0 && query.length < 2 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search
            </div>
          )}
          {Object.values(groupedResults).map((group) => (
            <div key={group.conversationId}>
              <div className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                <MessageSquare className="h-3 w-3" />
                {group.conversationName ?? "Direct Message"}
              </div>
              {group.results.map((result) => (
                <button
                  key={result.messageId}
                  onClick={() =>
                    handleResultClick(result.conversationId, result.messageId)
                  }
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-accent transition-colors"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs">
                      {result.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {result.senderName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {result.contentSnippet}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ))}
          {totalCount > results.length && (
            <div className="p-2 text-center text-xs text-muted-foreground">
              Showing {results.length} of {totalCount} results
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
