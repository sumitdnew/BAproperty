# Fix 404 Errors on Email Links in Production

## Problem

Email invitation links work locally but show 404 errors in production when users click "Complete Registration".

## Root Cause

The issue occurs because your production server doesn't handle client-side routing properly. React Router uses browser history to handle routes, but the server needs to redirect all routes to `index.html` so React can take over.

## Solutions by Hosting Platform

### 1. **Netlify** (Recommended)

Already fixed! A `_redirects` file has been added to your `public` folder.

**File**: `public/_redirects`
```
/*    /index.html   200
```

This tells Netlify to serve `index.html` for all routes and let React Router handle the routing.

**Deploy Command**:
```bash
npm run build
# Then deploy the 'dist' folder to Netlify
```

### 2. **Vercel**

Create `vercel.json` in the project root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Deploy Command**:
```bash
npm run build
vercel --prod
```

### 3. **GitHub Pages**

GitHub Pages requires HashRouter instead of BrowserRouter for proper routing.

**Option A**: Use HashRouter (URLs will have `#` like `example.com/#/invite`)

Update `src/App.tsx`:
```typescript
// Change this:
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// To this:
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
```

**Option B**: Use spa-github-pages script
1. Copy `404.html` to `public` folder
2. Add redirect script to `index.html`

See: https://github.com/rafgraph/spa-github-pages

### 4. **Apache Server**

Create `.htaccess` in your build folder:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

### 5. **Nginx**

Add to your nginx config:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

Full config example:
```nginx
server {
  listen 80;
  server_name yourdomain.com;
  root /path/to/your/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

### 6. **Express.js / Node.js Server**

If you're serving with Express:

```javascript
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 7. **Firebase Hosting**

Add to `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Testing Your Fix

### 1. Test Locally with Production Build

```bash
npm run build
npm run preview
```

Then try accessing: `http://localhost:4173/invite`

### 2. Test in Production

After deploying, try these URLs directly:
- `https://yourdomain.com/invite`
- `https://yourdomain.com/login`
- `https://yourdomain.com/signup`

All should load without 404 errors.

### 3. Test Email Link

1. Send a test invitation
2. Check the email for the signup link
3. Click the link - should work now!

## Debug Steps

If it still doesn't work:

### 1. Check the Email URL
Look at the email source and verify the URL format:
```
Should be: https://yourdomain.com/invite?email=test@example.com
NOT: https://yourdomain.com/#/invite?email=test@example.com (unless using HashRouter)
```

### 2. Check Console Logs
In the email sending code, the URLs are logged:
```
📧 Sending EmailJS request with params:
- login_url: https://yourdomain.com/login
- signup_url: https://yourdomain.com/invite?email=...
```

### 3. Check Server Logs
Look for 404 errors in your hosting platform's logs.

### 4. Verify Build Output
Make sure your build includes all necessary files:
```bash
npm run build
ls -la dist/
# Should see: index.html, assets/, etc.
```

## Alternative: Use HashRouter

If you can't configure server redirects, use HashRouter:

**Pros:**
- Works on any static hosting
- No server configuration needed
- Works with GitHub Pages out of the box

**Cons:**
- URLs look like: `example.com/#/invite` (with `#`)
- Less SEO friendly

**How to Implement:**

1. Update `src/App.tsx`:
```typescript
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
```

2. Update `src/services/emailProvider.ts`:
```typescript
signup_url: `${window.location.origin}/#/invite?email=${encodeURIComponent(to)}`
```

3. Rebuild and redeploy:
```bash
npm run build
```

## Recommended Setup

For most deployments, we recommend:

1. **Netlify** - Easiest, already configured with `_redirects` file
2. **Vercel** - Add `vercel.json` as shown above
3. **Your own server** - Configure nginx/apache as shown above

## Need Help?

If you're still having issues, please provide:
1. Which hosting platform you're using
2. The exact error message
3. A screenshot of the browser console
4. The URL from the email

---

**Status**: ✅ Fixed for Netlify (via `_redirects` file)
**Last Updated**: October 10, 2025

