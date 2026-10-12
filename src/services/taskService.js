const db = require("../repositories/jsonRepository");
const common = require("./common");
const AppError = require("../utils/AppError");
const {
  need,
  oneOf,
  date,
  checkRef,
  ensureString,
} = require("../utils/helpers");
const statuses = ["pending", "in_progress", "completed", "blocked"];
const priorities = ["low", "medium", "high"];
async function validate(x) {
  need(x, ["title", "projectId", "assigneeId"]);
  ensureString(x, ["description"]);
  oneOf(x.status, statuses, "status");
  oneOf(x.priority, priorities, "priority");
  date(x.dueDate, "dueDate");
  await checkRef("projects", x.projectId);
  await checkRef("users", x.assigneeId);
  await checkRef("contents", x.contentId);
  if (x.contentId) {
    const content = (await db.read("contents")).find(
      (z) => z.id === x.contentId,
    );
    const campaign = (await db.read("campaigns")).find(
      (z) => z.id === content.campaignId,
    );
    if (campaign.projectId !== x.projectId)
      throw new AppError(
        "Task and content must belong to the same project",
        409,
      );
  }
}
module.exports = {
  create: (body) =>
    common.create(
      "tasks",
      "task",
      { status: "pending", priority: "medium", ...body },
      validate,
    ),
  list: (q) => common.list("tasks", q),
  get: (id) => common.get("tasks", id),
  update: (id, body) => common.update("tasks", id, body, validate),
  remove: (id) => common.remove("tasks", id),
};
