"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquarePlus, Search } from "lucide-react";

export function Sidebar() {
  return (
    <aside className="flex h-full w-72 flex-col border-r lg:w-80">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MessageSquarePlus className="h-4 w-4" />
          <span className="sr-only">New conversation</span>
        </Button>
      </div>
      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {/* Placeholder skeleton items */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
