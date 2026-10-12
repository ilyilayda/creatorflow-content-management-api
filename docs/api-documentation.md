# CreatorFlow REST API Guide

Base URL: `http://localhost:3000/api`; request/response bodies use JSON. Successful responses normally use `{ "success": true, "data": ... }`. Failed requests use `{ "success": false, "message": "..." }`.

## Core grading endpoints
- `POST /tasks`: accepts `{title, description?, projectId, contentId?, assigneeId, status?, priority?, dueDate?}`; returns HTTP 201 and generated ID.
- `GET /tasks`: paginated list `{items, pagination}` inside `data`.
- `GET /tasks/:id`: one task or 404.
- `PUT /tasks/:id`: partial update (PUT is implemented as patch-style semantics for this educational project).
- `DELETE /tasks/:id`: returns 204.

Task statuses: `pending`, `in_progress`, `completed`, `blocked`; priorities: `low`, `medium`, `high`.

## Supporting routes
- Projects, campaigns and contents: standard CRUD as in README.
- `/users`: read-only seeded team.
- Content transitions: POST `/:id/start`, `/:id/submit-review`, `/:id/request-revision`, `/:id/resubmit`, `/:id/approve`, `/:id/schedule`, `/:id/publish` below `/contents`.
- A valid reviewer must have `manager` role in demo data. Review comment required on revision; publish date required on schedule. `resubmit` is only allowed after a revision request.
- Reports: `/reports/summary`, `/reports/overdue`, `/reports/projects/:id`.
- Calendar: `/calendar?month=YYYY-MM`.

## HTTP status codes
`200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `403 Forbidden` (demo reviewer role), `404 Not Found`, `409 Conflict` (invalid state / linked records), `500 Internal Server Error`.

## Postman evidence
Import the collection. Capture successful create, list, detail, update, delete actions (screenshot the request and HTTP response). Because deleted records don't produce a body, capture the HTTP 204 status, then a 404 on read-back.
