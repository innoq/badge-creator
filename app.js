const STORAGE_KEY = "badgeCreatorState_v1";

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// ---------- Icon-/Logo-URLs (Fluent Emoji per CDN, INNOQ-Logos per CDN) ----------

function fluentIconUrl(entry, styleKey) {
  const style = ICON_STYLES[styleKey] || ICON_STYLES.color;
  const skinSuffix = entry.skinFile ? `_${entry.skinFile}` : "";
  return `${FLUENT_EMOJI_BASE}/${style.suffix}/${entry.file}_${style.suffix}${skinSuffix}.svg`;
}

function logoUrl(logoKey) {
  const logo = LOGO_LIBRARY[logoKey] || LOGO_LIBRARY.apricotpetrol;
  return `${LOGO_BASE}/${logo.file}`;
}

// Nachschlagen eines Themen-Icons per Ordnername (siehe fluent-emoji-index.js).
const ICON_BY_FOLDER = new Map(FLUENT_EMOJI_INDEX.map(entry => [entry.folder, entry]));
const FALLBACK_ICON_FOLDER = "Office building";

function iconEntryFor(folder) {
  return ICON_BY_FOLDER.get(folder) || ICON_BY_FOLDER.get(FALLBACK_ICON_FOLDER);
}

const EMOJI_CATEGORY_LABELS = {
  all: "Alle",
  "Objects": "Objekte",
  "Symbols": "Symbole",
  "Travel & Places": "Reisen & Orte",
  "Smileys & Emotion": "Gesichter & Gefühle",
  "Animals & Nature": "Tiere & Natur",
  "Food & Drink": "Essen & Trinken",
  "Activities": "Aktivitäten",
  "People & Body": "Menschen & Körper",
  "Flags": "Flaggen"
};

// ---------- Zustand (state) - Startwert aus config.js, danach localStorage ----------

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Gespeicherter Stand konnte nicht gelesen werden, verwende Standard:", e);
  }
  return structuredClone(BADGE_CONFIG);
}

let state = loadState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- Rendering der Badge-Karten ----------

function renderBadgeHtml(langKey) {
  const lang = state.languages[langKey];
  if (!lang) {
    throw new Error(`Unbekannte Sprache "${langKey}" in layout`);
  }

  const topicsHtml = lang.topics.map(topic => {
    const iconEntry = iconEntryFor(topic.icon);
    return `
    <div class="badge-topic">
      <span class="topic-text">${escapeHtml(topic.text)}</span>
      <img class="icon" src="${fluentIconUrl(iconEntry, state.iconStyle)}" alt="">
    </div>`;
  }).join("");

  const footerHtml = (state.footerIcons || [])
    .map(src => `<img class="icon" src="${src}" alt="">`)
    .join("");

  return `
    <div class="badge-card">
      <div class="badge-logo">
        <img class="badge-logo-img" src="${logoUrl(state.brand.logo)}" alt="INNOQ">
      </div>
      <div class="badge-greeting">
        <img class="icon" src="${fluentIconUrl(GREETING_ICON, state.iconStyle)}" alt="">
        <span class="greeting-text"><span class="prefix">${escapeHtml(lang.greetingPrefix)}</span> <span class="name">${escapeHtml(state.person.name)}</span></span>
      </div>
      <div class="badge-intro">${escapeHtml(lang.intro)}</div>
      <div class="badge-topics">${topicsHtml}</div>
      <div class="badge-footer">${footerHtml}</div>
    </div>`;
}

function applyBrandColors() {
  const root = document.documentElement;
  root.style.setProperty("--color-primary", state.brand.colorPrimary);
  root.style.setProperty("--color-dark", state.brand.colorDark);
}

// Schlichte, ungedrehte Textansicht aller Sprachen zum Gegenlesen - unabhängig
// von Papierform/Falz/180°-Drehung der Rückseite in den Druckvorschauen.
function renderReadView() {
  const { front, back } = state.layout;

  const columnsHtml = Object.entries(state.languages).map(([key, lang]) => {
    const roleLabel = key === front ? "Vorderseite" : key === back ? "Rückseite" : null;
    const topicsHtml = lang.topics.map(topic =>
      `<li>${escapeHtml(topic.text)}</li>`
    ).join("");

    return `
    <div class="read-view-col">
      <h3>${escapeHtml(lang.label || key.toUpperCase())}${roleLabel ? ` <span class="read-view-role">(${roleLabel})</span>` : ""}</h3>
      <p class="read-view-greeting">${escapeHtml(lang.greetingPrefix)} <strong>${escapeHtml(state.person.name)}</strong></p>
      <p class="read-view-intro">${escapeHtml(lang.intro)}</p>
      <ul class="read-view-topics">${topicsHtml}</ul>
    </div>`;
  }).join("");

  document.getElementById("read-view").innerHTML = columnsHtml;
}

