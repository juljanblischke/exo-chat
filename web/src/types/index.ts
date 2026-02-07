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
  unreadCount?: number;
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

export enum CallStatus {
  Idle = "idle",
  Initiating = "initiating",
  Ringing = "ringing",
  Connecting = "connecting",
  Connected = "connected",
  Ended = "ended",
}

export interface IncomingCallData {
  conversationId: string;
  callerId: string;
  callerDisplayName: string;
  isVideo: boolean;
  roomName: string;
}

export interface CallTokenData {
  token: string;
  roomName: string;
  liveKitUrl: string;
}

// Search
export interface SearchResult {
  messageId: string;
  contentSnippet: string;
  conversationId: string;
  conversationName: string | null;
  senderName: string;
  senderAvatarUrl: string | null;
  sentAt: string;
}

// Notifications
export enum NotificationType {
  NewMessage = 0,
  MissedCall = 1,
  GroupInvite = 2,
  MentionInGroup = 3,
  SystemAlert = 4,
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: string | null;
  isRead: boolean;
  conversationId: string | null;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  conversationId: string | null;
  conversationName: string | null;
  enablePush: boolean;
  enableSound: boolean;
  enableDesktop: boolean;
  mutedUntil: string | null;
}

// User Settings
export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  statusMessage: string | null;
  email: string | null;
}

export enum StatusVisibility {
  Everyone = 0,
  Contacts = 1,
  Nobody = 2,
}

export interface UserPrivacySettings {
  readReceiptsEnabled: boolean;
  onlineStatusVisibility: StatusVisibility;
}

export interface BlockedUser {
  id: string;
  blockedUserId: string;
  blockedUserDisplayName: string;
  blockedUserAvatarUrl: string | null;
  blockedAt: string;
}

// Appearance
export type ThemeMode = "light" | "dark" | "system";
export type FontSize = "small" | "medium" | "large";
export type MessageDensity = "compact" | "comfortable";
