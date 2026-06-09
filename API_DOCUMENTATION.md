# EcoTrack AI - API Documentation & Features Reference

## 📚 API Endpoints

### Authentication Endpoints

#### Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response: 200
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "firebaseId": "firebase_uid"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200
{
  "user": { ... }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer {idToken}

Response: 200
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar": "https://...",
  "bio": "Sustainability enthusiast",
  "city": "San Francisco",
  "country": "USA"
}
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {idToken}
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Eco warrior",
  "city": "New York",
  "avatar": "https://..."
}

Response: 200
{ updated user object }
```

---

### Carbon Footprint Endpoints

#### Calculate Emissions
```http
POST /api/footprint/calculate
Authorization: Bearer {idToken}
Content-Type: application/json

{
  "carUsage": 25,           // km/day
  "publicTransport": 10,    // km/day
  "trainUsage": 5,          // km/day
  "flights": 2,             // hours/month
  "electricity": 120,       // kWh/month
  "gas": 50,                // units/month
  "renewableUsage": 20,     // percentage
  "dietType": "mixed",      // vegetarian|vegan|mixed|highMeat
  "clothingPurchases": 2,   // items/month
  "electronicsPurchases": 1,// items/month
  "generalGoods": 100,      // $/month
  "recyclingRate": 75,      // percentage
  "weeklyWaste": 5          // kg/week
}

Response: 201
{
  "id": "uuid",
  "userId": "uuid",
  "totalDaily": 15.23,
  "totalMonthly": 456.9,
  "totalYearly": 5483.8,
  "breakdown": {
    "transportation": 2100,
    "energy": 1200,
    "food": 913.75,
    "shopping": 600,
    "waste": 260.05
  },
  "date": "2024-01-15T10:30:00Z"
}
```

#### Get History
```http
GET /api/footprint/history
Authorization: Bearer {idToken}

Response: 200
[
  { footprint objects... }
]
```

#### Get Monthly Data
```http
GET /api/footprint/monthly/2024/1
Authorization: Bearer {idToken}

Response: 200
{
  "month": 1,
  "year": 2024,
  "days": 31,
  "totalDaily": 14.5,
  "totalMonthly": 435,
  "data": [ array of daily footprints ]
}
```

#### Get Yearly Data
```http
GET /api/footprint/yearly/2024
Authorization: Bearer {idToken}

Response: 200
{
  "year": 2024,
  "months": 12,
  "totalMonthly": 450,
  "data": [ array of monthly totals ]
}
```

---

### Dashboard Endpoints

#### Get Overview
```http
GET /api/dashboard/overview
Authorization: Bearer {idToken}

Response: 200
{
  "carbonScore": 15.23,
  "monthlyTotal": 456.9,
  "yearlyTotal": 5483.8,
  "reduction": -5.2,        // percentage vs last month
  "level": 3,
  "xp": 2450,
  "breakdown": {
    "transportation": 2100,
    "energy": 1200,
    "food": 913.75,
    "shopping": 600,
    "waste": 260.05
  }
}
```

#### Get Breakdown
```http
GET /api/dashboard/breakdown
Authorization: Bearer {idToken}

Response: 200
{
  "transportEmission": 2100,
  "energyEmission": 1200,
  "foodEmission": 913.75,
  "shoppingEmission": 600,
  "wasteEmission": 260.05,
  "percentages": {
    "transportation": 42.1,
    "energy": 24.0,
    "food": 18.3,
    "shopping": 12.0,
    "waste": 5.2
  }
}
```

#### Get Recommendations
```http
GET /api/dashboard/recommendations
Authorization: Bearer {idToken}

Response: 200
[
  {
    "id": "1",
    "title": "Reduce Car Usage",
    "description": "Using public transport 2-3 days a week could reduce your emissions...",
    "estimatedSavings": 500,
    "difficulty": "medium",
    "category": "transportation"
  },
  ...
]
```

---

### Community Endpoints

#### Get Leaderboard
```http
GET /api/community/leaderboard?limit=50
Authorization: Bearer {idToken}

