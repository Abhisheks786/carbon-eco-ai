const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.userId = decodedToken.uid;
    req.email = decodedToken.email;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  await authenticateToken(req, res, () => {
    // Check if user is admin
    const adminIds = (process.env.ADMIN_IDS || '').split(',');
    if (!adminIds.includes(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};

module.exports = { authenticateToken, authenticateAdmin };
