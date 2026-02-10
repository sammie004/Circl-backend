// dependencies
const express = require('express');
const cors = require('cors');
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
const userAuthRoutes = require('./user-routes/user-auth');
const profileRoutes = require('./user-routes/profile');
const IntentRoutes = require('./intent-routes/intent-route');
const networkingRoutes = require('./networking-routes/net');

// route usage
app.use('/api/auth', userAuthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/intent', IntentRoutes);
app.use('/api/networking', networkingRoutes);


// server listening
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
