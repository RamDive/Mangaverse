# MangaVerse - Full App Scaffold

This repo is a runnable scaffold for the MangaVerse app (web + api).

## Quickstart (dev)

1. Install Docker and Docker Compose.
2. From `infra/` run: `docker-compose up --build`.
3. Wait for Postgres to be ready, then run migrations in the api container (or use provided migrate script).
4. Seed sample data: `docker exec -it <api_container> node src/seed.js`.
5. Visit http://localhost:3000

## Notes
- This scaffold provides a minimal but functional API with signup/login and manga listing.
- Replace JWT_SECRET with a secure value for production.
