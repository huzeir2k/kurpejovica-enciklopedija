# Kurpejovica Enciklopedija

A **mobile-friendly Wikipedia-inspired** family encyclopedia platform with restricted editing capabilities. This is a full-stack application for documenting your family history with professional-grade security, beautiful UI, and multi-language support.

## 📋 Project Overview

**Kurpejovica Enciklopedija** is a Wikipedia-like encyclopedia dedicated to the Kurpejović family (and can be adapted for any family). Key features:

- 📱 **Mobile-First Design**: Wikipedia-inspired responsive UI that looks great on all devices
- 🎨 **Beautiful Interface**: Clean, minimal design with proper typography and spacing
- 🔐 **Restricted Access**: Only approved editors can modify content
- 🌍 **Multi-Language Support**: 9 languages (Serbo-Croatian, English, French, German, Swedish, Italian, Spanish, Albanian, Turkish)
- 👨‍👩‍👧‍👦 **Family Tree Management**: Complete family relationships and genealogy
- 📝 **Article Management**: Rich content for each family member
- 🔄 **Automatic Translation**: DeepL API integration for instant translations
- 📊 **Audit Logging**: Complete history of all changes
- 🔒 **Security**: JWT authentication, role-based access control, encrypted passwords

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- Vue.js 3 (Composition API)
- Vite (build tool)
- Vue Router (routing)
- Pinia (state management)
- Axios (HTTP client)

**Backend:**
- Node.js with Express
- PostgreSQL (database)
- JWT (authentication)
- Joi (validation)
- DeepL API (translation)
- Docker & Docker Compose

**Deployment:**
- DigitalOcean (recommended)
- Docker containerization
- Nginx reverse proxy
- SSL/TLS with Let's Encrypt

## 📁 Project Structure

```
kurpejovica-enciklopedija/
├── frontend/                      # Vue.js frontend application
│   ├── src/
│   │   ├── components/           # Reusable Vue components
│   │   ├── pages/                # Page components (Home, Login, etc.)
│   │   ├── services/             # API service layer
│   │   ├── stores/               # Pinia state management
│   │   ├── composables/          # Vue composition API helpers
│   │   ├── router/               # Vue Router configuration
│   │   ├── utils/                # Utility functions
│   │   ├── App.vue               # Root component
│   │   └── main.js               # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                       # Node.js/Express backend API
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── routes/               # API route definitions
│   │   ├── models/               # Database query functions
│   │   ├── middleware/           # Express middleware
│   │   ├── services/             # Business logic (translation, audit)
│   │   ├── validators/           # Request validation schemas
│   │   ├── utils/                # Utility functions (JWT, passwords)
│   │   ├── database/             # Database configuration and migrations
│   │   └── server.js             # Express app entry point
│   ├── Dockerfile                # Docker image definition
│   ├── package.json
│   ├── README.md                 # Backend documentation
│   └── API.md                    # API endpoint reference
│
├── docker-compose.yml            # Multi-container orchestration
├── deploy.sh                      # DigitalOcean deployment script
├── BACKEND_EXTENSION_GUIDE.md    # How to extend the backend
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Docker & Docker Compose (optional, for containerized setup)

### Local Development

#### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will run at `http://localhost:5173`

#### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and API keys

# Initialize database
npm run migrate

# Seed sample data (optional)
npm run seed

# Start development server
npm run dev
```
Backend will run at `http://localhost:3000`

#### 3. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **API Health Check**: http://localhost:3000/health

### Docker Compose Setup

For easy multi-container setup:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This starts:
- PostgreSQL database on port 5432
- Backend API on port 3000
- Frontend on port 5173

## 📚 Documentation

### Frontend
- **[Frontend README](./frontend/README.md)** - Frontend setup and architecture
- **[Frontend Development Guide](./frontend/docs/)** - Component development

### Backend
- **[Backend README](./backend/README.md)** - Backend setup and architecture
- **[API Documentation](./backend/API.md)** - Complete API endpoint reference
- **[Backend Extension Guide](./BACKEND_EXTENSION_GUIDE.md)** - How to add features safely

## 🔑 Key Features

### Authentication & Authorization
- JWT-based token authentication
- Role-based access control (viewer, editor, admin)
- Secure password hashing with bcryptjs
- Token expiration and refresh

### Multi-Language Support
- 9 language options
- Automatic translation via DeepL API
- Per-article language versioning
- Client-side language switching

### Family Tree Management
- Parent-child relationships
- Spouse relationships
- Sibling relationships
- Family tree visualization data
- Life dates and biographical info

