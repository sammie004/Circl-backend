const swaggerJSDoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Circl API",
    version: "1.0.0",
    description: "API documentation for Circl backend",
  },
  servers: [
    { url: "http://localhost:3000", description: "Local server" },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ BearerAuth: [] }], // makes JWT global by default
};

const options = {
  swaggerDefinition,
  apis: [
    "./route-main/**/*.js",
    "./controllers/**/*.js"
  ],
};


module.exports = swaggerJSDoc(options);
