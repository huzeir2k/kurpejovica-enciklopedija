# Kurpejovica Enciklopedija - Backend

Family encyclopedia REST API server built with Node.js, Express, and PostgreSQL.

## Project Structure

```
backend/
├── src/
│   ├── controllers/         # Request handlers (authController, familyController, articleController)
│   ├── database/           # Database configuration and migrations
│   ├── middleware/         # Express middleware (auth, error handling)
│   ├── models/            # Database query functions (User, FamilyMember, Article)
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic (translation, audit)
│   ├── utils/             # Utility functions (JWT, password hashing)
│   ├── validators/        # Request validation schemas (Joi)
│   └── server.js          # Express app entry point
├── .env                   # Environment variables (create from .env.example)
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 12+

### Setup Steps

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Configure database:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. **Initialize database schema:**
```bash
npm run migrate
```

4. **Seed sample data (optional):**
```bash
npm run seed
```

5. **Start the server:**
```bash
npm run dev  # Development mode with nodemon
npm start    # Production mode
```

The server will start on the port specified in `.env` (default: 3000).

## API Documentation

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "editor"
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "editor"
}
```

### Family Member Endpoints

#### List All Family Members
```
GET /api/family-members
Query params: ?name=John&birth_year=1950

Response (200):
{
  "count": 5,
  "members": [...]
}
```

#### Search Family Members
```
GET /api/family-members/search?q=Marko

Response (200):
{
  "count": 2,
  "members": [...]
}
```

#### Get Family Member
```
GET /api/family-members/:id

Response (200):
{
  "id": 1,
  "name": "Marko Kurpejović",
  "birth_year": 1920,
  "death_year": 1995,
  "occupation": "Farmer",
  "relationships": [...]
}
```

#### Get Family Tree
```
GET /api/family-members/:id/tree

Response (200):
{
  "member_id": 1,
  "member_name": "Marko Kurpejović",
  "parents": [],
  "spouse": null,
  "children": [...],
  "siblings": []
}
```

#### Create Family Member (Editor+)
```
POST /api/family-members
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jovan Kurpejović",
  "birth_year": 1950,
  "birth_place": "Kurpejovac",
  "occupation": "Teacher",
  "short_bio": "A respected educator in the family"
}

Response (201):
{ member object }
```

### Article Endpoints

#### Get Article
```
GET /api/articles/:id?lang=en

Response (200):
{
  "id": 1,
  "family_member_id": 1,
  "language": "en",
  "content": "<p>Article content...</p>",
  "created_at": "2025-01-15T10:30:00Z"
}
```

#### List Supported Languages
```
GET /api/articles/languages

Response (200):
{
  "languages": [
    { "code": "sr", "name": "Serbo-Croatian", "nativeName": "Srpski/Hrvatski" },
    { "code": "en", "name": "English", "nativeName": "English" },
    ...
  ]
}
```

#### Create Article (Editor+)
```
POST /api/articles
Authorization: Bearer <token>
Content-Type: application/json

{
  "family_member_id": 1,
  "language": "sr",
  "content": "<p>Article content in Serbo-Croatian...</p>"
}

Response (201):
{ article object }
```

#### Update Article (Editor+)
```
PUT /api/articles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "<p>Updated content...</p>"
}

Response (200):
{ updated article object }
```

#### Translate Article (Editor+)
```
POST /api/articles/:id/translate
Authorization: Bearer <token>
Content-Type: application/json

{
  "targetLanguage": "en"
}

Response (201):
{
  "message": "Article translated successfully",
  "translation": { translation object }
}
```

## User Roles

- **viewer**: Default role, can only view articles and family members
- **editor**: Can create and edit articles and family members
- **admin**: Can manage users and perform all operations

## Database Schema

### Users Table
- `id` (PK): User identifier
- `email` (UNIQUE): User email
- `password_hash`: Bcrypt hashed password
- `name`: User full name
- `role`: User role (viewer, editor, admin)
- `active`: Account status
- `created_at`, `updated_at`: Timestamps

### Family Members Table
- `id` (PK): Member identifier
- `name`: Full name
- `birth_year`, `death_year`: Life dates
- `birth_place`: Birth location
- `occupation`: Profession
- `short_bio`: Brief biography

### Family Relationships Table
- `id` (PK): Relationship identifier
- `member_id` (FK): Primary member
- `related_member_id` (FK): Related member
- `relationship_type`: Type of relationship (parent, spouse, child, sibling)

### Articles Table
- `id` (PK): Article identifier
- `family_member_id` (FK, UNIQUE): Associated family member
- `language`: Language code
- `content`: Article content (HTML)
- `created_by`, `updated_by` (FK): User who created/updated
- `created_at`, `updated_at`: Timestamps

### Article Translations Table
- `id` (PK): Translation identifier
- `article_id` (FK): Source article
- `language`: Language code
- `content`: Translated content
- `is_auto_translated`: Whether translation was automatic (DeepL)
- `created_by` (FK): User who created translation

### Audit Logs Table
- `id` (PK): Log identifier
- `user_id` (FK): User who made the change
- `table_name`: Table that was modified
- `record_id`: ID of modified record
- `action`: Type of change (INSERT, UPDATE, DELETE)
- `old_values`: Previous values (JSON)
- `new_values`: New values (JSON)
- `created_at`: Timestamp of change

## Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kurpejovica_db
DB_USER=postgres
DB_PASSWORD=your_password

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=7d

# DeepL Translation API
DEEPL_API_KEY=your_deepl_api_key

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

## Scripts

- `npm start`: Run production server
- `npm run dev`: Run development server with auto-reload
- `npm run migrate`: Initialize database schema
- `npm run seed`: Populate database with sample data
- `npm run lint`: Lint code with ESLint
- `npm test`: Run test suite

## Error Handling

All errors are caught by the global error handler and returned in a consistent format:

```json
{
  "error": "Error message",
  "details": ["Detailed error information if applicable"]
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 401: Unauthorized (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 409: Conflict (duplicate resource)
- 500: Internal Server Error

## Security

- **Password Hashing**: Bcryptjs with 10 salt rounds
- **Token Authentication**: JWT with configurable expiration
- **Input Validation**: Joi schemas for all requests
- **SQL Injection Prevention**: Parameterized queries
- **CORS**: Restricted to frontend origin
- **Audit Logging**: All changes tracked for accountability

## Development Notes

### Adding New Routes

1. Create controller in `src/controllers/`
2. Create validation schema in `src/validators/schemas.js`
3. Create route file in `src/routes/`
4. Import and use route in `src/server.js`

### Modifying Database Schema

1. Update `src/database/schema.js`
2. Run `npm run migrate` to apply changes
3. Create model functions in `src/models/`

### Adding Features

All significant features should:
- Have comprehensive JSDoc comments
- Include input validation
- Be covered by audit logging
- Handle errors gracefully
- Follow existing code patterns

## Support

For issues or questions about the backend, please refer to:
- Database schema documentation above
- JSDoc comments in source files
- API endpoint examples in this README
