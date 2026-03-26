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

## Part D — Owner admin: add your own picks + YouTube video (spoon-feed)

This is **optional**. Skip until you want picks or a video that **you** type in, instead of only what the Mac forecaster uploads.

**Idea in one sentence:** You open a **secret URL** on your site, paste a **password** you invented, fill a form, click **Save**. The server writes to Firebase; **`/best-picks`** updates automatically (no redeploy).

### D1 — What gets stored where

| Path in Realtime Database | Who writes it | What it’s for |
|---------------------------|---------------|----------------|
| `unanimousExports/{date}` | Mac app | Forecaster (leave it alone) |
| `selections/{date}` | Mac app | League performance map |
| **`manualExports/{date}`** | **Your admin page (via API)** | **Your** extra Over/Under picks + **YouTube** id + optional title |

The public page **merges** manual picks **on top of** (before) forecaster picks. Manual rows show **“Editor pick”** in the subtitle and always appear (they don’t need the “best performing league” filter).

The **Video** box on `/best-picks` reads **`youtubeId`** and **`videoTitle`** from the **same** `manualExports/{date}` object.

### D2 — One-time: create the admin password (you invent it)

1. Open **Passwords** (Apple) or any generator.
2. Create a **long random string** (e.g. 32+ characters). Example shape: `k7QmP9x...` (don’t use this one).
3. **Save it** somewhere safe (password manager). This value will be **`ADMIN_MANUAL_PICKS_KEY`**.  
   **Nobody else should know it.** It is not stored in Git.

### D3 — One-time: Firebase service account JSON (lets the *server* write Firebase)

The **browser** is not allowed to write `manualExports` (by design). **Vercel’s server** uses a **service account** file.

