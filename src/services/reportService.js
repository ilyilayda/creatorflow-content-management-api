const db = require("../repositories/jsonRepository");
const { exists } = require("../utils/helpers");
function counts(items, key) {
  return items.reduce((a, x) => ((a[x[key]] = (a[x[key]] || 0) + 1), a), {});
}
const today = () => new Date().toISOString().slice(0, 10);
const overdue = (t) =>
  t.dueDate && t.dueDate < today() && t.status !== "completed";
async function summary() {
  const [tasks, contents, projects, campaigns] = await Promise.all(
    ["tasks", "contents", "projects", "campaigns"].map(db.read),
  );
  return {
    totalProjects: projects.length,
    totalCampaigns: campaigns.length,
    totalTasks: tasks.length,
    totalContents: contents.length,
    tasksByStatus: counts(tasks, "status"),
    tasksByPriority: counts(tasks, "priority"),
    contentsByStatus: counts(contents, "status"),
    overdueTasks: tasks.filter(overdue).length,
  };
}
async function project(id) {
  await exists("projects", id);
  const campaigns = (await db.read("campaigns")).filter(
    (x) => x.projectId === id,
  );
  const tasks = (await db.read("tasks")).filter((x) => x.projectId === id);
  const contents = (await db.read("contents")).filter((x) =>
    campaigns.some((c) => c.id === x.campaignId),
  );
  return {
    projectId: id,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((x) => x.status === "completed").length,
    completionPercent: tasks.length
      ? Math.round(
          (tasks.filter((x) => x.status === "completed").length /
            tasks.length) *
            100,
        )
      : 0,
    totalContents: contents.length,
    contentsByStatus: counts(contents, "status"),
    overdueTasks: tasks.filter(overdue).length,
  };
}
async function overdueTasks() {
  return (await db.read("tasks")).filter(overdue);
}
async function calendar(month) {
  if (month && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    throw new (require("../utils/AppError"))("month must be YYYY-MM", 400);
  return (await db.read("contents"))
    .filter((x) => x.publishDate && (!month || x.publishDate.startsWith(month)))
    .sort((a, b) => a.publishDate.localeCompare(b.publishDate));
}
module.exports = { summary, project, overdueTasks, calendar };
