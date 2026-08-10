import swaggerJsdoc from 'swagger-jsdoc';
import env from './env.js';

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
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
