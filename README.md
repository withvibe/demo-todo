# Todo — full-stack demo (Nest + React + Flutter + MySQL)

A single Todo product across three surfaces, sharing one API and database.
Used to demonstrate WithVibe running a full stack with a web admin and a
mobile app side by side.

- **backend/** — NestJS + Prisma, REST API (`/todos`) backed by MySQL
- **admin/** — React + Vite web admin panel (manage all tasks)
- **mobile/** — Flutter app (the todo itself: add / check off)

Each client discovers the API at runtime by swapping its own host prefix
(`web-…` / `mobile-…` → `api-…`), so no build-time config is needed.

## Services (docker-compose, provided by the WithVibe template)

| Service | Port | What |
|---|---|---|
| mysql    | 3306 (internal) | `todos` database |
| api      | 8080 | Nest REST API, seeds sample tasks on first boot |
| web      | 8081 | React admin (Preview) |
| mobile   | 8082 | Flutter app (Mobile Simulator) |

Check a task off on the phone and it updates in the admin, and vice-versa.
