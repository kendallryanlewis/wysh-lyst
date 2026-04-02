# wysh-lyst

This is a Vite + React app configured to deploy publicly with GitHub Pages.

## Public URL

After deployment is enabled, your app will be available at:

https://kendallryanlewis.github.io/wysh-lyst/

## How deployment works

- A GitHub Actions workflow in `.github/workflows/deploy-pages.yml` runs on every push to `main`.
- The workflow builds the app and publishes `dist/` to GitHub Pages.
- `vite.config.ts` automatically sets the correct base path when running in GitHub Actions.

## One-time GitHub settings

1. Open the repository settings in GitHub.
2. Go to Pages.
3. Under Build and deployment, set Source to GitHub Actions.

After that, push to `main` and wait for the Deploy to GitHub Pages workflow to finish.

## Auto Push (Optional)

If you want local changes to be auto-committed and pushed on a timer:

```bash
npm run auto-push
```

Optional environment variables:

- `AUTO_PUSH_INTERVAL` (seconds, default: `30`)
- `AUTO_PUSH_MESSAGE_PREFIX` (default: `chore(auto)`)

Example:

```bash
AUTO_PUSH_INTERVAL=15 AUTO_PUSH_MESSAGE_PREFIX="chore(sync)" npm run auto-push
```

Press `Ctrl+C` to stop the auto-push loop.
