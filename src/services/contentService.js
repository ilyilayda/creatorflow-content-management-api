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
const statuses = [
  "draft",
  "in_production",
  "in_review",
  "revision_requested",
  "approved",
  "scheduled",
  "published",
];
const types = ["post", "carousel", "reels", "story", "video"];
const platforms = ["instagram", "tiktok", "youtube", "linkedin", "facebook"];
async function validate(x, isUpdate, old) {
  need(x, ["title", "campaignId"]);
  ensureString(x, ["caption"]);
  oneOf(x.type, types, "type");
  oneOf(x.platform, platforms, "platform");
  oneOf(x.status, statuses, "status");
  date(x.publishDate, "publishDate");
  if (
    x.assetLinks !== undefined &&
    (!Array.isArray(x.assetLinks) ||
      x.assetLinks.some((y) => typeof y !== "string"))
  )
    throw new AppError("assetLinks must be an array of strings", 400);
  await checkRef("campaigns", x.campaignId);
  if (isUpdate && old && x.status !== old.status)
    throw new AppError(
      "Content status may only change through workflow endpoints",
      409,
    );
  if (
    isUpdate &&
    old &&
    x.campaignId !== old.campaignId &&
    (await db.read("tasks")).some((t) => t.contentId === old.id)
  )
    throw new AppError(
      "Cannot move content with linked tasks to another campaign",
      409,
    );
}
module.exports = {
  create: (b) => {
    if (b.status && b.status !== "draft")
      throw new AppError("New content must start as draft", 400);
    return common.create(
      "contents",
      "content",
      {
        type: "post",
        platform: "instagram",
        caption: "",
        assetLinks: [],
        ...b,
        status: "draft",
      },
      validate,
    );
  },
  list: (q) => common.list("contents", q),
  get: (id) => common.get("contents", id),
  update: (id, b) => common.update("contents", id, b, validate),
  remove: (id) =>
    common.remove("contents", id, async () => {
      if (
        (await db.read("tasks")).some((x) => x.contentId === id) ||
        (await db.read("approvals")).some((x) => x.contentId === id)
      )
        throw new AppError("Content has linked tasks or approval history", 409);
    }),
};
