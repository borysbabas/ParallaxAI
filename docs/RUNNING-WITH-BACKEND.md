# 🚀 Running Dark Tech with Backend and iOS

This guide shows you how to run both the backend server and the iOS app together.

## Quick Start (3 Steps)

### 1. Start the Backend Server

Open a **new terminal** window and run:

```bash
cd /Users/borys/HvA/dark-tech
./start-backend.sh
```

**Expected output:**
```
✅ Backend starting on http://0.0.0.0:8000
✅ API accessible at http://localhost:8000
✅ API docs at http://localhost:8000/docs
```

Leave this terminal running!

### 2. Start the iOS App

Open a **second terminal** window and run:

```bash
cd /Users/borys/HvA/dark-tech
./start-ios.sh
```

This will:
- Build the Vue frontend
- Sync to iOS
- Open Xcode automatically

### 3. Run in Xcode

When Xcode opens:
1. Select an iPhone simulator from the dropdown (e.g., "iPhone 15 Pro")
2. Click the Play button (▶️) or press `Cmd + R`

The simulator will launch with your app, connected to the backend!

---

## Alternative: Manual Steps

If you prefer to run commands manually:

### Terminal 1: Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Terminal 2: iOS Build & Run
```bash
cd frontend
eval "$(fnm env)"
fnm use 22
npm run build
npx cap sync ios
npx cap open ios
```

Then run from Xcode as described above.

---

## iOS Simulator Error Fix

If you get the error:
```
ERR_UNKNOWN: There was an error launching app on simulator
```

### Solution 1: Clean and Rebuild

```bash
cd frontend

# Remove old build artifacts
rm -rf ios/App/build

# Uninstall app from simulator
xcrun simctl uninstall booted nl.parallax.darktech

# Rebuild
npm run build
npx cap sync ios
```

Then run from Xcode again.

### Solution 2: Reset Simulator

If the error persists, reset the simulator:

```bash
# Shutdown all simulators
xcrun simctl shutdown all

# Erase the problematic simulator
xcrun simctl erase all
```

Then try running the app again from Xcode.

### Solution 3: Build Directly in Xcode

1. Open the project: `npx cap open ios`
2. In Xcode menu: **Product → Clean Build Folder** (Shift + Cmd + K)
3. **Product → Build** (Cmd + B)
4. **Product → Run** (Cmd + R)

---

## Development Workflow

### Best Practice: Live Reload

For the fastest development experience:

**Terminal 1: Backend** (keep running)
```bash
./start-backend.sh
```

**Terminal 2: Frontend Dev Server** (keep running)
```bash
./start-frontend.sh
```

**Terminal 3: iOS with Live Reload**
```bash
cd frontend
npm run cap:run:ios:live
```

Now any changes to your Vue files will automatically reload in the iOS simulator!

---

## Checking if Backend is Running

Test the backend:
```bash
curl http://localhost:8000/status
```

Or open in browser: http://localhost:8000/docs

---

## Environment Configuration

### Backend (.env)
Location: `/Users/borys/HvA/dark-tech/backend/.env`

Already configured with:
- ✅ GEMINI_API_KEY
- ✅ Database credentials
- ✅ JWT secret

### Frontend (.env.development)
Location: `/Users/borys/HvA/dark-tech/frontend/.env.development`

Already configured with:
- ✅ VITE_API_URL=http://localhost:8000

### CORS Configuration

The backend is already configured to accept requests from:
- ✅ `capacitor://localhost` (iOS)
- ✅ `http://localhost` (Android)
- ✅ `http://localhost:3000` (Web dev)

---

## Troubleshooting

### "Cannot connect to backend" in iOS app

**Check 1:** Is backend running?
```bash
curl http://localhost:8000/status
```

**Check 2:** Is the frontend env file correct?
```bash
cat frontend/.env.development
# Should show: VITE_API_URL=http://localhost:8000
```

**Check 3:** Did you rebuild after changing env?
```bash
cd frontend
npm run build
npx cap sync ios
```

### "Port 8000 already in use"

Kill the existing process:
```bash
lsof -ti:8000 | xargs kill -9
```

Then start backend again.

### "Node version error" when running iOS

Make sure fnm is using Node 22:
```bash
eval "$(fnm env)"
fnm use 22
node --version  # Should show v22.x.x
```

---

## Useful npm Scripts

All these work from the `frontend/` directory:

```bash
# iOS
npm run cap:open:ios          # Open in Xcode
npm run cap:run:ios          # Build and run
npm run cap:run:ios:live     # Run with live reload

# Android
npm run cap:open:android     # Open in Android Studio
npm run cap:run:android      # Build and run

# Build
npm run build                # Production build
npm run build-development    # Development build
npm run dev                  # Web dev server
```

---

## Summary

**To run the full stack:**

1. **Terminal 1:** `./start-backend.sh` (backend at :8000)
2. **Terminal 2:** `./start-ios.sh` (builds and opens Xcode)
3. **Xcode:** Select simulator → Press Play (▶️)

Your iOS app will now connect to your local backend! 🎉

