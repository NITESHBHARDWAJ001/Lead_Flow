import swaggerJsdoc from 'swagger-jsdoc';
import { env } from '../config/env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LeadFlow CRM API',
      version: '1.0.0',
      description: 'Production-ready Lead Management CRM REST API',
      contact: {
        name: 'LeadFlow CRM',
        email: 'support@leadflow.com',
      },
    },
    servers: [
      {
        url: env.SWAGGER_SERVER_URL,
        description: 'API server',
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
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'Leads', description: 'Lead management' },
      { name: 'Dashboard', description: 'Analytics and dashboard' },
    ],
  },
  apis:
    env.NODE_ENV === 'production'
      ? ['./dist/modules/**/*.routes.js']
      : ['./src/modules/**/*.routes.ts', './src/modules/**/*.routes.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
