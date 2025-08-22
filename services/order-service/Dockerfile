# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.18


FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN npm run build


FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache openssl

# Copy production dependencies from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json* ./
RUN npm ci --omit=dev


# Copy the compiled application code from the builder stage
COPY --from=builder /app/dist ./dist

COPY <<'EOF' /entrypoint.sh
#!/bin/sh
set -e
# Generate or reuse Order keypair
mkdir -p /shared/keys
PRIV_FILE="/shared/keys/order_private.pem"
PUB_FILE="/shared/keys/order_public.pem"
if [ ! -f "$PRIV_FILE" ] || [ ! -f "$PUB_FILE" ]; then
  echo "Generating new RSA key pair for order..."
  openssl genrsa -out "$PRIV_FILE" 2048 2>/dev/null
  openssl rsa -in "$PRIV_FILE" -pubout -out "$PUB_FILE" 2>/dev/null
  chmod 600 "$PRIV_FILE" && chmod 644 "$PUB_FILE"
  echo "Key pair generated."
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
node ./node_modules/moleculer/bin/moleculer-runner.js --config dist/moleculer.config.js dist/**/*.service.js
EOF
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
