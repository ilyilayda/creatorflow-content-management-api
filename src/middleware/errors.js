const AppError = require("../utils/AppError");
const notFound = (req, res) =>
  res
    .status(404)
    .json({
      success: false,
      message: `Route ${req.method} ${req.originalUrl} not found`,
    });
const errorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err)
    return res
      .status(400)
      .json({ success: false, message: "Invalid JSON body" });
  const status = err instanceof AppError ? err.status : 500;
  if (status === 500) console.error(err);
  const out = {
    success: false,
    message: status === 500 ? "Internal server error" : err.message,
  };
  if (err.errors) out.errors = err.errors;
  return res.status(status).json(out);
};
module.exports = { notFound, errorHandler };
