// Deutschsprachige Suche über den Fluent-Emoji-Index (fluent-emoji-index.js).
// Die Emoji-Daten selbst liegen nur auf Englisch vor (cldr-Name + keywords aus
// dem Microsoft-Repo). Damit man trotzdem auf Deutsch suchen kann, wird die
// Sucheingabe zusätzlich gegen ein Wörterbuch häufiger deutscher Begriffe
// abgeglichen; das deckt gängige Badge-Themen ab, aber nicht jeden möglichen
// deutschen Begriff für alle 1285 Icons. Englische Suchbegriffe funktionieren
// immer direkt (z.B. "cloud", "rocket").
const EMOJI_SYNONYMS_DE = {
  // Technik & Arbeit
  "roboter": ["robot"], "ki": ["robot", "brain"], "künstliche intelligenz": ["robot", "brain"],
  "computer": ["laptop", "computer", "desktop"], "laptop": ["laptop"], "code": ["laptop", "keyboard"],
  "tastatur": ["keyboard"], "server": ["computer"], "wolke": ["cloud"], "cloud": ["cloud"],
  "netzwerk": ["globe", "link"], "verbindung": ["link", "chains"], "kette": ["link", "chains"],
  "sicherheit": ["shield", "lock"], "schild": ["shield"], "schloss": ["lock", "locked"],
  "schlüssel": ["key"], "zahnrad": ["gear"], "einstellungen": ["gear", "wrench"],
  "werkzeug": ["wrench", "hammer", "tool"], "hammer": ["hammer"], "schraubenschlüssel": ["wrench"],
  "diagramm": ["chart", "graph"], "balkendiagramm": ["bar chart"], "statistik": ["chart", "graph"],
  "analyse": ["magnifying glass", "chart"], "lupe": ["magnifying glass"], "suche": ["magnifying glass"],
  "gebäude": ["office building", "building"], "büro": ["office"], "architektur": ["office building", "building"],
  "karte": ["map", "credit card"], "landkarte": ["world map"], "weltkarte": ["world map"],
  "kompass": ["compass"], "rakete": ["rocket"], "start": ["rocket"], "puzzle": ["puzzle piece"],
  "idee": ["light bulb", "bulb"], "glühbirne": ["light bulb", "bulb"], "lampe": ["light bulb", "bulb"],
  "handschlag": ["handshake"], "team": ["handshake", "people"], "zusammenarbeit": ["handshake"],
  "bildung": ["graduation cap"], "lernen": ["graduation cap", "book"], "schule": ["graduation cap"],
  "buch": ["book"], "bücher": ["books"], "dokument": ["document", "page"], "brief": ["envelope", "letter"],
  "email": ["envelope"], "telefon": ["phone", "telephone"], "anruf": ["phone", "telephone"],
  "kalender": ["calendar"], "uhr": ["clock", "watch"], "zeit": ["clock", "hourglass"],
  "wecker": ["alarm clock"], "sanduhr": ["hourglass"],
  // Natur & Wetter
  "sonne": ["sun"], "mond": ["moon"], "stern": ["star", "sparkles"], "sterne": ["stars"],
  "regen": ["rain", "cloud"], "blitz": ["lightning", "zap", "high voltage"], "gewitter": ["thunderstorm"],
  "schnee": ["snow", "snowflake"], "regenbogen": ["rainbow"], "feuer": ["fire"], "wasser": ["water", "droplet"],
  "baum": ["tree"], "blume": ["flower"], "blatt": ["leaf"], "pflanze": ["plant", "seedling"],
  "berg": ["mountain"], "meer": ["ocean", "wave"], "welle": ["wave"], "erde": ["globe", "earth"],
  "planet": ["planet", "globe"], "weltall": ["rocket", "star", "moon"],
  // Tiere
  "hund": ["dog"], "katze": ["cat"], "vogel": ["bird"], "fisch": ["fish"], "biene": ["bee", "honeybee"],
  "schmetterling": ["butterfly"], "pferd": ["horse"], "löwe": ["lion"], "affe": ["monkey"],
  // Reisen
  "flugzeug": ["airplane"], "zug": ["train", "locomotive"], "auto": ["car", "automobile"],
  "fahrrad": ["bicycle", "bike"], "schiff": ["ship"], "rakete raumfahrt": ["rocket"], "reise": ["airplane", "luggage"],
  "koffer": ["luggage", "briefcase"], "haus": ["house", "home"], "stadt": ["city", "cityscape"],
  "fahne": ["flag", "triangular flag"], "flagge": ["flag"], "ziel": ["direct hit", "dart"],
  // Gefühle & Gesichter
  "lächeln": ["smiling", "grinning"], "freude": ["smiling", "joy"], "herz": ["heart"], "liebe": ["heart"],
  "traurig": ["sad", "crying"], "wütend": ["angry"], "überrascht": ["surprised", "astonished"],
  "müde": ["tired", "sleepy"], "cool": ["sunglasses", "cool"], "lachen": ["laughing", "joy"],
  "applaus": ["clapping hands"], "daumen hoch": ["thumbs up"], "daumen runter": ["thumbs down"],
  "hand": ["hand", "waving hand"], "winken": ["waving hand"], "feiern": ["party", "confetti", "tada"],
  // Essen & Trinken
  "essen": ["food"], "kaffee": ["coffee", "hot beverage"], "tee": ["tea"], "pizza": ["pizza"],
  "kuchen": ["cake"], "apfel": ["apple"], "obst": ["fruit"],
  // Symbole
  "häkchen": ["check mark"], "kreuz": ["cross mark"], "warnung": ["warning"], "achtung": ["warning"],
  "info": ["information"], "frage": ["question mark"], "ausrufezeichen": ["exclamation mark"],
  "pfeil": ["arrow"], "kreis": ["circle"], "quadrat": ["square"], "dreieck": ["triangle"],
  "medaille": ["medal"], "pokal": ["trophy"], "trophäe": ["trophy"], "geschenk": ["gift"],
  "geld": ["money", "dollar"], "ballon": ["balloon"], "musik": ["musical note"], "brille": ["glasses"],
  "gehirn": ["brain"], "auge": ["eye"], "globus": ["globe"]
};

function normalizeSearchText(text) {
  return text
    .toLowerCase()
    .replaceAll("ä", "a").replaceAll("ö", "o").replaceAll("ü", "u").replaceAll("ß", "ss");
}

// Liefert die Icon-Einträge, die zu Suchtext + optionaler Kategorie passen.
function searchFluentEmoji(query, category) {
  const trimmed = query.trim().toLowerCase();
  const terms = new Set();
  if (trimmed) {
    terms.add(normalizeSearchText(trimmed));
    for (const [de, en] of Object.entries(EMOJI_SYNONYMS_DE)) {
      if (de.includes(trimmed) || trimmed.includes(de)) {
        en.forEach(t => terms.add(t));
      }
    }
  }

  return FLUENT_EMOJI_INDEX.filter(entry => {
    if (category && category !== "all" && entry.group !== category) return false;
    if (!trimmed) return true;
    const haystack = normalizeSearchText(`${entry.cldr} ${entry.keywords.join(" ")}`);
    for (const term of terms) {
      if (haystack.includes(term)) return true;
    }
    return false;
  }).sort((a, b) => a.cldr.localeCompare(b.cldr, "de"));
}
