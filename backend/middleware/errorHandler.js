const errorHandler = (err, req, res, next) => {
  // Don't leak internal errors in production
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (isDev) console.error(err.stack);

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }

  // Validation errors from express-validator
  if (err.type === 'validation') {
    return res.status(422).json({ message: err.message, errors: err.errors });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: statusCode === 500 && !isDev ? 'Internal server error' : err.message,
    ...(isDev && { stack: err.stack }),
  });
};

module.exports = errorHandler;