# EcoTrack AI - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- GitHub account (for CI/CD)
- Vercel account (frontend hosting)
- Railway/Heroku/AWS account (backend hosting)
- PostgreSQL managed database (AWS RDS, Supabase, or similar)
- Firebase project configured
- Domain name

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Repository
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ecotrack-ai.git
git push -u origin main
```

### Step 2: Deploy to Vercel
```bash
npm i -g vercel
vercel login
vercel
```

**Or via Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Configure environment variables
5. Click "Deploy"

### Step 3: Configure Environment Variables in Vercel
In Vercel dashboard → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://api.ecotrack-ai.com
NEXT_PUBLIC_FIREBASE_API_KEY=...
(all other frontend env vars)
```

### Step 4: Configure Custom Domain
1. In Vercel dashboard → Settings → Domains
2. Add your domain
3. Update DNS records with provided values

---

## Backend Deployment (Railway)

### Step 1: Prepare Backend Repository
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git push -u origin main
```

### Step 2: Deploy to Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "GitHub Repo"
4. Select your backend repository
5. Add PostgreSQL database
6. Configure environment variables
7. Deploy

### Step 3: Configure Environment Variables in Railway
Add all variables from `.env.example`:
```
DATABASE_URL=postgresql://...
FIREBASE_SERVICE_ACCOUNT=...
JWT_SECRET=generate_a_random_string
(all other env vars)
```

### Step 4: Run Database Migrations
```bash
# In Railway terminal
npx prisma migrate deploy
```

---

## Database Setup (PostgreSQL)

### Option 1: AWS RDS
1. Go to AWS console → RDS
2. Create new database instance (PostgreSQL 14+)
3. Configure security groups
4. Get connection string
5. Update `DATABASE_URL` in backend

### Option 2: Supabase (Recommended - Easier)
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy PostgreSQL connection string
4. Update `DATABASE_URL`

### Initial Setup
```bash
# Install Prisma CLI
npm install -g @prisma/cli

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

---

## CI/CD Pipeline

### GitHub Actions for Testing
Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
```

---

## Monitoring & Logging

### Set Up Monitoring
```bash
# Install monitoring packages
npm install winston pino-pretty

# Create logging middleware in Express
const logger = require('winston');

app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    timestamp: new Date(),
  });
  next();
});
```

### Error Tracking with Sentry
```bash
npm install @sentry/node

import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

app.use(Sentry.Handlers.errorHandler());
```

---

## Security Checklist

- [ ] Enable HTTPS
- [ ] Set strong JWT secret
- [ ] Enable CORS only for your domain
- [ ] Add rate limiting
- [ ] Enable database backups
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Enable query logging
- [ ] Add authentication headers
- [ ] Use environment variables for secrets

```javascript
// Security headers middleware
const helmet = require('helmet');
const app = require('express')();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
}));
```

---

## Scaling Considerations

### Horizontal Scaling
```bash
# Use load balancer (nginx)
# Deploy multiple backend instances
# Use stateless API design
```

### Database Optimization
```sql
-- Create indexes
CREATE INDEX idx_user_id ON carbon_footprint(user_id);
CREATE INDEX idx_date ON carbon_footprint(date);

-- Enable query caching
-- Set up read replicas for heavy queries
```

### Caching Strategy
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL,
});

// Cache API responses
app.get('/api/leaderboard', async (req, res) => {
  const cached = await client.get('leaderboard');
  if (cached) return res.json(JSON.parse(cached));
  
  const data = await fetchLeaderboard();
  await client.setex('leaderboard', 3600, JSON.stringify(data));
  res.json(data);
});
```

---

## Backup Strategy

### Database Backups
```bash
# AWS RDS automated backups
# Set retention period: 30 days

# Manual backup
pg_dump -U username -h host database_name > backup.sql

# Restore
psql -U username -h host database_name < backup.sql
```

### Infrastructure as Code
```bash
# Use Terraform for infrastructure
# Store infrastructure configs in Git
# Use infrastructure as code principles
```

---

## Monitoring Checklist

- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure error alerts (Sentry)
- [ ] Set up performance monitoring (NewRelic)
- [ ] Configure log aggregation (ELK, CloudWatch)
- [ ] Set up SSL certificate monitoring
- [ ] Configure database query monitoring
- [ ] Set up API rate limit monitoring
- [ ] Configure backup verification

---

## Domain & SSL

### SSL Certificate (Let's Encrypt)
```bash
# Vercel/Railway handle SSL automatically
# For custom setups, use Certbot:
sudo certbot certonly --standalone -d yourdomain.com
```

### DNS Configuration
```
# A Record
@ → Your server IP

# CNAME Records
www → yourdomain.com
api → your-api-server-ip

# MX Records (for email)
mx.yourdomain.com

# TXT Records (SPF, DKIM)
```

---

## Post-Deployment

### Smoke Tests
```bash
# Test critical endpoints
curl https://api.ecotrack-ai.com/health
curl https://ecotrack-ai.com/
```

### Performance Testing
```bash
# Use Apache Bench or Artillery
npm install -g artillery

artillery quick --count 100 --num 10 https://api.ecotrack-ai.com/health
```

### Analytics Setup
```javascript
// Google Analytics
<Script
  strategy="lazyOnload"
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
/>

window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', process.env.NEXT_PUBLIC_GA_ID);
```

---

## Troubleshooting

### Common Issues

**502 Bad Gateway**
- Check backend service status
- Verify database connection
- Check API logs for errors

**Database Connection Error**
- Verify DATABASE_URL format
- Check security group rules
- Test connection: `psql $DATABASE_URL`

**CORS Errors**
- Verify CORS_ORIGIN environment variable
- Check frontend domain in CORS whitelist
- Clear browser cache

**Firebase Auth Issues**
- Verify FIREBASE_SERVICE_ACCOUNT JSON
- Check Firebase project ID
- Enable Authentication in Firebase console

---

## Cost Optimization

### Recommendations
- Use serverless databases (Supabase, Firebase)
- Enable caching to reduce requests
- Optimize image sizes with Cloudinary
- Use CDN for static assets (Vercel, CloudFlare)
- Monitor database query performance
- Set up budget alerts

---

## Support & Maintenance

- Monitor error logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Conduct security audits quarterly
- Review and optimize database queries

---

**For questions or issues during deployment, refer to the official documentation:**
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Firebase Docs](https://firebase.google.com/docs)
- [Prisma Docs](https://www.prisma.io/docs/)
