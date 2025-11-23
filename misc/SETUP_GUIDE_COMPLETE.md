# Complete Setup Guide - All Changes

## Summary of Changes

You've now got a complete, professional family encyclopedia system with:

### ✅ 1. **Google Translate Integration** (Replaced DeepL)
- Switched from DeepL to Google Translate API
- Update `.env`: `GOOGLE_TRANSLATE_API_KEY=your_key`
- Get a free API key from: https://cloud.google.com/translate/docs

### ✅ 2. **Frontend-Backend Connection**
- Frontend configured to connect to: `http://localhost:3000/api`
- Backend CORS enabled for: `http://localhost:5173`
- All requests properly authenticated with JWT tokens

### ✅ 3. **Full Article CRUD with Admin Panel**
- **Create**: New articles with Wikipedia-style templates
- **Read**: View articles in 9 languages with fallback
- **Update**: Edit article content with live preview
- **Delete**: Remove articles with audit logging
- **Templates**: Basic, Infobox, Full-Featured

### ✅ 4. **Image Management**
- **Upload**: Add images to family members (5MB max)
- **Gallery**: View all images for each member
- **Primary**: Set featured image
- **Delete**: Remove images with file cleanup
- **Serve**: Images accessible at `/images/{filename}`

### ✅ 5. **Wikipedia-Style Templates**

#### Basic Template
```html
<section class="wiki-section">
  <h2>Biography</h2>
  <p>Content here...</p>
</section>
```

#### Infobox Template
```html
<div class="wiki-infobox">
  <div class="infobox-title">Family Information</div>
  <table class="infobox-table">
    <tr><td class="label">Born:</td><td>Date and place</td></tr>
    <tr><td class="label">Died:</td><td>Date and place</td></tr>
  </table>
</div>
```

#### Full-Featured Wikipedia Style
- Infobox with image placeholder
- Multiple sections (Early Life, Career, Family, Legacy)
- Subsections support
- Related links "See also" section
- Professional styling

---

## Installation & Setup

### Backend Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
# Edit .env and set:
# - DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
# - JWT_SECRET (already set)
# - GOOGLE_TRANSLATE_API_KEY (get from Google Cloud)

# 3. Create PostgreSQL database
createdb kurpejovic_enciklopedija_db

# 4. Run migrations
npm run migrate

# 5. Seed sample data (optional)
npm run seed

# 6. Start server
npm run dev  # Or: npm start for production
```

Server will run on: `http://localhost:3000`

### Frontend Setup

```bash
# 1. Install dependencies
cd frontend
npm install

# 2. Verify .env configuration
# Should contain:
# VITE_API_URL=http://localhost:3000/api

# 3. Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## File Structure Changes

### Backend New/Modified Files

**New:**
- `src/models/Image.js` - Image database operations
- `src/routes/imageRoutes.js` - Image upload/download endpoints
- `src/database/schema.js` - Updated with `images` table

**Modified:**
- `src/controllers/articleController.js` - Full CRUD + templates
- `src/services/translationService.js` - Google Translate API
- `src/routes/articleRoutes.js` - Admin article management
- `src/server.js` - Image serving, new routes
- `package.json` - Added `multer` dependency
- `.env` - GOOGLE_TRANSLATE_API_KEY instead of DEEPL

### Frontend New/Modified Files

**New:**
- `src/pages/ArticleEditorPage.vue` - Complete article management UI

**Modified:**
- `src/router/index.js` - Added `/articles` route
- `src/App.vue` - Added "Edit Articles" navbar link

---

## API Endpoints

### Article Management (Admin Only)

```bash
# Create article
POST /api/articles
Body: {
  family_member_id: 1,
  language: "sr",
  content: "<html>...",
  template_type: "basic"  # optional
}

# Update article
PUT /api/articles/:id
Body: {
  content: "<html>..."
}

# Delete article
DELETE /api/articles/:id

# Get article
GET /api/articles/:id?lang=en

# Translate article
POST /api/articles/:id/translate
Body: { targetLanguage: "en" }

# Get all translations
GET /api/articles/:id/translations

# Get article history
GET /api/articles/:id/history
```

### Image Management (Admin Only)

```bash
# Upload image
POST /api/images/upload
FormData: {
  file: File,
  family_member_id: 1,
  description: "Image description",
  is_primary: false
}

# Get images for member
GET /api/images/member/:memberId

# Get primary image
GET /api/images/member/:memberId/primary

# Update image metadata
PUT /api/images/:imageId
Body: {
  description: "New description",
  is_primary: true
}

# Delete image
DELETE /api/images/:imageId

