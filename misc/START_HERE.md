# 🎬 START HERE - Your Complete Project Guide

Welcome to **Kurpejovica Enciklopedija**! This document will guide you through your complete, professional, production-ready family encyclopedia system.

---

## 📚 Documentation Quick Links

### 🚀 Getting Started (Read These First)
1. **[README.md](./README.md)** - Main project overview and features
2. **[SETUP_SUMMARY.md](./SETUP_SUMMARY.md)** - Step-by-step setup instructions
3. **[BACKEND_COMPLETE.md](./BACKEND_COMPLETE.md)** - Backend implementation summary

### 📖 Detailed Documentation
4. **[backend/README.md](./backend/README.md)** - Backend setup and architecture
5. **[backend/API.md](./backend/API.md)** - Complete API endpoint reference
6. **[BACKEND_EXTENSION_GUIDE.md](./BACKEND_EXTENSION_GUIDE.md)** - How to add new features
7. **[FILE_MANIFEST.md](./FILE_MANIFEST.md)** - Complete file listing

### 🎯 Quick Start
- **[quickstart.sh](./quickstart.sh)** - Automated setup script (run this!)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Run Setup Script
```bash
chmod +x quickstart.sh
./quickstart.sh
```

The script will:
- ✅ Check Node.js and PostgreSQL
- ✅ Install frontend dependencies
- ✅ Install backend dependencies
- ✅ Create database and tables
- ✅ Seed sample data
- ✅ Show you test credentials

### Step 2: Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```

You'll see:
```
╔════════════════════════════════════════════════════════════╗
║   Kurpejovica Enciklopedija Backend Server                ║
║   Server running on port: 3000                            ║
╚════════════════════════════════════════════════════════════╝
```

### Step 3: Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

You'll see something like:
```
  ➜  Local:   http://localhost:5173/
```

### Step 4: Visit Application
Open browser to: **http://localhost:5173**

### Step 5: Login
```
Email: admin@family.local
Password: admin123
```

🎉 **You're in!** The application is now running locally.

---

## 📁 Project Overview

```
Your Project
├── Frontend (Vue.js)          → http://localhost:5173
├── Backend (Express.js)       → http://localhost:3000
├── Database (PostgreSQL)      → localhost:5432
└── Documentation              → This folder
```

### What Each Part Does

**Frontend (Vue.js)**
- Beautiful user interface
- Multi-language support
- User authentication
- Family member browsing
- Article creation/editing

**Backend (Express.js)**
- REST API server
- User management
- Article management
- Family tree logic
- Multi-language translation

**Database (PostgreSQL)**
- Stores user accounts
- Stores family members
- Stores articles
- Tracks all changes
- Manages relationships

---

## 🎯 Common Tasks

### View All Family Members
1. Frontend home page shows latest members
2. Click "View All Members" to see full list
3. Click member name to see details and family tree

### Create a New Family Member (as Editor/Admin)
1. Login (admin account included)
2. Click member name to edit
3. Fill in details (name, birth year, etc.)
4. Save

### Write Article About Member
1. Navigate to member
2. Click "Edit"
3. Enter article content
4. Save

### Translate Article to Another Language
1. Go to article
2. Click "Translate"
3. Select target language
4. System auto-translates via DeepL
5. Article available in new language

### Switch Language
1. Click language dropdown (top right)
2. Select language (9 options)
3. All content updates to new language

### View Who Changed What
1. Login as admin
2. Go to Admin Panel
3. View audit logs of all changes

---

## 🔑 Key Information

### User Roles
- **Viewer**: Can read articles and family tree (default)
- **Editor**: Can create/edit articles and family members
- **Admin**: Can do everything + manage users

### Test Account
```
Email: admin@family.local
Password: admin123
Role: admin (can do everything)
```

⚠️ **In production, change these credentials!**

### Supported Languages
1. Serbo-Croatian (default)
2. English
3. French
4. German
5. Swedish
6. Italian
7. Spanish
8. Albanian
9. Turkish

### API Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

---

## 🚀 Understanding the Architecture

### Frontend → Backend Communication

