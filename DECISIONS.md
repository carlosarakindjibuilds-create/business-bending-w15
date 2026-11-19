# Architecture Decisions

## Week 14 — Pricing: The Number That Tells the Truth

### Context

The product needs buyer-facing pricing and a transparent revenue model without disturbing the existing Week 13 voice-capture experience or collecting real merchant data in a prototype.

### Decisions

1. Keep the existing capture experience and its handlers at `/`; add `/pricing` and `/about` as separate routes.
2. Use `react-router-dom` and configure Vercel to rewrite SPA paths to `/index.html`.
3. Calculate pricing projections locally from strictly bounded controls. Defaults must match the published month-six example.
4. Store only scenario assumptions and sanitized names in `localStorage`; include no personal data. Clearly mark every built-in example as `SIMULATED DATA`.
5. Escape no user strings into HTML: render sanitized scenario names as React text. Apply strict lengths and numeric ranges before calculation or persistence.
6. Treat ERP bridges, WhatsApp recovery, model SLAs, and retention claims as offer descriptions, not live integrations delivered in this milestone. Do not add API credentials or external data services.
7. Retain the Week 13 capture UI and its recording/recovery functionality unchanged, adding navigation without obstructing its primary controls.

### Verification

The packet defines the mechanical test plan and records the completed build, KPI, zero-margin, slider, name-sanitization, scenario persistence/deletion, route-refresh, and 360px layout checks.

### Week 14 Mechanical Correction

The initial name check allowed any digit sequence. Since an arbitrary number can be a phone number or other identifier, custom scenario labels now use a generic vocabulary allowlist with only month numbers 1–12. Saved records are validated on load; malformed or identifying records are removed with an explicit notice so they cannot silently block the manager or remain in browser storage. No personal data is needed to create or compare projections.

## Week 15 — Session 1: Distribution: Your Method Feeds Your Audience

### Packet before code

Created the Week 15 packet before modifying `src/`. Preserve the existing React/Vite application, React Router setup, system font stack, warm paper backgrounds, and green/gold palette. Keep the existing capture and pricing flows intact.

### Decisions

1. `/distribution` demonstrates a bounded, local Input → Method → Useful Content flow; it does not claim that speech models, telemetry, deletion jobs, SAT checks, or WhatsApp OTP are deployed.
2. Campaign examples are fictional and carry the exact `DATOS SIMULADOS / COHORTE DE PRUEBA (n=60)` disclosure. No real cohort evidence or inflated distribution metrics are represented.
3. `/waitlist` requires Google OAuth and stores only authenticated users' own lead rows under Supabase RLS. Only public Supabase URL and anon key are configured in the frontend; `.env.local` is ignored and no service-role key belongs in client code or Git.
4. Validate and bound all waitlist inputs in the browser and database; render user-provided strings as text. No real RFC or phone number is used as example content.
5. About-page metrics report actual available counts or zero, and the public-channel link must use the project's confirmed URL. No channel URL was present in the repository at packet time; do not invent one.
6. Supabase, OAuth consent configuration, production environment variables, and Vercel deployment are external prerequisites and must not be reported as live until verified.

### Session 1 verification

Repository was clean on `main` before work. Inspected the existing navigation, pages, CSS palette/typography, Vercel SPA rewrite, package manifest, and ignore rules. Packet and this decision record are the only intended changes before Commit #1; no source files have been touched.

## Week 15 — Technical Close

### Completed commits

1. `9c34e40` — `docs(w15): create week 15 packet, mermaid flow and campaign playbook`
2. `a124e1f` — `feat(w15): add /distribution method-to-content engine and supabase rls schema`
3. `4fa5a9c` — `feat(w15): build /waitlist capture with google oauth, rls and strict validation`
4. `7567265` — `feat(w15): add honest distribution metrics and public loop to /about`
5. This close — `chore(w15): complete mechanical audit, 360px mobile check and decisions log`
6. Verification follow-up — `docs(w15): record successful Vercel deployments`
7. Channel follow-up — `feat(w15): connect confirmed public social channel`

All five phase commits were pushed to `origin main`. GitHub's Vercel commit-status checks report `Deployment has completed` for Commit #1 (`9c34e40`), Commit #2 (`a124e1f`), and Commit #5 (`0be168e`), confirming at least three successful deployments. The production alias `https://business-bending-w15.vercel.app/distribution` also loaded the new route directly.

### Mechanical audit

- `npm run build` passed after each app phase and in the final audit.
- Browser route checks passed for `/`, `/pricing`, `/about`, `/distribution`, and `/waitlist` at 360 px and 1280 px. No horizontal overflow was measured; direct route navigation/refresh and page titles worked.
- `.env.local` and `.env.*.local` are ignored; no local environment file is tracked. Only placeholder values are present in `.env.example`.
- The app does not receive or store lead data until Supabase is configured. The confirmed public channel `https://x.com/elvalidadordeof` is linked; follower and reach metrics remain uninstrumented and are not represented as measured.

### Supabase setup before accepting leads

1. Create/configure the Supabase project and enable Google in **Authentication → Providers**.
2. Paste the complete `supabase/schema.sql` into **SQL Editor** and run it. Confirm the `waitlist_leads` table and both owner-scoped RLS policies are present.
3. In **Authentication → URL Configuration**, add the deployed app's `/waitlist` URL and local `http://localhost:5173/waitlist` to allowed redirect URLs.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel for the appropriate deployment environments; use the project's public anon key only, never its service-role key. Set the same values in an ignored local `.env.local` for local testing.
5. Redeploy after setting Vercel variables. Test with two distinct Google accounts and verify each sees only its own row before inviting users.

Do not treat OAuth, lead capture, external social metrics, SAT verification, WhatsApp OTP, speech models, or automated deletion as live until each is configured and separately tested.
