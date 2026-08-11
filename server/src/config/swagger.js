import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJsdoc from 'swagger-jsdoc';
import env from './env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const routeGlob = path.join(__dirname, '../routes/*.js').replace(/\\/g, '/');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Inventory Management System API',
      version: '1.0.0',
      description:
        'REST API for the MERN Inventory Management System with JWT authentication and RBAC.',
    },
    servers: [
      {
        url: '/api',
        description: 'Current host',
      },
      {
        url: `http://localhost:${env.port}/api`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [routeGlob],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
