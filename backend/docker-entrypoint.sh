#!/bin/sh
set -e

npx prisma generate
npx prisma migrate deploy
npm run prisma:seed

exec node dist/server.js