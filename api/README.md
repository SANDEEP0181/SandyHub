# SandyHub AI API Boundary

GitHub Pages can host the static frontend, but secrets cannot be safely stored in client-side code. A future serverless API should expose a minimal endpoint such as /api/ai and keep provider credentials in server-side environment variables.

Recommended safeguards:
- input length limits
- request validation
- rate limiting
- abuse protection
- provider/model allowlists
- response size limits
- clear error handling
- no logging of sensitive prompt content by default

Phase 7 intentionally does not add a fake AI endpoint or expose a secret.