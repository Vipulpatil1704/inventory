import AppError from '../utils/AppError.js';

const setRequestSource = (req, source, value) => {
  // Express 5 exposes req.query as a getter-only property
  if (source === 'query') {
    Object.defineProperty(req, 'query', {
      value,
      writable: true,
      configurable: true,
      enumerable: true,
    });
    return;
  }

  req[source] = value;
};

const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new AppError('Validation failed', 422, errors));
    }
    setRequestSource(req, source, result.data);
    return next();
  };

export default validate;
