export enum DataExportStatus {
  Pending = "Pending",
  Processing = "Processing",
  Completed = "Completed",
  Failed = "Failed",
  Expired = "Expired",
}

export enum AccountDeletionStatus {
  Pending = "Pending",
  Cancelled = "Cancelled",
  Processing = "Processing",
  Completed = "Completed",
}

export enum ConsentType {
  TermsOfService = "TermsOfService",
  PrivacyPolicy = "PrivacyPolicy",
  CookieAnalytics = "CookieAnalytics",
  CookieMarketing = "CookieMarketing",
  DataProcessing = "DataProcessing",
}

export interface DataExportDto {
  id: string;
  status: DataExportStatus;
  requestedAt: string;
  completedAt: string | null;
  downloadUrl: string | null;
  expiresAt: string | null;
}

export interface AccountDeletionDto {
  id: string;
  status: AccountDeletionStatus;
  requestedAt: string;
  gracePeriodEndsAt: string;
  deletedAt: string | null;
}

export interface UserConsentDto {
  consentType: ConsentType;
  isGranted: boolean;
  grantedAt: string | null;
  revokedAt: string | null;
  policyVersion: string;
}

export interface UpdateConsentRequest {
  consentType: ConsentType;
  isGranted: boolean;
}