### Article Management
- One article per family member
- Rich text content
- Version history with audit trail
- Automatic translations
- Editor tracking

### Security
- SQL injection prevention (parameterized queries)
- Input validation (Joi schemas)
- CORS configuration
- Audit logging of all changes
- Secure environment variables

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kurpejovica_db
DB_USER=postgres
DB_PASSWORD=secure_password

PORT=3000
NODE_ENV=development

JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d

DEEPL_API_KEY=your_deepl_api_key

CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000/api
```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with authentication
- **family_members** - Core family data
- **family_relationships** - Connections between members
- **articles** - Article content per member
- **article_translations** - Multi-language versions
- **audit_logs** - Change history

See [Backend README](./backend/README.md) for detailed schema documentation.

## 🛠️ Development Workflow

### Adding Features

1. **Backend Feature**:
   - Create controller in `src/controllers/`
   - Create/update model in `src/models/`
   - Add validation schema in `src/validators/`
   - Create routes in `src/routes/`
   - Register routes in `src/server.js`
   - See [Backend Extension Guide](./BACKEND_EXTENSION_GUIDE.md) for details

2. **Frontend Feature**:
   - Create Vue component in `src/components/`
   - Create page component in `src/pages/`
   - Create service in `src/services/` if API calls needed
   - Update routes in `src/router/`
   - Update stores in `src/stores/` if state needed

### Code Standards
- All functions must have JSDoc comments
- Use try-catch in async functions
- Parameterize all database queries
- Validate all input with Joi
- Log all data modifications
- Use environment variables for configuration

## 📈 API Endpoints

### Public Endpoints
- `GET /api/family-members` - List all members
- `GET /api/family-members/:id` - Get member details
- `GET /api/family-members/:id/tree` - Get family tree
- `GET /api/family-members/search?q=query` - Search members
- `GET /api/articles/:id?lang=en` - Get article

### Authenticated Endpoints
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Editor+ Endpoints
- `POST /api/family-members` - Create member
- `PUT /api/family-members/:id` - Update member
- `POST /api/articles` - Create article
- `PUT /api/articles/:id` - Update article
- `POST /api/articles/:id/translate` - Translate via DeepL

See [API Documentation](./backend/API.md) for complete reference.

## 🚢 Deployment

### DigitalOcean Deployment

1. **Automated Setup**:
```bash
chmod +x deploy.sh
./deploy.sh
```

2. **Manual Setup**:
   - Create Ubuntu 22.04 Droplet
   - Follow steps in [deploy.sh](./deploy.sh)
   - Configure domain with Nginx
   - Set up SSL with Let's Encrypt

### Environment Configuration
```bash
# Production .env
NODE_ENV=production
DB_PASSWORD=strong_password_here
JWT_SECRET=long_random_secret_key
DEEPL_API_KEY=your_deepl_key
CORS_ORIGIN=https://your-domain.com
```

### Monitoring
```bash
# View service status
systemctl status kurpejovica

# View logs
journalctl -u kurpejovica -f

# Restart service
systemctl restart kurpejovica
```

## 📝 User Roles

### Viewer
- View articles and family members
- Search functionality
- View family tree

### Editor
- Create/edit articles
- Create/edit family members
- Manage relationships
- Use automatic translation

### Admin
- All editor permissions
- Manage user accounts and roles
- View audit logs
- System administration

## 🔐 Security Notes

1. **Always change default passwords** before deploying
2. **Use strong JWT_SECRET** in production
3. **Enable HTTPS** with valid SSL certificate
4. **Restrict CORS_ORIGIN** to your domain
5. **Regular backups** of PostgreSQL database
6. **Monitor audit logs** for suspicious activity
7. **Update dependencies** regularly

## 🤝 Contributing

When contributing:
1. Follow code style guidelines
2. Add comprehensive comments
3. Validate all input
4. Test locally before committing
5. Update documentation
6. Create feature branches

## 📞 Support

### For Questions About:
- **Backend**: See [Backend README](./backend/README.md) and [Extension Guide](./BACKEND_EXTENSION_GUIDE.md)
- **Frontend**: See frontend documentation
- **API**: See [API.md](./backend/API.md)
- **Database**: See Backend README schema section

## 📄 License

MIT License - Feel free to use and modify for your family needs.

## 🎯 Future Enhancements

Potential features to add:
- Photo gallery per family member
- Timeline view of family events
- PDF export of articles
- Advanced search filters
- User profile management
- Email notifications
- Social sharing
- Mobile app (React Native)

---

**Created for the Kurpejović family. Adapt and use for any family!**
