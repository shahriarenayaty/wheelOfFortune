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
# Wait for required public keys up to 60s
AUTH_PUB="/shared/keys/auth_public.pem"
WHEEL_PUB="/shared/keys/wheel_public.pem"
for i in $(seq 1 60); do
  if [ -f "$AUTH_PUB" ] && [ -f "$WHEEL_PUB" ]; then break; fi
  echo "Waiting for public keys... ($i/60)"
  sleep 1
done
if [ -z "${AUTH_PUBLIC_KEY}" ] && [ -f "$AUTH_PUB" ]; then
  export AUTH_PUBLIC_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n", $0; }' "$AUTH_PUB")"
fi
if [ -z "${WHEEL_PUBLIC_KEY}" ] && [ -f "$WHEEL_PUB" ]; then
  export WHEEL_PUBLIC_KEY="$(awk 'NF {sub(/\r/, ""); printf "%s\\n", $0; }' "$WHEEL_PUB")"
fi
node ./node_modules/moleculer/bin/moleculer-runner.js --config dist/moleculer.config.js dist/**/*.service.js
EOF
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
