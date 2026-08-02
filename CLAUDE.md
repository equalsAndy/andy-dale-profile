# Andy Dale Profile

A small social/directory site for people who share the exact legal name
"Andy Dale" — join (admin-reviewed), build a profile, message each other
through a privacy-preserving email relay, and search for a specific Andy
Dale even if you're not one yourself.

This file is durable reference for whoever (human or Claude) picks this
project up next. For narrative "where things stand right now" detail, see
`HANDOFF.md` (gitignored, local-machine only — this file is the part meant
to travel with the repo).

## Stack

- **Backend**: Node.js + Express, MySQL via `mysql2` (raw SQL, no ORM),
  `bcryptjs` for passwords, `express-session` + `express-mysql-session`
  for sessions, Postmark for the email relay.
- **Frontend**: React + Vite, `react-router-dom`. No CSS framework —
  hand-rolled design tokens in `client/src/styles/theme.css`.
- **Deploy target**: an AWS Lightsail VM the project owner already has.
  Nothing is deployed yet — see "Not built yet" below.

### Vite version pin — read before touching `client/package.json`

`create-vite`'s current default scaffolds onto Vite 8 with an experimental
"rolldown" bundler, which hits a real, currently-unfixed npm bug (missing
platform-specific native binding, `npm/cli#4828`) — `npm install` succeeds
but `vite` crashes on startup. `client/package.json` is deliberately pinned
to the stable Vite 6 / Rollup line. Don't bump past Vite 7 without checking
whether the rolldown bug is actually fixed upstream first.

## Running locally

```bash
# Backend (repo root) — port from .env, currently 3001
npm install
npm run dev          # node --watch server/index.js

# Frontend — separate terminal, port 5173
cd client
npm install
npm run dev
```

Both need MySQL running locally with a database matching `DB_DATABASE` in
`.env` already populated from `db/schema.sql` (see Database section).

Health check: `curl localhost:3001/api/health`

## Environment variables

See `.env.example` for the full list. `.env` itself is gitignored and
already populated on this machine. Briefly, by group:

- `DB_HOST` / `DB_USER` / `DB_PASSWORD` / `DB_DATABASE` — local MySQL.
- `SESSION_SECRET` — random, session cookie signing.
- `SUPER_ADMIN_EMAILS` — comma-separated. Signing up with one of these
  emails skips the join-request queue entirely and lands as verified
  admin immediately (solves the admin bootstrap chicken-and-egg problem).
  Currently just the project owner's real email.
- `PORT`, `CLIENT_ORIGIN`, `NODE_ENV` — server/CORS basics.
- `POSTMARK_API_KEY`, `POSTMARK_FROM_EMAIL`, `RELAY_DOMAIN` — outbound
  email relay.
- `POSTMARK_WEBHOOK_USER`, `POSTMARK_WEBHOOK_PASS` — Basic Auth guarding
  the inbound relay webhook (`POST /api/relay/inbound`) so the URL alone
  can't be used to inject fake messages.

## Database

- `db/schema.sql` is the full schema (all `CREATE TABLE`s). **It is not a
  migration tool** — there's no versioned migration runner. Every schema
  change so far has been applied by hand (`ALTER TABLE` against the live
  local DB) and then hand-mirrored into `schema.sql`. Keep doing that:
  when you change the schema, do both, in that order (verify the ALTER
  works, then update the file to match reality).
- `db/migrate_legacy_leads.sql` — historical one-off script, already run.
  Safe to ignore; kept for the record.
- The **old pre-rebuild app's tables are still in the DB**, renamed
  `legacy_*` (e.g. `legacy_profile`, `legacy_accounts`). Never touched by
  the current app, kept as a reference/backup. Fine to ignore.
- `sessions` table is auto-created by `express-mysql-session`, not in
  `schema.sql`.

## Architecture & key decisions

**Auth**: local email+password only, no SSO, by deliberate choice (see
`db/schema.sql` — `accounts.password_hash` is `NOT NULL`). Sessions live
in MySQL, cookie name `andydale_sid`.

**Profile visibility**: two tiers, not per-field. `profile` table = basic
fields, visible to everyone. `profile_detail` table = sensitive fields
(hometown, birth year, employer, links), visible only to verified viewers
or the profile owner. This was a deliberate simplification over full
per-field visibility control.

**Messaging privacy model**:
- First contact always goes through `connection_requests`
  (pending → accepted/declined) before any thread exists. No standing
  contact address is generated until accepted.
- Accepting creates a `message_threads` row with a random opaque
  `alias_token` (NOT derived from account IDs — a leaked token only
  exposes that one thread). Used as the email relay address. Rotated
  whenever a thread is blocked.
- A thread can include an **external (non-account) participant** — see
  below. This was added specifically because search needed to work for
  people who aren't Andy Dales and never will be.

**Find an Andy / search** (`POST /api/search`) is **fully public, no auth
required**. Three-tier `accounts.search_participation`:
- `findable` — shown directly in results, with identity.
- `notify_only` (default) — never shown or counted to the searcher; if
  matched, gets a private notification and can choose to respond or
  ignore. The searcher never learns whether a `notify_only` match exists
  unless that person chooses to respond.
- `invisible` — never shown, never notified.

A searcher may or may not have an account. If they don't, they can
optionally leave `searcherEmail` so a `notify_only` match has a way to
respond to them.

