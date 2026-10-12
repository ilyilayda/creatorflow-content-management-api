const fs = require("node:fs/promises");
const path = require("node:path");
const AppError = require("../utils/AppError");
const names = new Set([
  "users",
  "projects",
  "campaigns",
  "contents",
  "tasks",
  "approvals",
  "activityLogs",
]);
const root = path.resolve(
  process.env.DATA_DIR || path.join(__dirname, "../../data"),
);
const locks = new Map();
function filename(name) {
  if (!names.has(name)) throw new AppError("Unknown data collection", 400);
  return path.join(root, `${name}.json`);
}
async function read(name) {
  const file = filename(name);
  try {
    const txt = await fs.readFile(file, "utf8");
    const value = JSON.parse(txt);
    if (!Array.isArray(value)) throw new Error("Collection must be an array");
    return value;
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}
async function save(name, items) {
  await fs.mkdir(root, { recursive: true });
  const file = filename(name);
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(items, null, 2) + "\n");
  await fs.rename(tmp, file);
}
async function transaction(name, callback) {
  const previous = locks.get(name) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => {
    release = resolve;
  });
  locks.set(name, current);
  await previous;
  try {
    const items = await read(name);
    const result = await callback(items);
    await save(name, items);
    return result;
  } finally {
    release();
    if (locks.get(name) === current) locks.delete(name);
  }
}
module.exports = { read, save, transaction };