1. Open **[Firebase Console](https://console.firebase.google.com)** → your project.
2. **Gear** → **Project settings** → tab **Service accounts**.
3. Click **Generate new private key** → confirm → a **`.json`** file downloads.
4. **Open that file in TextEdit** (or Cursor). It is one JSON object with keys like `type`, `project_id`, `private_key`, etc.
5. **Copy the entire file contents** (from `{` to `}`).
6. **Minify to one line** (recommended for Vercel):
   - Easiest: paste into an online “JSON minify” tool, **or**
   - In Cursor: put the JSON in a temp file and remove the line breaks so it’s **one single line**.

You will paste that **one line** into Vercel as **`FIREBASE_SERVICE_ACCOUNT_JSON`** (next step).

**Security:** Treat this JSON like a password. Never commit it to GitHub. Never paste it in Discord/email.

### D4 — Add three environment variables on Vercel

1. **[vercel.com](https://vercel.com)** → your project → **Settings** → **Environment Variables**.

2. Add:

   | Name | Value | Notes |
   |------|--------|--------|
   | **`ADMIN_MANUAL_PICKS_KEY`** | The long password from **D2** | Production (and Preview if you use admin there) |
   | **`FIREBASE_SERVICE_ACCOUNT_JSON`** | The **one-line** JSON from **D3** | Same |
   | **`FIREBASE_DATABASE_URL`** (optional) | Same as **`NEXT_PUBLIC_FIREBASE_DATABASE_URL`** | Only if the server complains it can’t find the DB URL |

3. **Save**, then **Redeploy** the project (Deployments → ⋯ → Redeploy).  
   Server-side env vars are read at **runtime** for the API route, but a redeploy avoids confusion.

### D5 — One-time: Realtime Database rules for `manualExports`

Browsers should **read** `manualExports` (the public site does). Browsers should **not** **write** it (only your API uses Admin SDK).

1. Firebase Console → **Realtime Database** → **Rules**.
2. Ensure you have a block that **allows read** and **denies write** for clients, for example:

```json
"manualExports": {
  ".read": true,
  ".write": false
}
```

Merge that into your existing JSON (don’t duplicate the outer `"rules": { ... }` wrapper). More detail: **`docs/FIREBASE_RTDB_RULES_MANUAL_EXPORTS.md`**.

3. **Publish** rules.

### D6 — Local testing (optional)

If you run **`npm run dev`** on your Mac and want the admin API to work **locally**:

1. Add to **`.env.local`** (same folder as `package.json`):

```env
ADMIN_MANUAL_PICKS_KEY=paste_the_same_password_as_vercel
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...one line...}
```

2. Restart **`npm run dev`**.

### D7 — How you use it **every day** (the actual clicks)

1. **Open the admin page** in your browser (not linked from the public site — bookmark it):
   - Live site: **`https://YOUR_DOMAIN/admin/picks`**  
   - Local: **`http://localhost:3000/admin/picks`**

2. **Section “1. Admin key”**  
   - Paste **`ADMIN_MANUAL_PICKS_KEY`** (the password from D2).  
   - Optional: tick **Remember key in this browser** if you trust that computer.

3. **Section “2. Date & load”**  
   - **Date** must be **`YYYY-MM-DD`** and must match the **same “today”** the Best Picks page uses (UK calendar day by default — same as Part F below).  
   - Click **Load from Firebase** to pull whatever is already saved for that date (or empty lists).

4. **Section “3. Add picks”**  
   - Choose **Over 2.5** or **Under 2.5**.  
   - Fill **Home team** and **Away team** (required). League / country / kickoff optional.  
   - Click **Add pick to list**.  
   - Repeat as needed. **Remove** clears one row from the list (only in the form until you Save).

5. **Section “4. Video (YouTube)”**  
   - Paste a full **YouTube watch URL**, a **`youtu.be/...`** link, or the **11-character video ID**.  
   - Optional **Title** shows above the player on `/best-picks`.  
   - Leave the URL **empty** and Save to **remove** the video for that date.

6. Click **Save everything to Firebase**.  
   - You should see **Saved to manualExports/…**.  
   - Open **`/best-picks`** in another tab: your picks and video should show (may take a second).

### D8 — If something goes wrong

| Symptom | What to check |
|---------|----------------|
| **401 Unauthorized** | Admin key wrong, or missing **`Authorization`** (typo in key on Vercel). |
| **503 / Server misconfigured** | **`ADMIN_MANUAL_PICKS_KEY`** or **`FIREBASE_SERVICE_ACCOUNT_JSON`** missing on Vercel. |
| **500 with JSON error** | Service account JSON invalid (not one valid JSON object); or wrong **`FIREBASE_DATABASE_URL`**. |
| **Save works but nothing on /best-picks** | **Date** on admin form ≠ date the page uses (timezone). Compare with Part F. |
| **Permission denied** on public page | Rules must **allow read** on **`manualExports`**. |

---

## Part E — Database rules (if you see permission errors)

1. Firebase Console → **Realtime Database** → **Rules**.

2. The browser is an **unauthenticated** client unless you add login later. For a **read-only public** proof of concept, rules must **allow read** on at least:

   - `unanimousExports/{date}`
   - `selections/{date}`
   - **`manualExports/{date}`** (if you use the owner admin — Part D)

3. **Do not** leave wide-open read/write on production long-term. Tighten rules once you’re happy (e.g. read-only on those branches only). **Writes** to **`manualExports`** should stay **false** for clients if you use Part D (server writes only).

4. **“Submit Your Idea” form** (`/best-picks`): submissions are written by the **server** (same **`FIREBASE_SERVICE_ACCOUNT_JSON`** as the admin API) to **`predictionIdeaSubmissions/{pushId}`** by default. You do **not** need to allow browser read/write on that path; review entries in the Firebase console. Optional env: **`FIREBASE_PREDICTION_IDEA_SUBMISSIONS_ROOT`**.

If rules block reads, the page may show an error or stay empty.

---

## Part F — What “today” means

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
| Admin **401** / **503** | See **Part D8** (admin key + service account on Vercel) |
| Manual picks / video don’t show | Wrong **date** vs timezone; or rules block **read** on `manualExports` |
| Form submit **503** on Best Picks | **`FIREBASE_SERVICE_ACCOUNT_JSON`** (and DB URL) not set on Vercel — same as admin API |

---

## Files in this project (for your reference)

| File | Role |
|------|------|
| `.env.example` | Lists variable **names** (no secrets). |
| `.env.local` | Your real keys — **local only**. |
| `lib/firebase-client.ts` | Initializes Firebase in the browser. |
| `lib/best-picks-firebase.ts` | Paths, date, league key matching Mac app. |
| `lib/firebase-admin.ts` | Server-only Firebase Admin (writes `manualExports`). |
| `app/api/admin/manual-picks/route.ts` | Owner API (Bearer key + service account). |
| `app/api/prediction-idea/route.ts` | Public POST: saves “Submit Your Idea” form to RTDB (`predictionIdeaSubmissions`). |
| `app/api/admin/prediction-submissions/route.ts` | Owner GET (Bearer): lists submissions for `/admin/picks` sidebar. |
| `components/best-picks/PredictionIdeaForm.tsx` | Client form on the Best Picks prediction panel. |
| `components/admin/AdminPredictionSubmissions.tsx` | Admin page sidebar: submissions + auto-refresh. |
| `app/admin/picks/page.tsx` | Owner form UI. |
| `components/best-picks/FirebasePicksPanels.tsx` | Live listeners + UI (merged picks). |
| `components/best-picks/BestPicksVideo.tsx` | YouTube embed from `manualExports`. |
| `docs/FIREBASE_RTDB_RULES_MANUAL_EXPORTS.md` | Suggested rules for `manualExports`. |

---

You can keep this file on your Desktop inside **`portfolio-site`** and open it in any text editor or Markdown preview whenever you’re setting up a new machine or Vercel project.
