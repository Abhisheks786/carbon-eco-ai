const { z } = require('zod');

const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6).optional(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    firebaseId: z.string().optional(),
    idToken: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required').optional(),
    idToken: z.string().optional(),
  }),
});

const syncSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, 'ID token is required'),
    name: z.string().min(2).optional(),
  }),
});

const profileUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    bio: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    avatar: z.string().url().optional(),
  }),
});

const footprintCalculateSchema = z.object({
  body: z.object({
    carUsage: z.number().min(0).default(0),
    publicTransport: z.number().min(0).default(0),
    trainUsage: z.number().min(0).default(0),
    flights: z.number().min(0).default(0),
    electricity: z.number().min(0).default(0),
    gas: z.number().min(0).default(0),
    renewableUsage: z.number().min(0).max(100).default(0),
    dietType: z.string().default('omnivore'),
    clothingPurchases: z.number().min(0).default(0),
    electronicsPurchases: z.number().min(0).default(0),
    generalGoods: z.number().min(0).default(0),
    recyclingRate: z.number().min(0).max(100).default(0),
    weeklyWaste: z.number().min(0).default(0),
  }),
});

module.exports = {
  signupSchema,
  loginSchema,
  syncSchema,
  profileUpdateSchema,
  footprintCalculateSchema,
};
