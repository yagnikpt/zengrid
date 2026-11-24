# Chrome Web Store Listing — ZenGrid

> Last Updated: 2026-11-24

## Store Listing

**Extension Name** [REQUIRED]
ZenGrid

**Short Description** [REQUIRED]
A minimalist, keyboard-friendly grid bookmark manager and new tab dashboard with custom themes and styles.

**Detailed Description** [REQUIRED]
Transform your new tab page into a clean, distraction-free grid of bookmarks and organized label columns.

ZenGrid replaces your default new tab with an organized visual canvas designed for speed, clarity, and focus. Whether you prefer a structured spreadsheet layout, floating cards, lined notebook paper, or a retro terminal prompt, ZenGrid adapts to how you organize your workflow.

Key Features:
- Four visual layout styles: Classic spreadsheet, Cards, Lined Paper, and Terminal
- Seven curated color themes (Classic, Gruvbox, Catppuccin, GitHub, Tokyo Night, Rosé Pine, and Kanagawa)
- Full Light, Dark, and System color mode support
- Flexible grid sizing: customize columns and rows to fit any display
- Drag-and-drop tile reordering with keyboard navigation and multi-cell selection
- Optional Supabase cloud synchronization to keep your layout backed up across sessions
- Fast URL resolution with automatic page title retrieval and high-resolution favicons
- Privacy-first: all bookmarks and settings are stored locally on your device by default

How to use:
1. Open a new browser tab to access your ZenGrid dashboard.
2. Click any empty cell to type or paste a URL or section header.
3. Drag tiles to reorganize, or right-click to customize accents, open in a new tab, or edit labels.
4. Click the palette icon in the lower dock to switch themes and styles at any time.

Privacy & Permissions:
ZenGrid respects your privacy. All your bookmarks, labels, and settings are saved directly in your browser's local storage. Network requests are only made when fetching website titles/favicons for bookmarks you add, or when you explicitly sign in to sync your layout.

Support & Feedback:
ZenGrid is open source. If you have feature suggestions or encounter issues, please file an issue on GitHub.

**Category** [REQUIRED]
Productivity

**Single Purpose** [REQUIRED]
Replaces the default new tab page with a customizable grid dashboard for organizing and launching bookmarks.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | ✅ Ready | `public/icon/128.png` |
| Small Icon | 16×16 PNG | ✅ Ready | `public/icon/16.png` |
| Medium Icon | 48×48 PNG | ✅ Ready | `public/icon/48.png` |
| Large Icon | 96×96 PNG | ✅ Ready | `public/icon/96.png` |
| Screenshot 1 [REQUIRED] | 1280×800 | 🟡 Needs capture | `docs/screenshots/dashboard.png` |
| Screenshot 2 [RECOMMENDED] | 1280×800 | 🟡 Needs capture | `docs/screenshots/appearance-modal.png` |
| Small Promo Tile [RECOMMENDED] | 440×280 | ⬜ Not created | |
| Marquee Promo Tile | 1400×560 | ⬜ Not created | |

### Screenshot Notes
- Screenshot 1: Overview of the new tab dashboard showing organized columns, bookmark tiles, and bottom dock.
- Screenshot 2: Appearance modal showing style selection (Classic, Cards, Paper, Terminal) and theme palette.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `storage` | permissions | Required to save and persist grid cell data, custom themes, layout dimensions, and user preferences locally on the device. |
| `identity` | permissions | Required to authenticate with OAuth providers (Google, GitHub) via `chrome.identity.launchWebAuthFlow` when the user chooses to enable cloud sync. |
| `https://*/*`, `http://*/*` | host_permissions | Required to fetch the webpage title and favicon image when the user adds a new bookmark URL to their grid. |

## Privacy & Data Use

### Data Collection

- **Personally Identifiable Information**: None collected by default. When the user signs in to sync, their email and user identifier are stored securely to associate their layout.
- **Health Info**: None collected.
- **Financial & Payment Info**: None collected.
- **Authentication Info**: OAuth access tokens stored locally in session storage solely for communicating with the sync backend.
- **Personal Communications**: None collected.
- **Location**: None collected.
- **Web History**: Not tracked. Only URLs explicitly submitted by the user as bookmarks are saved.
- **User Activity**: None tracked. No third-party telemetry, ads, or behavioral analytics.
- **Website Content**: Only the title tag of URLs explicitly added by the user is requested.

### Data Usage Disclosures

1. The extension does not sell user data to third parties.
2. The extension does not use or transfer user data for purposes unrelated to the extension's core single purpose.
3. The extension does not use or transfer user data to determine creditworthiness or for lending purposes.

## Version History

| Version | Date | Summary |
|---------|------|---------|
| 0.0.1 | 2026-11-24 | Initial release: 4 visual styles, 7 color themes, keyboard navigation, drag & drop, and optional Supabase sync. |
