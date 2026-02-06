# Grid Bookmarks

A Chrome extension that replaces your new tab page with a clean, grid-based bookmark manager. Organize your bookmarks and custom labels on a 10x20 grid with drag-and-drop, emoji labels, and automatic page title fetching -- all on a minimal canvas.

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
- Right-click any cell for a context menu (edit label, open in new tab, delete)

**Other details:**

- 10 columns x 20 rows (200 cells, no scrolling)
- Page titles fetched automatically via the background service worker (no CORS issues)
- Data persisted locally via Chrome storage API
- Optional sign-in to sync across devices

## Getting Started

```bash
bun install
bun run dev        # Chrome dev mode
bun run build      # Production build → .output/chrome-mv3/
```

Load the extension in Chrome: `chrome://extensions` > Developer mode > Load unpacked > select `.output/chrome-mv3`.

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

## Project Structure

```
entrypoints/
  newtab/        New tab page (main UI)
  popup/         Extension popup
  background.ts  Service worker (title fetching, auth, sync)
components/
  Grid.tsx       CSS grid with drag-and-drop context
  Cell.tsx       Cell logic (editing, context menu, emoji picker)
  BookmarkCell.tsx  Favicon + title display
  LabelCell.tsx    Emoji button + text display
  EmojiPicker.tsx  Floating emoji picker wrapper
  ui/            shadcn/ui primitives
lib/
  types.ts       Type definitions
  constants.ts   Grid dimensions, favicon API
  grid-utils.ts  Grid operations, URL parsing, title fetching
  storage.ts     WXT storage items
  hooks/         useGrid, useAuth
  api/           API client and mock
  auth/          OAuth flow
```

## License

MIT
