# EcoTrack AI - Quick Start Guide

Get EcoTrack AI running locally in 15 minutes!

## 📋 Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- PostgreSQL 14+ ([Download](https://www.postgresql.org/))
- Git
- Firebase account ([firebase.google.com](https://firebase.google.com))
- OpenAI API key (optional, for AI features)

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ecotrack-ai.git
cd ecotrack-ai
```

### 2. Setup Database

#### Option A: Local PostgreSQL
```bash
# Create database
createdb ecotrack_db

# Get connection string
export DATABASE_URL="postgresql://username:password@localhost:5432/ecotrack_db"
```

#### Option B: Docker (Easiest)
```bash
docker run --name ecotrack-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ecotrack_db -p 5432:5432 -d postgres:14

export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ecotrack_db"
```

### 3. Setup Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Authentication (Email/Password + Google)
4. Get your config from Project Settings
5. Create Service Account key (JSON file)

### 4. Frontend Setup

```bash
cd frontend

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Firebase config
# NEXT_PUBLIC_FIREBASE_API_KEY=...
# etc.

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend running at:** http://localhost:3000

### 5. Backend Setup

```bash
cd ../backend

# Copy environment template
cp .env.example .env

# Edit .env with your config
# DATABASE_URL=...
# FIREBASE_SERVICE_ACCOUNT=...
# etc.

# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed

# Start backend
npm run dev
```

**Backend running at:** http://localhost:5000

### 6. Verify Setup

```bash
# Test endpoints
curl http://localhost:5000/api/health

# Check frontend loads
open http://localhost:3000
```

## 📚 Project Structure

```
ecotrack-ai/
├── frontend/                 # Next.js React app
│   ├── app/                 # Pages & routes
│   ├── components/          # Reusable React components
│   ├── lib/                 # Utilities & API client
│   └── styles/              # Global CSS
│
├── backend/                 # Express Node.js API
│   ├── routes/              # API endpoints
│   ├── models/              # Database models
│   ├── middleware/          # Express middleware
│   └── services/            # Business logic
│
└── docs/                    # Documentation
```

## 🔑 Key Features to Explore

### 1. Carbon Calculator
- Visit http://localhost:3000/calculator
- Input your daily habits
- See real-time emissions calculation

### 2. Dashboard
- Navigate to http://localhost:3000/dashboard
- View carbon footprint breakdown
- See AI recommendations

### 3. Community
- Go to http://localhost:3000/community
- Check leaderboards
- Join challenges

### 4. Carbon Twin
- Visit http://localhost:3000/carbon-twin
- Explore scenario simulations
- Get 12-month predictions

## 📝 Common Commands

### Frontend
```bash
cd frontend

npm run dev          # Start dev server
npm run build        # Build for production
npm test            # Run tests
npm run lint        # Check code style
```

### Backend
```bash
cd backend

npm run dev          # Start with hot reload
npm run build        # Build for production
npm test            # Run tests

# Database
npx prisma studio  # Open Prisma Studio (GUI for database)
npx prisma migrate dev      # Create new migration
npx prisma generate         # Regenerate Prisma client
```

## 🔐 Setting Up Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000

NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/ecotrack_db

FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

JWT_SECRET=your_random_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing the APIs

### Test Authentication
```bash
# Signup (via Firebase UI or API)
# Login (via Firebase UI or API)

# Get your ID token from browser console:
# firebase.auth().currentUser.getIdToken()
```

### Test Calculator Endpoint
```bash
TOKEN="your_id_token_here"

curl -X POST http://localhost:5000/api/footprint/calculate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "carUsage": 25,
    "publicTransport": 10,
    "electricity": 100,
    "dietType": "mixed",
    "weeklyWaste": 5
  }'
```

### Test Dashboard Endpoint
```bash
curl -X GET http://localhost:5000/api/dashboard/overview \
  -H "Authorization: Bearer $TOKEN"
```

## 🛠️ Troubleshooting

### "Cannot connect to database"
- Check PostgreSQL is running
- Verify DATABASE_URL is correct
- Check database exists: `psql -l`

### "Firebase configuration error"
- Verify Firebase config in .env
- Check FIREBASE_SERVICE_ACCOUNT is valid JSON
- Ensure Firebase project exists

### "Port 3000/5000 already in use"
```bash
# Kill process on port
lsof -ti :3000 | xargs kill -9
lsof -ti :5000 | xargs kill -9

# Or use different ports
# Frontend: npm run dev -- -p 3001
# Backend: PORT=5001 npm run dev
```

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma
npx prisma generate
```

## 📊 Database Admin

### Open Prisma Studio (Visual Database Admin)
```bash
cd backend
npx prisma studio

# Opens at http://localhost:5555
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
```

## 🚀 Next Steps

1. **Explore the codebase**
   - Frontend: `/frontend/app/dashboard/page.tsx`
   - Backend: `/backend/routes/calculator.js`

2. **Add features**
   - Create new routes in `/backend/routes`
   - Add new pages in `/frontend/app`
   - Update database schema in `schema.prisma`

3. **Customize**
   - Update emission factors in `backend/utils/emissionCalculator.js`
   - Modify colors in `tailwind.config.ts`
   - Update recommendations logic in `backend/utils/helpers.js`

4. **Deploy**
   - See `DEPLOYMENT.md` for production setup
   - Follow Vercel & Railway guides

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [Prisma ORM Docs](https://www.prisma.io/docs/)
- [Firebase Console](https://console.firebase.google.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org/)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

## ✨ Key Commands Summary

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend (in new terminal)
cd backend && npm install && npx prisma migrate dev && npm run dev

# Database Management
npx prisma studio

# Logs
tail -f logs/app.log

# Testing
npm test
npm run test:watch
```

## 🎯 Quick Feature Checklist

- [ ] Authentication working (sign up/login)
- [ ] Calculator calculates emissions correctly
- [ ] Dashboard shows data with charts
- [ ] Community leaderboard displays
- [ ] Carbon Twin shows predictions
- [ ] Gamification system tracks XP
- [ ] Recommendations generate based on patterns

## 📞 Support

- Check GitHub Issues
- Review documentation in `/docs`
- Check server logs: `tail -f logs/app.log`
- Open browser console for frontend errors

---

**Happy coding! 🌱**

If you encounter issues, check the troubleshooting section or open an issue on GitHub.
