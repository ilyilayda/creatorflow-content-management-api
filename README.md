# CreatorFlow — Content Production & Approval Management API

A modular **Node.js + Express REST API** for creative agencies and social media teams. Manage **projects, campaigns, content, assigned tasks, review/approval loops, publishing schedules and reports**. Designed for a Node.js backend internship capstone with an extended portfolio feature set.

## Quick start (VS Code / Windows / macOS / Linux)

**Requirements:** Node.js 18+ and npm installed; internet required **once** to download npm packages.

```bash
npm install
npm start
```

Visit **http://localhost:3000/api/health** in a browser. You should see JSON with `status: "ok"`.

For auto-restart during development: `npm run dev`. To configure port, copy `.env.example` to `.env` and edit `PORT`.

**Important:** Do **not** run the `.js` files individually. Run the project from its root folder, where `package.json` is located.

### Try the API

1. Import `postman/CreatorFlow.postman_collection.json` into Postman.
2. Start the server: `npm start`.
3. Run **List tasks**, **Create task**, **Get seeded task**, **Update seeded task** and **Delete seeded task**.
4. For newly created tasks, copy the returned `id` into Get/Update/Delete URL as desired.
5. Save screenshots showing the results under `docs/screenshots/` for submission. Placeholder files are not test evidence.

The initial JSON fixtures contain **6 users, 3 projects, 5 campaigns, 24 contents, 40 tasks**, plus approvals. Changes are persisted in `data/*.json`. Run `npm run seed` to restore the original fixture data from `seed/`.

## Core endpoints

| Method | Endpoint | Function |
|---|---|---|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks` | List tasks |
| GET | `/api/tasks/:id` | Task detail |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET/POST/PUT/DELETE | `/api/projects[/:id]` | Projects CRUD |
| GET/POST/PUT/DELETE | `/api/campaigns[/:id]` | Campaigns CRUD |
| GET/POST/PUT/DELETE | `/api/contents[/:id]` | Contents CRUD |
| GET | `/api/users` | Seeded team |
| POST | `/api/contents/:id/start` | Start producing |
| POST | `/api/contents/:id/submit-review` | Send for review |
| POST | `/api/contents/:id/request-revision` | Request revision |
| POST | `/api/contents/:id/resubmit` | Resubmit revision |
| POST | `/api/contents/:id/approve` | Approve |
| POST | `/api/contents/:id/schedule` | Set publish date |
| POST | `/api/contents/:id/publish` | Mark published |
| GET | `/api/contents/:id/approvals` | Approval history |
| GET | `/api/calendar?month=2026-10` | Planned posts |
| GET | `/api/reports/summary` | All statistics |
| GET | `/api/reports/projects/:id` | Campaign/project progress |
| GET | `/api/reports/overdue` | Late tasks |
| GET | `/api/activity` | Workflow log |

### Filtering

`GET /api/tasks?status=pending&priority=high&assigneeId=user_002&page=1&limit=10&sort=createdAt&order=desc`

`GET /api/contents?type=reels&platform=instagram&search=library`

### Sample task request

```json
{"title":"Design a 5-slide Instagram carousel","description":"Create visuals","projectId":"project_001","assigneeId":"user_002","priority":"high","dueDate":"2026-10-22"}
```

Response: `201 Created` with `{"success":true,"data":{...}}`. Invalid inputs return `400`, unknown linked IDs `404`, invalid lifecycle transitions `409`.

### Workflow example

Create a content using POST `/api/contents`, copy its returned ID, then:

1. POST `/api/contents/ID/start` with `{}`
2. POST `/api/contents/ID/submit-review` with `{}`
3. POST `/api/contents/ID/approve` with `{"reviewerId":"user_001","comment":"Looks good"}`
4. POST `/api/contents/ID/schedule` with `{"publishDate":"2026-10-28"}`
5. POST `/api/contents/ID/publish` with `{}`

Or request revision using `{ "reviewerId": "user_001", "comment": "Adjust typography" }`, then `resubmit` for review. Note that manager roles in fixture data are **not secure authentication**; this demo intentionally does not implement a login system.

## Automated tests

```bash
npm test
```

Uses the native Node.js test runner and temporary copies of the fixture files. Tests do not modify production JSON files. Run `npm run seed` if you want to reset demo data.

## Architecture

`src/app.js` wires Express routes, global logger, JSON parser and error handling. `src/services/` owns validation, business rules and workflow state changes. `src/repositories/jsonRepository.js` safely serializes updates per JSON collection. `data/` stores local demo data. `postman/` contains request examples.

See [`docs/project-overview.md`](docs/project-overview.md), [`docs/api-documentation.md`](docs/api-documentation.md) and [`docs/er-diagram.md`](docs/er-diagram.md).

## Project assignment compliance

- Node.js + Express.js + routing: **yes**
- Mandatory five task CRUD endpoints: **yes**
- Request logger middleware (method, endpoint, timestamp): **yes**
- JSON data management: **yes**
- Postman collection for required CRUD: **yes** (actual successful screenshots must be captured by the student)
- 1–2 page project overview and installation guide: **yes**
- Public GitHub repo: **publish manually after reviewing the code**

**Scope:** Backend-only. No web frontend, OAuth, media upload, database server, or direct social-platform publishing. `publish` records manual publication; it does not post to Instagram.

## Limitations

File-backed storage targets local demos, not horizontally scaled production traffic. Workflow activity and approval logging uses separate JSON files rather than multi-file transactions. Add a database and authenticated roles before internet deployment.

## License
MIT
