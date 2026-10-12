const AppError = require("../utils/AppError");
const allowed = (fields) => (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    return next(new AppError("Request body must be a JSON object", 400));
  const unknown = Object.keys(req.body).filter((k) => !fields.includes(k));
  if (unknown.length)
    return next(new AppError("Unexpected fields: " + unknown.join(", "), 400));
  next();
};
module.exports = { allowed };
