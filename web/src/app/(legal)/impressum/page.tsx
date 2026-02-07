import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum - ExoChat",
};

export default function ImpressumPage() {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <h1>Impressum</h1>

      <h2>Angaben gemaess 5 TMG</h2>
      <p>
        <strong>[Firmenname / Vor- und Nachname]</strong>
        <br />
        [Strasse und Hausnummer]
        <br />
        [PLZ Ort]
        <br />
        Deutschland
      </p>

      <h2>Kontakt</h2>
      <p>
        Telefon: [Telefonnummer]
        <br />
        E-Mail: [E-Mail-Adresse]
      </p>

      <h2>Vertreten durch</h2>
      <p>[Name des Vertretungsberechtigten]</p>

      <h2>Registereintrag</h2>
      <p>
        Eintragung im Handelsregister.
        <br />
        Registergericht: [Registergericht]
        <br />
        Registernummer: [Registernummer]
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemaess 27a Umsatzsteuergesetz:
        <br />
        [USt-IdNr.]
      </p>

      <h2>Verantwortlich fuer den Inhalt nach 55 Abs. 2 RStV</h2>
      <p>
        [Vor- und Nachname]
        <br />
        [Strasse und Hausnummer]
        <br />
        [PLZ Ort]
      </p>

      <h2>Streitschlichtung</h2>
      <p>
        Die Europaeische Kommission stellt eine Plattform zur
        Online-Streitbeilegung (OS) bereit. Unsere E-Mail-Adresse finden Sie
        oben im Impressum.
      </p>
      <p>
        Wir sind nicht bereit oder verpflichtet, an
        Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
        teilzunehmen.
      </p>

      <h2>Haftung fuer Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemaess 7 Abs. 1 TMG fuer eigene
        Inhalte auf diesen Seiten nach den allgemeinen Gesetzen
        verantwortlich. Nach den 8 bis 10 TMG sind wir als Diensteanbieter
        jedoch nicht verpflichtet, uebermittelte oder gespeicherte fremde
        Informationen zu ueberwachen oder nach Umstaenden zu forschen, die
        auf eine rechtswidrige Taetigkeit hinweisen.
      </p>

      <h2>Haftung fuer Links</h2>
      <p>
        Unser Angebot enthaelt Links zu externen Websites Dritter, auf deren
        Inhalte wir keinen Einfluss haben. Deshalb koennen wir fuer diese
        fremden Inhalte auch keine Gewaehr uebernehmen. Fuer die Inhalte der
        verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
        der Seiten verantwortlich.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf
        diesen Seiten unterliegen dem deutschen Urheberrecht. Die
        Vervielfaeltigung, Bearbeitung, Verbreitung und jede Art der
        Verwertung ausserhalb der Grenzen des Urheberrechtes beduerfen der
        schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
      </p>
    </article>
  );
}
