require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { wrap, send, crud } = require("./utils/http");
const { allowed } = require("./middleware/validate");
const logger = require("./middleware/logger");
const { notFound, errorHandler } = require("./middleware/errors");
const db = require("./repositories/jsonRepository");
const services = {
  tasks: require("./services/taskService"),
  projects: require("./services/projectService"),
  campaigns: require("./services/campaignService"),
  contents: require("./services/contentService"),
};
const approvals = require("./services/approvalService");
const reports = require("./services/reportService");
const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(logger);
app.get("/api/health", (req, res) =>
  send(res, { status: "ok", application: "CreatorFlow", version: "1.0.0" }),
);
const fields = {
  tasks: [
    "title",
    "description",
    "projectId",
    "contentId",
    "assigneeId",
    "status",
    "priority",
    "dueDate",
  ],
  projects: ["name", "clientName", "description", "status"],
  campaigns: ["title", "projectId", "startDate", "endDate"],
  contents: [
    "title",
    "campaignId",
    "type",
    "platform",
    "caption",
    "assetLinks",
    "publishDate",
    "status",
  ],
};
for (const [name, service] of Object.entries(services)) {
  const router = express.Router();
  
router.use((req, res, next) => {
  const isCreateRequest =
    req.method === "POST" &&
    req.path === "/";

  const isUpdateRequest =
    req.method === "PUT" &&
    /^\/[^/]+\/?$/.test(req.path);

  if (isCreateRequest || isUpdateRequest) {
    return allowed(fields[name])(req, res, next);
  }

  next();
});

  crud(router, service);
  app.use("/api/" + name, router);
}
app.get(
  "/api/users",
  wrap(async (req, res) => send(res, await db.read("users"))),
);
app.get(
  "/api/users/:id",
  wrap(async (req, res) => {
    const users = await db.read("users");
    const value = users.find((x) => x.id === req.params.id);
    if (!value) throw new (require("./utils/AppError"))("User not found", 404);
    send(res, value);
  }),
);
const router = express.Router();
for (const action of [
  "start",
  "submit-review",
  "approve",
  "request-revision",
  "resubmit",
  "schedule",
  "publish",
]) {
  const key = action.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  router.post(
    "/:id/" + action,
    wrap(async (req, res) =>
      send(res, await approvals.transition(req.params.id, key, req.body)),
    ),
  );
}
router.get(
  "/:id/approvals",
  wrap(async (req, res) => send(res, await approvals.history(req.params.id))),
);
app.use("/api/contents", router);
app.get(
  "/api/reports/summary",
  wrap(async (req, res) => send(res, await reports.summary())),
);
app.get(
  "/api/reports/overdue",
  wrap(async (req, res) => send(res, await reports.overdueTasks())),
);
app.get(
  "/api/reports/projects/:id",
  wrap(async (req, res) => send(res, await reports.project(req.params.id))),
);
app.get(
  "/api/calendar",
  wrap(async (req, res) => send(res, await reports.calendar(req.query.month))),
);
app.get(
  "/api/activity",
  wrap(async (req, res) => send(res, await db.read("activityLogs"))),
);
app.use(notFound);
app.use(errorHandler);
module.exports = app;
