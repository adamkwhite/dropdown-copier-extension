// Right-click context menu: "Copy All Dropdown Values"
// Supports:
//   - Standard <select> elements
//   - HTML5 datalist comboboxes (<input list="...">)
//   - ARIA comboboxes (role="combobox" / role="listbox")

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "copyDropdownValues",
    title: "Copy All Dropdown Values",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "copyDropdownValues") return;
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: copyDropdownValues,
  });
});

function copyDropdownValues() {
  // Find all candidate elements on the page.
  const candidates = collectCandidates();

  if (candidates.length === 0) {
    alert("No dropdowns or comboboxes found on this page.");
    return;
  }

  // Pick the right one: focused element first, single candidate auto-pick,
  // otherwise prompt with a numbered list.
  let chosen = candidates.find((c) => c.element === document.activeElement);
  if (!chosen) {
    if (candidates.length === 1) {
      chosen = candidates[0];
    } else {
      const labels = candidates
        .map((c, i) => `${i + 1}. ${c.label}`)
        .join("\n");
      const input = prompt(
        `Multiple dropdowns found. Enter a number:\n${labels}`,
        "1",
      );
      const idx = parseInt(input, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= candidates.length) return;
      chosen = candidates[idx];
    }
  }

  const values = chosen.values();
  if (values.length === 0) {
    alert("Selected element has no values.");
    return;
  }

  const text = values.join("\n");
  navigator.clipboard
    .writeText(text)
    .then(() => alert(`Copied ${values.length} values to clipboard.`))
    .catch((err) => alert(`Copy failed: ${err.message}`));
}

function collectCandidates() {
  const out = [];

  // 1. Standard <select>
  document.querySelectorAll("select").forEach((el, i) => {
    out.push({
      element: el,
      label: labelFor(el) || `<select> #${i + 1}`,
      values: () =>
        Array.from(el.options)
          .map((o) => o.text.trim())
          .filter(Boolean),
    });
  });

  // 2. HTML5 datalist combobox: <input list="datalistId">
  document.querySelectorAll("input[list]").forEach((el, i) => {
    const dl = document.getElementById(el.getAttribute("list"));
    if (!dl) return;
    out.push({
      element: el,
      label: labelFor(el) || `<input list> #${i + 1}`,
      values: () =>
        Array.from(dl.querySelectorAll("option"))
          .map((o) => (o.value || o.textContent || "").trim())
          .filter(Boolean),
    });
  });

  // 3. ARIA combobox: role="combobox" with aria-controls/aria-owns
  document
    .querySelectorAll('[role="combobox"], [role="listbox"]')
    .forEach((el, i) => {
      const ownsId =
        el.getAttribute("aria-controls") || el.getAttribute("aria-owns");
      const listEl = ownsId ? document.getElementById(ownsId) : null;
      const source = listEl || el;
      const opts = source.querySelectorAll('[role="option"]');
      if (opts.length === 0) return;
      out.push({
        element: el,
        label: labelFor(el) || `${el.getAttribute("role")} #${i + 1}`,
        values: () =>
          Array.from(opts)
            .map((o) => o.textContent.trim())
            .filter(Boolean),
      });
    });

  return out;
}

function labelFor(el) {
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    if (label) return label.textContent.trim();
  }
  return (
    el.getAttribute("aria-label") ||
    el.getAttribute("name") ||
    el.getAttribute("placeholder") ||
    ""
  );
}
