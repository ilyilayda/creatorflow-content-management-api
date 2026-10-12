const AppError = require("./AppError");
const db = require("../repositories/jsonRepository");
const now = () => new Date().toISOString();
const need = (obj, keys) => {
  const missing = keys.filter(
    (k) => typeof obj[k] !== "string" || !obj[k].trim(),
  );
  if (missing.length)
    throw new AppError(
      "Validation failed",
      400,
      missing.map((field) => ({ field, message: `${field} is required` })),
    );
};
const oneOf = (value, list, key) => {
  if (value !== undefined && !list.includes(value))
    throw new AppError(`Invalid ${key}. Allowed: ${list.join(", ")}`, 400);
};
const date = (v, key) => {
  if (
    v !== undefined &&
    v !== null &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(v) ||
      Number.isNaN(Date.parse(v)) ||
      new Date(v).toISOString().slice(0, 10) !== v)
  )
    throw new AppError(`${key} must be a valid YYYY-MM-DD date`, 400);
};
const exists = async (name, id) => {
  const item = (await db.read(name)).find((x) => x.id === id);
  if (!item) throw new AppError(`${name.slice(0, -1)} not found: ${id}`, 404);
  return item;
};
const checkRef = async (name, id) => {
  if (id != null) await exists(name, id);
};
const ensureString = (obj, keys) => {
  for (const k of keys)
    if (obj[k] !== undefined && (typeof obj[k] !== "string" || !obj[k].trim()))
      throw new AppError(`${k} must be a non-empty string`, 400);
};
const listOptions = (items, q, { searchFields = ["title", "name"] } = {}) => {
  let result = items;
  const search = q.search || q.keyword;
  if (search) {
    const phrase = String(search).toLowerCase();
    result = result.filter((x) =>
      searchFields.some((k) =>
        String(x[k] || "")
          .toLowerCase()
          .includes(phrase),
      ),
    );
  }
  for (const key of [
    "status",
    "priority",
    "assigneeId",
    "projectId",
    "campaignId",
    "contentId",
    "type",
    "platform",
  ])
    if (q[key]) result = result.filter((x) => x[key] === q[key]);
  const permitted = [
    "createdAt",
    "updatedAt",
    "dueDate",
    "publishDate",
    "title",
    "name",
  ];
  const sort = permitted.includes(q.sort) ? q.sort : "createdAt";
  result = [...result].sort(
    (a, b) =>
      String(a[sort] || "").localeCompare(String(b[sort] || "")) *
      (q.order === "asc" ? 1 : -1),
  );
  const page = Math.max(1, Math.min(100000, Number.parseInt(q.page, 10) || 1));
  const limit = Math.max(1, Math.min(100, Number.parseInt(q.limit, 10) || 10));
  return {
    items: result.slice((page - 1) * limit, page * limit),
    pagination: {
      total: result.length,
      page,
      limit,
      totalPages: Math.ceil(result.length / limit),
    },
  };
};
module.exports = {
  now,
  need,
  oneOf,
  date,
  exists,
  checkRef,
  ensureString,
  listOptions,
};
