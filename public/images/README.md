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

Messengers read **`og:image`** when unfurling a link (that can differ from large images on the page itself). This project generates images with Next.js **`opengraph-image.tsx`** files: **portfolio home** (`/`) uses **`headshot.png`** + portfolio copy; **Today’s Best Picks** (`/football-predictions`) uses **`goallab-icon.png`** + that page’s title.

### Step 1 — Images used for link previews

**Portfolio homepage (`/`):** uses **`public/images/headshot.png`**. If it’s missing, the generator falls back to a **“JM”** monogram.

**Best Picks (`/football-predictions`):** uses **`public/images/goallab-icon.png`**.

For GoalLab (Best Picks preview):

1. Export your GoalLab app icon as **PNG** (square is fine, e.g. **512×512**, or **`Icon-1024.png`** from Xcode).
2. Name it exactly: **`goallab-icon.png`** (all lowercase, hyphen).
3. Put it in **`public/images/goallab-icon.png`**.
4. **Commit and push** so production includes it. If missing, Best Picks previews show a **“GL”** placeholder.

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
| `https://yoursite.com/` | `app/opengraph-image.tsx` → **Jamie’s Portfolio** + **`headshot.png`** |
| `https://yoursite.com/football-predictions` | `app/football-predictions/opengraph-image.tsx` → **Today’s Best Picks** + **`goallab-icon.png`** |

### Step 4 — Confirm in a browser

1. Open: `https://YOUR_DOMAIN/opengraph-image` — should show **headshot + portfolio** copy.  
2. Open: `https://YOUR_DOMAIN/football-predictions/opengraph-image` — should show **GoalLab icon + Today’s Best Picks**.

If you get an error page, check deploy logs and that **`headshot.png`** / **`goallab-icon.png`** are committed as needed.

### Step 5 — Refresh WhatsApp / Facebook cache

WhatsApp uses Meta’s crawler cache. Old images can stick until refreshed.

1. Open **[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)**.
2. Paste the **exact** URL you share (e.g. `https://yoursite.com/football-predictions`).
3. Click **Debug**, then **Scrape Again** (may need a few tries).
4. Share the link again in WhatsApp; if it’s still old, wait a bit or try from another chat/thread.

### Step 6 — Optional: static image instead of generated

If you prefer a single PNG for previews, you can add **`app/opengraph-image.png`** (or **`app/football-predictions/opengraph-image.png`**) at the right size (**1200×630** recommended) and remove or rename the `.tsx` file for that route so Next.js picks the static file. The dynamic `.tsx` approach avoids maintaining a separate composite image.

---

## Need Help?

Check the main README.md or CUSTOMIZATION_GUIDE.md for more details!


