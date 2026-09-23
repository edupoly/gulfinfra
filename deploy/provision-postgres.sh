#!/usr/bin/env bash
set -euo pipefail

umask 077

app_dir="${APP_DIR:-/home/gulfbuildhub/htdocs/gulfbuildhub.com}"
pg_root="${PG_ROOT:-/home/gulfbuildhub/.postgres}"
pg_data="$pg_root/data"
pg_run="$pg_root/run"
pg_log="${PG_LOG:-/home/gulfbuildhub/logs/postgresql-app.log}"
pg_port="${PG_PORT:-5433}"
pg_user="${PG_USER:-gulfbuildhub_app}"
pg_database="${PG_DATABASE:-gulfbuildhub}"
pg_bin="${PG_BIN:-/usr/lib/postgresql/18/bin}"
backup_dir="${BACKUP_DIR:-/home/gulfbuildhub/backups}"

if [[ -d "$pg_data" ]]; then
  echo "PostgreSQL data directory already exists: $pg_data" >&2
  exit 1
fi

latest_backup="$(find "$backup_dir" -maxdepth 1 -type f -name 'neon-before-vps-*.dump' -print | sort -r | head -n 1)"
if [[ -z "$latest_backup" ]]; then
  echo "No Neon backup was found in $backup_dir." >&2
  exit 1
fi

mkdir -p "$pg_root" "$pg_run" "$(dirname "$pg_log")"
password_file="$(mktemp "$pg_root/init-password.XXXXXX")"
trap 'rm -f "$password_file"' EXIT
openssl rand -hex 32 > "$password_file"
db_password="$(<"$password_file")"

"$pg_bin/initdb" \
  -D "$pg_data" \
  --username="$pg_user" \
  --pwfile="$password_file" \
  --auth-local=scram-sha-256 \
  --auth-host=scram-sha-256 \
  --encoding=UTF8 \
  --locale=C.UTF-8 >/dev/null

rm -f "$password_file"
"$pg_bin/pg_ctl" -D "$pg_data" -l "$pg_log" \
  -o "-p $pg_port -h 127.0.0.1 -k $pg_run" start >/dev/null

for _ in $(seq 1 20); do
  if "$pg_bin/pg_isready" -h 127.0.0.1 -p "$pg_port" -U "$pg_user" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

export PGPASSWORD="$db_password"
"$pg_bin/createdb" -h 127.0.0.1 -p "$pg_port" -U "$pg_user" "$pg_database"
"$pg_bin/pg_restore" -h 127.0.0.1 -p "$pg_port" -U "$pg_user" \
  -d "$pg_database" --no-owner --no-privileges "$latest_backup"

cp "$app_dir/.env.local" "$app_dir/.env.local.before-local-postgres"
database_url="postgresql://${pg_user}:${db_password}@127.0.0.1:${pg_port}/${pg_database}?schema=public"
awk -v replacement="DATABASE_URL=\"$database_url\"" '
  BEGIN { replaced=0 }
  /^DATABASE_URL=/ { print replacement; replaced=1; next }
  { print }
  END { if (!replaced) print replacement }
' "$app_dir/.env.local" > "$app_dir/.env.local.next"
mv "$app_dir/.env.local.next" "$app_dir/.env.local"
chmod 600 "$app_dir/.env.local" "$app_dir/.env.local.before-local-postgres"

cron_line="@reboot $pg_bin/pg_ctl -D $pg_data -l $pg_log -o '-p $pg_port -h 127.0.0.1 -k $pg_run' start"
(crontab -l 2>/dev/null | grep -Fv "$pg_bin/pg_ctl -D $pg_data" || true; printf '%s\n' "$cron_line") | crontab -

unset PGPASSWORD db_password database_url
trap - EXIT

echo "PostgreSQL cluster initialized."
echo "Restored backup: $latest_backup"
"$pg_bin/pg_isready" -h 127.0.0.1 -p "$pg_port"
