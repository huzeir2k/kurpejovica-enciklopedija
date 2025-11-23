# Quick Translation Testing Guide

## Fast Test (2 minutes)

### 1. Start Your Application
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 2. Open in Browser
- Go to http://localhost:5173
- Open DevTools with F12
- Click **Console** tab

### 3. Test Initial Load
- Click any family member on home page
- Check console for logs starting with `[Translation]` and `[API]`
- **You should see:**
  ```
  [Translation] Fetching article for member 1 in language: sr
  [API] GET /articles/1?lang=sr
  [API] Response: {...}
  [Translation] Article data received: {...}
  [Translation] Article.content: "..."
  ```

### 4. Test Language Change
- In navbar top-right, click language dropdown
- Select **English** (or any other language)
- **You should see in console:**
  ```
  [Translation] Fetching article for member 1 in language: en
  [API] GET /articles/1?lang=en
  [API] Response: {...}
  [Translation] Article data received: {...}
  [Translation] Article.content: "..."
  ```
- **On the page:** Article text should change to English

### 5. Verify Success ✅
- [ ] Language selector changes language shown in dropdown
- [ ] Console shows `[Translation]` logs for each language
- [ ] Console shows `[API]` logs with correct language parameter
- [ ] Page content changes when language changes

---

## What Each Log Means

| Log | Meaning | Status |
|-----|---------|--------|
| `[Translation] Fetching...` | Frontend is requesting article | ✅ Request started |
| `[API] GET /articles/...` | API call being made | ✅ HTTP request sent |
| `[API] Response: {...}` | API returned data | ✅ Backend responded |
| `[Translation] Article data received` | Frontend got the data | ✅ Response received |
| `[Translation] Article.content:` | Content ready for display | ✅ Ready to render |

---

## If Console is Empty When Changing Language

**Problem:** Logs don't appear when you change language

**Quick Fixes:**
1. **Hard refresh browser:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Check if dropdown is actually changing** - look at selected option
3. **Check if Language Store is active** - type in console: `localStorage.getItem('language')`
   - Should show currently selected language code (sr, en, fr, etc.)

---

## If Backend Logs Show 404

**Problem:** Backend console shows:
```
[Article API] Article not found for member 1 in language: en
```

**Solution:** That language article doesn't exist in database

**Workaround:** Create article in that language via:
1. Go to `/admin` page (if logged in)
2. Or add articles directly to database

---

## Expected Console Output (Complete Example)

### When Landing on Page:
```
[Translation] Fetching article for member 1 in language: sr
[API] GET /articles/1?lang=sr
[API] Response: {id: 1, family_member_id: 1, language: "sr", content: "Никола Курпејовић је био...", ...}
[Translation] Article data received: {id: 1, family_member_id: 1, language: "sr", ...}
[Translation] Article.content: "Никола Курпејовић је био..."
```

### When Changing to English:
```
[Translation] Fetching article for member 1 in language: en
[API] GET /articles/1?lang=en
[API] Response: {id: 1, family_member_id: 1, language: "en", content: "Nikola Kurpejović was a...", ...}
[Translation] Article data received: {id: 1, family_member_id: 1, language: "en", ...}
[Translation] Article.content: "Nikola Kurpejović was a..."
```

### When Changing to French:
```
[Translation] Fetching article for member 1 in language: fr
[API] GET /articles/1?lang=fr
[API] Response: {id: 1, family_member_id: 1, language: "fr", content: "Nikola Kurpejović était un...", ...}
[Translation] Article data received: {id: 1, family_member_id: 1, language: "fr", ...}
[Translation] Article.content: "Nikola Kurpejović était un..."
```

---

## Browser Network Tab Verification

1. Press F12 → **Network** tab
2. Click language dropdown
3. Look for API request in the list:
   - **Request:** `GET /api/articles/1?lang=en`
   - **Status:** `200` (success) or `404` (not found)
   - **Response:** Should show article JSON with `language: "en"` and `content: "..."`

---

## Troubleshooting Checklist

- [ ] Backend server running? (Check terminal for no errors)
- [ ] Frontend server running? (Can access http://localhost:5173)
- [ ] DevTools Console open? (F12 → Console)
- [ ] Logs appear on initial page load? (Should see `[Translation]` logs)
- [ ] Logs appear when changing language? (Should see new `[Translation]` logs)
- [ ] API logs show correct language? (Check `lang=` parameter in URL)
- [ ] Backend logs appear? (Check backend terminal for `[Article API]` logs)
- [ ] Page content actually changes? (Read article text, not just logs)

---

## Success Indicators ✅

Your translation system works if:

1. **Console logs appear** when language changes
2. **API request** shows correct language parameter (`?lang=en`)
3. **API response** includes article with correct language
4. **Page content** changes to match selected language
5. **No errors** in console (red messages)

If all 5 are true → **Translation working!** 🎉

---

## If All Else Fails

Check the detailed debugging guide:
- Read: `TRANSLATION_DEBUGGING.md`
- Read: `TRANSLATION_FIX_SUMMARY.md`

These files have complete walkthroughs and troubleshooting steps.
