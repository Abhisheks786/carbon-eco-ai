const prisma = require('../services/db');
const admin = require('firebase-admin');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  const hasFirebaseAccount = process.env.FIREBASE_SERVICE_ACCOUNT && admin.apps.length > 0;
  const useMockAuth = !hasFirebaseAccount || process.env.MOCK_AUTH === 'true';

  if (useMockAuth) {
    req.userId = 'mock-user-123';
    req.email = 'test@example.com';
  } else {
    try {
      if (!token) {
        return res.status(401).json({ error: 'Access token missing' });
      }
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.userId = decodedToken.uid;
      req.email = decodedToken.email;
    } catch (e) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  }
  
  // Ensure user exists in DB
  try {
    const user = await prisma.user.findUnique({ where: { firebaseId: req.userId } });
    if (!user) {
      await prisma.user.create({
        data: {
          email: req.email || 'user@example.com',
          name: req.email ? req.email.split('@')[0] : 'Test User',
          firebaseId: req.userId,
          settings: { create: {} },
          communityScore: { create: {} },
        }
      });
    }
  } catch (e) {
    console.error("Failed to ensure user in DB", e);
  }
  
  next();
};

module.exports = { authenticateToken };
