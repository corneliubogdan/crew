# Hetzner single-box deploy (Crew API)

One Ubuntu 24.04 VPS. CX22 is enough for v1; CX32 if you want headroom.
This is not HA. Dumps stay on the box. Postgres is not on the public internet.

## 1. Create the server

- Region: Falkenstein / Helsinki / Ashburn — pick close to Bucharest users or to you
- Image: Ubuntu 24.04
- SSH keys only (disable password login)
- IPv4 + IPv6

## 2. DNS

Point an A (and AAAA) record at the box, e.g. `api.yourdomain.com`.
Wait until it resolves before `docker compose up` if you want Caddy to mint a cert.

## 3. First login hardening

```bash
ssh root@YOUR_IP
apt-get update && apt-get upgrade -y
apt-get install -y ufw fail2ban unattended-upgrades git docker.io docker-compose-v2
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
dpkg-reconfigure -plow unattended-upgrades
```

`sshd_config`: `PasswordAuthentication no`, `PermitRootLogin prohibit-password`.

## 4. App user + clone

```bash
adduser --disabled-password --gecos "" crew
usermod -aG docker crew
su - crew
git clone https://github.com/corneliubogdan/crew.git
cd crew
cp .env.example .env
chmod 600 .env
```

Edit `.env`:

- `POSTGRES_PASSWORD` — long random
- `JWT_SECRET` — long random (≥32 chars)
- `CORS_ORIGINS` — exact origins, comma-separated. **No `*`**
- `SITE_URL` — `https://api.yourdomain.com`
- `SITE_ADDRESS` — `api.yourdomain.com` (no `http://`; Caddy will do HTTPS)
- `ACME_EMAIL` — let's encrypt notices (optional; Caddy still works without the global email block)
- `NODE_ENV=production`

## 5. Bring it up

```bash
docker compose up -d --build
docker compose ps
curl -sS http://127.0.0.1:3000/health
# after DNS + TLS: curl -sS https://api.yourdomain.com/health
```

Postgres is published only on `127.0.0.1:5432` (not `0.0.0.0`). The API is on `127.0.0.1:3000`; public traffic goes through Caddy on 80/443.

## 6. Local dumps (not offsite)

Cron as `crew`:

```bash
crontab -e
# 03:17 every day
17 3 * * * /home/crew/crew/scripts/pg_dump_local.sh >> /home/crew/crew/backups/dump.log 2>&1
```

## 7. Magic links in production

`POST /auth/magic-link` does **not** email yet. In `NODE_ENV=production` the token is not returned in the JSON. Wire an email sender before you invite real users, or temporarily verify via server logs (not for the public).

## 8. Updates

```bash
cd /home/crew/crew
git pull
docker compose up -d --build
```

## Local laptop (same compose)

```bash
cp .env.example .env
# SITE_ADDRESS=:80  (HTTP, no certs)
docker compose up --build
curl http://127.0.0.1:3000/health
```
