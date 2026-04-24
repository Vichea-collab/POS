# Render Test Deployment

This repo is prepared for a free Render test deployment with:

- `pos-api-v4` for `api-v4`
- `pos-file-v3` for `file-v3`
- `pos-report-v3` for `report-v3`
- `pos-postgres` for a shared free Render Postgres database

Render provides managed Postgres, not MySQL. The backend already supports `postgres`, so the Blueprint uses Postgres for the test environment.

## Create The Services

1. Push this repo to GitHub.
2. In Render, choose **New > Blueprint**.
3. Select the GitHub repo and use the root `render.yaml`.
4. When prompted for `sync: false` secrets, enter blank values for optional integrations you do not need yet.

## DNS

After Render creates `pos-api-v4`, add the DNS record Render shows for:

```text
api.luchtithvichea.com
```

The frontend on Cloudflare Pages should be rebuilt with:

```text
API_BASE_URL=https://api.luchtithvichea.com
FILE_BASE_URL=https://pos-file-v3.onrender.com
SOCKET_URL=https://api.luchtithvichea.com
```

## Initial Database Setup

Do not put the migration commands in `render.yaml` because both migration scripts use `sync({ force: true })`.
That drops and recreates tables for the service models.

After the services deploy, use Render Shell or a one-off job:

```bash
cd api-v4
npm run migrate
npm run seeder

cd ../file-v3
npm run migrate
```

Use this only on an empty test database.

## Free Plan Limits

- Render Free Postgres has one active free database per workspace.
- Free Postgres expires after 30 days.
- Free web services sleep and share monthly free instance hours.
- File uploads are stored on the service filesystem, which is not durable on free services.
