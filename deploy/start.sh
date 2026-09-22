#!/usr/bin/env bash
set -euo pipefail

export NODE_ENV=production
export PORT=3001
export PATH="/home/gulfbuildhub/.nvm/versions/node/v22.23.2/bin:/usr/local/bin:/usr/bin:/bin"

cd /home/gulfbuildhub/htdocs/gulfbuildhub.com

if ! /usr/bin/ss -ltn | /usr/bin/grep -q ':3001 '; then
  exec /home/gulfbuildhub/.nvm/versions/node/v22.23.2/bin/npm start
fi
