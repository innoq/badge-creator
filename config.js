// Werkseinstellungen fuer den Badge-Ersteller.
// Inhalte werden jetzt ueber das Formular oben auf der Seite
// ("Inhalte online bearbeiten") im Browser gepflegt und in localStorage
// gespeichert - diese Datei liefert nur die Startwerte sowie die
// verfuegbaren Icon-/Logo-Kataloge, aus denen im Formular ausgewaehlt wird.
// Ueber "Auf Standard zuruecksetzen" im Formular kommt man wieder hierher zurueck.

// Fluent Emoji von Microsoft (https://github.com/microsoft/fluentui-emoji),
// lokal heruntergeladen nach icons/fluent/<stil>/<datei>.svg - damit braucht
// das Durchsuchen/Anzeigen der Icons keine Internetverbindung und erzeugt
// keine CDN-Last mehr zur Laufzeit. Achtung: Laender-Flaggen gibt es in
// Fluent Emoji nicht - dafuer bleiben eigene SVGs in icons/ im Einsatz.
const FLUENT_EMOJI_BASE = "icons/fluent";

// Icon, das fest fuer die Begruessungszeile ("Ich bin ...") verwendet wird.
const GREETING_ICON = { file: "waving_hand", skinFile: "default" };

// Pro Thema wird ein Icon ueber den Ordnernamen aus FLUENT_EMOJI_INDEX
// referenziert (siehe fluent-emoji-index.js), z.B. "Robot" oder "World map".
// Auswahl erfolgt im Formular ueber den Icon-Picker (Suche + Kategorien),
// nicht mehr ueber eine feste Liste.

// Fluent-Emoji-Stile, im Formular als "Icon-Stil" fuer alle Icons gemeinsam waehlbar.
const ICON_STYLES = {
  color:         { label: "Color (bunt)",        suffix: "color" },
  flat:          { label: "Flat (reduziert)",    suffix: "flat" },
  high_contrast: { label: "High Contrast (s/w)", suffix: "high_contrast" }
};

// Original-INNOQ-Logos (https://innoq.style/docs/basics/logos.html), lokal
// heruntergeladen nach icons/logos/. Nur die beiden Varianten fuer hellen
// (weißen) Badge-Hintergrund ergeben hier Sinn.
const LOGO_BASE = "icons/logos";
const LOGO_LIBRARY = {
  apricotpetrol: { label: "Apricot / Petrol (Standard)", file: "innoq-logo--apricotpetrol.svg" },
  black:         { label: "Schwarz (monochrom)",         file: "innoq-logo--black.svg" }
};

const BADGE_CONFIG = {
  brand: {
    logo: "apricotpetrol",
    colorPrimary: "#F2994A",
    colorDark: "#0B3D42"
  },

  person: {
    name: "Markus"
  },

  // Fluent-Emoji-Stil, siehe ICON_STYLES oben.
  iconStyle: "color",

  // Welche Sprache auf der Vorder- bzw. Rueckseite des gefalteten Badges liegt.
  layout: {
    front: "de",
    back: "en"
  },

  // Icons, die immer unten auf jeder Seite erscheinen (Sprachflaggen).
  footerIcons: [
    "icons/flag-de.svg",
    "icons/flag-en.svg"
  ],

  languages: {
    de: {
      label: "Deutsch",
      greetingPrefix: "Ich bin",
      intro: "Frage mich alles zu",
      topics: [
        { text: "Softwarearchitektur", icon: "Office building" },
        { text: "Software-Evaluation", icon: "Magnifying glass tilted left" },
        { text: "Software Analytics", icon: "Bar chart" },
        { text: "Agentic Software Modernisierung", icon: "Robot" },
        { text: "Wardley Maps", icon: "World map" }
      ]
    },
    en: {
      label: "Englisch",
      greetingPrefix: "I'm",
      intro: "Ask me anything about",
      topics: [
        { text: "Software Architecture", icon: "Office building" },
        { text: "Software Evaluation", icon: "Magnifying glass tilted left" },
        { text: "Software Analytics", icon: "Bar chart" },
        { text: "Agentic Software Modernization", icon: "Robot" },
        { text: "Wardley Maps", icon: "World map" }
      ]
    }
  }
};
