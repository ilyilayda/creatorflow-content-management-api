const { randomUUID } = require("node:crypto");
module.exports = (kind) => `${kind}_${randomUUID()}`;
