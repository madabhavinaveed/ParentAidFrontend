# PairentAid — Part 2 light implementation

This repo matches the **optional Part 2** brief:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/responses` | **POST** | Submit one partner’s answer (`coupleId`, `slot`: 1 or 2, `text`) |
| `/responses/:coupleId` | **GET** | Return both answers + `complete` |
| `/alignment/:coupleId` | **GET** | `{ ready }` or `{ ready, alignment }` after both submitted |

`GET /health` is included for ops only.

**Database:** SQLite (`backend/prisma/dev.db`), two tables via Prisma — **no Postgres, no JWT, no users.**

**Try it:** same `coupleId` in two browser tabs; submit **slot 1** in one and **slot 2** in the other, then **GET alignment**.

## Run (Docker)

```bash
docker compose up --build
```

- UI: http://localhost:5173  
- API: http://localhost:4000/health  

Vite proxies `/api` → backend (see `frontend/vite.config.ts`).

## Run locally

```bash
cd backend && cp .env.example .env && npx prisma db push && npm install && npm run dev
cd frontend && npm install && npm run dev
```

Use `VITE_PROXY_TARGET=http://127.0.0.1:4000` if the proxy target differs.

## Assignment mapping

- **Submit response** → `POST /responses`
- **Retrieve responses** → `GET /responses/:coupleId`
- **Alignment state** → `GET /alignment/:coupleId`

Alignment uses a tiny keyword-overlap heuristic (not ML).
