const AppError = require("./AppError");
const wrap = (fn) => (req, res, next) =>
  Promise.resolve()
    .then(() => fn(req, res))
    .catch(next);
const send = (res, data, status = 200) =>
  res.status(status).json({ success: true, data });
const crud = (router, service) => {
  router.post(
    "/",
    wrap(async (req, res) => send(res, await service.create(req.body), 201)),
  );
  router.get(
    "/",
    wrap(async (req, res) => send(res, await service.list(req.query))),
  );
  router.get(
    "/:id",
    wrap(async (req, res) => send(res, await service.get(req.params.id))),
  );
  router.put(
    "/:id",
    wrap(async (req, res) =>
      send(res, await service.update(req.params.id, req.body)),
    ),
  );
  router.delete(
    "/:id",
    wrap(async (req, res) => {
      await service.remove(req.params.id);
      res.status(204).end();
    }),
  );
};
module.exports = { wrap, send, crud };
