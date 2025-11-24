# Portfolio Site - 3D App Carousel

A modern, interactive portfolio website showcasing your apps with a beautiful 3D carousel interface.

## 🚀 Quick Start

### 1. Install Dependencies

First, make sure you have Node.js installed (version 18 or later), then run:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Run Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 📝 How to Customize

### Adding Your Apps

Edit `/lib/apps-data.ts` to add or modify your apps:

```typescript
{
  id: 'your-app-id',
  name: 'Your App Name',
  tagline: 'A catchy tagline',
  description: 'Full description of your app',
  color: '#FF6B9D', // Hex color for the app's theme
  icon: '/images/your-app-icon.png',
  screenshots: [
    '/images/screenshot1.png',
    '/images/screenshot2.png',
  ],
  features: [
    'Feature 1',
    'Feature 2',
    'Feature 3',
  ],
  appStoreUrl: 'https://apps.apple.com/your-app',
  websiteUrl: 'https://yourapp.com',
  platform: 'iOS', // or 'macOS', 'Web', 'Cross-platform'
  status: 'live', // or 'beta', 'coming-soon'
}
```

### Adding Images

1. Place your app icons and screenshots in the `/public/images/` folder
2. Reference them in your app data using `/images/filename.png`

### Customizing Colors & Branding

- **Hero section**: Edit `/app/page.tsx` - change the title, tagline, and description
- **Background gradient**: Modify the `bg-gradient-to-br` classes in `page.tsx`
- **Contact links**: Update the footer section in `page.tsx` with your email, Twitter, GitHub, etc.
- **Global styles**: Edit `/app/globals.css` for fonts, colors, and other global styles

### Customizing the Carousel

The 3D carousel settings can be adjusted in `/components/AppCarousel.tsx`:

- `radius`: Distance of cards from center (line 52)
- `scale`: Size variation based on position (line 54)
- `angle`: Rotation angle calculation (line 51)

## 🎨 Features

- ✨ **3D Carousel**: Interactive, draggable carousel with smooth animations
- 📱 **Responsive**: Works beautifully on mobile, tablet, and desktop
- 🎭 **Modal Detail Views**: Click any app to see full details
- 🎯 **Touch & Mouse**: Drag to rotate, click arrows, or use dot indicators
- 🌙 **Dark Mode Ready**: Supports system dark mode preferences
- ⚡ **Fast**: Built with Next.js 14 and optimized for performance

## 🛠 Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React** - UI library

## 📦 Building for Production

```bash
npm run build
npm run start
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy! ✨

### Other Platforms

- **Netlify**: Connect your Git repo and deploy
- **GitHub Pages**: Run `npm run build` and deploy the `out` folder
- **Custom Server**: Run `npm run build` then `npm run start`

## 📄 License

MIT - Feel free to use this for your own portfolio!

## 🎉 Enjoy!

Built with ❤️ using Next.js and Framer Motion.


