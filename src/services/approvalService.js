const db = require("../repositories/jsonRepository");
const AppError = require("../utils/AppError");
const id = require("../utils/id");
const log = require("./activityService");
const { now, exists, need, date } = require("../utils/helpers");
const states = {
  start: ["draft"],
  submitReview: ["in_production"],
  approve: ["in_review"],
  requestRevision: ["in_review"],
  resubmit: ["revision_requested"],
  schedule: ["approved"],
  publish: ["scheduled"],
};
const next = {
  start: "in_production",
  submitReview: "in_review",
  approve: "approved",
  requestRevision: "revision_requested",
  resubmit: "in_review",
  schedule: "scheduled",
  publish: "published",
};
async function transition(contentId, action, body = {}) {
  const current = await exists("contents", contentId);
  if (!states[action] || !states[action].includes(current.status))
    throw new AppError(
      `Cannot ${action} content in ${current.status} status`,
      409,
    );
  if (["approve", "requestRevision"].includes(action)) {
    need(body, ["reviewerId"]);
    const reviewer = await exists("users", body.reviewerId);
    if (reviewer.role !== "manager")
      throw new AppError("Reviewer must have manager role", 403);
  }
  if (action === "requestRevision") need(body, ["comment"]);
  if (action === "schedule") {
    date(body.publishDate, "publishDate");
    need(body, ["publishDate"]);
  }
  let result;
  await db.transaction("contents", (items) => {
    const index = items.findIndex((x) => x.id === contentId);
    if (index < 0 || items[index].status !== current.status)
      throw new AppError("Content changed; retry", 409);
    items[index] = {
      ...items[index],
      status: next[action],
      ...(action === "schedule" ? { publishDate: body.publishDate } : {}),
      updatedAt: now(),
    };
    result = items[index];
  });
  if (["approve", "requestRevision"].includes(action)) {
    await db.transaction("approvals", (items) =>
      items.push({
        id: id("approval"),
        contentId,
        reviewerId: body.reviewerId,
        decision: action === "approve" ? "approved" : "revision_requested",
        comment: body.comment || "",
        createdAt: now(),
      }),
    );
  }
  await log({
    actorId: body.reviewerId || null,
    entityType: "content",
    entityId: contentId,
    action,
    details: body.comment || null,
  });
  return result;
}
async function history(id) {
  await exists("contents", id);
  return (await db.read("approvals")).filter((x) => x.contentId === id);
}
module.exports = { transition, history };
