export interface User {
  id: string;
  keycloakId: string;
  displayName: string;
  avatarUrl: string | null;
  lastSeenAt: string | null;
  onlineStatus: OnlineStatus;
}

export enum OnlineStatus {
  Offline = 0,
  Online = 1,
  Away = 2,
  DoNotDisturb = 3,
}

export enum ConversationType {
  Direct = 0,
  Group = 1,
}

export enum MessageType {
  Text = 0,
  File = 1,
  Image = 2,
  System = 3,
}

export enum ParticipantRole {
  Member = 0,
  Admin = 1,
  Owner = 2,
}

export interface Conversation {
  id: string;
  type: ConversationType;
  createdAt: string;
  updatedAt: string | null;
  group: Group | null;
  participants: Participant[];
  lastMessage: Message | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  isEncrypted: boolean;
  createdAt: string;
  editedAt: string | null;
  sender: User;
  attachments: FileAttachment[];
}

export interface Group {
  id: string;
  conversationId: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
}

export interface Participant {
  id: string;
  conversationId: string;
  userId: string;
  role: ParticipantRole;
  joinedAt: string;
  lastReadMessageId: string | null;
  user: User;
}

export interface FileAttachment {
  id: string;
  messageId: string;
  fileName: string;
  contentType: string;
  size: number;
  storageKey: string;
  thumbnailKey: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errors: string[];
  validationErrors: Record<string, string[]> | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
