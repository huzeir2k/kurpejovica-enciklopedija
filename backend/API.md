# Backend API Quick Reference

## Base URL
```
http://localhost:3000/api
```

## Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints Summary

### Auth
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user
- `POST /auth/register` - Register new user

### Family Members
- `GET /family-members` - List all (filters: name, birth_year)
- `GET /family-members/search?q=query` - Search
- `GET /family-members/:id` - Get single
- `GET /family-members/:id/tree` - Get family tree
- `POST /family-members` - Create (editor+)
- `PUT /family-members/:id` - Update (editor+)
- `POST /family-members/:id/relationships` - Create relationship (editor+)

### Articles
- `GET /articles/languages` - Supported languages
- `GET /articles/:id?lang=en` - Get article
- `GET /articles/:id/history` - Version history
- `GET /articles/:id/translations` - Get translations
- `POST /articles` - Create (editor+)
- `PUT /articles/:id` - Update (editor+)
- `POST /articles/:id/translate` - Translate via DeepL (editor+)
- `GET /family-members/:id/articles` - Get all articles for member

## Response Format

### Success
```json
{
  "data": { /* response data */ },
  "status": "ok"
}
```

### Error
```json
{
  "error": "Error message",
  "details": ["Additional info"]
}
```

## Common Status Codes
- 200 OK
- 201 Created
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error
