"use client";

import { useState, useCallback, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Crown,
  Shield,
  MoreVertical,
  UserPlus,
  LogOut,
  Trash2,
  Loader2,
  Search,
} from "lucide-react";
import type { Conversation, Participant, User } from "@/types";
import { ParticipantRole } from "@/types";
import {
  updateGroup,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
  leaveGroup,
} from "@/lib/api/groups";
import { searchUsers } from "@/lib/api/conversations";
import { useChatStore } from "@/stores/chat-store";
import { useAuth } from "@/hooks/use-auth";

interface GroupSettingsDialogProps {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getRoleLabel(role: ParticipantRole): string {
  switch (role) {
    case ParticipantRole.Owner:
      return "Owner";
    case ParticipantRole.Admin:
      return "Admin";
    case ParticipantRole.Member:
      return "Member";
    default:
      return "Member";
  }
}

function getRoleIcon(role: ParticipantRole) {
  switch (role) {
    case ParticipantRole.Owner:
      return <Crown className="h-3 w-3" />;
    case ParticipantRole.Admin:
      return <Shield className="h-3 w-3" />;
    default:
      return null;
  }
}

export function GroupSettingsDialog({
  conversation,
  open,
  onOpenChange,
}: GroupSettingsDialogProps) {
  const { session } = useAuth();
  const { fetchConversations } = useChatStore();
  const currentUserId = session?.user?.id;

  const currentParticipant = conversation.participants.find(
    (p) => p.userId === currentUserId
  );
  const currentRole = currentParticipant?.role ?? ParticipantRole.Member;
  const isAdmin =
    currentRole === ParticipantRole.Admin ||
    currentRole === ParticipantRole.Owner;
  const isOwner = currentRole === ParticipantRole.Owner;

  const [groupName, setGroupName] = useState(
    conversation.group?.name ?? ""
  );
  const [groupDescription, setGroupDescription] = useState(
    conversation.group?.description ?? ""
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [memberSearchResults, setMemberSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    if (open) {
      setGroupName(conversation.group?.name ?? "");
      setGroupDescription(conversation.group?.description ?? "");
      setShowAddMember(false);
      setMemberSearchQuery("");
      setMemberSearchResults([]);
    }
  }, [open, conversation.group]);

  const handleSaveInfo = useCallback(async () => {
    if (!groupName.trim()) return;
    setIsSaving(true);
    try {
      await updateGroup(conversation.id, {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
      });
      await fetchConversations();
    } finally {
      setIsSaving(false);
    }
  }, [conversation.id, groupName, groupDescription, fetchConversations]);

  const handleSearchMembers = useCallback(async (query: string) => {
    setMemberSearchQuery(query);
    if (query.trim().length < 2) {
      setMemberSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await searchUsers(query);
      if (response.success && response.data) {
        setMemberSearchResults(response.data);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleAddMember = useCallback(
    async (userId: string) => {
      setIsAddingMember(true);
      try {
        await addGroupMember(conversation.id, userId);
        await fetchConversations();
        setMemberSearchQuery("");
        setMemberSearchResults([]);
        setShowAddMember(false);
      } finally {
        setIsAddingMember(false);
      }
    },
    [conversation.id, fetchConversations]
  );

  const handleRemoveMember = useCallback(
    async (userId: string) => {
      await removeGroupMember(conversation.id, userId);
      await fetchConversations();
    },
    [conversation.id, fetchConversations]
  );

  const handleChangeRole = useCallback(
    async (userId: string, role: ParticipantRole) => {
      await updateMemberRole(conversation.id, userId, role);
      await fetchConversations();
    },
    [conversation.id, fetchConversations]
  );

  const handleLeaveGroup = useCallback(async () => {
    await leaveGroup(conversation.id);
    await fetchConversations();
    onOpenChange(false);
  }, [conversation.id, fetchConversations, onOpenChange]);

  const existingMemberIds = new Set(
    conversation.participants.map((p) => p.userId)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Group Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Group Info */}
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="group-name-edit">Group Name</Label>
              <Input
                id="group-name-edit"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group-desc-edit">Description</Label>
              <Input
                id="group-desc-edit"
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="Add a description..."
                disabled={!isAdmin}
              />
            </div>
            {isAdmin && (
              <Button
                onClick={handleSaveInfo}
                disabled={isSaving || !groupName.trim()}
                size="sm"
              >
                {isSaving && (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                )}
                Save Changes
              </Button>
            )}
          </div>

          <Separator />

          {/* Members */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>
                Members ({conversation.participants.length})
              </Label>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddMember(!showAddMember)}
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              )}
            </div>

            {showAddMember && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={memberSearchQuery}
                    onChange={(e) => handleSearchMembers(e.target.value)}
                  />
                </div>
                {isSearching && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {memberSearchResults
                  .filter((u) => !existingMemberIds.has(u.id))
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddMember(user.id)}
                      disabled={isAddingMember}
                      className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-accent"
                    >
                      <Avatar className="h-7 w-7">
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
                  ))}
              </div>
            )}

            <ScrollArea className="max-h-60">
              <div className="space-y-1">
                {conversation.participants
                  .sort((a, b) => b.role - a.role)
                  .map((participant) => (
                    <MemberRow
                      key={participant.id}
                      participant={participant}
                      currentUserId={currentUserId}
                      isAdmin={isAdmin}
                      isOwner={isOwner}
                      onRemove={handleRemoveMember}
                      onChangeRole={handleChangeRole}
                    />
                  ))}
              </div>
            </ScrollArea>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={handleLeaveGroup}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Leave Group
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({
  participant,
  currentUserId,
  isAdmin,
  isOwner,
  onRemove,
  onChangeRole,
}: {
  participant: Participant;
  currentUserId?: string;
  isAdmin: boolean;
  isOwner: boolean;
  onRemove: (userId: string) => void;
  onChangeRole: (userId: string, role: ParticipantRole) => void;
}) {
  const isSelf = participant.userId === currentUserId;
  const canManage =
    !isSelf &&
    isAdmin &&
    (isOwner || participant.role === ParticipantRole.Member);

  const initials = participant.user?.displayName
    ? participant.user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <div className="flex items-center gap-3 rounded-lg p-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {participant.user?.displayName ?? "Unknown"}
          </span>
          {isSelf && (
            <span className="text-xs text-muted-foreground">(you)</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {participant.role !== ParticipantRole.Member && (
          <Badge variant="secondary" className="gap-1 text-xs">
            {getRoleIcon(participant.role)}
            {getRoleLabel(participant.role)}
          </Badge>
        )}
        {canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isOwner && participant.role === ParticipantRole.Member && (
                <DropdownMenuItem
                  onClick={() =>
                    onChangeRole(participant.userId, ParticipantRole.Admin)
                  }
                >
                  <Shield className="mr-2 h-3.5 w-3.5" />
                  Make Admin
                </DropdownMenuItem>
              )}
              {isOwner && participant.role === ParticipantRole.Admin && (
                <DropdownMenuItem
                  onClick={() =>
                    onChangeRole(participant.userId, ParticipantRole.Member)
                  }
                >
                  Demote to Member
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onRemove(participant.userId)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Remove from Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
