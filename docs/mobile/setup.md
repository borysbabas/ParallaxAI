# Mobile App Setup Guide

## Prerequisites

### Voor Android Development

- **Android Studio** (laatste versie): [Download](https://developer.android.com/studio)
- **Java Development Kit (JDK) 17+**: Komt meestal met Android Studio
- **Node.js 18+**: Voor het builden van de Vue app
- **USB Debugging** enabled op je Android device (optioneel, voor testen op echt device)

### Voor iOS Development (alleen Mac)

- **Xcode 14+**: [Mac App Store](https://apps.apple.com/app/xcode/id497799835)
- **CocoaPods**: `sudo gem install cocoapods`
- **Xcode Command Line Tools**: `xcode-select --install`

---

## Eerste Keer Setup

### 1. Installeer Dependencies

```bash
cd frontend
npm install
```

Dit installeert automatisch:

- `@capacitor/core` - Capacitor framework
- `@capacitor/cli` - Command line tools
- `@capacitor/camera` - Native camera plugin
- `@capacitor/android` - Android platform
- `@capacitor/status-bar` - Status bar styling
- `@capacitor/splash-screen` - Splash screen control

### 2. Build de Vue App

```bash
npm run build
```

Dit creëert de `dist` folder met je gecompileerde app.

### 3. Sync met Capacitor

```bash
npx cap sync
```

Dit kopieert je web assets naar de native projecten en update plugins.

---

## Development Workflow

### Option A: Web Development (snelst voor UI development)

```bash
npm run dev
```

Open browser op `http://localhost:5173`. Camera werkt via web APIs.

### Option B: Android Emulator

1. **Start Android Emulator in Android Studio**
    - Open Android Studio
    - Tools → Device Manager
    - Start een virtual device

2. **Run de app**
   ```bash
   npm run cap:run:android
   ```

### Option C: Live Reload op Android Device/Emulator

Voor snelle development met hot reload:

**Methode 1: Automatisch (Aanbevolen)**

```bash
npm run cap:run:android:live
```

Dit start automatisch:

- De Vite dev server op je lokale IP
- Live reload naar de Android app
- Hot module replacement (HMR)

**⚠️ Belangrijke Notes:**

- Zorg dat je Android device/emulator op hetzelfde netwerk zit als je computer
- Je firewall moet port 5173 toestaan
- De eerste keer kan het even duren om je lokale IP te detecteren

**Methode 2: Manueel (voor advanced gebruikers)**

1. **Start Vue dev server**
   ```bash
   npm run dev
   ```

2. **Vind je lokale IP address**
    - Windows: `ipconfig` (zoek naar IPv4 Address, bijv. `192.168.1.100`)
    - Mac/Linux: `ifconfig` (zoek naar inet, bijv. `192.168.1.100`)

3. **Update capacitor.config.ts tijdelijk:**
   ```typescript
   server: {
     url: 'http://192.168.1.100:5173', // Vervang met je lokale IP
     cleartext: true
   }
   ```

4. **Sync en run**
   ```bash
   npx cap sync
   npx cap run android
   ```

Nu zie je wijzigingen direct in de app!

**⚠️ Vergeet niet de `server` config te verwijderen voor production builds!**

### Option D: Physical Android Device

1. **Enable USB Debugging op je phone:**
    - Settings → About Phone
    - Tap "Build Number" 7x om Developer Options te activeren
    - Settings → Developer Options → USB Debugging (enable)

2. **Connect via USB**

3. **Run**
   ```bash
   npm run cap:run:android
   ```

Android Studio detecteert automatisch je device.

---

## Build Commands Uitleg

| Command                        | Beschrijving                                     |
|--------------------------------|--------------------------------------------------|
| `npm run dev`                  | Start Vite dev server voor web development       |
| `npm run build`                | Build production Vue app                         |
| `npm run build-development`    | Build met development settings                   |
| `npx cap sync`                 | Sync web assets en plugins naar native projecten |
| `npx cap open android`         | Open Android Studio                              |
| `npm run cap:run:android`      | Build + sync + run op Android                    |
| `npm run cap:run:android:live` | Run met live reload (HMR enabled)                |

---

## Native Camera Testen

De app detecteert automatisch of je op een native platform draait:

### Op Web (Browser)

- Toont "Start Camera" button
- Gebruikt web camera API (`getUserMedia`)
- Countdown van 3 seconden voor foto

### Op Android/iOS

- Toont "Take Photo" button
- Opent native camera direct
- Toont "Choose from Gallery" voor gallerij
- Geen countdown nodig

---

## Troubleshooting

### "SDK location not found" error

**Probleem**: `ANDROID_HOME` environment variable niet gezet of `local.properties` ontbreekt.
**Oplossing**:

**Optie 1: Via local.properties (snelst)**
Maak `frontend/android/local.properties`:

```properties
sdk.dir=C\:\\Users\\JouwGebruikersnaam\\AppData\\Local\\Android\\Sdk
```

**Optie 2: Via Environment Variable (permanent)**

1. Open "System Properties" → "Environment Variables"
2. Nieuwe System Variable:
    - Name: `ANDROID_HOME`
    - Value: `C:\Users\JouwGebruikersnaam\AppData\Local\Android\Sdk`
3. Herstart terminal
4. Verifieer: `echo $env:ANDROID_HOME`

**Vind je SDK locatie:**

- Windows standaard: `C:\Users\<username>\AppData\Local\Android\Sdk`
- In Android Studio: Settings → Appearance & Behavior → System Settings → Android SDK

### "Camera not working" op emulator

**Probleem**: Sommige emulators hebben geen camera support.
**Oplossing**: Gebruik een nieuwer system image met camera support, of test op echt device.

### "Camera not showing" of "Black screen"

**Probleem**: De camera output is niet zichtbaar in de browser.

**Mogelijke oorzaken & oplossingen:**

**1. Browser permissions niet gegeven**

- Check of je browser vraagt om camera toegang
- Kijk in browser settings → Site settings → Camera
- Sommige browsers vereisen HTTPS voor camera toegang (gebruik `localhost` voor development)

**2. Camera al in gebruik**

- Sluit andere applicaties die de camera gebruiken
- Close andere browser tabs met camera toegang
- Herstart je browser

**3. Verkeerde camera geselecteerd**

- Sommige devices hebben meerdere camera's
- Check browser DevTools → Console voor errors
- Probeer een andere browser

**4. Platform detection issues**

- Op web: Camera moet automatisch starten
- Op native: Je moet op "Take Photo" klikken (gebruikt native camera)
- Check of `isNative` correct wordt gedetecteerd in DevTools

**Debug stappen:**

```bash
# Start dev server
npm run dev

# Open browser console (F12)
# Check voor errors zoals:
# - "Permission denied"
# - "NotFoundError: Requested device not found"
# - "NotAllowedError: Permission denied"
```

**Test commando's:**

```javascript
// In browser console
navigator.mediaDevices.getUserMedia({video: true})
	.then(stream => console.log('Camera works!', stream))
	.catch(error => console.error('Camera error:', error))
```

### "Cannot connect to backend"

**Probleem**: Android emulator kan localhost niet bereiken.
**Oplossie**:

- Gebruik je lokale IP address (zie Live Reload instructies)
- Of gebruik `10.0.2.2` voor Android emulator
- Check CORS settings in backend

### "Build failed" errors

**Probleem**: Gradle/Android build errors.
**Oplossing**:

```bash
cd android
./gradlew clean
cd ..
npx cap sync
```

### "Plugin not found" errors

**Probleem**: Plugin niet geïnstalleerd.
**Oplossing**:

```bash
npm install @capacitor/camera @capacitor/status-bar @capacitor/splash-screen
npx cap sync
```

---

## Tips voor Development

1. **Start met web development** voor snelle UI iteraties
2. **Test native features regelmatig** om platform-specifieke issues te vangen
3. **Use live reload** voor snelle feedback loop
4. **Test op echt device** voor beste performance indicatie
5. **Check Android Studio Logcat** voor native errors

---

## Next Steps

Na setup:

1. Test camera functionaliteit
2. Test backend connectie
3. Test AI assumptions flow
4. Bekijk [Architecture Documentation](./architecture.md)

---

## Handige Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Capacitor Camera Plugin](https://capacitorjs.com/docs/apis/camera)
- [Debugging on Android](https://capacitorjs.com/docs/android/debugging)