Response: 200
[
  {
    "id": "uuid",
    "user": {
      "name": "Alice",
      "avatar": "https://...",
      "city": "San Francisco"
    },
    "xpPoints": 5400,
    "level": 5,
    "reductionPercent": 25.5,
    "streakDays": 32,
    "globalRank": 1
  },
  ...
]
```

#### Get City Rankings
```http
GET /api/community/city-rankings/San%20Francisco
Authorization: Bearer {idToken}

Response: 200
[
  { ranked user objects for specific city }
]
```

#### Get Friends
```http
GET /api/community/friends
Authorization: Bearer {idToken}

Response: 200
[
  { friend user objects }
]
```

#### Follow User
```http
POST /api/community/follow/:userId
Authorization: Bearer {idToken}

Response: 201
{ "message": "Following user" }
```

---

### Achievements Endpoints

#### Get User Achievements
```http
GET /api/achievements/user
Authorization: Bearer {idToken}

Response: 200
[
  {
    "id": "uuid",
    "name": "First Steps",
    "description": "Log your first carbon footprint",
    "badge": "👣",
    "xpReward": 100,
    "category": "milestone",
    "unlockedAt": "2024-01-15T10:30:00Z"
  },
  ...
]
```

#### Get All Achievements
```http
GET /api/achievements/all

Response: 200
[
  { achievement definitions }
]
```

#### Claim Achievement
```http
POST /api/achievements/claim/:achievementId
Authorization: Bearer {idToken}

Response: 201
{ "message": "Achievement unlocked!", "xp": 100 }
```

---

### Carbon Offset Endpoints

#### Create Offset
```http
POST /api/offsets/create
Authorization: Bearer {idToken}
Content-Type: application/json

{
  "project": "tree_planting",
  "amountKgCO2": 500,
  "costUSD": 25,
  "provider": "verified_carbon_credits"
}

