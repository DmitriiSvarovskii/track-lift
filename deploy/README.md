# Track Lift Deploy

## Backend env

Create `/etc/track-lift/backend.env` on the server:

```env
DATABASE_URL=postgresql+psycopg://track_lift:REPLACE_DB_PASSWORD@127.0.0.1:5432/track_lift
TELEGRAM_CLIENT_ID=8909368694
TELEGRAM_CLIENT_SECRET=REPLACE_TELEGRAM_CLIENT_SECRET
SESSION_SECRET=REPLACE_WITH_OPENSSL_RAND_HEX_32
COOKIE_SECURE=true
CORS_ORIGINS=https://track-lift.swrsky.ru
INSECURE_DEMO_LOGIN=false
```

Create `/var/www/track-lift/.env.production`:

```env
VITE_TELEGRAM_CLIENT_ID=8909368694
VITE_TELEGRAM_LOGIN_SCRIPT_URL=/telegram-login.js
VITE_API_BASE_URL=
```

## Commands

```bash
apt update
apt install -y nginx git curl python3-venv python3-pip postgresql postgresql-contrib

sudo -u postgres psql
```

```sql
CREATE USER track_lift WITH PASSWORD 'REPLACE_DB_PASSWORD';
CREATE DATABASE track_lift OWNER track_lift;
\q
```

```bash
cd /var/www/track-lift
git pull

cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

mkdir -p /etc/track-lift
nano /etc/track-lift/backend.env
chown -R www-data:www-data /var/www/track-lift/backend

cp /var/www/track-lift/deploy/track-lift-api.service /etc/systemd/system/track-lift-api.service
systemctl daemon-reload
systemctl enable --now track-lift-api
systemctl status track-lift-api

cd /var/www/track-lift
npm install
npm run build

cp /var/www/track-lift/deploy/nginx-track-lift.conf /etc/nginx/sites-available/track-lift
ln -sf /etc/nginx/sites-available/track-lift /etc/nginx/sites-enabled/track-lift
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

After Certbot rewrites the Nginx config, keep the `/api/`, `/auth` and `/telegram-login.js` locations inside the HTTPS server block too.
Also keep this header in the HTTPS server block because Telegram Login uses popup window messaging:

```nginx
add_header Cross-Origin-Opener-Policy "same-origin-allow-popups" always;
```
