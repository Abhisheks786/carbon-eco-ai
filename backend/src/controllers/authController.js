const prisma = require('../services/db');
const admin = require('firebase-admin');

const isDev = process.env.NODE_ENV !== 'production';

const upsertUser = async ({ firebaseId, email, name }) => {
  const displayName = name || email.split('@')[0];

  return prisma.user.upsert({
    where: { firebaseId },
    update: { email, ...(name && { name }) },
    create: {
      email,
      name: displayName,
      firebaseId,
      settings: { create: {} },
      communityScore: { create: {} },
    },
  });
};

const signup = async (req, res) => {
  try {
    const { email, password, name, firebaseId, idToken } = req.body;

    if (idToken && admin.apps.length > 0) {
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const user = await upsertUser({
          firebaseId: decoded.uid,
          email: decoded.email || email,
          name: name || decoded.name,
        });
        return res.status(201).json({ user, firebaseId: decoded.uid });
      } catch (tokenError) {
        if (!isDev) throw tokenError;
        console.warn('Token verification failed in dev:', tokenError.message);
      }
    }

    if (firebaseId) {
      const user = await upsertUser({ firebaseId, email, name });
      return res.status(201).json({ user, firebaseId });
    }

    let uid;
    if (admin.apps.length > 0) {
      try {
        const userRecord = await admin.auth().createUser({
          email,
          password,
          displayName: name,
        });
        uid = userRecord.uid;
      } catch (firebaseError) {
        if (!isDev) throw firebaseError;
        console.warn('Firebase createUser failed, using dev mock ID:', firebaseError.message);
        uid = `dev-${email.replace(/[^a-z0-9]/gi, '-')}`;
      }
    } else {
      uid = `mock-${Date.now()}`;
    }

    const user = await upsertUser({ firebaseId: uid, email, name });
    res.status(201).json({ user, firebaseId: uid });
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, idToken } = req.body;

    if (idToken && admin.apps.length > 0) {
      try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        const user = await upsertUser({
          firebaseId: decoded.uid,
          email: decoded.email || email,
          name: decoded.name,
        });
        return res.json({ user, firebaseId: decoded.uid });
      } catch (tokenError) {
        if (!isDev) throw tokenError;
        console.warn('Token verification failed in dev, falling back to email lookup');
      }
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({
        error: 'No account found with this email. Please sign up first.',
        code: 'USER_NOT_FOUND',
      });
    }

    res.json({ user, firebaseId: user.firebaseId });
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed. Please try again.' });
  }
};

const sync = async (req, res) => {
  try {
    const { idToken, name } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'ID token is required.' });
    }

    if (admin.apps.length === 0) {
      return res.status(503).json({ error: 'Firebase is not configured on the server.' });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const user = await upsertUser({
      firebaseId: decoded.uid,
      email: decoded.email,
      name: name || decoded.name,
    });

    res.json({ user, firebaseId: decoded.uid });
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseId: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio, city, country, avatar } = req.body;

    const user = await prisma.user.update({
      where: { firebaseId: req.userId },
      data: {
        ...(name && { name }),
        ...(bio && { bio }),
        ...(city && { city }),
        ...(country && { country }),
        ...(avatar && { avatar }),
      },
    });

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  signup,
  login,
  sync,
  getProfile,
  updateProfile,
};
