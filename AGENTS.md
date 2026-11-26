# Arioso String Quartet site — Environments & Workflow

## Terminology (the user's vocabulary)
- **"main"** and **"prod"** both mean the live site at https://ariosoquartet.com.
  - Git branch: `develop` (the GitHub default branch). It is NOT named `main`; do not rename it.
  - Heroku app `arioso` auto-deploys from `develop` (GitHub integration), proxied by Cloudflare.
  - Pushing or merging to `develop` = changing the live site.
- **"staging"** means the preview site for the user's mom to review:
  - Git branch: `staging`
  - URL: https://arioso-quartet-preview-c899f.web.app (Firebase Hosting, project `arioso-quartet-preview-c899f`)
  - Deploy with `npm run deploy:staging`. It is `noindex` (see `firebase.json`) and must stay that way.
- **"staging #2"** does not exist yet. Only create it (e.g. a Firebase preview channel) when the user needs their mom to compare two options.
- `master` was deleted; it was fully contained in `develop`.

## Workflow
1. Do new work on `staging` (or a branch off it), then run `npm test` and `npm run deploy:staging`.
2. The user's mom reviews the staging URL.
3. Only after the user confirms she approved, merge `staging` into `develop` (prod), run `npm test`, push, and verify https://ariosoquartet.com.
4. Never push to `develop` without the user's explicit go-ahead.

## Notes
- A future move of prod from Heroku to Firebase is planned (cheaper), after staging is approved. Remove the `noindex` header from any production Firebase config.
- Local dev: `npm start` serves http://localhost:9000.
- `dist/` and `.firebase/` are generated and git-ignored.
