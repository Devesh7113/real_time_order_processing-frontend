# Frontend build checklist — React, Axios, React Router

**Stack:** Vite, React, Axios, React Router, Tailwind (already in project).

**Backend note:** `/api/orders` requires JWT. Public routes: `/api/auth/welcome`, `/api/auth/addNewUser`, `/api/auth/generateToken`. Default API: `http://localhost:8080` unless configured otherwise.

**Resume angle:** SPA → centralized API client → JWT + protected routes → order CRUD with loading/error states.

---

## Phase A — Project skeleton (no backend calls yet)

1. **Folder layout** — e.g. `src/pages`, `src/components`, `src/api`, `src/hooks`, `src/context` (pick one pattern; stay consistent).
2. **Router shell** — `BrowserRouter`, a **Layout** (nav + outlet), placeholder routes: `/`, `/orders`, `/login`.
3. **404 route** — catch unknown paths.

**Outcome:** Navigate between pages; explain routing on a resume.

---

## Phase B — Configuration and HTTP (Axios)

4. **Environment base URL** — `VITE_API_BASE_URL` (e.g. `http://localhost:8080`) in `.env` / `.env.example` (Vite only exposes `VITE_*` vars).
5. **Axios instance** — single `apiClient` with `baseURL`, default headers, **request interceptor** attaching `Authorization: Bearer <token>` when present.
6. **Response interceptor (optional)** — e.g. 401 → clear token, redirect to login (add after login works).

**Outcome:** One HTTP entry point; “centralized client + interceptors.”

---

## Phase C — Auth (minimum viable; needed for real `/api/orders`)

7. **Auth API** — `register`, `login` aligned with `addNewUser` / `generateToken`.
8. **Token storage** — `localStorage` or `sessionStorage` + helpers (read/write/remove).
9. **Auth context or hook** — `user`, `token`, `login`, `logout`, `isAuthenticated`.
10. **Login / Register pages** — forms, save token, navigate to `/orders`.
11. **Protected route** — no token → redirect to `/login`.

**Outcome:** JWT + protected routes end to end.

---

## Phase D — Types and order API module

12. **TypeScript types** — mirror DTOs: `OrderDTO`, `OrderItemDTO`, `OrderCreateDTO`, `OrderUpdateDTO`; enums for order/payment status (match backend enum names as strings).
13. **`ordersApi`** — thin functions:
    - `GET /api/orders` — list
    - `GET /api/orders/items?orderId=` — line items
    - `POST /api/orders` — create
    - `PUT /api/orders` — update (`id`, `shippingAddress`, `notes`)
    - `DELETE /api/orders?id=` — confirm query param matches backend (`@RequestParam` on controller if needed)
14. **Products for order form** — `GET /api/orders/products` → `ProductDTO[]`.

**Outcome:** UI stays thin; URLs/payloads in one testable module.

---

## Phase E — Orders UI (one screen per step)

15. **Orders list** — fetch list; loading + error states.
16. **Order detail** — e.g. `/orders/:orderId`; show items, totals, status, addresses.
17. **Create order** — product picker from step 14, quantities, addresses, notes, payment method → `POST`.
18. **Edit order** — only `OrderUpdateDTO` fields: `shippingAddress`, `notes` (+ `id`).
19. **Delete** — confirm → `DELETE`; refresh or navigate.

**Outcome:** Order CRUD aligned with API.

---

## Phase F — Quality and polish

20. **CORS** — backend allows frontend origin (e.g. `http://localhost:5173`).
21. **Error UX** — map API errors to readable messages.
22. **Optional: TanStack Query** — caching, mutations (resume keyword; not required initially).

---

## Phase G — Later (after orders)

23. **Dedicated product UI** — if/when product APIs are separate.
24. **Admin vs user** — `ROLE_ADMIN` routes if needed.
25. **Real-time** — WebSocket/SSE if backend adds it.

---

## Suggested order for the very first session

1. Phase A — items 1–3 (folders + router + layout + placeholders + 404).
2. Then Phase B — items 4–5 (env + axios instance).

---

*Generated for project: real-time-order-processing / order-service frontend track.*
