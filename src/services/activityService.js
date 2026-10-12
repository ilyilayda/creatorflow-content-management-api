const db = require("../repositories/jsonRepository");
const id = require("../utils/id");
const { now } = require("../utils/helpers");
module.exports = async ({
  actorId = null,
  entityType,
  entityId,
  action,
  details = null,
}) =>
  db.transaction("activityLogs", (items) =>
    items.push({
      id: id("log"),
      actorId,
      entityType,
      entityId,
      action,
      details,
      createdAt: now(),
    }),
  );
