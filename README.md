# Section 63 BSA Certificate Generator

Static React app (Vite). No backend; files are hashed on the device. See `PLAN.md`.

## Local
- `npm install`
- `npm run dev` — dev server at http://localhost:5173 (uses `.env.development`; `public/_headers` is not applied)
- `npm run build && npm run preview` — production build served at http://localhost:4173 (uses `.env.production`)
- `npm test`, `npm run lint`

## Production
Cloudflare Pages: build command `npm run build`, output `dist`. Security headers come from `public/_headers`. Set the real domain in `.env.production` (`VITE_APP_URL`).
