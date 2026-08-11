import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import swaggerSpec from './config/swagger.js';
import { renderSwaggerHtml } from './config/swaggerUi.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import AppError from './utils/AppError.js';

const app = express();

app.use(cors({
  origin: env.clientUrl,
  credentials: true,
}));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get(['/api/docs', '/api/docs/'], (req, res) => {
  res.type('html').send(renderSwaggerHtml('/api/docs.json'));
});
app.get('/api/docs.json', (req, res) => {
  res.json(swaggerSpec);
});

app.use('/api', routes);

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

export default app;
