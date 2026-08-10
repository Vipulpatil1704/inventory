import AppError from '../utils/AppError.js';

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
    req[source] = result.data;
    return next();
  };

export default validate;
