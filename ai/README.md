# SandyHub AI Engine

Phase 7 establishes a provider-independent boundary for future real AI integrations.

## Architecture
- UI tools remain static and safe on GitHub Pages.
- AI requests should go through a server-side endpoint in a future deployment environment.
- API keys must never be committed to this repository or exposed in browser JavaScript.
- The current Phase 7 work is an architecture guide, not a live AI API.

## Planned flow
Browser tool → /api/ai → provider adapter → AI provider → sanitized response → browser

This keeps the frontend independent from any single AI provider and allows low-cost providers to be added later.