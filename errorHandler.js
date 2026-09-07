/* eslint-disable no-unused-vars */

/**
 * Catches anything thrown/passed to next(err) in route handlers and
 * returns a consistent, safe JSON error shape. Never leaks stack traces
 * or internal details to the client.
 */
function errorHandler(err, req, res, next) {
  console.error(`[error] ${req.method} ${req.path} ->`, err.message);

  const status = err.status || 500;
  const message =
    status === 500
      ? "Something went wrong on our end. Please try again shortly."
      : err.message;

  res.status(status).json({ error: message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: "Not found." });
}

module.exports = { errorHandler, notFoundHandler };
