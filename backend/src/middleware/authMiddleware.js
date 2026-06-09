const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const admin = require('firebase-admin');

const authenticateToken = async (req, res, next) => {
  // In a real app we'd verify Firebase token:
  // const authHeader = req.headers['authorization'];
  // const token = authHeader && authHeader.split(' ')[1];
  // const decodedToken = await admin.auth().verifyIdToken(token);
  // req.userId = decodedToken.uid;
  
  // Mock authentication for development
  req.userId = 'mock-user-123';
  req.email = 'test@example.com';
  
  // Ensure mock user exists in DB
  try {
    const user = await prisma.user.findUnique({ where: { firebaseId: req.userId } });
    if (!user) {
      await prisma.user.create({
        data: {
          email: req.email,
          name: 'Test User',
          firebaseId: req.userId,
          settings: { create: {} },
          communityScore: { create: {} },
        }
      });
    }
  } catch (e) {
    console.error("Failed to ensure mock user", e);
  }
  
  next();
};

module.exports = { authenticateToken };
