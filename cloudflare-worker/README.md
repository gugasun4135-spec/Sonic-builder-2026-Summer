# Builder Quest Cloud Sync

This Worker provides one shared cloud state for Builder Quest.

## Cloudflare settings

Create a Worker, paste `bq-sync-worker.js`, and bind a KV namespace:

- Binding name: `BQ_GAME`
- Variable `SYNC_TOKEN`: any long random string
- Variable `GAME_ID`: `zhenyu-builder-quest`
- Variable `ALLOWED_ORIGIN`: `https://gugasun4135-spec.github.io`

After deploy, the endpoint should look like:

`https://your-worker-name.your-account.workers.dev`

## GitHub Pages build variables

Add these in GitHub repo settings:

- Repository variable `BQ_SYNC_ENDPOINT`: your Worker URL
- Repository secret `BQ_SYNC_TOKEN`: the same token as Worker `SYNC_TOKEN`

Then rerun GitHub Pages deployment.
