const db = require("../repositories/jsonRepository");
const AppError = require("../utils/AppError");
const id = require("../utils/id");
const { now, listOptions } = require("../utils/helpers");
async function create(name, prefix, body, validate) {
  await validate(body, false);
  const stamp = now();
  const item = { ...body, id: id(prefix), createdAt: stamp, updatedAt: stamp };
  await db.transaction(name, (items) => {
    items.push(item);
  });
  return item;
}
async function list(name, q, options) {
  return listOptions(await db.read(name), q, options);
}
async function get(name, key) {
  const item = (await db.read(name)).find((x) => x.id === key);
  if (!item) throw new AppError(`${name.slice(0, -1)} not found`, 404);
  return item;
}
async function update(name, key, body, validate) {
  if ("id" in body || "createdAt" in body || "updatedAt" in body)
    throw new AppError("ID and timestamps cannot be edited", 400);
  if (!Object.keys(body).length) throw new AppError("No fields provided", 400);
  const current = await get(name, key);
  const proposed = { ...current, ...body };
  await validate(proposed, true, current);
  return db.transaction(name, (items) => {
    const index = items.findIndex((x) => x.id === key);
    if (index === -1) throw new AppError("Record not found", 404);
    items[index] = { ...items[index], ...body, updatedAt: now() };
    return items[index];
  });
}
async function remove(name, key, beforeRemove = async () => {}) {
  await get(name, key);
  await beforeRemove(key);
  return db.transaction(name, (items) => {
    const index = items.findIndex((x) => x.id === key);
    if (index === -1) throw new AppError("Record not found", 404);
    items.splice(index, 1);
  });
}
module.exports = { create, list, get, update, remove };
