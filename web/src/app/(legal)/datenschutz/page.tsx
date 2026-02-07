import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklaerung - ExoChat",
};

export default function DatenschutzPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Datenschutzerklaerung</h1>

      <h2>1. Datenschutz auf einen Blick</h2>

      <h3>Allgemeine Hinweise</h3>
      <p>
        Die folgenden Hinweise geben einen einfachen Ueberblick darueber,
        was mit Ihren personenbezogenen Daten passiert, wenn Sie diese
        Website nutzen. Personenbezogene Daten sind alle Daten, mit denen
        Sie persoenlich identifiziert werden koennen.
      </p>

      <h3>Datenerfassung auf dieser Website</h3>
      <p>
        <strong>
          Wer ist verantwortlich fuer die Datenerfassung auf dieser Website?
        </strong>
      </p>
      <p>
        Die Datenverarbeitung auf dieser Website erfolgt durch den
        Websitebetreiber. Dessen Kontaktdaten koennen Sie dem Impressum
        dieser Website entnehmen.
      </p>

      <h2>2. Hosting</h2>
      <p>
        ExoChat ist eine selbst gehostete Loesung. Alle Daten werden auf
        Ihren eigenen Servern gespeichert und verarbeitet. Es findet keine
        Weitergabe von Daten an externe Hosting-Anbieter statt, es sei
        denn, Sie konfigurieren dies explizit.
      </p>

      <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>

      <h3>Datenschutz</h3>
      <p>
        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persoenlichen
        Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten
        vertraulich und entsprechend der gesetzlichen
        Datenschutzvorschriften sowie dieser Datenschutzerklaerung.
      </p>

      <h3>Hinweis zur verantwortlichen Stelle</h3>
      <p>
        Die verantwortliche Stelle fuer die Datenverarbeitung auf dieser
        Website ist:
      </p>
      <p>
        [Firmenname / Vor- und Nachname]
        <br />
        [Strasse und Hausnummer]
        <br />
        [PLZ Ort]
        <br />
        E-Mail: [E-Mail-Adresse]
      </p>

      <h2>4. Datenerfassung auf dieser Website</h2>

      <h3>Cookies</h3>
      <p>
        Unsere Website verwendet Cookies. Dabei handelt es sich um kleine
        Textdateien, die Ihr Webbrowser auf Ihrem Endgeraet speichert.
        Cookies helfen uns dabei, unser Angebot nutzerfreundlicher,
        effektiver und sicherer zu machen.
      </p>
      <p>
        <strong>Essentielle Cookies:</strong> Diese Cookies sind fuer den
        Betrieb der Website zwingend erforderlich (z.B.
        Authentifizierungs-Cookies). Sie koennen nicht deaktiviert werden.
      </p>
      <p>
        <strong>Analyse-Cookies:</strong> Diese Cookies helfen uns zu
        verstehen, wie Besucher die Website nutzen. Sie werden nur mit
        Ihrer ausdruecklichen Einwilligung gesetzt.
      </p>
      <p>
        <strong>Marketing-Cookies:</strong> Diese Cookies werden verwendet,
        um relevante Inhalte anzuzeigen. Sie werden nur mit Ihrer
        ausdruecklichen Einwilligung gesetzt.
      </p>
      <p>
        Sie koennen Ihre Cookie-Einstellungen jederzeit ueber den
        Cookie-Banner aendern.
      </p>

      <h3>Registrierung und Nutzerkonto</h3>
      <p>
        Bei der Registrierung erfassen wir folgende Daten:
      </p>
      <ul>
        <li>Anzeigename</li>
        <li>E-Mail-Adresse (ueber Keycloak)</li>
        <li>Profilbild (optional)</li>
      </ul>
      <p>
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsdurchfuehrung).
      </p>

      <h3>Nachrichten und Dateien</h3>
      <p>
        Ihre Nachrichten und hochgeladenen Dateien werden verschluesselt
        gespeichert. Bei aktivierter Ende-zu-Ende-Verschluesselung koennen
        nur Sie und Ihre Gespraechspartner den Inhalt lesen. Der
        Serverbetreiber hat keinen Zugang zu den verschluesselten Inhalten.
      </p>
      <p>
        Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsdurchfuehrung).
      </p>

      <h2>5. Ihre Rechte</h2>

      <h3>Recht auf Auskunft (Art. 15 DSGVO)</h3>
      <p>
        Sie haben das Recht, eine Bestaetigung darueber zu verlangen, ob
        personenbezogene Daten verarbeitet werden. Ueber die Funktion
        &quot;Daten exportieren&quot; in den Einstellungen koennen Sie alle
        Ihre Daten als ZIP-Datei herunterladen.
      </p>

      <h3>Recht auf Datenuebertragbarkeit (Art. 20 DSGVO)</h3>
      <p>
        Der Datenexport erfolgt in einem maschinenlesbaren Format (JSON),
        das die Uebertragung an einen anderen Dienst ermoeglicht.
      </p>

      <h3>Recht auf Loeschung (Art. 17 DSGVO)</h3>
      <p>
        Sie koennen Ihr Konto jederzeit loeschen. Nach einer
        Karenzzeit von 30 Tagen werden alle Ihre personenbezogenen Daten
        unwiderruflich geloescht, einschliesslich:
      </p>
      <ul>
        <li>Profildaten</li>
        <li>Alle Nachrichten</li>
        <li>Alle hochgeladenen Dateien</li>
        <li>Verschluesselungsschluessel</li>
        <li>Einwilligungen</li>
      </ul>
      <p>
        Waehrend der Karenzzeit kann die Loeschung widerrufen werden.
      </p>

      <h3>Recht auf Berichtigung (Art. 16 DSGVO)</h3>
      <p>
        Sie koennen Ihre Profildaten jederzeit in den Einstellungen
        aendern.
      </p>

      <h3>Recht auf Einschraenkung der Verarbeitung (Art. 18 DSGVO)</h3>
      <p>
        Sie koennen unter bestimmten Voraussetzungen die Einschraenkung der
        Verarbeitung Ihrer Daten verlangen.
      </p>

      <h3>Widerspruchsrecht (Art. 21 DSGVO)</h3>
      <p>
        Wenn die Datenverarbeitung auf Art. 6 Abs. 1 lit. e oder f DSGVO
        beruht, haben Sie jederzeit das Recht, aus Gruenden, die sich aus
        Ihrer besonderen Situation ergeben, Widerspruch einzulegen.
      </p>

      <h2>6. Datenspeicherung und Loeschung</h2>

      <h3>Speicherdauer von Nachrichten</h3>
      <p>
        Der Administrator kann eine Aufbewahrungsfrist fuer Nachrichten
        konfigurieren. Nach Ablauf dieser Frist werden Nachrichten
        automatisch geloescht. Wenn keine Frist konfiguriert ist, werden
        Nachrichten unbegrenzt gespeichert.
      </p>

      <h3>Audit-Protokolle</h3>
      <p>
        Sicherheitsrelevante Ereignisse (An-/Abmeldungen, Datenzugriffe,
        Verwaltungsaktionen) werden protokolliert. Diese Protokolle
        enthalten keine personenbezogenen Inhalte, sondern nur
        technische Referenz-IDs. Bei der Kontoloeschung werden die
        Protokolle anonymisiert.
      </p>

      <h2>7. Verschluesselung</h2>
      <p>
        Diese Website nutzt TLS-Verschluesselung fuer die
        Datenuebertragung. Zusaetzlich bietet ExoChat
        Ende-zu-Ende-Verschluesselung basierend auf dem Signal Protocol
        fuer Nachrichten und Dateien. Bei aktivierter E2E-Verschluesselung
        sind Ihre Inhalte auch fuer den Serverbetreiber nicht lesbar.
      </p>

      <h2>8. Drittanbieter</h2>
      <p>
        ExoChat ist vollstaendig selbst gehostet. Standardmaessig werden
        keine Daten an Drittanbieter uebermittelt. Alle
        Infrastruktur-Dienste (Datenbank, Dateispeicher,
        Authentifizierung, Videokonferenzen) laufen auf Ihren eigenen
        Servern.
      </p>

      <h2>9. Aenderungen dieser Datenschutzerklaerung</h2>
      <p>
        Wir behalten uns vor, diese Datenschutzerklaerung anzupassen, um
        sie an geaenderte Rechtslagen oder Aenderungen des Dienstes
        anzupassen. Bei wesentlichen Aenderungen werden Sie um eine erneute
        Einwilligung gebeten.
      </p>

      <p className="mt-8 text-sm text-muted-foreground">
        Stand: Februar 2026
      </p>
    </article>
  );
}
