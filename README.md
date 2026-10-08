# NexGate — Backend API

REST API for the NexGate gated-community app. It handles residents, guards, visitors, meetings, events, maintenance billing, plumber and laundry bookings, ratings and notifications.

Built with **Node.js + Express**, **Prisma** on **PostgreSQL**, JWT auth and bcrypt password hashing. Profile images upload to Cloudinary. The UI lives in the companion [`frontend`](../frontend) repo, which also runs on its own in demo mode.

## Quick start

```bash
npm install
cp .env.example .env              # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET
npx prisma migrate deploy         # apply migrations (use `migrate dev` locally)
npx prisma generate
npm start                         # nodemon index.js → http://localhost:5000
```

Health check: `GET /api/health` returns `{ "ok": true, "uptime": … }`.

### Seeding flats

Rooms (towers × floors × flats) are created by an admin:

```http
POST /api/user/rooms
Authorization: Bearer <admin token>
{ "blocks": ["A", "B", "C"], "numberOfFloors": 8, "flatsPerFloor": 4 }
```

The frontend's registration page then lists blocks from `GET /api/user/blocks` and flats from `GET /api/user/rooms?block=A`.

## Environment

See `.env.example` for the full list. The important ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL`, `DIRECT_URL` | PostgreSQL (pooled / direct for migrations) |
| `JWT_SECRET` | Token signing secret. Rotating it signs everyone out |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CORS_ORIGIN` | Comma-separated allowed origins (default `*`) |
| `DEMO_MODE` | `true` enables built-in demo logins with any password. **Never in production** |
| `CLOUDINARY_*` | Profile image uploads |

## Auth

Login endpoints return a JWT. Send it as `Authorization: Bearer <token>`.

- **authenticate**: any valid token.
- **admin**: a resident token with `isAdmin: true` (RWA committee).
- **guard**: a security token.

Responses never include password hashes or OTP fields. Invalid or expired tokens get `401`, and the wrong role gets `403`.

## Endpoints

All routes are prefixed with `/api`.

| Area | Method & path | Access |
|---|---|---|
| **Users** | `POST /user/signup` — `{ name, email, number, password, roomId }` | public* |
| | `POST /user/login` — `{ name, password }` | public |
| | `GET /user/my` | authenticate |
| | `GET /user/all` | admin |
| | `DELETE /user/delete` | authenticate (self) |
| | `GET /user/blocks` · `GET /user/rooms?block=A` | public |
| | `POST /user/rooms` | admin |
| **Security** | `POST /security/signup` · `POST /security/login` | public* |
| | `GET /security/all` | public |
| | `DELETE /security/delete` | admin |
| **Visitors** | `POST /visitor/create` — `{ name, age, address, purpose, number, block, flat }` | guard |
| | `GET /visitor/waiting` · `/getInside` · `/prev` | authenticate (resident's flat) |
| | `PUT /visitor/inside` · `PUT /visitor/hasLeft` · `DELETE /visitor/delete` — `{ visitorId }` | authenticate (flat resident, guard or admin) |
| | `GET /visitor/notified` | public |
| **Meetings** | `GET /meeting/all` · `/byId/:id` · `/search/:word` · `/completed` · `/incompleted` | public |
| | `POST /meeting/create` · `PUT /meeting/update/:id` · `/complete/:id` · `/incomplete/:id` · `DELETE /meeting/delete/:id` | admin |
| **Events** | `GET /event/all` · `/byId/:id` | public |
| | `POST /event/create` · `DELETE /event/delete/:id` | admin |
| **Maintenance** | `POST /maintenance/send` — `{ amount, month, year }` (bills every room) | admin |
| | `GET /maintenance/allUnpaid` | admin |
| | `GET /maintenance/userUnpaid` · `/userPaid` | authenticate |
| | `PATCH /maintenance/update` — `{ maintenanceId }` (mark paid) | admin or resident of that flat |
| **Plumber / Laundry** | `POST /plumber/signup` · `/login`, `POST /laundry/signup` · `/login` | public* |
| | `GET /plumber/get` · `GET /laundry/get` | public |
| | `DELETE /plumber/delete/:id` · `/laundry/delete/:id` | admin |
| **Bookings** | `POST /booking/create` — `{ date, description, plumberId \| laundryId }` | authenticate |
| | `GET /booking/getUser` · `/getPlumber` · `/getLaundry` | authenticate (matching role) |
| | `DELETE /booking/delete/:id` | owner or admin |
| **Ratings** | `POST /rating/create` — `{ bookingId, rating 1–5, comment }` | authenticate (own booking) |
| | `GET /rating/getUser/:id` · `/getPlumber/:id` | public |
| | `DELETE /rating/delete/:id` | owner or admin |
| **Notifications** | `GET /notification/my` | authenticate |
| | `PATCH /notification/visit/:id` · `DELETE /notification/delete/:id` | owner or admin |

\* Signup routes are open for now (marked `TODO` in code). `isAdmin` on user signup is ignored unless the request carries an admin token.

## Project structure

```
index.js                 Express app, CORS, health check, 404 + error handlers
middleware/authJWT.js    authenticate / authenticateSecurity / authorizeAdmin
middleware/multer.js     upload storage (./uploads)
modules/<area>/          <area>Route.js + <area>Controller.js per domain
prisma/schema.prisma     data model (Room, User, Security, Visitor, Meetings, Events,
                         Maintenance, Plumber, Laundry, Booking, Rating, Notification)
utils/                   prisma client, JWT helpers, logger (pino), sanitize()
```

## Known limitations

- `Visitor.number` is an `Int` column, so 10-digit phone numbers overflow. The API returns `400` with an explanation; the fix is a migration that changes the column to `String`.
- Some read endpoints are public (`/security/all`, `/plumber/get`, `/laundry/get`, ratings). Restrict them before going to production.
- Payment signature verification happens in the frontend's `/api/payment` route. The backend trusts the `PATCH /maintenance/update` call from an authorised resident.