function renderAll() {
  applyBrandColors();
  const { front, back } = state.layout;

  document.getElementById("a4-front-slot").innerHTML = renderBadgeHtml(front);
  document.getElementById("a4-back-slot").innerHTML = renderBadgeHtml(back);
  document.getElementById("a6-front-page").innerHTML = renderBadgeHtml(front);
  document.getElementById("a6-back-page").innerHTML = renderBadgeHtml(back);
  renderReadView();
}

function printView(target) {
  const pageSizes = {
    a4fold: "210mm 297mm",
    a6front: "105mm 148mm",
    a6back: "105mm 148mm"
  };
  document.getElementById("dynamic-page-size").textContent =
    `@page { size: ${pageSizes[target]}; margin: 0; }`;
  document.documentElement.dataset.printing = target;
  window.print();
}

window.addEventListener("afterprint", () => {
  delete document.documentElement.dataset.printing;
});

// ---------- Einstellungsformular ("Inhalte online bearbeiten") ----------

function populateSelect(select, entries, selectedValue) {
  select.innerHTML = Object.entries(entries)
    .map(([key, entry]) => `<option value="${escapeHtml(key)}">${escapeHtml(entry.label)}</option>`)
    .join("");
  select.value = selectedValue;
}

function renderTopicsEditor(langKey) {
  const container = document.querySelector(`.settings-topics[data-lang="${langKey}"]`);
  const topics = state.languages[langKey].topics;

  container.innerHTML = topics.map((topic, index) => {
    const iconEntry = iconEntryFor(topic.icon);
    return `
    <div class="topic-row" data-index="${index}">
      <input type="text" class="f-topic-text" value="${escapeHtml(topic.text)}" placeholder="Thema">
      <button type="button" class="icon-pick-btn f-pick-icon" title="Icon wählen">
        <img class="icon-pick-thumb" src="${fluentIconUrl(iconEntry, state.iconStyle)}" alt="">
        <span class="icon-pick-label">${escapeHtml(iconEntry.cldr)}</span>
      </button>
      <button type="button" class="icon-btn f-remove-topic" title="Thema entfernen" aria-label="Thema entfernen">✕</button>
    </div>`;
  }).join("");

  container.querySelectorAll(".topic-row").forEach(row => {
    const index = Number(row.dataset.index);
    const topic = topics[index];

    row.querySelector(".f-pick-icon").addEventListener("click", () => {
      openIconPicker(entry => {
        topic.icon = entry.folder;
        saveState();
        renderTopicsEditor(langKey);
        renderAll();
      });
    });

    row.querySelector(".f-topic-text").addEventListener("input", e => {
      topic.text = e.target.value;
      saveState();
      renderAll();
    });

    row.querySelector(".f-remove-topic").addEventListener("click", () => {
      topics.splice(index, 1);
      saveState();
      renderTopicsEditor(langKey);
      renderAll();
    });
  });
}

// ---------- Icon-Picker (Suche über alle Fluent-Emoji) ----------

let iconPickerCallback = null;
let iconPickerShowAll = false;
const ICON_PICKER_RESULT_LIMIT = 120;

function renderIconPickerResults() {
  const query = document.getElementById("icon-picker-search").value;
  const category = document.getElementById("icon-picker-category").value;
  const results = searchFluentEmoji(query, category);
  const grid = document.getElementById("icon-picker-grid");
  const countLabel = document.getElementById("icon-picker-count");

  const limit = iconPickerShowAll ? results.length : ICON_PICKER_RESULT_LIMIT;
  const shown = results.slice(0, limit);
  countLabel.textContent = results.length > shown.length
    ? `${shown.length} von ${results.length} Treffern`
    : `${results.length} Treffer`;

  grid.innerHTML = shown.map(entry => `
    <button type="button" class="icon-result" data-folder="${escapeHtml(entry.folder)}" title="${escapeHtml(entry.cldr)}">
      <img src="${fluentIconUrl(entry, state.iconStyle)}" alt="" loading="lazy">
      <span>${escapeHtml(entry.cldr)}</span>
    </button>`).join("");

  grid.querySelectorAll(".icon-result").forEach(btn => {
    btn.addEventListener("click", () => {
      const entry = iconEntryFor(btn.dataset.folder);
      document.getElementById("icon-picker-dialog").close();
      if (iconPickerCallback) iconPickerCallback(entry);
      iconPickerCallback = null;
    });
  });

  const loadAllBtn = document.getElementById("icon-picker-load-all");
  if (results.length > shown.length) {
    loadAllBtn.hidden = false;
    loadAllBtn.textContent = `Alle ${results.length} laden`;
    loadAllBtn.onclick = () => {
      iconPickerShowAll = true;
      renderIconPickerResults();
    };
  } else {
    loadAllBtn.hidden = true;
  }
}

