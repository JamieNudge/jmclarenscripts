# Best Picks page: simple setup guide

This walks you from zero to a live `/best-picks` page that reads **Firebase Realtime Database** (same project as your Stat Strike Mac uploader). Take it in order; skip steps you’ve already done.

---

## What you’re connecting

| Piece | What it is |
|--------|------------|
| **Your Next.js site** | Folder `portfolio-site` on your Desktop → deploys to **Vercel** (e.g. jmclarenscripts). |
| **Firebase** | Project **stat-strike-firebase** (or whatever yours is called). |
| **Data the page reads** | For **today’s date** (UK time by default): `unanimousExports/YYYY-MM-DD` and `selections/YYYY-MM-DD`. |

The Mac app uploads there; the website only **listens** (read). It does **not** need Firebase Hosting.

---

## Part A — Get the right Firebase keys (website = Web app, not plist alone)

1. Open **[Firebase Console](https://console.firebase.google.com)** and select your project.

2. Click the **gear** → **Project settings**.

3. Scroll to **Your apps**.

4. If you see a **Web** app (`</>` icon), click it and find the **`firebaseConfig`** block (or “SDK setup and configuration” → npm).

5. If there is **no** Web app yet, click **Add app** → **Web** (`</>`), give it any nickname, **don’t** tick Hosting unless you want it — **Register app**. Copy the config object.

6. You need these **seven** values (names may match exactly):

   - `apiKey`
   - `authDomain`
   - `databaseURL` ← must be your **Realtime Database** URL (e.g. `https://YOUR_PROJECT-default-rtdb.firebaseio.com`)
   - `projectId`
   - `storageBucket`
   - `messagingSenderId`
   - `appId`

**About plist:** **`GoogleService-Info.plist`** (used by your Mac/iOS apps) is **not** the same as the main **`Info.plist`**. For the **website**, the **Web app** config in the console is the right source. If you copy `API_KEY` from `GoogleService-Info.plist` and something fails, switch to the **Web** `apiKey` from the console.

---

## Part B — Local test (your Mac)

1. Open the folder **`portfolio-site`** (on your Desktop).

2. Create or edit **`.env.local`** in that folder (same level as `package.json`).  
   **Never commit this file** — it’s already gitignored (so Git won’t show it; some tools hide it too).

   **You might already have this file** — it was created as an empty template earlier. It’s easy to miss because the name starts with a **dot** (`.env.local`), so Finder often hides it.

   **How to create or open it**

   - **Cursor / VS Code**  
     - In the sidebar, open the **`portfolio-site`** folder.  
     - **File → New File** (or right-click the folder → New File).  
     - Name it exactly: **`.env.local`** (including the leading dot).  
     - Save it in the same folder as **`package.json`** (not inside `app/`).  
     - If the editor hides ignored files, use **File → Open File…** (`Cmd+O`), press **`Cmd+Shift+.`** in the open dialog if needed to show hidden files, then pick `.env.local`.

   - **Terminal** (always works)

     ```bash
     cd ~/Desktop/portfolio-site
     open -e .env.local
     ```

     If macOS says the file doesn’t exist, create it first:

     ```bash
     cd ~/Desktop/portfolio-site
     touch .env.local
     open -e .env.local
     ```

   - **Finder**  
     - Open **`portfolio-site`**.  
     - Press **`Cmd + Shift + .`** (period) to **show hidden files**.  
     - Look for **`.env.local`**. Double-click to edit in TextEdit, or drag into Cursor.

3. Paste and fill in (no quotes needed around values):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=paste_apiKey_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=paste_authDomain_here
NEXT_PUBLIC_FIREBASE_DATABASE_URL=paste_databaseURL_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=paste_projectId_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=paste_storageBucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=paste_messagingSenderId_here
NEXT_PUBLIC_FIREBASE_APP_ID=paste_appId_here
```

4. Optional (only if you need a different “today” for the path):

```env
NEXT_PUBLIC_PICKS_DATE_TIMEZONE=Europe/London
```

5. In Terminal:

```bash
cd ~/Desktop/portfolio-site
npm install
npm run dev
```

6. In the browser open **`http://localhost:3000/best-picks`**.

   - If you see a **yellow “Firebase is not configured”** box, the `NEXT_PUBLIC_*` lines are missing, wrong, or the dev server wasn’t restarted after editing `.env.local`.
   - After a successful upload from the Mac for **today’s date** (UK), you should see picks or a clear empty message — not a permission error.

---

## Part C — Let the public site (Vercel) see Firebase

1. Go to **[vercel.com](https://vercel.com)** → your project (the one that deploys this repo).

2. **Settings** → **Environment Variables**.

3. Add **the same seven** variables as in Part B (`NEXT_PUBLIC_FIREBASE_API_KEY`, etc.), for **Production** (and **Preview** too if you want preview URLs to work).

4. **Save**, then trigger a **new deployment**:
   - **Deployments** → open the latest → **⋯** → **Redeploy**,  
   - or push any small commit to `main`.

   `NEXT_PUBLIC_*` values are baked in at **build** time — changing env vars without redeploying won’t update the live site.

5. Open **`https://YOUR_DOMAIN/best-picks`** and check again.

---

## Part D — Database rules (if you see permission errors)

1. Firebase Console → **Realtime Database** → **Rules**.

2. The browser is an **unauthenticated** client unless you add login later. For a **read-only public** proof of concept, rules must **allow read** on at least:

   - `unanimousExports/{date}`
   - `selections/{date}`

3. **Do not** leave wide-open read/write on production long-term. Tighten rules once you’re happy (e.g. read-only on those branches only).

If rules block reads, the page may show an error or stay empty.

---

## Part E — What “today” means

The site builds the path date as **calendar day** in **`Europe/London`** by default (`NEXT_PUBLIC_PICKS_DATE_TIMEZONE`).

So it looks for:

- `unanimousExports/2026-03-25` (example)
- `selections/2026-03-25`

That date should match how your **Mac app** names the upload (`DailySelection.date` / same key you use when uploading). If your “day” is always UK, you’re aligned. If not, change the timezone env var.

---

## Quick troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| Yellow “Firebase is not configured” | Missing/wrong env vars or no redeploy on Vercel |
| Permission / denied errors | Realtime Database **rules** blocking read |
| Empty lists, “no leaguePerformance” | No upload for that date, or no leagues hit the 70%+ threshold in the Mac app |
| Works locally, not on Vercel | Env vars not set on Vercel or **no redeploy** after adding them |

---

## Files in this project (for your reference)

| File | Role |
|------|------|
| `.env.example` | Lists variable **names** (no secrets). |
| `.env.local` | Your real keys — **local only**. |
| `lib/firebase-client.ts` | Initializes Firebase in the browser. |
| `lib/best-picks-firebase.ts` | Paths, date, league key matching Mac app. |
| `components/best-picks/FirebasePicksPanels.tsx` | Live listeners + UI. |

---

You can keep this file on your Desktop inside **`portfolio-site`** and open it in any text editor or Markdown preview whenever you’re setting up a new machine or Vercel project.
