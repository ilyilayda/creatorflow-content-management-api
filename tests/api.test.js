const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "creatorflow-"));
for (const name of [
  "users",
  "projects",
  "campaigns",
  "contents",
  "tasks",
  "approvals",
  "activityLogs",
])
  fs.copyFileSync(
    path.join(__dirname, "../data", name + ".json"),
    path.join(tmp, name + ".json"),
  );
process.env.DATA_DIR = tmp;
const app = require("../src/app");
let server, base;
test.before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => {
  await new Promise((r) => server.close(r));
  fs.rmSync(tmp, { recursive: true, force: true });
});
const request = async (method, path, body) => {
  const res = await fetch(base + path, {
    method,
    headers: { "content-type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return {
    status: res.status,
    data: res.status === 204 ? null : await res.json(),
  };
};
test("health and seeded reports", async () => {
  assert.equal((await request("GET", "/api/health")).status, 200);
  const r = await request("GET", "/api/reports/summary");
  assert.equal(r.data.data.totalTasks, 40);
});
test("full mandatory CRUD lifecycle", async () => {
  let r = await request("POST", "/api/tasks", {
    title: "Sample test task",
    projectId: "project_001",
    assigneeId: "user_002",
    priority: "high",
  });
  assert.equal(r.status, 201);
  const id = r.data.data.id;
  assert.ok(id);
  r = await request("GET", "/api/tasks");
  assert.equal(r.status, 200);
  r = await request("GET", "/api/tasks/" + id);
  assert.equal(r.data.data.title, "Sample test task");
  r = await request("PUT", "/api/tasks/" + id, { status: "completed" });
  assert.equal(r.data.data.status, "completed");
  r = await request("DELETE", "/api/tasks/" + id);
  assert.equal(r.status, 204);
  r = await request("GET", "/api/tasks/" + id);
  assert.equal(r.status, 404);
});
test("validation and invalid refs", async () => {
  assert.equal(
    (await request("POST", "/api/tasks", { title: "" })).status,
    400,
  );
  assert.equal(
    (
      await request("POST", "/api/tasks", {
        title: "One",
        projectId: "project_001",
        assigneeId: "unknown",
      })
    ).status,
    404,
  );
});


test("content approval workflow and invariants", async () => {
  let r = await request("POST", "/api/contents", {
    campaignId: "campaign_001",
    title: "New campaign idea",
    type: "carousel",
    platform: "instagram",
    caption: "Discover our latest study tips and creative content!",
    status: "draft"
  });


  //console.log(
  //  "CONTENT CREATION RESPONSE:",
  //  JSON.stringify(r, null, 2)
  //);

  assert.equal(r.status, 201);
  const id = r.data.data.id;
  assert.equal(
    (
      await request("POST", `/api/contents/${id}/schedule`, {
        publishDate: "2026-10-25",
      })
    ).status,
    409,
  );
  for (const a of ["start", "submit-review"])
    assert.equal(
      (await request("POST", `/api/contents/${id}/${a}`, {})).status,
      200,
    );
  assert.equal(
    (
      await request("POST", `/api/contents/${id}/request-revision`, {
        reviewerId: "user_001",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("POST", `/api/contents/${id}/approve`, {
        reviewerId: "user_002",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("POST", `/api/contents/${id}/approve`, {
        reviewerId: "user_001",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("POST", `/api/contents/${id}/schedule`, {
        publishDate: "2026-10-25",
      })
    ).status,
    200,
  );
  assert.equal(
    (await request("POST", `/api/contents/${id}/publish`, {})).status,
    200,
  );
});
