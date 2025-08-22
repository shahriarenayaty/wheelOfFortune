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
# Generate or reuse Order keypair
mkdir -p /shared/keys
PRIV_FILE="/shared/keys/order_private.pem"
PUB_FILE="/shared/keys/order_public.pem"
if [ ! -f "$PRIV_FILE" ] || [ ! -f "$PUB_FILE" ]; then
  openssl genrsa -out "$PRIV_FILE" 2048 2>/dev/null
  openssl rsa -in "$PRIV_FILE" -pubout -out "$PUB_FILE" 2>/dev/null
  chmod 600 "$PRIV_FILE" && chmod 644 "$PUB_FILE"
fi
if [ -z "${PRIVATE_KEY}" ] && [ -f "$PRIV_FILE" ]; then
  export PRIVATE_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n", $0; }' "$PRIV_FILE")"
fi
if [ -z "${ORDER_PUBLIC_KEY}" ] && [ -f "$PUB_FILE" ]; then
  export ORDER_PUBLIC_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n", $0; }' "$PUB_FILE")"
fi
# Wait for Auth public key
AUTH_PUB="/shared/keys/auth_public.pem"
for i in $(seq 1 60); do
  if [ -f "$AUTH_PUB" ]; then break; fi
  sleep 1
done
if [ -z "${AUTH_PUBLIC_KEY}" ] && [ -f "$AUTH_PUB" ]; then
  export AUTH_PUBLIC_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n", $0; }' "$AUTH_PUB")"
fi
node -r ts-node/register -r dotenv/config ./node_modules/moleculer/bin/moleculer-runner.js --config moleculer.config.ts src/**/*.service.ts
EOF
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
