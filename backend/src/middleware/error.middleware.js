const errorHandler = (err, req, res, next) => {
  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'A record with this value already exists' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ message: 'Record not found' });
  }

  const statusMap = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
  };

  const status = err.status || err.statusCode || 500;
  const message = statusMap[status] ? err.message || statusMap[status] : 'Internal server error';

  return res.status(status).json({ message });
};

module.exports = { errorHandler };
