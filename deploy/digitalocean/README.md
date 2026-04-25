# DigitalOcean Droplet Deployment

The current test Droplet is very small (`512 MB RAM / 10 GB disk`), so the live deployment runs the backend stack natively instead of Docker. This keeps disk usage lower and avoids Docker image build failures.

- `api-v4` behind `api.luchtithvichea.com`
- `file-v3` behind `file.luchtithvichea.com`
- `report-v3` behind `report.luchtithvichea.com`
- MySQL as the production database
- Caddy for HTTPS reverse proxy

Current Droplet IP:

```text
159.223.82.224
```

Point these Cloudflare DNS records to the Droplet IP:

```text
api     A     159.223.82.224
file    A     159.223.82.224
report  A     159.223.82.224
```

Use these frontend environment values for Cloudflare Pages:

```env
API_BASE_URL=https://api.luchtithvichea.com/api
FILE_BASE_URL=https://file.luchtithvichea.com/
SOCKET_URL=https://api.luchtithvichea.com
```

The live frontend must be rebuilt after these values change. From `web-v4`:

```bash
npm run build
npx wrangler login
npx wrangler pages deploy dist --project-name <cloudflare-pages-project-name>
```

If deploying from the Cloudflare dashboard instead, set the same environment variables in the Pages project and trigger a new production deployment. The old build will keep calling `localhost` until it is redeployed.

Live server layout:

```text
/opt/pos/api-v4
/opt/pos/file-v3
/opt/pos/report-v3
/opt/pos/.env.production
```

Live systemd services:

```bash
systemctl status pos-api pos-file pos-report caddy
systemctl restart pos-api pos-file pos-report caddy
```

Live Caddy routes:

```caddyfile
api.luchtithvichea.com {
  reverse_proxy 127.0.0.1:3000
}

file.luchtithvichea.com {
  reverse_proxy 127.0.0.1:8080
}

report.luchtithvichea.com {
  reverse_proxy 127.0.0.1:5488
}
```

Docker Compose is still available for a larger Droplet, but it is too heavy for the current 10 GB disk test server:

```bash
docker compose -f deploy/digitalocean/docker-compose.yml --env-file .env.production up -d --build db file report api caddy
docker compose -f deploy/digitalocean/docker-compose.yml --env-file .env.production --profile tools run --rm file-tools
docker compose -f deploy/digitalocean/docker-compose.yml --env-file .env.production --profile tools run --rm api-tools
```
