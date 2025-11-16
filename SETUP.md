# 🚀 Quick Setup Instructions

## Prerequisites

You need Node.js installed. Check if you have it:

```bash
node --version
```

If not installed, download from: https://nodejs.org/ (get the LTS version)

## Step-by-Step Setup

### 1. Install Dependencies

Open Terminal, navigate to this folder, and run:

```bash
cd /Users/Jamie/Desktop/portfolio-site
npm install
```

This will install all required packages (~2-3 minutes).

### 2. Customize Your Content

**Edit these files** (in order of priority):

#### 🔥 Must Edit:
1. `/lib/apps-data.ts` - Add your app data
2. `/app/page.tsx` - Update your name, tagline, contact info

#### 📸 Add Images:
3. `/public/images/` - Add your app icons and screenshots

#### ⚙️ Optional:
4. `/app/layout.tsx` - Change site title/description
5. `/app/globals.css` - Customize colors/fonts
6. `/components/AppCarousel.tsx` - Tweak carousel behavior

See **CUSTOMIZATION_GUIDE.md** for detailed instructions!

### 3. Run the Development Server

```bash
npm run dev
```

Then open: **http://localhost:3000**

The page will auto-reload when you save changes! 🔥

### 4. Make Your Changes

While `npm run dev` is running:
1. Edit files in your code editor
2. Save
3. Refresh browser to see changes
4. Repeat!

## 🎨 Quick Customizations to Try First

### Change Your Name (30 seconds)
Open `/app/page.tsx`, line 17:
```typescript
<h1>Your Name's Portfolio</h1>
```

### Change Background Color (30 seconds)
Open `/app/page.tsx`, line 13:
```typescript
<main className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
```

### Add Your First App (5 minutes)
Open `/lib/apps-data.ts` and modify the example apps with your real data.

## 🚀 Ready to Deploy?

### Deploy to Vercel (Easiest)

1. Push your code to GitHub
2. Go to https://vercel.com
3. Sign in with GitHub
4. Click "Import Project"
5. Select your repository
6. Click "Deploy"

Done! You'll get a live URL like: `your-site.vercel.app`

### Deploy to Netlify

1. Push your code to GitHub
2. Go to https://netlify.com
3. Click "New site from Git"
4. Connect your repository
5. Build command: `npm run build`
6. Publish directory: `.next`
7. Deploy!

## ❓ Troubleshooting

### "command not found: npm"
→ Install Node.js from https://nodejs.org/

### Port 3000 already in use
→ Kill the process: `lsof -ti:3000 | xargs kill -9`
→ Or use a different port: `npm run dev -- -p 3001`

### Images not loading
→ Make sure images are in `/public/images/`
→ Reference them as `/images/filename.png` (with leading slash)

### TypeScript errors
→ Run `npm run build` to see all errors
→ Check CUSTOMIZATION_GUIDE.md for proper data format

## 📚 Documentation Files

- **README.md** - Overview and general info
- **CUSTOMIZATION_GUIDE.md** - Detailed customization instructions
- **SETUP.md** - This file! Setup instructions
- **public/images/README.md** - Image requirements

## 🎉 You're Ready!

Start with `npm install`, then `npm run dev`, and begin customizing!

Questions? Check the other documentation files or the comments in the code.

Happy building! 🚀