function openIconPicker(onSelect) {
  iconPickerCallback = onSelect;
  iconPickerShowAll = false;
  const dialog = document.getElementById("icon-picker-dialog");
  const searchInput = document.getElementById("icon-picker-search");
  searchInput.value = "";
  renderIconPickerResults();
  dialog.showModal();
  searchInput.focus();
}

function initIconPicker() {
  const categorySelect = document.getElementById("icon-picker-category");
  const categories = ["all", ...new Set(FLUENT_EMOJI_INDEX.map(e => e.group))];
  categorySelect.innerHTML = categories
    .map(key => `<option value="${escapeHtml(key)}">${escapeHtml(EMOJI_CATEGORY_LABELS[key] || key)}</option>`)
    .join("");

  const resetAndRender = () => {
    iconPickerShowAll = false;
    renderIconPickerResults();
  };
  document.getElementById("icon-picker-search").addEventListener("input", resetAndRender);
  categorySelect.addEventListener("change", resetAndRender);
  document.getElementById("icon-picker-close").addEventListener("click", () => {
    document.getElementById("icon-picker-dialog").close();
    iconPickerCallback = null;
  });
}

// Baut die Sprachen-Fieldsets (Begrüßung/Einleitung/Themen) dynamisch auf Basis
// von state.languages auf - so lassen sich Sprachen hinzufügen/entfernen, statt
// fest auf Deutsch/Englisch beschränkt zu sein.
function renderLanguageFieldsets() {
  const container = document.getElementById("language-fieldsets");
  const langKeys = Object.keys(state.languages);

  container.innerHTML = langKeys.map(key => {
    const lang = state.languages[key];
    return `
    <fieldset data-lang="${escapeHtml(key)}">
      <legend>
        ${escapeHtml(lang.label || key.toUpperCase())}
        <button type="button" class="icon-btn f-remove-language" title="Sprache entfernen" aria-label="Sprache entfernen">✕</button>
      </legend>
      <label>Begrüßung<input type="text" class="f-greeting-prefix"></label>
      <label>Einleitung<input type="text" class="f-intro"></label>
      <div class="settings-topics" data-lang="${escapeHtml(key)}"></div>
      <button type="button" class="f-add-topic">+ Thema hinzufügen</button>
    </fieldset>`;
  }).join("");

  langKeys.forEach(initLanguageFieldset);

  container.querySelectorAll(".f-remove-language").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.closest("fieldset").dataset.lang;
      if (Object.keys(state.languages).length <= 1) {
        alert("Es muss mindestens eine Sprache übrig bleiben.");
        return;
      }
      if (!confirm(`Sprache "${state.languages[key].label || key}" wirklich entfernen?`)) return;
      delete state.languages[key];
      const remaining = Object.keys(state.languages);
      if (state.layout.front === key) state.layout.front = remaining[0];
      if (state.layout.back === key) state.layout.back = remaining[0];
      saveState();
      refreshLanguageUi();
      renderAll();
    });
  });
}

function refreshLanguageUi() {
  const langKeys = Object.keys(state.languages);
  const langLabels = Object.fromEntries(
    langKeys.map(k => [k, { label: state.languages[k].label || k.toUpperCase() }])
  );

  const frontSelect = document.getElementById("f-front-lang");
  populateSelect(frontSelect, langLabels, state.layout.front);
  const backSelect = document.getElementById("f-back-lang");
  populateSelect(backSelect, langLabels, state.layout.back);

  renderLanguageFieldsets();
}

function initAddLanguage() {
  document.getElementById("f-add-language").onclick = () => {
    const codeInput = document.getElementById("f-new-lang-code");
    const labelInput = document.getElementById("f-new-lang-label");
    const code = codeInput.value.trim().toLowerCase();
    const label = labelInput.value.trim();

    if (!code) {
      alert("Bitte einen kurzen Code für die Sprache angeben (z.B. \"fr\").");
      return;
    }
    if (state.languages[code]) {
      alert(`Sprache "${code}" gibt es schon.`);
      return;
    }

    state.languages[code] = { label: label || code.toUpperCase(), greetingPrefix: "", intro: "", topics: [] };
    saveState();
    codeInput.value = "";
    labelInput.value = "";
    refreshLanguageUi();
    renderAll();
  };
}

