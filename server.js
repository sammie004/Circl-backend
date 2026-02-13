// dependencies
const express = require('express');
const cors = require('cors');
const app = express();const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger-config/swagger"); // adjust path if needed


// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// routes
const userAuthRoutes = require('./route-main/user-routes/user-auth');
const profileRoutes = require('./route-main/user-routes/profile');
const IntentRoutes = require('./route-main/intent-routes/intent-route');
const networkingRoutes = require('./route-main/networking-routes/net');
const filterRoute = require('./route-main/filter-route/filter-route');

// route usage
app.use('/api/auth', userAuthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/intent', IntentRoutes);
app.use('/api/networking', networkingRoutes);
app.use('/api/search', filterRoute);


// server listening
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