**External participants** — the extension that makes anonymous search
actually useful (e.g. "David isn't an Andy Dale but is looking for one he
went to school with"). `thread_participants.account_id`,
`messages.sender_account_id`, and
`search_match_notifications.searcher_account_id` are all nullable, each
with an `_email`/`external_email` alternative column. When a `notify_only`
Andy responds to a notification from an accountless searcher, it creates
a thread with one real account + one external (email-only) participant.
All communication with the external side is relayed by email — they have
no in-app access at all, so `delivery_channel` is always `'email'` for
messages directed at them, regardless of anyone's `notification_mode`.

**Email relay (Postmark)**:
- Outbound: `server/utils/relay.js` → `sendRelayEmail()`. Sends from
  `<alias_token>@<RELAY_DOMAIN>`.
- Inbound: `POST /api/relay/inbound`, Basic-Auth protected. Matches the
  sender against `thread_participants` by either the account's
  `login_email` or a row's `external_email`, scoped to the thread found
  via the alias token in the recipient address.
- `RELAY_DOMAIN` is `reply.andydale.me` — a **dedicated subdomain**. The
  root `andydale.me` domain's MX already points at Google Workspace for
  the project owner's real personal email — the relay must never be
  configured on the root domain, only this subdomain.
- The Postmark account was in a sending-restricted "pending approval"
  state initially; it has since been approved for general sending.
- **Not done yet**: the actual Postmark dashboard inbound webhook URL is
  not configured, because there's no deployed public URL to point it at —
  the inbound path has only been exercised via simulated `curl` POSTs
  straight to `localhost`. Once deployed: set the Inbound Stream's
  webhook URL to `https://<deployed-domain>/api/relay/inbound` with the
  `POSTMARK_WEBHOOK_USER`/`PASS` credentials embedded
  (`https://user:pass@host/...`).

**Leads** (`leads` table): 19 LinkedIn-sourced candidate profiles, private
and admin-only. There is no "unclaimed profile" concept in the product —
`profile.account_id` is `NOT NULL`; a profile only exists once someone has
actually signed up. `leads` exists purely to drive a future one-time
manual invite email, sent by hand from the project owner's own personal
address — **not** through the Postmark relay (cold outreach through a
transactional relay risks the account's sending reputation/compliance,
this was a deliberate call).

## Frontend structure

- Design tokens: `client/src/styles/theme.css` — "name badge pinned to a
  corkboard" visual identity (sage-green ground, warm cream badge cards,
  mustard as the one playful accent, teal = verified, cherry = alert).
  Both light/dark themes via CSS custom properties.
- Nav/layout: `client/src/components/AppShell.jsx` — bottom tab bar on
  mobile, top nav bar on desktop, identical routes either way. Nav items
  differ by auth state (logged out: Home/Find/Roster/Join/Log in; logged
  in: Home/Find/Inbox/Profile, plus Admin for admins).
- Pages (`client/src/pages/`): Home (live data-driven ticker), Login,
  Join, Profile (view + full edit form with all privacy settings),
  Inbox (**list only, no thread/compose view yet**), FindAndy (public
  search), Roster (public browse of `findable` accounts), Admin
  (join-request queue).
- `client/src/api.js` — thin fetch wrapper, always sends
  `credentials: 'include'` for the session cookie.
- `client/src/context/AuthContext.jsx` — current-account state, `login`/
  `signup`/`logout`/`refresh`.
- **Gotcha already hit once**: MySQL `TINYINT(1)` columns (like
  `is_admin`) come back from `mysql2` as the JS number `0`/`1`, not a
  boolean. `{account.is_admin && <Thing/>}` renders a literal `"0"` text
  node when false (React renders `0`, unlike `false`/`null`/`undefined`).
  Always coerce: `{!!account.is_admin && <Thing/>}`. Check for this
  pattern before adding new conditionals on any boolean-ish DB column.

## Not built yet, roughly in priority order

1. **Thread detail/compose UI.** Inbox only lists conversations — there's
   no page to open a thread, see full history, or send a reply from the
   browser. Backend (`GET`/`POST /api/threads/:id/messages`) is built and
   tested; this is purely a missing frontend page.
2. **Deployment.** Nothing is live. Plan (agreed, not yet executed): a
   GitHub Actions pipeline builds/deploys to the Lightsail VM; Claude
   does not get direct AWS/SSH credentials in an interactive session —
   deploy credentials stay scoped to the pipeline.
3. **Postmark inbound webhook URL** needs pointing at the real deployed
   address once #2 is done (see relay section above).
4. **Password reset ("forgot password")** flow — identified as needed
   early on, never built. No email-verification-on-signup either.
5. **Photo/avatar upload.** `profile.photo_url` exists in the schema;
   no upload mechanism exists. Was earmarked for S3, not started.
6. **Account deletion.** The Account Settings mockup has a "Delete my
   account" button; there is no backend endpoint behind it.
7. **Skills/hobbies and education/employment entry UI.** The tables
   (`tags`, `profile_tags`, `profile_education`, `profile_employment`)
   exist and the search endpoint already queries `profile_education`/
   `profile_employment`, but there's no profile-edit UI for adding rows
   to any of them yet. The "Andy Dale can: / hobbies:" tickers on Home
   will stay in their empty state until this exists.
8. **Terms of Service / Privacy Policy page.** Not written. Needed before
   any real invites go out, given the site collects real names/locations
   and the relay handles real email addresses.
9. Rate limiting exists on login/signup/search but hasn't had a dedicated
   review pass.