function initLanguageFieldset(langKey) {
  const fieldset = document.querySelector(`fieldset[data-lang="${langKey}"]`);
  const lang = state.languages[langKey];

  const greetingInput = fieldset.querySelector(".f-greeting-prefix");
  greetingInput.value = lang.greetingPrefix;
  greetingInput.addEventListener("input", e => {
    lang.greetingPrefix = e.target.value;
    saveState();
    renderAll();
  });

  const introInput = fieldset.querySelector(".f-intro");
  introInput.value = lang.intro;
  introInput.addEventListener("input", e => {
    lang.intro = e.target.value;
    saveState();
    renderAll();
  });

  renderTopicsEditor(langKey);

  fieldset.querySelector(".f-add-topic").addEventListener("click", () => {
    lang.topics.push({ text: "Neues Thema", icon: FALLBACK_ICON_FOLDER });
    saveState();
    renderTopicsEditor(langKey);
    renderAll();
  });
}

function exportState() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "badge-config.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importStateFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !parsed.languages || !parsed.brand || !parsed.person) {
        throw new Error("Datei enthält keine gültige Badge-Konfiguration.");
      }
      state = parsed;
      saveState();
      initSettingsForm();
      renderAll();
    } catch (e) {
      alert(`Import fehlgeschlagen: ${e.message}`);
    }
  };
  reader.readAsText(file);
}

function initSettingsForm() {
  const nameInput = document.getElementById("f-person-name");
  nameInput.value = state.person.name;
  nameInput.oninput = e => {
    state.person.name = e.target.value;
    saveState();
    renderAll();
  };

  const logoSelect = document.getElementById("f-logo");
  populateSelect(logoSelect, LOGO_LIBRARY, state.brand.logo);
  logoSelect.onchange = e => {
    state.brand.logo = e.target.value;
    saveState();
    renderAll();
  };

  const iconStyleSelect = document.getElementById("f-icon-style");
  populateSelect(iconStyleSelect, ICON_STYLES, state.iconStyle);
  iconStyleSelect.onchange = e => {
    state.iconStyle = e.target.value;
    saveState();
    renderAll();
  };

  const colorPrimaryInput = document.getElementById("f-color-primary");
  colorPrimaryInput.value = state.brand.colorPrimary;
  colorPrimaryInput.oninput = e => {
    state.brand.colorPrimary = e.target.value;
    saveState();
    renderAll();
  };

  const colorDarkInput = document.getElementById("f-color-dark");
  colorDarkInput.value = state.brand.colorDark;
  colorDarkInput.oninput = e => {
    state.brand.colorDark = e.target.value;
    saveState();
    renderAll();
  };

  refreshLanguageUi();

  const frontSelect = document.getElementById("f-front-lang");
  frontSelect.onchange = e => {
    state.layout.front = e.target.value;
    saveState();
    renderAll();
  };

  const backSelect = document.getElementById("f-back-lang");
  backSelect.onchange = e => {
    state.layout.back = e.target.value;
    saveState();
    renderAll();
  };

  initAddLanguage();

  document.getElementById("f-export").onclick = exportState;

  const importFileInput = document.getElementById("f-import-file");
  document.getElementById("f-import").onclick = () => importFileInput.click();
  importFileInput.onchange = e => {
    if (e.target.files[0]) importStateFromFile(e.target.files[0]);
    importFileInput.value = "";
  };

  document.getElementById("f-reset").onclick = () => {
    if (!confirm("Wirklich alle Eingaben verwerfen und auf die Standardwerte aus config.js zurücksetzen?")) return;
    state = structuredClone(BADGE_CONFIG);
    saveState();
    initSettingsForm();
    renderAll();
  };
}

// ---------- Ziehbarer Trenner zwischen Sidebar und Vorschau ----------

const SIDEBAR_WIDTH_KEY = "badgeCreatorSidebarWidth";
const SIDEBAR_MIN_WIDTH = 260;
const SIDEBAR_MAX_WIDTH = 900;

function initPanelResizer() {
  const resizer = document.getElementById("panel-resizer");
  const sidebar = document.querySelector(".settings-panel");

  const savedWidth = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
  if (savedWidth) sidebar.style.width = `${savedWidth}px`;

  resizer.addEventListener("mousedown", e => {
    e.preventDefault();
    resizer.classList.add("is-dragging");
    document.body.classList.add("is-resizing");

    const onMouseMove = moveEvent => {
      const width = Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, moveEvent.clientX));
      sidebar.style.width = `${width}px`;
    };
    const onMouseUp = () => {
      resizer.classList.remove("is-dragging");
      document.body.classList.remove("is-resizing");
      localStorage.setItem(SIDEBAR_WIDTH_KEY, parseInt(sidebar.style.width, 10));
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initIconPicker();
  initSettingsForm();
  initPanelResizer();
  renderAll();
});
