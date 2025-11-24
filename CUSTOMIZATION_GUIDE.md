# 🎨 Customization Guide

Quick reference for customizing your portfolio site.

## 📂 File Structure

```
portfolio-site/
├── app/
│   ├── layout.tsx         # Root layout (metadata, fonts)
│   ├── page.tsx           # Main landing page
│   └── globals.css        # Global styles
├── components/
│   ├── AppCarousel.tsx    # 3D carousel component
│   └── AppDetailModal.tsx # App detail popup
├── lib/
│   └── apps-data.ts       # 🔥 YOUR APP DATA HERE
├── types/
│   └── app.ts             # TypeScript types
└── public/
    └── images/            # 🔥 PUT YOUR IMAGES HERE
```

## 🔥 Must-Do Customizations

### 1. Add Your Apps (`/lib/apps-data.ts`)

This is the main data file! Edit it to showcase your apps.

```typescript
export const apps: App[] = [
  {
    id: 'my-app',
    name: 'My Amazing App',
    tagline: 'Does something awesome',
    description: 'A longer description...',
    color: '#FF6B9D',
    icon: '/images/my-app-icon.png',
    screenshots: ['/images/screenshot1.png'],
    features: ['Feature 1', 'Feature 2'],
    appStoreUrl: 'https://...',
    platform: 'iOS',
    status: 'live',
  },
  // Add more apps...
];
```

### 2. Update Personal Info (`/app/page.tsx`)

**Lines 17-25**: Hero section
```typescript
<h1>Jamie's Portfolio</h1>  // Change your name
<p>Crafting innovative...</p>  // Change your tagline
```

**Lines 64-80**: Footer/Contact
```typescript
<a href="mailto:your.email@example.com">  // Update email
<a href="https://twitter.com/yourhandle">  // Update social links
```

### 3. Add Your Images (`/public/images/`)

Place your images in this folder:
- App icons (square, ideally 512x512px)
- Screenshots (phone mockups work best!)
- Any other assets

Reference them like: `/images/your-image.png`

### 4. Update Metadata (`/app/layout.tsx`)

**Lines 5-7**: SEO metadata
```typescript
export const metadata: Metadata = {
  title: "Your Name - Portfolio",
  description: "Your custom description",
};
```

## 🎨 Optional Customizations

### Change Background Gradient (`/app/page.tsx`, line 13)

```typescript
<main className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
```

Try other combinations:
- `from-blue-600 via-cyan-600 to-teal-500` (Ocean)
- `from-orange-500 via-red-500 to-pink-500` (Sunset)
- `from-green-600 via-emerald-600 to-teal-500` (Forest)

### Adjust Carousel Spacing (`/components/AppCarousel.tsx`, line 52)

```typescript
const radius = 400; // Distance between cards
```

- Smaller number = cards closer together
- Larger number = cards more spread out

### Change Card Appearance (`/components/AppCarousel.tsx`, line 97)

Modify the phone mockup design:
- Size: `w-[280px] h-[500px]`
- Border radius: `rounded-3xl`
- Shadow: `shadow-2xl`

## 🌈 Color Scheme Tips

Each app has a `color` property. Choose colors that:
- Represent your app's brand
- Contrast well with white text
- Look good in gradients

**Good color examples:**
- Pink: `#FF6B9D`
- Purple: `#8B5CF6`
- Blue: `#3B82F6`
- Green: `#10B981`
- Orange: `#F59E0B`

## 📱 Adding More Apps

Just add more objects to the `apps` array in `/lib/apps-data.ts`:

```typescript
export const apps: App[] = [
  { /* app 1 */ },
  { /* app 2 */ },
  { /* app 3 */ },  // The carousel handles any number!
];
```

## 🚀 Pro Tips

1. **High-quality images**: Use crisp, high-resolution images for best results
2. **Consistent mockups**: Keep all phone mockups the same style
3. **Color harmony**: Choose colors that work well together
4. **Short taglines**: Keep taglines under 50 characters
5. **Feature bullets**: 3-6 features per app is ideal

## ❓ Need Help?

Check the main README.md for:
- Installation instructions
- Running the dev server
- Deployment guide

Happy customizing! 🎉


