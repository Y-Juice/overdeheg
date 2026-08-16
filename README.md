# Overdeheg

Anonieme buurtchat met stille observatie op de achtergrond.

Overdeheg is een dystopische wijk-app: je praat met buren, maar berichten, aarzelingen, bewerkingen, verwijderingen en locatiepings worden stil bijgehouden. Daaruit komen risicoscores, vlaggen, een systeemlog en een eenvoudige “predictieve politie”-laag (geen machine learning, alleen vaste regels).

Dit is een schoolproject / simulatie. Het is geen echte surveillance- of politietool.

## Tech stack

- Frontend: React 18, TypeScript, Vite, Zustand, CSS modules
- Backend: Express, TypeScript, `pg` (geen ORM)
- Database: PostgreSQL 16
- Alles draait via Docker Compose

Geen API-keys nodig.

## Starten

1. Docker Desktop starten
2. In de projectmap:

```bash
cp .env.template .env
docker compose up --build
```

3. Open:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4000
   - Health: http://localhost:4000/api/health

Standaard `.env` waarden staan in `.env.template` (poorten 5173 / 4000 / 5432).

## Wat erin zit

- **Wijkkaart** met zones, heat en bewoners
- **Buurtchat** per zone, soft delete, snelle startvragen, NPC-dialogen
- **Systeemlog** met observaties uit de database
- **Risicoanalyse** met scores per bewoner/zone, correlatiesignalen, patrouilleadvies, watchlist en verwachte incidenten
- Risico kan **omhoog** (gedragssignalen) en **omlaag** (inactiviteit / vriendelijke berichten)

## Mappen

```
overdeheg/
├─ backend/          # Express API, engine, services, schema/seed
├─ frontend/         # Vite React app
├─ docker-compose.yml
└─ .env.template
```

Belangrijkste backend-onderdelen:

- `engine/` — correlatie-matchers + dreigingsmodel
- `services/` — berichten, locatie, dialoog, risico, voorspellingen
- `db/` — `schema.sql` en `seed.sql`

Frontend is opgedeeld in features: `map/`, `chat/`, `risk/`, `systemlog/`.

## Werkwijze

Features zitten op branches zoals `feat/...` en worden naar `main` gemerged. Commits zijn kort (`feat:` / `fix:`).

## Bronnen

### Documentatie

- [React docs](https://react.dev/) — componenten, hooks, state
- [Vite](https://vitejs.dev/) — frontend build / Docker-devsetup
- [TypeScript handbook](https://www.typescriptlang.org/docs/) — types in frontend en backend
- [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) — client store
- [Express](https://expressjs.com/) — API-routes
- [node-postgres (`pg`)](https://node-postgres.com/) — queries zonder ORM
- [PostgreSQL docs](https://www.postgresql.org/docs/current/) — schema, joins, aggregaties
- [Docker Compose](https://docs.docker.com/compose/) — db + backend + frontend samen draaien
- [MDN CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) — layout, CSS modules, grid
- [Google Fonts](https://fonts.google.com/) — Syne en Manrope voor de UI

### Concept (achtergrond)

- [Predictive policing (Wikipedia)](https://en.wikipedia.org/wiki/Predictive_policing) — context voor het dystopische thema (niet als echte methode gebruikt)

### AI

Voor structuuradvies (mappen, services, hoe het niet te ingewikkeld te maken) is deze ChatGPT-chat gebruikt:

https://chatgpt.com/share/6a814aa7-e3ec-83ed-8feb-280ecb3c1ee6

Dit is de enige AI-bron die voor dit project is gebruikt.
