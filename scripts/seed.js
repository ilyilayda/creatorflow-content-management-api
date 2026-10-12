const fs = require("node:fs/promises");
const path = require("node:path");
(async () => {
  const from = path.resolve(__dirname, "../seed");
  const to = path.resolve(__dirname, "../data");
  await fs.mkdir(to, { recursive: true });
  for (const file of await fs.readdir(from))
    if (file.endsWith(".json"))
      await fs.copyFile(path.join(from, file), path.join(to, file));
  console.log("Demo data reset.");
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
