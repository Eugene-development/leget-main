#!/bin/sh

# SvelteKit LEGET Frontend Entrypoint Script
# Reads Docker secrets and sets PUBLIC environment variables

echo "🚀 SvelteKit LEGET Frontend starting with domain secrets resolution..."

# Private key for the durable form gateway; never expose through browser config.
if [ -z "${FORM_CONTEXT_SECRET:-}" ] && [ -f "/run/secrets/form_context_secret" ]; then
    FORM_CONTEXT_SECRET=$(tr -d '\r\n' < /run/secrets/form_context_secret)
    export FORM_CONTEXT_SECRET
fi
export BODY_SIZE_LIMIT="${BODY_SIZE_LIMIT:-20971520}"
# The app is reachable only through its nginx proxy, which overwrites X-Real-IP.
export ADDRESS_HEADER="${ADDRESS_HEADER:-x-real-ip}"

# Read secret values for configuration
FRONTEND_URL_VALUE=""
API_BASE_URL_VALUE=""
AUTH_API_URL_VALUE=""

# Private Management API credential. Never include this in config.js or logs.
if [ -z "${YANDEX_METRIKA_OAUTH_TOKEN:-}" ] && [ -f "/run/secrets/yandex_metrika_oauth_token" ]; then
    YANDEX_METRIKA_OAUTH_TOKEN=$(tr -d '\r\n' < /run/secrets/yandex_metrika_oauth_token)
    export YANDEX_METRIKA_OAUTH_TOKEN
fi

if [ -f "/run/secrets/frontend_url" ]; then
    FRONTEND_URL_VALUE=$(tr -d '[:space:]' < /run/secrets/frontend_url)
    echo "✅ FRONTEND_URL set from secret: $FRONTEND_URL_VALUE"
fi

if [ -f "/run/secrets/api_base_url" ]; then
    API_BASE_URL_VALUE=$(tr -d '[:space:]' < /run/secrets/api_base_url)
    echo "✅ API_BASE_URL set from secret: $API_BASE_URL_VALUE"
fi

if [ -f "/run/secrets/auth_api_url" ]; then
    AUTH_API_URL_VALUE=$(tr -d '[:space:]' < /run/secrets/auth_api_url)
    echo "✅ AUTH_API_URL set from secret: $AUTH_API_URL_VALUE"
fi

# Set production defaults if no secrets provided
FINAL_API_BASE_URL="${API_BASE_URL_VALUE:-https://api.leget.ru}"
FINAL_AUTH_API_URL="${AUTH_API_URL_VALUE:-https://auth.leget.ru}"
FINAL_FRONTEND_URL="${FRONTEND_URL_VALUE:-https://leget.ru}"

# Create configuration file for the browser
mkdir -p /app/build/client
cat > /app/build/client/config.js << EOF
window.__APP_CONFIG__ = {
    API_BASE_URL: '${FINAL_API_BASE_URL}',
    AUTH_API_URL: '${FINAL_AUTH_API_URL}',
    FRONTEND_URL: '${FINAL_FRONTEND_URL}'
};
EOF

# Debug: Show resolved environment variables
echo "🔍 Configuration resolved:"
echo "  API_BASE_URL: ${FINAL_API_BASE_URL}"
echo "  AUTH_API_URL: ${FINAL_AUTH_API_URL}"
echo "  FRONTEND_URL: ${FINAL_FRONTEND_URL}"
# Export AUTH_BACKEND_URL for server-side proxy (used by SvelteKit $env/dynamic/private)
export AUTH_BACKEND_URL="${FINAL_AUTH_API_URL}/api"
export API_BACKEND_URL="${FINAL_API_BASE_URL}"
echo "  AUTH_BACKEND_URL: ${AUTH_BACKEND_URL}"
echo "  API_BACKEND_URL: ${API_BACKEND_URL}"

# Start SvelteKit LEGET Frontend application
echo "🌐 Starting SvelteKit LEGET Frontend application..."
echo "📋 Command to execute: $@"

# Execute the command with proper signal handling
exec "$@"
