# ZenGrid

A Chrome extension that replaces your new tab page with a clean, grid-based bookmark manager. Organize your bookmarks and custom labels on a configurable grid with drag-and-drop, emoji labels, theme controls, and automatic page title fetching -- all on a minimal canvas.

---

> This project is heavily vibe coded.

## Features

**Two types of cells:**

- **Bookmarks** -- Paste or type a URL. The extension fetches the page title and favicon automatically. Click to open in a new tab.
- **Custom Labels** -- Type any text to create a label with a random emoji. Click the emoji anytime to change it via the built-in emoji picker.

**Interactions:**

- Click an empty cell to add a bookmark or label
- Click a label to edit its text
- Click a bookmark to open the page
- Click a label's emoji to change it
- Drag and drop cells to rearrange them
- Drop URLs from other tabs directly onto the grid
- Configure grid rows and columns from the settings menu
- Switch between light, dark, and system themes
- Right-click any cell for a context menu (edit label, open in new tab, delete)

**Other details:**

- Defaults to 10 columns x 20 rows, configurable from settings
- Cell placement is stored by row and column so resizing preserves positions; cells outside a smaller grid are hidden, not deleted
- Page titles fetched automatically via the background service worker (no CORS issues)
- Data persisted locally via Chrome storage API
- Optional sign-in with Supabase Auth (GitHub OAuth)

## Getting Started

```bash
bun install
bun run dev        # Chrome dev mode
bun run build      # Production build → .output/chrome-mv3/
```

Create a local env file for Supabase auth:

```bash
cp .env.example .env.local
# then fill in WXT_SUPABASE_URL and WXT_SUPABASE_PUBLISHABLE_KEY
```

Load the extension in Chrome: `chrome://extensions` > Developer mode > Load unpacked > select `.output/chrome-mv3`.

For GitHub OAuth in Supabase:

1. In your Supabase project's GitHub provider settings, keep provider enabled.
2. In **Authentication → URL Configuration → Redirect URLs**, add extension redirect URLs (must match exactly):
   - Chrome: `https://<your-extension-id>.chromiumapp.org/supabase-auth-callback`
   - Firefox: `https://zengrid@local.extensions.allizom.org/supabase-auth-callback`
3. Rebuild/reload the extension if its ID changes.

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start dev server (port 3482) |
| `bun run build` | Production build for Chrome |
| `bun run build:firefox` | Production build for Firefox |
| `bun run compile` | TypeScript type check |
| `bun run zip` | Build and package as .zip |

## Tech Stack

WXT, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI, dnd-kit, Frimousse (emoji picker), Lucide icons.

## License

MIT
