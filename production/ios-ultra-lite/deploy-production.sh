#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."
BASE="$(pwd)/production/ios-ultra-lite"

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="/root/gorilla-before-ios-deploy-$STAMP"

mkdir -p "$BACKUP"

[ -f /var/www/html/gorilla-react-home.html ] && \
  cp /var/www/html/gorilla-react-home.html "$BACKUP/" || true

[ -f /var/www/html/gorilla-react-home.js ] && \
  cp /var/www/html/gorilla-react-home.js "$BACKUP/" || true

[ -d /var/www/html/gorilla-assets ] && \
  cp -a /var/www/html/gorilla-assets "$BACKUP/" || true

[ -f /etc/nginx/sites-available/gorilla ] && \
  cp /etc/nginx/sites-available/gorilla "$BACKUP/nginx-gorilla.conf" || true

mkdir -p /var/www/html/gorilla-assets

cp "$BASE/dist/gorilla-react-home.html" \
   /var/www/html/gorilla-react-home.html

cp "$BASE/dist/gorilla-react-home.js" \
   /var/www/html/gorilla-react-home.js

rm -rf /var/www/html/gorilla-assets/*
cp -a "$BASE/assets/." /var/www/html/gorilla-assets/

cp "$BASE/nginx/gorilla.conf" \
   /etc/nginx/sites-available/gorilla

nginx -t
systemctl reload nginx

echo
echo "=== PRODUCTION CHECK ==="
curl -fsSI https://gorillahockey.ru/ | head -20

echo
echo "DEPLOY COMPLETE"
echo "Backup: $BACKUP"
