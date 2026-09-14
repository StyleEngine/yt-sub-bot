# YouTube Sub Bot — Render Deployment

## Deploy to Render (one click)

1. Push these files to a GitHub repo:
   - `index.html`
   - `server.js`
   - `package.json`
   - `render.yaml`
   - `start.sh`
   - `README.md`

2. Go to [https://render.com](https://render.com) → **New** → **Web Service** → **Connect your repo**

3. Render auto-detects `render.yaml` and fills in the config:
   - **Build command:** `npm install`
   - **Start command:** `bash start.sh`
   - **Instance size:** Free tier works

4. Click **Create Web Service**. Render will:
   - Install Node.js dependencies (express, playwright, sqlite3)
   - Install Chromium browser via `start.sh`
   - Start the server

5. Once deployed, open the Render URL (e.g. `https://yt-sub-bot.onrender.com`).
   - The dashboard loads at `/`
   - Login with: **lemax1426@gmail.com** / **Meadow5256**
   - Add orders and they'll be processed by Playwright in the background

## Local development

```bash
npm install
npx playwright install chromium
node server.js
# Open http://localhost:3001
```

## Notes

- The database is stored in `/tmp` on Render (ephemeral). Orders persist while the service is running but will reset on restart. For persistent storage, connect a Render PostgreSQL database.
- Free-tier Render instances spin down after inactivity. The first request after idle may take ~30 seconds to wake up.
- Playwright Chromium is installed fresh on each deploy via `start.sh`.