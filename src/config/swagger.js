const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Community Grocery API',
      version: '1.0.0',
      description: 'API for community-based grocery shopping',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
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
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./src/routes/*.js'], // Path to the API routes
};

const specs = swaggerJsdoc(options);

module.exports = specs; 