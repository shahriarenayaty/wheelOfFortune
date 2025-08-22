# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.18
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN if [ -f package-lock.json ]; then npm ci; \
    elif [ -f yarn.lock ]; then yarn install; \
    elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i; \
    else npm i; fi
COPY . .
RUN npm run build || :

FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app .

COPY <<'EOF' /entrypoint.sh
#!/bin/sh
set -e
# history needs AUTH_PUBLIC_KEY and WHEEL_PUBLIC_KEY from shared volume
AUTH_PUB="/shared/keys/auth_public.pem"
WHEEL_PUB="/shared/keys/wheel_public.pem"
for i in $(seq 1 60); do
  [ -f "$AUTH_PUB" ] && [ -f "$WHEEL_PUB" ] && break
  sleep 1
done
if [ -z "${AUTH_PUBLIC_KEY}" ] && [ -f "$AUTH_PUB" ]; then
  export AUTH_PUBLIC_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n", $0; }' "$AUTH_PUB")"
fi
if [ -z "${WHEEL_PUBLIC_KEY}" ] && [ -f "$WHEEL_PUB" ]; then
  export WHEEL_PUBLIC_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n", $0; }' "$WHEEL_PUB")"
fi
node -r ts-node/register -r dotenv/config ./node_modules/moleculer/bin/moleculer-runner.js --config moleculer.config.ts src/**/*.service.ts
EOF
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
