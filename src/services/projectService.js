const db = require("../repositories/jsonRepository");
const common = require("./common");
const AppError = require("../utils/AppError");
const { need, oneOf, ensureString } = require("../utils/helpers");
async function validate(x) {
  need(x, ["name", "clientName"]);
  ensureString(x, ["description"]);
  oneOf(x.status, ["active", "paused", "completed"], "status");
}
module.exports = {
  create: (b) =>
    common.create("projects", "project", { status: "active", ...b }, validate),
  list: (q) => common.list("projects", q),
  get: (id) => common.get("projects", id),
  update: (id, b) => common.update("projects", id, b, validate),
  remove: (id) =>
    common.remove("projects", id, async () => {
      for (const name of ["campaigns", "tasks"])
        if ((await db.read(name)).some((x) => x.projectId === id))
          throw new AppError("Project has linked campaigns or tasks", 409);
    }),
};
