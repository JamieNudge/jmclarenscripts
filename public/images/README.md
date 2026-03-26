# 📸 Images Folder

Place your app images here!

## Required Images

For each app, you'll need:

### 1. App Icon
- **Filename**: `your-app-name-icon.png`
- **Size**: 512x512px (square)
- **Format**: PNG with transparency (optional)
- **Example**: `draw-with-friends-icon.png`

### 2. Screenshots (optional but recommended)
- **Filename**: `your-app-name-1.png`, `your-app-name-2.png`, etc.
- **Size**: iPhone mockup dimensions (ideally 1170x2532px)
- **Format**: PNG or JPG
- **Example**: `draw-with-friends-1.png`

## Quick Tips

- Use high-resolution images (2x or 3x scale)
- Keep file sizes under 1MB for web performance
- Use consistent mockup styles across all apps
- Consider using phone frame mockups for screenshots

## Free Mockup Tools

- **Mockuphone**: https://mockuphone.com/
- **Smartmockups**: https://smartmockups.com/
- **Shots**: https://shots.so/

## Placeholder Images

Until you have real images, the site will show:
- App icons: First letter of app name in a white square
- Screenshots: Gray placeholder boxes with text

## Open Graph / WhatsApp / iMessage link previews

Messengers read **`og:image`** from your page, not your portrait from the HTML. This project generates those images with Next.js **`opengraph-image.tsx`** and uses **`public/images/goallab-icon.png`** when that file exists.

### Step 1 — Add the GoalLab icon file

1. Export your GoalLab app icon as **PNG** (square is fine, e.g. **512×512**).
2. Name it exactly: **`goallab-icon.png`** (all lowercase, hyphen).
3. Put it here: **`public/images/goallab-icon.png`**  
   Full path from project root: `portfolio-site/public/images/goallab-icon.png`.
4. **Commit and push** this file so your host (e.g. Vercel) builds with the real icon.  
   If the file is missing, previews still work but show a **“GL”** placeholder instead of the artwork.

### Step 2 — Set your public site URL (production)

1. In your host’s environment variables (e.g. **Vercel → Project → Settings → Environment Variables**), add:
   - **Name:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** your live site with **https**, no trailing slash, e.g. `https://jmclarenscripts.com`
2. Redeploy after saving so `metadataBase` in `app/layout.tsx` resolves absolute preview image URLs correctly.
3. For local testing, you can put the same line in **`.env.local`** (not committed).

### Step 3 — Which URL shows which preview?

After deploy, Next.js serves generated images at:

| You share this URL | Preview image comes from |
|--------------------|---------------------------|
| `https://yoursite.com/` | `app/opengraph-image.tsx` → **Jamie’s App Portfolio · GoalLab** |
| `https://yoursite.com/best-picks` | `app/best-picks/opengraph-image.tsx` → **Today’s Best Picks · GoalLab** |

Both use the same **`goallab-icon.png`** file.

### Step 4 — Confirm in a browser

1. Open: `https://YOUR_DOMAIN/opengraph-image`  
2. You should see a **1200×630** image (icon + text).  
3. Try `https://YOUR_DOMAIN/best-picks/opengraph-image` for the Best Picks variant.

If you get an error page, check the deployment logs and that **`NODE`** can read `public/images/goallab-icon.png` (file committed).

### Step 5 — Refresh WhatsApp / Facebook cache

WhatsApp uses Meta’s crawler cache. Old images can stick until refreshed.

1. Open **[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)**.
2. Paste the **exact** URL you share (e.g. `https://yoursite.com/best-picks`).
3. Click **Debug**, then **Scrape Again** (may need a few tries).
4. Share the link again in WhatsApp; if it’s still old, wait a bit or try from another chat/thread.

### Step 6 — Optional: static image instead of generated

If you prefer a single PNG for previews, you can add **`app/opengraph-image.png`** (or **`app/best-picks/opengraph-image.png`**) at the right size (**1200×630** recommended) and remove or rename the `.tsx` file for that route so Next.js picks the static file. The dynamic `.tsx` approach avoids maintaining a separate composite image.

---

## Need Help?

Check the main README.md or CUSTOMIZATION_GUIDE.md for more details!


