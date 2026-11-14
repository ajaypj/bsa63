---
description: Run the BSA63 app locally (dev server, or prod build preview with "prod")
argument-hint: [prod]
---

Run this app locally from the repo root.

1. If `node_modules` is missing, run `npm install`.
2. If `$ARGUMENTS` is `prod`: run `npm run build`, then start `npm run preview` in the background. URL: http://localhost:4173.
3. Otherwise: start `npm run dev` in the background. URL: http://localhost:5173.
4. Check the URL responds with `curl -sI <url>` and report the URL. If the port is taken or the build fails, report the shortest error line.
