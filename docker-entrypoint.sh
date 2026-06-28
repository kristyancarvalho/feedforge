#!/bin/sh
set -e

if [ "$1" = "npm" ] && [ "$2" = "run" ] && [ "$3" = "start" ]; then
  npx prisma generate

  if [ -d prisma/migrations ] && [ -n "$(ls -A prisma/migrations 2>/dev/null)" ]; then
    npx prisma migrate deploy
  else
    npx prisma db push --skip-generate
  fi
fi

exec "$@"