```
Vue Component (frontend/src/pages/*)
    ↓
Service Layer (frontend/src/services/api.js)
    ↓ (HTTP Request with JWT Token)
Express Server (backend/src/server.js)
    ↓
Router (backend/src/routes/*)
    ↓
Controller (backend/src/controllers/*)
    ↓
Model (backend/src/models/*)
    ↓
PostgreSQL Database
    ↓ (Response)
Frontend Updates (Pinia Store)
    ↓
Vue Component Re-renders
```

### API Endpoints

**Get Family Members:**
```
GET /api/family-members
```

**Create Article:**
```
POST /api/articles
Body: { family_member_id, language, content }
```

**Translate Article:**
```
POST /api/articles/:id/translate
Body: { targetLanguage }
```

See `backend/API.md` for all 17 endpoints.

---

## 🛠️ Extending the Project

### Add a New Page/Feature

**Step 1: Create Frontend Component**
```bash
# Create page component
touch frontend/src/pages/MyNewPage.vue
```

**Step 2: Add Route**
Edit `frontend/src/router/index.js` and add:
```javascript
{
  path: '/my-path',
  name: 'MyNewPage',
  component: () => import('@/pages/MyNewPage.vue'),
}
```

**Step 3: Create Service (if needed)**
```bash
touch frontend/src/services/myService.js
```

### Add a New Backend Endpoint

**Step 1: Create Controller**
```bash
touch backend/src/controllers/myController.js
```

**Step 2: Create Model**
```bash
touch backend/src/models/MyModel.js
```

**Step 3: Create Routes**
```bash
touch backend/src/routes/myRoutes.js
```

**Step 4: Register in server.js**
```javascript
import myRoutes from './routes/myRoutes.js'
app.use('/api/my-path', myRoutes)
```

See `BACKEND_EXTENSION_GUIDE.md` for detailed instructions!

---

## 🐛 Troubleshooting

### "Cannot connect to PostgreSQL"
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify credentials in `backend/.env`
- Create database: `createdb kurpejovica_db`

### "Backend won't start"
- Check port 3000 is available: `lsof -i :3000`
- Kill process if needed: `kill -9 <PID>`
- Check `.env` file exists
- Run: `npm install` in backend directory

### "Frontend won't start"
- Check port 5173 is available: `lsof -i :5173`
- Delete `frontend/node_modules` and reinstall: `npm install`
- Check Node.js version: `node --version` (need 18+)

### "Can't login"
- Verify test account exists: Run `npm run seed` in backend
- Check `.env` has correct database config
- Check backend is running: Visit `http://localhost:3000/health`

### "DeepL translation not working"
- Set `DEEPL_API_KEY` in `backend/.env`
- Get key from: https://www.deepl.com/pro
- Use free tier for development

---

## 📖 Full Documentation

### For Different Roles

**If you're a User:**
- Read: `README.md` - Overview
- Read: `SETUP_SUMMARY.md` - Getting started
- Just run: `./quickstart.sh`

**If you're a Developer:**
- Read: `BACKEND_EXTENSION_GUIDE.md` - Adding features
- Read: `backend/README.md` - API details
- Review: `FILE_MANIFEST.md` - Code organization
- Study: Code in `backend/src/`

**If you're Deploying:**
- Read: `deploy.sh` - Deployment script
- Or use: `docker-compose.yml` - Docker setup
- Read: `README.md` - Deployment section

**If you want to Understand Everything:**
- Start: `README.md`
- Then: `SETUP_SUMMARY.md`
- Then: `BACKEND_EXTENSION_GUIDE.md`
- Then: `FILE_MANIFEST.md`
- Then: Read source code

---

## 🚢 Deployment

### Local Docker Setup
```bash
docker-compose up -d
```

Starts everything (database, backend, frontend) in containers.

### DigitalOcean Deployment
```bash
chmod +x deploy.sh
./deploy.sh
```

Run on a fresh Ubuntu 22.04 droplet. Fully automated!

### Manual Deployment
See detailed instructions in `README.md` deployment section.

---

## 📊 Project Contents

**50+ Files Created**
- 25+ Backend files (controllers, models, routes, etc.)
- 15+ Frontend files (pages, components, services, etc.)
- 6+ Documentation files
- 4+ DevOps files (Docker, deployment scripts)

