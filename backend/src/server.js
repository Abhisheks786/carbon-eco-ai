require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Express App
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin Setup
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } catch (e) {
    console.warn("Firebase config invalid, running in mock mode");
  }
} else {
  console.warn("No FIREBASE_SERVICE_ACCOUNT provided, running in mock mode");
}

// Routes
const authRoutes = require('./routes/authRoutes');
const footprintRoutes = require('./routes/footprintRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const communityRoutes = require('./routes/communityRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/footprint', footprintRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/community', communityRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`EcoTrack AI Backend (Refactored) running on port ${PORT}`);
});

module.exports = app;
