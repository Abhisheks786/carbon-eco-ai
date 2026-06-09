const prisma = require('../services/db');
const admin = require('firebase-admin');

const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    let firebaseId;
    if (admin.apps.length > 0) {
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: name,
      });
      firebaseId = userRecord.uid;
    } else {
      firebaseId = `mock-${Date.now()}`;
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        firebaseId,
        settings: { create: {} },
        communityScore: { create: {} },
      },
    });

    res.json({ user, firebaseId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
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
  getProfile,
  updateProfile,
};
