# TUMTUM PHOTOS

A graduation photography site: a marketing page, a JSON-driven gallery, an enquiry intake
endpoint, and a small admin view for reading what came in.

The content follows the studio's flyer — four packages from GHC 400, the booking terms, and
the phone number 0242 249 621. The email address and all imagery are placeholders. Every
image is hand-written SVG artwork standing in for real photographs; replace the copy in
`public/index.html` and the files in `public/images/` with the real thing.

> **Not yet run.** This was generated on a machine where the shell could not start, so
> nothing here has been executed or type-checked. The code is straightforward and the
> dependency list is deliberately tiny, but treat the first `npm run dev` as the real test.
> If something breaks, the likely candidates are notes in [First run](#first-run).

## Stack

| Piece    | Choice                                                            |
| -------- | ----------------------------------------------------------------- |
| Server   | Node 20.11+, Express 5, TypeScript run through `tsx` (no compile) |
| Frontend | Plain HTML, CSS, and ES2020 modules — no bundler, no framework     |
| Storage  | Append-only JSONL file in `data/`                                 |
| Auth     | One shared admin token, compared in constant time                 |

No database, no build step, no client dependencies. One production dependency: `express`
and its transitive tree.

## Quick start

```powershell
npm install
npm run dev
```

Then open <http://127.0.0.1:3000>.

The admin view is at <http://127.0.0.1:3000/admin>. It needs a token:

```powershell
# generate one
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"

# then run with it set
$env:ADMIN_TOKEN = "paste-the-generated-value"
npm run dev
```

Without `ADMIN_TOKEN`, the site works normally and the admin routes return `503`.

## Environment

| Variable      | Default       | Notes                                                          |
| ------------- | ------------- | -------------------------------------------------------------- |
| `PORT`        | `3000`        | Clamped to 1–65535.                                            |
| `HOST`        | `127.0.0.1`   | Use `0.0.0.0` in a container.                                  |
| `NODE_ENV`    | `development` | `production` turns on static asset caching.                    |
| `ADMIN_TOKEN` | unset         | Required for `/admin`. Unset disables admin entirely.           |
| `TRUST_PROXY` | `0`           | Set `1` only behind a proxy you control — otherwise `X-Forwarded-For` lets clients dodge the rate limit. |

`.env` is not loaded automatically. Either set variables in your shell, or use
`npx tsx --env-file=.env server/index.ts`.

## API

| Method | Path                     | Auth        | Description                                    |
| ------ | ------------------------ | ----------- | ---------------------------------------------- |
| `GET`  | `/api/health`            | none        | Liveness check.                                |
| `GET`  | `/api/gallery`           | none        | Collections plus images from `data/gallery.json`. |
| `POST` | `/api/enquiries`         | none        | Submit an enquiry. Rate limited to 8 per IP per 15 minutes. |
| `GET`  | `/api/admin/enquiries`   | `Bearer`    | Newest-first enquiries. `?limit=` up to 1000.   |

`POST /api/enquiries` accepts JSON:

```json
{
  "name": "Ama Mensah",
  "email": "ama@example.com",
  "phone": "0242 249 621",
  "shootType": "solo",
  "eventDate": "2026-07-18",
  "budget": "ghc-500",
  "message": "I'd like 10 pictures, two outfits, studio or outdoors."
}
```

`shootType` is one of `solo`, `duo`, `group`, `after-party`, `dinner`, `location`, `other`.
`budget` is one of `ghc-400`, `ghc-500`, `ghc-600`, `ghc-700`, `ghc-1000-plus`, `unsure`, or omitted.

Responses: `201` on success, `422` with a field-keyed `errors` object, `429` when rate
limited, `413` for oversized bodies (16 kB cap).

A hidden `website` field acts as a honeypot: if it has a value, the request is accepted and
discarded without being stored.

## Project layout

```
server/
  index.ts        Express app, routes, static serving, error handling, shutdown
  config.ts       Environment parsing, absolute paths
  gallery.ts      Loads and validates data/gallery.json, caches the result
  enquiries.ts    Validation, enquiry records, JSONL append/read
  admin.ts        Bearer token check (constant-time)
  rate-limit.ts   In-memory fixed-window limiter
data/
  gallery.json    Gallery content — edit this, restart to pick changes up
  enquiries.jsonl Created at runtime, gitignored
public/
  index.html      Marketing page
  styles.css      Site styles
  app.js          Gallery rendering, nav, form submission
  admin.html      Enquiry inbox
  admin.css       Admin styles
  admin.js        Token handling, table, CSV export
  images/*.svg    Placeholder artwork
```

## Editing content

- **Copy and prices** — `public/index.html`. Prices are in `.price` elements.
- **Gallery** — `data/gallery.json`. Add an image object, and add its `collection` to
  `collections` (or it will still appear as a filter labelled with the raw slug). The server
  caches the file at boot, so restart after editing. Invalid entries are skipped with a
  warning rather than crashing the site.
- **Images** — drop real files in `public/images/`, point each `src` at them, and keep
  `width`/`height` accurate so the browser reserves layout space (the grid crops to 3:2).
- **Brand colour** — `--accent` at the top of `public/styles.css` and `public/admin.css`.

## Data, privacy, and the bits that aren't built

- Enquiries are stored as plain JSONL on disk. That's personal data: keep `data/` off
  version control (already in `.gitignore`), and back it up deliberately.
- **Nothing emails you.** New enquiries sit in the file until you open `/admin`. To get
  notified, call your mail provider from the `POST /api/enquiries` handler, after
  `saveEnquiry` succeeds — don't block the response on it, and don't lose the record if the
  mail call fails.
- No spam protection beyond the honeypot and rate limit. If the form gets targeted, add a
  challenge (Turnstile, hCaptcha) in the same handler.
- No image uploads, no booking calendar, no payments, no per-user accounts.
- The admin token is shared and long-lived. Rotate it by changing `ADMIN_TOKEN` and
  restarting; there is no session or logout server-side, so a leaked token stays valid.

## Deploying

The server is a single Node process with no build step:

```powershell
npm ci
$env:NODE_ENV = "production"
$env:ADMIN_TOKEN = "…"
npx tsx server/index.ts
```

Put it behind Caddy, nginx, or a PaaS router that terminates TLS, set `TRUST_PROXY=1`, and
put `data/` on a volume that survives deploys. Because storage is a local file, this does
not scale horizontally — one process only, unless you swap `server/enquiries.ts` for a
database.

If you'd rather not ship `tsx`, add a `tsc` emit step or run the server through
`node --experimental-strip-types` on Node 22.6+.

## First run

Three things worth knowing before you start:

1. **`tsx` runs TypeScript directly.** Imports use `.js` extensions in the source
   (`./config.js`) because that's what Node's ESM loader expects; `tsx` maps them to the
   `.ts` files. Keep that convention when adding files.
2. **Express 5** removed string wildcard routes. If you add catch-all routes, use
   `app.use(...)` or the `{*splat}` syntax — `app.get("*")` throws.
3. **The CSP is strict.** `script-src 'self'` and `style-src 'self'` mean no inline
   `<script>`, no inline `style=""` attributes, and no third-party embeds. Adding Google
   Fonts, an analytics snippet, or an iframe maps will require editing the
   `Content-Security-Policy` header in `server/index.ts`.

## Suggested next steps

- Replace the placeholder SVGs with real photographs.
- Send a notification email on each enquiry.
- Add a `GET /api/admin/enquiries.csv` endpoint if you'd rather export server-side.
- Add structured logging and a health check for uptime monitoring.
- Move enquiries to SQLite (`node:sqlite` is built in on Node 22+) once volume justifies it.
