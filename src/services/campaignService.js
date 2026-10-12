const db = require("../repositories/jsonRepository");
const common = require("./common");
const AppError = require("../utils/AppError");
const { need, date, checkRef } = require("../utils/helpers");
async function validate(x) {
  need(x, ["title", "projectId"]);
  date(x.startDate, "startDate");
  date(x.endDate, "endDate");
  if (x.startDate && x.endDate && x.endDate < x.startDate)
    throw new AppError("endDate must be on or after startDate", 400);
  await checkRef("projects", x.projectId);
}
module.exports = {
  create: (b) => common.create("campaigns", "campaign", b, validate),
  list: (q) => common.list("campaigns", q),
  get: (id) => common.get("campaigns", id),
  update: (id, b) =>
    common.update("campaigns", id, b, async (x, u, old) => {
      await validate(x);
      if (
        old &&
        old.projectId !== x.projectId &&
        (await db.read("contents")).some((c) => c.campaignId === id)
      )
        throw new AppError(
          "Cannot move campaign with content to another project",
          409,
        );
    }),
  remove: (id) =>
    common.remove("campaigns", id, async () => {
      if ((await db.read("contents")).some((x) => x.campaignId === id))
        throw new AppError("Campaign has linked content", 409);
    }),
};