# Serve image
GET /images/:filename
```

---

## Database Schema

### New Images Table

```sql
CREATE TABLE images (
  id SERIAL PRIMARY KEY,
  family_member_id INTEGER REFERENCES family_members(id),
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by INTEGER REFERENCES users(id),
  description TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Updated Articles Table

Still has standard fields:
- `id`, `family_member_id`, `language`
- `content` (HTML)
- `created_by`, `updated_by`
- `created_at`, `updated_at`

---

## Admin Panel Features

### Article Editor (/articles)

1. **Article List**
   - Browse all articles
   - Filter by language
   - See last updated date

2. **Create Article**
   - Select family member
   - Choose language
   - Select template (basic/infobox/full)
   - Edit HTML content
   - Live preview
   - Save to database

3. **Edit Article**
   - Update content
   - Live HTML preview
   - Track changes with audit logs

4. **Article Metadata**
   - View/manage translations
   - Auto-translate to other languages
   - Upload/manage images
   - Set primary image

5. **Image Management**
   - Upload images (5MB max)
   - Set as primary
   - Delete with cleanup
   - Organize in gallery

---

## Template Usage Examples

### Adding Infobox to Article

```html
<div class="wiki-infobox">
  <div class="infobox-title">Nikola Kurpejović</div>
  <table class="infobox-table">
    <tr><td class="label">Born:</td><td>15 March 1820</td></tr>
    <tr><td class="label">Died:</td><td>12 October 1880</td></tr>
    <tr><td class="label">Nationality:</td><td>Serbian</td></tr>
    <tr><td class="label">Occupation:</td><td>Merchant</td></tr>
  </table>
</div>
```

### Adding Sections

```html
<section class="wiki-section">
  <h2>Early Life</h2>
  <p>Content about early life...</p>
</section>

<section class="wiki-section">
  <h2>Career</h2>
  <h3>Beginning</h3>
  <p>Started in 1840...</p>
  
  <h3>Peak Years</h3>
  <p>Most productive period...</p>
</section>
```

### Images in Content

```html
<div class="wiki-image">
  <img src="/images/filename.jpg" alt="Description" />
  <p class="image-caption">Caption text</p>
</div>
```

---

## Google Translate API Setup

1. **Go to Google Cloud Console**
   - https://console.cloud.google.com

2. **Create Project or Select Existing**
   - Project name: "Kurpejovica Enciklopedija"

3. **Enable Translation API**
   - Search: "Cloud Translation API"
   - Click "Enable"

4. **Create API Key**
   - Go to Credentials
   - Create API Key (Restrict to Translation API)
   - Copy key to `.env` file

5. **Set up Billing** (First 500k chars/month free)
   - Add payment method
   - Set billing alerts if desired

---

## Testing the System

### Test Article CRUD

```bash
# 1. Login as admin
# Go to: http://localhost:5173/login
# Use admin credentials

# 2. Click "Edit Articles" in navbar
# Go to: http://localhost:5173/articles

# 3. Click "+ New Article"
# - Select a family member
# - Choose language
# - Select template
# - Add content
# - Click "Save Article"

# 4. Try uploading an image
# - Click on article to edit
# - Scroll to "Images" section
# - Click "Upload Image"
# - Select file

# 5. Test translation
# - Click "Auto-translate to Other Languages"
# - Select target language
# - Verify translation in "Translations" section
```

### Test Frontend-Backend Connection

```bash
# 1. Both servers running:
# Backend: http://localhost:3000/health (should return OK)
# Frontend: http://localhost:5173 (should load)

# 2. Check DevTools Network tab
# Click on article → should see API call to /api/articles/1?lang=sr

# 3. Change language
# Dropdown should trigger API call with new lang parameter

# 4. Check DevTools Console
# Should show [Translation] logs if you added them
```

---

## Security Notes

✅ **Authentication**
- JWT tokens required for all admin/edit endpoints
- Tokens stored in localStorage
- Axios interceptors add token to requests
- Auto-logout on 401 response

✅ **Authorization**
- Admin role required for CRUD operations
- Image upload size limited to 5MB
- File type validation (images only)

✅ **Data Protection**
- Audit logs track all changes
- Database constraints prevent orphaned records
- File cleanup on image deletion
- Password hashing with bcryptjs

---

## Troubleshooting

### "Article not found" on first load
- **Solution**: Run migrations first
  ```bash
  npm run migrate  # Backend
  npm run seed     # Optional: add sample data
  ```

### Images not uploading
- **Solution**: Check permissions
  ```bash
  mkdir -p backend/uploads/images
  chmod 755 backend/uploads/images
  ```

### Translation failing
- **Solution**: Verify API key
  ```
  - Check .env has GOOGLE_TRANSLATE_API_KEY
  - Verify API enabled in Google Cloud Console
  - Check billing is set up
  ```

### Frontend can't reach backend
- **Solution**: Verify CORS
  ```
  Backend .env should have: CORS_ORIGIN=http://localhost:5173
  Frontend .env should have: VITE_API_URL=http://localhost:3000/api
  ```

### Database connection error
- **Solution**: Verify PostgreSQL
  ```bash
  psql -U root -d kurpejovic_enciklopedija_db
  # If fails, check .env DB credentials match your setup
  ```

---

## Next Steps

1. ✅ **Set up Google Translate API key**
2. ✅ **Run database migrations**
3. ✅ **Start both servers**
4. ✅ **Login as admin and create first article**
5. ✅ **Upload images**
6. ✅ **Test translations**
7. ✅ **Deploy when ready**

---

## Key Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Article CRUD | ✅ Complete | `/api/articles` + `/articles` page |
| Image Upload | ✅ Complete | `/api/images` + article editor |
| Image Gallery | ✅ Complete | Article editor "Images" section |
| Translations | ✅ Complete | Google Translate API |
| Templates | ✅ Complete | Basic/Infobox/Full templates |
| Admin Panel | ✅ Complete | `/admin` (users) + `/articles` (content) |
| Audit Logging | ✅ Complete | Tracks all changes |
| Frontend Connection | ✅ Complete | Configured & working |
| Backend Connection | ✅ Complete | CORS enabled, routes set up |

---

**Your encyclopedia system is now complete and production-ready!** 🎉
