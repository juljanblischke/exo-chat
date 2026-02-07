"use client";

import { useSyncExternalStore, useState } from "react";
import { Button } from "@/components/ui/button";
import { updateConsent } from "@/lib/api/gdpr";
import { ConsentType } from "@/types/gdpr";

const COOKIE_CONSENT_KEY = "exochat-cookie-consent";

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

function getStoredPreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as CookiePreferences;
  } catch {
    return null;
  }
}

function storePreferences(preferences: CookiePreferences): void {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences));
}

function subscribeToStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getConsentSnapshot(): boolean {
  return getStoredPreferences() === null;
}

function getServerSnapshot(): boolean {
  return false;
}

export function CookieBanner() {
  const isVisible = useSyncExternalStore(
    subscribeToStorage,
    getConsentSnapshot,
    getServerSnapshot
  );
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  const handleAcceptAll = async () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      analytics: true,
      marketing: true,
    };
    storePreferences(allAccepted);
    setDismissed(true);

    await saveConsentsToServer(allAccepted);
  };

  const handleAcceptEssential = async () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      analytics: false,
      marketing: false,
    };
    storePreferences(essentialOnly);
    setDismissed(true);

    await saveConsentsToServer(essentialOnly);
  };

  const handleSavePreferences = async () => {
    storePreferences(preferences);
    setDismissed(true);

    await saveConsentsToServer(preferences);
  };

  const saveConsentsToServer = async (prefs: CookiePreferences) => {
    try {
      await updateConsent({
        consentType: ConsentType.CookieAnalytics,
        isGranted: prefs.analytics,
      });
      await updateConsent({
        consentType: ConsentType.CookieMarketing,
        isGranted: prefs.marketing,
      });
    } catch {
      // Consent saving is best-effort when not logged in
    }
  };

  if (!isVisible || dismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold">Cookie-Einstellungen</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Wir verwenden Cookies, um Ihnen die bestmoegliche Erfahrung zu
              bieten. Essentielle Cookies sind fuer die Funktion der Website
              erforderlich. Optionale Cookies helfen uns, die Website zu
              verbessern.
            </p>
          </div>

          {showDetails && (
            <div className="space-y-3 rounded-md border p-4">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.essential}
                  disabled
                  className="h-4 w-4"
                />
                <div>
                  <span className="text-sm font-medium">
                    Essentielle Cookies
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Erforderlich fuer die grundlegende Funktionalitaet der
                    Website. Kann nicht deaktiviert werden.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      analytics: e.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                <div>
                  <span className="text-sm font-medium">
                    Analyse-Cookies
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Helfen uns zu verstehen, wie Besucher die Website nutzen.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      marketing: e.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                <div>
                  <span className="text-sm font-medium">
                    Marketing-Cookies
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Werden verwendet, um relevante Inhalte anzuzeigen.
                  </p>
                </div>
              </label>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={handleAcceptAll}>Alle akzeptieren</Button>
            <Button variant="outline" onClick={handleAcceptEssential}>
              Nur essenzielle
            </Button>
            {showDetails ? (
              <Button variant="secondary" onClick={handleSavePreferences}>
                Einstellungen speichern
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setShowDetails(true)}
              >
                Einstellungen anpassen
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
