# Portfolio assistant deployment

The frontend is ready but stays in preview mode until a deployed endpoint is set.
The Worker uses Cloudflare Workers AI's `@cf/meta/llama-3.1-8b-instruct-fp8-fast` with public facts in `profile.mjs`. No separate API key is needed.
No chat history or API keys are stored in the browser. Each question is independent.

## Activate

1. Sign in to a free Cloudflare account and verify its email address. Keep the account on Workers Free.
2. In this directory, use a current Node version supported by Wrangler and run `npx wrangler login`, then `npx wrangler deploy`.
3. The AI binding in `wrangler.jsonc` connects the Worker directly to Workers AI. Native modules are uploaded without bundling for Windows compatibility.
4. Verify a question against the resulting `https://negar-portfolio-assistant.<account>.workers.dev/ask` URL using Origin `https://negarhonarvar.github.io`.
5. Set that URL in `assets/portfolio/assistant-config.js`, update its cache version in the layout, and publish the website. Verify a live answer before reporting activation.

## Behavior and limits

Only the configured website origin is allowed by CORS; CORS is not authentication.
Questions are capped at 500 characters and request bodies at 4096 bytes.
Rate limiting uses Cloudflare bindings: 5 requests/minute per IP and 10/minute for the site, per Cloudflare location. It is not a strict global quota. Shared IPs share the visitor limit.
Cloudflare's free daily AI allocation remains the final upstream cap. Stay on the free plan if zero billing is required. Add bot verification before increasing exposure if abuse occurs.
Provider failures and quota exhaustion return a generic error; prepared topic answers remain available.
No application-level chat logging or persistence is implemented; Cloudflare still processes requests under its own policies.
Instructions constrain answers to the profile, but generated answers still need live factual checks and may be wrong.

Run `node --test worker.test.mjs` for request validation and provider failure tests.
Update `profile.mjs` whenever Negar changes her facts. This underscore-prefixed directory is not published by Jekyll.
