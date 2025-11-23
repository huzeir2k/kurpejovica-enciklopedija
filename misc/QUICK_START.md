# Quick Start Guide

## 🚀 Start in 5 Minutes

### Step 1: Backend Setup
```bash
cd backend
npm install
npm run migrate
npm run dev
```

**Backend running on:** `http://localhost:3000`

### Step 2: Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Frontend running on:** `http://localhost:5173`

### Step 3: Login
- Go to: http://localhost:5173/login
- Use admin credentials from database or signup
- Click "Edit Articles" in navbar

### Step 4: Create Article
- Click "+ New Article"
- Select family member
- Choose template
- Edit content
- Save!

---

## 📝 What Was Changed

### 1. **Translation Service**
```
❌ DeepL (paid API)
✅ Google Translate (free tier available)
```

### 2. **Article Management**
```
✅ Create articles with templates
✅ Edit HTML content
✅ Auto-translate to 9 languages
✅ Full version history
✅ Admin CRUD endpoints
```

### 3. **Image Management**
```
✅ Upload images (5MB max)
✅ Organize in galleries
✅ Set as primary
✅ Serve via `/images` endpoint
```

### 4. **Wikipedia Templates**
```
✅ Basic (title + content)
✅ Infobox (structured data)
✅ Full Featured (multi-section)
```

### 5. **Admin Panel**
```
✅ Article Editor at /articles
✅ User Management at /admin
✅ Image Gallery in article editor
✅ Translation management
```

---

## 🔑 Key Files

**Backend:**
- `src/controllers/articleController.js` - Article CRUD
- `src/models/Image.js` - Image operations
- `src/routes/imageRoutes.js` - Image API
- `src/services/translationService.js` - Google Translate

**Frontend:**
- `src/pages/ArticleEditorPage.vue` - Full article management UI
- `src/router/index.js` - Routes config
- `src/App.vue` - Navbar with links

---

## 🌐 Frontend-Backend Connection

| Component | URL |
|-----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Images | http://localhost:3000/images |
| Health Check | http://localhost:3000/health |

All connections configured and working!

---

## 📦 Templates

Click the toolbar buttons to insert:

- **Infobox** - Structured information box
- **Section** - Content section with heading
- **Table** - Data table

Or manually insert:

```html
<!-- Infobox -->
<div class="wiki-infobox">
  <div class="infobox-title">Title</div>
  <table class="infobox-table">
    <tr><td class="label">Key:</td><td>Value</td></tr>
  </table>
</div>

<!-- Section -->
<section class="wiki-section">
  <h2>Section Title</h2>
  <p>Content...</p>
</section>
```

---

## 🖼️ Image Management

In the article editor, scroll to "Images" section:

1. **Upload** - Click "Upload Image" button
2. **View** - See all images in gallery
3. **Delete** - Remove images
4. **Use** - Reference with: `/images/filename.jpg`

Example in HTML:
```html
<img src="/images/photo.jpg" alt="Description" />
```

---

## 🔄 Translation Workflow

1. Create article in Serbo-Croatian (default)
2. In article editor, click "Auto-translate to Other Languages"
3. Select target language
4. Google Translate API translates content
5. View all translations in "Translations" section

---

## 🔐 Admin Access

**Required Role:** `admin`

**What Can Admins Do:**
- ✅ Create articles
- ✅ Edit articles
- ✅ Delete articles
- ✅ Upload images
- ✅ Manage translations
- ✅ Manage users
- ✅ View audit logs

---

## ✅ Checklist

- [ ] Backend running (`npm run dev`)
- [ ] Frontend running (`npm run dev`)
- [ ] Database migrated (`npm run migrate`)
- [ ] Google Translate API key in `.env`
- [ ] Can login as admin
- [ ] Can access article editor
- [ ] Can create new article
- [ ] Can upload images
- [ ] Can translate articles

---

## 🆘 Common Issues

**"Database connection failed"**
- Check `.env` DB credentials
- Ensure PostgreSQL is running
- Run: `npm run migrate`

**"Translation service error"**
- Check Google Translate API key in `.env`
- Verify API is enabled in Google Cloud
- Test with: `npm run test`

**"Can't upload images"**
- Create directory: `mkdir -p backend/uploads/images`
- Check file size < 5MB
- Ensure only image files

**"Frontend can't reach backend"**
- Verify both servers are running
- Check CORS in backend `.env`
- Check API URL in frontend `.env`

---

## 📚 Full Documentation

For complete setup details, see:
- `SETUP_GUIDE_COMPLETE.md` - Detailed setup
- `TRANSLATION_DEBUGGING.md` - Translation help
- `API.md` - API documentation

---

**Everything is set up and ready to use!** 🎉

Start building your family encyclopedia now.
