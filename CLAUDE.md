# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # dev server on http://localhost:9000 (Turbopack)
npm run build    # production build (Turbopack)
npm run start    # serve production build
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
```

No test runner is configured yet.

## Stack

Next.js 15 (App Router, RSC) · React 19 · TypeScript (strict) · Tailwind CSS v4 · shadcn (style `base-lyra`, Phosphor icons) · Zustand · Zod v4 · Sonner toasts. Path alias `@/*` → `src/*`.

## Architecture

This is an IAM admin frontend. The backend is a separate IAM API reached via `NEXT_PUBLIC_IAM_API` (see `.env.local`, e.g. `http://localhost:9001/v1`). All API base URLs live in `src/lib/config.ts` (`API.IAM`).

### Auth flow (the core of the app)

Token strategy: **access token in memory, refresh token in an httpOnly cookie**.

- `src/store/auth.ts` — Zustand store holding `user` and `token` (access token). In-memory only; nothing persisted client-side.
- `src/lib/client.ts` — the `client()` fetch wrapper. Injects `Authorization: <type> <access_token>` from the store, and on a `401` calls `refresh()` once and retries. `refresh()` is de-duplicated via a module-level `refreshing` promise so concurrent 401s trigger a single `/auth/refresh` call. On refresh failure it calls `clearAuth()`. **Use `client()` for any authenticated request**; raw `fetch` is only for unauthenticated endpoints (login/refresh/logout, which rely on the cookie).
- `src/lib/api/auth.ts` — auth API calls: `login`, `logout`, `getCurrentUser`. `login`/`refresh` use `credentials: "include"` to send/set the refresh cookie. `getCurrentUser` uses `client()`. Each response is validated with a Zod schema.
- `src/components/AuthProvider.tsx` — client component wrapping the whole app in the root layout. On mount it `refresh()`s, then loads the current user, gating render behind a `ready` flag (shows "Loading…"). Also bounces an authenticated user away from `/login` to the `from` param.
- `src/middleware.ts` — edge guard based **only on the presence of the `refresh_token` cookie** (not its validity). Unauthenticated → redirect to `/login?from=<path>`; authenticated hitting a public path → redirect to `/`. Public paths: `PUBLIC_PATH = ["/login"]`. Actual token validation happens client-side via the refresh flow.

When adding auth-protected behavior, the two layers work together: middleware does coarse cookie-presence routing, `AuthProvider` + `client()` do real validation/refresh.

### Routing & layout

App Router with route groups:
- `src/app/(public)/` — unauthenticated routes (`login`). Group has no shell.
- `src/app/(main)/` — authenticated app. `(main)/layout.tsx` renders the sidebar shell (`SidebarProvider` + `AppSidebar` + `Topbar`), reading the `sidebar_state` cookie for initial open state.

### Navigation & permissions

`src/lib/shell/nav-config.ts` is the single source of nav items (`NAV`). Each item may carry a `permission` string (e.g. `user.read`, `role.read`). `AppSidebar` (`src/components/shell/`) renders `NAV`. Note: permission-based filtering of nav items is **declared but not yet enforced** in `AppSidebar` — items render regardless of permission. Add new sections by extending `NAV`, not by hardcoding links.

### Types & validation

`src/types/auth.ts` defines Zod schemas (`loginSchema`, `UserSchema`, `TokenSchema`) and infers TS types from them. Pattern: define the Zod schema, derive the type via `z.infer`, and `.parse()` API responses at the boundary.

## Conventions

- Add UI primitives via shadcn into `src/components/ui/`; shared components in `src/components/`; route-local components in that route's `components/` folder.
- Compose Tailwind classes with `cn()` from `src/lib/utils.ts`.
- Icons come from `@phosphor-icons/react`.
