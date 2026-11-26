# Arioso String Quartet site — Environments & Workflow

## Terminology (the user's vocabulary)
- **"main"** and **"prod"** both mean the live site at https://ariosoquartet.com.
  - Git branch: `develop` (the GitHub default branch). It is NOT named `main`; do not rename it.
  - Hosted on **Cloudflare Workers Static Assets** (Worker `momsite`, `wrangler.jsonc`, `public/_redirects`, `public/_headers`), auto-deploying from `develop` via GitHub integration (`npm run build` → `npx wrangler deploy`).
  - Pushing or merging to `develop` = changing the live site.
- **"staging"** means the preview site for the user's mom to review:
  - Git branch: `staging`
  - URL: https://arioso-quartet-preview-c899f.web.app (Firebase Hosting, project `arioso-quartet-preview-c899f`)
  - Deploy with `npm run deploy:staging`. It is `noindex` (see `firebase.json`) and must stay that way.
- **"staging #2"** does not exist yet. Only create it (e.g. a Firebase preview channel) when the user needs their mom to compare two options.
- `master` was deleted; it was fully contained in `develop`.

## Workflow
0. **Always work in a fresh branch.** For every task, branch off `staging` (e.g. `git checkout -b seo-tweaks`), never commit directly to `staging` or `develop`. When the work is verified, merge it into `staging`, then delete the spent branch locally and on GitHub (`git branch -d <name>` and `git push origin --delete <name>`). Check `git status` is clean before starting.
1. Do new work on that fresh branch, merge it into `staging`, then run `npm test` and `npm run deploy:staging`.
2. The user's mom reviews the staging URL.
3. Only after the user confirms she approved, merge `staging` into `develop` (prod), run `npm test`, push, and verify https://ariosoquartet.com.
4. Never push to `develop` without the user's explicit go-ahead.

## Notes
- Prod migrated off Heroku to free Cloudflare Workers Static Assets (`momsite`). Never add `noindex` to `public/_headers`.
- Local dev: `npm start` serves http://localhost:9000.
- `dist/` and `.firebase/` are generated and git-ignored.
