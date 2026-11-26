// Canary token: looks like an internal API key + endpoint sitting in the page source.
// It's fake. Nothing legitimate ever calls it, so any request to the endpoint — especially
// one carrying this key — means someone is harvesting the page for secrets.

export const CANARY_KEY = 'jk_live_7Hq2VwXo9pLmT4sNcB1yRd8e'
export const CANARY_ENDPOINT = '/api/v1/export'
export const CANARY_CONFIG = { env: 'production', exportApi: CANARY_ENDPOINT, apiKey: CANARY_KEY, region: 'us-east-1' }
