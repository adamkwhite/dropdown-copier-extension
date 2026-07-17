# Dropdown Values Copier

Right-click any dropdown, get every value on your clipboard.

Every so often you need the contents of somebody's dropdown — the country list, the
timezone list, the 200 options in a form you're testing against. The usual move is opening
DevTools and writing a throwaway console one-liner, every time, forever.

So instead: right-click → **Copy All Dropdown Values** → they're on your clipboard, one per
line.

## What it handles

| Type | Example |
|---|---|
| Standard `<select>` | `<select><option>Canada</option></select>` |
| HTML5 datalist combobox | `<input list="cities">` + `<datalist id="cities">` |
| ARIA combobox / listbox | `role="combobox"` or `role="listbox"` with `role="option"` children |

For ARIA widgets it follows `aria-controls` / `aria-owns` to find the real option list,
which is usually a sibling element rather than a child.

When a page has more than one dropdown it picks the focused element, or auto-picks if
there's only one candidate. Otherwise it prompts with a numbered list, labelling each by
its `<label>`, `aria-label`, `name`, or `placeholder` so you can tell them apart.

## Install

Not on the Chrome Web Store. Load it unpacked:

1. Clone this repo.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the repo directory.

Chrome, Edge, or any Chromium browser. Manifest V3.

## Permissions, and why

| Permission | Why |
|---|---|
| `contextMenus` | Adds the right-click item. That's the whole UI. |
| `scripting` | Reads the dropdown's options from the page you right-clicked. |
| `clipboardWrite` | Puts the values on your clipboard. |
| `<all_urls>` | Dropdowns live on arbitrary sites, so it can't know the host in advance. |

Nothing is collected, stored, or sent anywhere. It reads the options, writes them to your
clipboard, and forgets. There is no background state, no options page, no analytics, no
network calls of any kind — see [`background.js`](background.js), which is the entire
extension.

## Scope

One context menu item. No settings, no popup, nothing to configure. It does the one thing
and gets out of the way.

## License

MIT
