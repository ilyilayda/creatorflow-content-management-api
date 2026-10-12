const app = require("./app");
const port = Number(process.env.PORT) || 3000;
app.listen(port, () =>
  console.log(`CreatorFlow API running at http://localhost:${port}/api/health`),
);
