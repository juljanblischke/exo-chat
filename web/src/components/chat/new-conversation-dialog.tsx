"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Loader2 } from "lucide-react";
import { searchUsers, createConversation } from "@/lib/api/conversations";
import { ConversationType } from "@/types";
import type { User } from "@/types";
import { useChatStore } from "@/stores/chat-store";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewConversationDialog({
  open,
  onOpenChange,
}: NewConversationDialogProps) {
  const router = useRouter();
  const { fetchConversations } = useChatStore();
  const [tab, setTab] = useState<string>("direct");
  const [userQuery, setUserQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setUserQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await searchUsers(query);
      if (response.success && response.data) {
        setSearchResults(response.data);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectUser = useCallback(
    (user: User) => {
      if (tab === "direct") {
        setSelectedUsers([user]);
      } else {
        setSelectedUsers((prev) =>
          prev.some((u) => u.id === user.id)
            ? prev.filter((u) => u.id !== user.id)
            : [...prev, user]
        );
      }
    },
    [tab]
  );

  const handleRemoveUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== userId));
  }, []);

  const handleCreate = useCallback(async () => {
    if (selectedUsers.length === 0) return;

    setIsCreating(true);
    try {
      const isGroup = tab === "group";
      const response = await createConversation({
        type: isGroup ? ConversationType.Group : ConversationType.Direct,
        participantIds: selectedUsers.map((u) => u.id),
        groupName: isGroup ? groupName : undefined,
        groupDescription: isGroup ? groupDescription : undefined,
      });

      if (response.success && response.data) {
        await fetchConversations();
        onOpenChange(false);
        router.push(`/chat/${response.data.id}`);
        resetForm();
      }
    } finally {
      setIsCreating(false);
    }
  }, [
    selectedUsers,
    tab,
    groupName,
    groupDescription,
    fetchConversations,
    onOpenChange,
    router,
  ]);

  const resetForm = () => {
    setUserQuery("");
    setSearchResults([]);
    setSelectedUsers([]);
    setGroupName("");
    setGroupDescription("");
    setTab("direct");
  };

  const canCreate =
    selectedUsers.length > 0 &&
    (tab === "direct" || (tab === "group" && groupName.trim().length > 0));

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="direct">Direct Message</TabsTrigger>
            <TabsTrigger value="group">Group</TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={userQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <UserSearchResults
              results={searchResults}
              selectedUsers={selectedUsers}
              isSearching={isSearching}
              query={userQuery}
              onSelect={handleSelectUser}
            />
          </TabsContent>

          <TabsContent value="group" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name..."
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-desc">Description (optional)</Label>
              <Input
                id="group-desc"
                placeholder="Enter description..."
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Members</Label>
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-1 pb-2">
                  {selectedUsers.map((user) => (
                    <span
                      key={user.id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium"
                    >
                      {user.displayName}
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="ml-0.5 rounded-full hover:bg-primary/20"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users to add..."
                  className="pl-8"
                  value={userQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <UserSearchResults
                results={searchResults}
                selectedUsers={selectedUsers}
                isSearching={isSearching}
                query={userQuery}
                onSelect={handleSelectUser}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!canCreate || isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tab === "direct" ? "Start Chat" : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserSearchResults({
  results,
  selectedUsers,
  isSearching,
  query,
  onSelect,
}: {
  results: User[];
  selectedUsers: User[];
  isSearching: boolean;
  query: string;
  onSelect: (user: User) => void;
}) {
  if (isSearching) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.trim().length < 2) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Type at least 2 characters to search
      </p>
    );
  }

  if (results.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        No users found
      </p>
    );
  }

  return (
    <ScrollArea className="max-h-48">
      <div className="space-y-1">
        {results.map((user) => {
          const isSelected = selectedUsers.some((u) => u.id === user.id);
          return (
            <button
              key={user.id}
              onClick={() => onSelect(user)}
              className={`flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent ${
                isSelected ? "bg-accent" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {user.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{user.displayName}</span>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