Response: 201
{
  "id": "uuid",
  "userId": "uuid",
  "project": "tree_planting",
  "amountKgCO2": 500,
  "costUSD": 25,
  "certificateUrl": "https://...",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Get My Offsets
```http
GET /api/offsets/my-offsets
Authorization: Bearer {idToken}

Response: 200
[
  { offset objects }
]
```

---

## 🎮 Features List

### Core Features ✅

#### 1. Authentication
- [x] Email/Password signup & login
- [x] Google OAuth integration
- [x] JWT token authentication
- [x] Profile management
- [x] Password reset

#### 2. Carbon Footprint Calculator
- [x] Transportation tracking (car, public transport, train, bike, flights)
- [x] Home energy tracking (electricity, gas, renewable usage)
- [x] Food habits (diet type selection)
- [x] Shopping habits (clothing, electronics, general goods)
- [x] Waste tracking (recycling rate, weekly waste)
- [x] Real-time calculation
- [x] Historical data storage
- [x] Monthly/yearly aggregations

#### 3. Dashboard & Visualization
- [x] Carbon score display
- [x] Category breakdown pie charts
- [x] Trend graphs
- [x] Progress tracking
- [x] Sustainability rating
- [x] Monthly progress overview
- [x] Responsive design

#### 4. AI Sustainability Coach
- [x] Habit analysis
- [x] Highest emission detection
- [x] Personalized strategies
- [x] Daily eco-tips
- [x] Weekly goal recommendations
- [x] Smart suggestions based on patterns

#### 5. Gamification System
- [x] XP points (earned on activities)
- [x] Sustainability levels (Bronze→Diamond)
- [x] Achievements/Badges (25+)
- [x] Milestone tracking
- [x] Streak counter
- [x] Progress visualization
- [x] Level progression

#### 6. Community Features
- [x] Global leaderboard
- [x] City rankings
- [x] Friend comparisons
- [x] User profiles
- [x] Following system
- [x] Sustainability badges on profile

#### 7. Carbon Twin (AI Predictions)
- [x] 12-month emission forecasts
- [x] Prediction confidence scores
- [x] What-if scenario simulator
- [x] Lifestyle change simulations
- [x] Optimal reduction pathways
- [x] Impact visualization
- [x] Future projection analysis

#### 8. Challenges System
- [x] Pre-built challenges (No-Car Day, Energy Saver, etc.)
- [x] Weekly challenges
- [x] Progress tracking
- [x] Completion rewards
- [x] Challenge categories
- [x] Community participation

#### 9. Carbon Offset Marketplace
- [x] Tree planting projects
- [x] Renewable energy support
- [x] Offset purchase tracking
- [x] Certificate generation
- [x] Impact verification
- [x] Project verification

#### 10. Knowledge Hub
- [x] Educational articles
- [x] Sustainability guides
- [x] Climate education
- [x] Tips & tricks
- [x] Resource library
- [x] Search functionality

---

## 🔐 Security Features

- [x] Firebase authentication
- [x] JWT tokens
- [x] HTTPS only
- [x] CORS protection
- [x] Rate limiting
- [x] Input validation
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection
- [x] Secure password hashing
- [x] Environment variable secrets
- [x] Admin authentication

---

## 📊 Database Schema

### Core Tables

**users**
- id, email, name, avatar, bio, city, country, firebaseId
- Timestamps: createdAt, updatedAt

**carbon_footprints**
- id, userId, date
- Transportation: carUsage, bikeUsage, publicTransport, trainUsage, flights
- Energy: electricity, gas, renewableUsage
- Food: dietType
- Shopping: clothingPurchases, electronicsPurchases, generalGoods
- Waste: recyclingRate, weeklyWaste
- Calculations: totalDaily, totalMonthly, totalYearly, breakdown fields

**achievements**
- id, userId, name, description, badge, xpReward, category, unlockedAt

**community_scores**
- id, userId, xpPoints, level, monthlyRank, cityRank, globalRank
- reductionPercent, streakDays, friendsCount

**recommendations**
- id, userId, type, title, description, estimatedSavings
- difficulty, category, implemented, implementedAt

**challenges**
- id, name, description, category, duration, targetReduction, xpReward

**user_challenges**
- id, userId, challengeId, startDate, endDate, completed, progress

**carbon_offsets**
- id, userId, project, amountKgCO2, costUSD, provider, certificateUrl

---

## 🎯 Calculation Formulas

### Transportation Emissions (Daily)
```
Emissions = (carUsage × 0.21) + (publicTransport × 0.089) 
          + (train × 0.041) + (flights × 0.255)
```

### Energy Emissions (Monthly)
```
Emissions = (electricity × 0.85 + gas × 2.04) × (1 - renewableUsage%)
```

### Food Emissions (Daily)
```
Based on diet type:
- Vegan: 1.0 kg CO₂
- Vegetarian: 1.5 kg CO₂
- Mixed: 2.5 kg CO₂
- High Meat: 4.0 kg CO₂
```

### Shopping Emissions (Monthly)
```
Emissions = (clothing × 7) + (electronics × 50) + (goods × 0.1)
```

### Waste Emissions (Weekly)
```
Emissions = weeklyWaste × ((recyclingRate × 0.02) + ((100-recyclingRate) × 0.06))
```

### Total Annual Emissions
```
Yearly = (Daily + Energy/30 + Food + Shopping/30 + Waste/7) × 365
```

---

## 🚀 Performance Metrics

**Target Response Times:**
- Dashboard: < 200ms
- Calculator: < 500ms
- Leaderboard: < 300ms
- API endpoints: < 500ms

**Caching Strategy:**
- Leaderboard: 1 hour
- User profile: 15 minutes
- Dashboard data: 5 minutes
- Recommendations: 1 hour

---

## 🔄 Data Sync

Real-time updates using:
- WebSocket for leaderboards
- Server-sent events for notifications
- Optimistic updates on frontend
- Background sync for offline support

---

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: 320px, 640px, 1024px, 1280px
- Touch-friendly UI elements
- Optimized images
- Progressive enhancement

---

## ♿ Accessibility

- WCAG 2.1 Level AA compliance
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast ratios
- Screen reader support

---

This documentation covers the complete EcoTrack AI platform. For updates and examples, see the GitHub repository.
