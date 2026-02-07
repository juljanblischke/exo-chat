"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X } from "lucide-react";
import {
  getUserConsents,
  updateConsent,
  requestDataExport,
  getExportDownload,
  requestAccountDeletion,
  cancelAccountDeletion,
} from "@/lib/api/gdpr";
import {
  getPrivacySettings,
  updatePrivacySettings,
  getBlockedUsers,
  unblockUser,
} from "@/lib/api/users";
import type {
  UserConsentDto,
  DataExportDto,
} from "@/types/gdpr";
import type { UserPrivacySettings, BlockedUser } from "@/types";
import { StatusVisibility } from "@/types";
import { ConsentType, DataExportStatus } from "@/types/gdpr";

export default function PrivacySettingsPage() {
  const [consents, setConsents] = useState<UserConsentDto[]>([]);
  const [exportData, setExportData] = useState<DataExportDto | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [privacySettings, setPrivacySettings] = useState<UserPrivacySettings>({
    readReceiptsEnabled: true,
    onlineStatusVisibility: StatusVisibility.Everyone,
  });
  const [blockedUsersList, setBlockedUsersList] = useState<BlockedUser[]>([]);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

  useEffect(() => {
    loadConsents();
    loadPrivacySettings();
    loadBlockedUsers();
  }, []);

  const loadPrivacySettings = async () => {
    const response = await getPrivacySettings();
    if (response.success && response.data) {
      setPrivacySettings(response.data);
    }
  };

  const loadBlockedUsers = async () => {
    const response = await getBlockedUsers();
    if (response.success && response.data) {
      setBlockedUsersList(response.data);
    }
  };

  const handlePrivacyUpdate = async (updates: Partial<UserPrivacySettings>) => {
    setIsSavingPrivacy(true);
    setError(null);
    const newSettings = { ...privacySettings, ...updates };
    try {
      const response = await updatePrivacySettings(newSettings);
      if (response.success && response.data) {
        setPrivacySettings(response.data);
        setSuccess("Privacy settings updated");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("Failed to update privacy settings.");
      }
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  const handleUnblock = async (userId: string) => {
    const response = await unblockUser(userId);
    if (response.success) {
      setBlockedUsersList((prev) => prev.filter((b) => b.blockedUserId !== userId));
      setSuccess("User unblocked");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const loadConsents = async () => {
    const response = await getUserConsents();
    if (response.success && response.data) {
      setConsents(response.data);
    }
  };

  const handleConsentToggle = async (consentType: ConsentType, isGranted: boolean) => {
    setError(null);
    const response = await updateConsent({ consentType, isGranted });
    if (response.success) {
      await loadConsents();
      setSuccess("Einwilligung aktualisiert.");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError("Fehler beim Aktualisieren der Einwilligung.");
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    setError(null);
    try {
      const response = await requestDataExport();
      if (response.success && response.data) {
        setExportData(response.data);
        setSuccess("Datenexport wird erstellt...");
        // Poll for completion
        if (response.data.status === DataExportStatus.Completed) {
          const downloadResponse = await getExportDownload(response.data.id);
          if (downloadResponse.success && downloadResponse.data) {
            setExportData(downloadResponse.data);
          }
        }
      } else {
        setError("Fehler beim Erstellen des Datenexports.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeleting(true);
    setError(null);
    try {
      const response = await requestAccountDeletion();
      if (response.success) {
        setSuccess(
          "Kontoloeschung beantragt. Sie haben 30 Tage Zeit, um die Loeschung zu widerrufen."
        );
        setShowDeleteConfirm(false);
        setDeleteConfirmText("");
      } else {
        setError("Fehler beim Beantragen der Kontoloeschung.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDeletion = async () => {
    setError(null);
    const response = await cancelAccountDeletion();
    if (response.success) {
      setSuccess("Kontoloeschung widerrufen.");
    } else {
      setError("Fehler beim Widerrufen der Kontoloeschung.");
    }
  };

  const getConsentStatus = (type: ConsentType): boolean => {
    const consent = consents.find((c) => c.consentType === type);
    return consent?.isGranted ?? false;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Datenschutz-Einstellungen</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Verwalten Sie Ihre Datenschutzeinstellungen, Einwilligungen und Daten.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-500 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400">
          {success}
        </div>
      )}

      {/* Privacy Controls */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Privacy Controls</h2>
        <div className="space-y-3 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Read Receipts</p>
              <p className="text-xs text-muted-foreground">
                Let others know when you have read their messages
              </p>
            </div>
            <input
              type="checkbox"
              checked={privacySettings.readReceiptsEnabled}
              onChange={(e) =>
                handlePrivacyUpdate({ readReceiptsEnabled: e.target.checked })
              }
              disabled={isSavingPrivacy}
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Online Status Visibility</p>
              <p className="text-xs text-muted-foreground">
                Who can see when you are online
              </p>
            </div>
            <select
              value={privacySettings.onlineStatusVisibility}
              onChange={(e) =>
                handlePrivacyUpdate({
                  onlineStatusVisibility: Number(e.target.value) as StatusVisibility,
                })
              }
              disabled={isSavingPrivacy}
              className="rounded-md border px-2 py-1 text-sm bg-background"
            >
              <option value={StatusVisibility.Everyone}>Everyone</option>
              <option value={StatusVisibility.Contacts}>Contacts only</option>
              <option value={StatusVisibility.Nobody}>Nobody</option>
            </select>
          </div>
        </div>
      </section>

      {/* Blocked Users */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Blocked Users</h2>
        {blockedUsersList.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have not blocked any users.
          </p>
        ) : (
          <div className="space-y-2">
            {blockedUsersList.map((blocked) => (
              <div
                key={blocked.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {blocked.blockedUserDisplayName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {blocked.blockedUserDisplayName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Blocked on {new Date(blocked.blockedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUnblock(blocked.blockedUserId)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Consent Management */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Einwilligungen</h2>
        <div className="space-y-3 rounded-md border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Nutzungsbedingungen</p>
              <p className="text-xs text-muted-foreground">
                Erforderlich fuer die Nutzung von ExoChat.
              </p>
            </div>
            <input
              type="checkbox"
              checked={getConsentStatus(ConsentType.TermsOfService)}
              onChange={(e) =>
                handleConsentToggle(ConsentType.TermsOfService, e.target.checked)
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Datenschutzerklaerung</p>
              <p className="text-xs text-muted-foreground">
                Erforderlich fuer die Nutzung von ExoChat.
              </p>
            </div>
            <input
              type="checkbox"
              checked={getConsentStatus(ConsentType.PrivacyPolicy)}
              onChange={(e) =>
                handleConsentToggle(ConsentType.PrivacyPolicy, e.target.checked)
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Analyse-Cookies</p>
              <p className="text-xs text-muted-foreground">
                Helfen uns, die Website zu verbessern.
              </p>
            </div>
            <input
              type="checkbox"
              checked={getConsentStatus(ConsentType.CookieAnalytics)}
              onChange={(e) =>
                handleConsentToggle(ConsentType.CookieAnalytics, e.target.checked)
              }
              className="h-4 w-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Marketing-Cookies</p>
              <p className="text-xs text-muted-foreground">
                Werden fuer personalisierte Inhalte verwendet.
              </p>
            </div>
            <input
              type="checkbox"
              checked={getConsentStatus(ConsentType.CookieMarketing)}
              onChange={(e) =>
                handleConsentToggle(ConsentType.CookieMarketing, e.target.checked)
              }
              className="h-4 w-4"
            />
          </div>
        </div>
      </section>

      {/* Data Export */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Datenexport</h2>
        <p className="text-sm text-muted-foreground">
          Laden Sie alle Ihre Daten als ZIP-Datei herunter (Art. 15 und Art. 20
          DSGVO).
        </p>
        <div className="flex items-center gap-4">
          <Button onClick={handleExportData} disabled={isExporting}>
            {isExporting ? "Export wird erstellt..." : "Daten exportieren"}
          </Button>
          {exportData?.downloadUrl && (
            <a
              href={exportData.downloadUrl}
              className="text-sm text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download bereit (gueltig bis{" "}
              {exportData.expiresAt
                ? new Date(exportData.expiresAt).toLocaleString("de-DE")
                : ""}
              )
            </a>
          )}
        </div>
      </section>

      {/* Account Deletion */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-destructive">
          Konto loeschen
        </h2>
        <p className="text-sm text-muted-foreground">
          Die Kontoloeschung ist nach einer Karenzzeit von 30 Tagen
          unwiderruflich. Alle Ihre Daten werden permanent geloescht.
        </p>

        {!showDeleteConfirm ? (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Konto loeschen beantragen
            </Button>
            <Button variant="outline" onClick={handleCancelDeletion}>
              Loeschung widerrufen
            </Button>
          </div>
        ) : (
          <div className="space-y-3 rounded-md border border-destructive p-4">
            <p className="text-sm font-medium text-destructive">
              Geben Sie &quot;DELETE&quot; ein, um die Loeschung zu bestaetigen:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleRequestDeletion}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
              >
                {isDeleting ? "Wird beantragt..." : "Endgueltig beantragen"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
              >
                Abbrechen
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