**17 API Endpoints**
- 3 authentication endpoints
- 4 public family member endpoints
- 3 editor family member endpoints
- 4 public article endpoints
- 3 editor article endpoints

**6 Database Tables**
- Users (authentication)
- Family Members (core data)
- Family Relationships (genealogy)
- Articles (content)
- Article Translations (multi-language)
- Audit Logs (change history)

**9 Languages Supported**
- Serbo-Croatian, English, French, German
- Swedish, Italian, Spanish, Albanian, Turkish

---

## 🔐 Security Built-In

✅ Secure password hashing (bcryptjs)
✅ JWT authentication with expiration
✅ Role-based access control
✅ SQL injection prevention
✅ Input validation (Joi schemas)
✅ CORS configuration
✅ Audit logging of all changes
✅ Error handling without exposing internals

---

## 📞 Getting Help

### Documentation by Topic

| Topic | File |
|-------|------|
| Overview | README.md |
| Setup | SETUP_SUMMARY.md |
| Backend | backend/README.md |
| API | backend/API.md |
| Development | BACKEND_EXTENSION_GUIDE.md |
| Files | FILE_MANIFEST.md |
| Completion | BACKEND_COMPLETE.md |
| This Guide | START_HERE.md |

### Code Examples

| Want to learn | See file |
|--------------|----------|
| Authentication | backend/src/controllers/authController.js |
| API calls | frontend/src/services/*.js |
| Database queries | backend/src/models/*.js |
| Vue components | frontend/src/pages/*.vue |
| Routing | frontend/src/router/index.js |
| State management | frontend/src/stores/*.js |

---

## ✨ What's Included

### Professional Code
- Well-structured architecture
- Comprehensive comments
- Error handling
- Security best practices
- Database optimization

### Complete Documentation
- Setup guides
- API reference
- Development guide
- Deployment instructions
- Code examples

### Ready to Deploy
- Docker configuration
- DigitalOcean script
- Nginx setup
- SSL certificate support
- Environment configuration

### Fully Functional
- Authentication system
- Multi-language support
- Family tree management
- Article management
- Audit logging

---

## 🎓 Learning Path

**Beginner (Just want to run it):**
1. Run `quickstart.sh`
2. Start servers
3. Login and explore

**Intermediate (Want to understand):**
1. Read `README.md`
2. Read `SETUP_SUMMARY.md`
3. Review code in `backend/src/`
4. Try modifying components

**Advanced (Want to extend):**
1. Read `BACKEND_EXTENSION_GUIDE.md`
2. Create new feature following guide
3. Test locally
4. Deploy to DigitalOcean

---

## 🎯 Your Next Steps

### Right Now
1. Open terminal
2. Run `./quickstart.sh`
3. Follow the prompts
4. Wait for setup to complete

### Then
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Visit `http://localhost:5173`
4. Login with `admin@family.local / admin123`

### After That
1. Explore the application
2. Create family members
3. Write articles
4. Try translations
5. Review the code

---

## 🏆 You Have Everything!

✅ Professional frontend (Vue.js)
✅ Professional backend (Express.js)
✅ Secure database (PostgreSQL)
✅ Multi-language support
✅ Authentication & authorization
✅ Comprehensive documentation
✅ Deployment-ready setup
✅ Extension guide

**No more work needed to get started.**

---

## 📞 Support Resources

**Technical Questions:**
- Backend: See `backend/README.md`
- API: See `backend/API.md`
- Frontend: Check `frontend/src/`

**Code Questions:**
- See `BACKEND_EXTENSION_GUIDE.md`
- Review similar code in project
- Check JSDoc comments in functions

**Deployment Questions:**
- See `deploy.sh` comments
- See `docker-compose.yml`
- Read deployment section in `README.md`

---

## 🎉 Ready to Go!

Everything is built. Everything is documented. Everything is ready.

**Start with:**
```bash
./quickstart.sh
```

Then visit: **http://localhost:5173**

Enjoy your family encyclopedia! 🎊

---

**Questions? Check the documentation files listed at the top of this document.**

**Good luck! 🚀**
