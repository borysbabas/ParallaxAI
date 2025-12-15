# Mobile App Architecture

## Overview

De Dark Tech mobile app is gebouwd als een **hybride applicatie** met Capacitor, wat betekent dat:

- De UI is gebouwd met **Vue 3 + TypeScript**
- Native functionaliteit wordt toegevoegd via **Capacitor plugins**
- Dezelfde codebase draait op **web, Android, en iOS**

```
┌─────────────────────────────────────────┐
│         Vue 3 Frontend (TypeScript)      │
│  ┌────────────┐  ┌──────────────────┐   │
│  │   Pages    │  │   Components     │   │
│  └─────┬──────┘  └────────┬─────────┘   │
│        │                  │              │
│  ┌─────▼──────────────────▼─────────┐   │
│  │         Services Layer          │   │
│  │  • webcamService                │   │
│  │  • cameraService (NEW)          │   │
│  │  • apiService (NEW)             │   │
│  └──────────┬──────────────────────┘   │
│             │                           │
└─────────────┼───────────────────────────┘
              │
    ┌─────────▼─────────┐
    │   Capacitor Core   │
    └─────────┬─────────┘
              │
    ┌─────────▼──────────────────────┐
    │    Native Platform Layer       │
    │  ┌──────────┐   ┌───────────┐  │
    │  │ Android  │   │    iOS    │  │
    │  │  (Java)  │   │  (Swift)  │  │
    │  └──────────┘   └───────────┘  │
    └────────────────────────────────┘
              │
    ┌─────────▼─────────┐
    │  FastAPI Backend   │
    │   (Python + AI)    │
    └────────────────────┘
```

---

## Component Architecture

### 1. Platform Detection Layer

**File**: `src/services/cameraService.ts`

Detecteert of de app draait op web of native platform:

```typescript
import {Capacitor} from '@capacitor/core';

const isNative = Capacitor.isNativePlatform(); // true op Android/iOS
const platform = Capacitor.getPlatform();      // 'web', 'android', 'ios'
```

### 2. Camera Abstraction

**Two-Path Strategy:**

```
User clicks "Take Photo"
         │
         ▼
    Is Native?
    ┌───┴───┐
    │       │
   YES     NO
    │       │
    ▼       ▼
Native   Web API
Camera   (getUserMedia)
```

**Native Path** (`cameraService.ts`):

```typescript
await Camera.getPhoto({
    source: CameraSource.Camera,  // Open camera
    resultType: CameraResultType.DataUrl,
    quality: 90
});
```

**Web Path** (`webcamService.ts`):

```typescript
await navigator.mediaDevices.getUserMedia({
    video: {facingMode: 'user'}
});
// Draw to canvas → convert to blob
```

### 3. API Communication

**File**: `src/services/apiService.ts`

Intelligente URL selectie:

```typescript
function getApiBaseUrl() {
    if (isNativePlatform) {
        // Mobile uses production URL by default
        return 'https://parallax-darktech.nl';
    } else {
        // Web can use local backend
        return 'http://localhost:8000';
    }
}
```

**CORS Configuration** (`backend/main.py`):

```python
origins = [
    "capacitor://localhost",  # iOS
    "http://localhost",  # Android
    # ... web origins
]
```

---

## Data Flow

### Camera → AI Analysis Flow

```
┌──────────────┐
│     User     │
│ Takes Photo  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│   SelfieCamera.vue       │
│   - takeLatestPicture()  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│   webcamService.ts       │
│   - Platform detection   │
│   - Camera routing       │
└──────┬───────────────────┘
       │
   ┌───┴────┐
   │        │
Native    Web
   │        │
   ▼        ▼
┌─────┐  ┌────────┐
│Camera│ │getUserMedia│
└──┬──┘  └───┬────┘
   │         │
   └────┬────┘
        │
        ▼
   ┌─────────┐
   │  Blob   │
   └────┬────┘
        │
        ▼
┌────────────────────┐
│ analyzeImage()     │
│ - Create FormData  │
│ - POST to backend  │
└────────┬───────────┘
         │
         ▼
┌──────────────────────┐
│  FastAPI Backend     │
│  /assumptions/generate│
└────────┬─────────────┘
         │
         ▼
┌──────────────────┐
│   AI Model       │
│ (Gemini/Claude)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Assumptions     │
│  Response JSON   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────┐
│ AssumptionsPanel.vue │
│ - Display results    │
│ - Show bias warnings │
└──────────────────────┘
```

---

## File Structure

```
frontend/
├── capacitor.config.ts        # Capacitor configuration
├── android/                   # Android native project (auto-generated)
├── ios/                       # iOS native project (auto-generated)
├── src/
│   ├── App.vue               # Root component (splash screen, status bar)
│   ├── pages/
│   │   └── SelfieCamera.vue  # Main camera page
│   ├── services/
│   │   ├── cameraService.ts  # NEW: Native camera abstraction
│   │   ├── apiService.ts     # NEW: API URL management
│   │   └── webcamService.ts  # UPDATED: Unified camera logic
│   └── components/
│       └── AssumptionsPanel.vue
└── dist/                     # Built web assets (copied to native)
```

---

## Key Design Decisions

### 1. **Hybrid Architecture (Web + Native)**

**Waarom?**

- Hergebruik bestaande Vue codebase
- Snellere development (één codebase voor alle platforms)
- Makkelijker onderhoud

**Trade-offs:**

- Niet 100% native performance
- Grotere app size dan pure native
- Beperkt tot Capacitor plugins

### 2. **Two-Path Camera Implementation**

**Waarom?**

- Web heeft geen toegang tot native camera API
- Native camera geeft betere UX (instant, no countdown)
- Platform-specific optimalisaties mogelijk

**Implementation:**

```typescript
if (isNative) {
    // Direct camera access
    const photo = await Camera.getPhoto();
} else {
    // Web: stream → countdown → capture
    await startWebcam();
    countdown(3);
    captureFromCanvas();
}
```

### 3. **API URL Resolution**

**Probleem:** Android emulator kan `localhost` niet bereiken.

**Oplossing:**

```typescript
// Development: gebruik lokaal IP
server: {
    url: 'http://192.168.1.XXX:5173'
}

// Production: gebruik server URL
VITE_API_URL = https
://parallax-darktech.nl
```

---

## Platform-Specific Considerations

### Android

- **Permissions**: Camera permission auto-gevraagd door Capacitor
- **Localhost**: Gebruik `10.0.2.2` voor emulator → host machine
- **File Access**: Capacitor handelt paths automatisch af
- **Status Bar**: Dark theme, zwarte achtergrond

### iOS (toekomstig)

- **Permissions**: Info.plist moet camera usage description bevatten
- **Localhost**: Werkt direct op simulator
- **File Access**: Sandboxed, Capacitor abstraheert
- **Status Bar**: Consistent met Android styling

### Web

- **Permissions**: Browser vraagt camera permission
- **No Native Features**: Splash screen, status bar niet beschikbaar
- **Fallback UI**: Andere buttons (file upload i.p.v. gallery)

---

## Performance Optimizations

### 1. **Lazy Loading**

```typescript
// Only import native plugins when needed
if (Capacitor.isNativePlatform()) {
    const {Camera} = await import('@capacitor/camera');
}
```

### 2. **Image Compression**

```typescript
Camera.getPhoto({
    quality: 90,  // Balance tussen kwaliteit en size
    correctOrientation: true,  // Auto-rotate
});
```

### 3. **Async Operations**

```typescript
// Non-blocking camera operations
isLoading.value = true;
const photo = await takePhoto();
isLoading.value = false;
```

---

## Security Considerations

### 1. **HTTPS op Production**

```typescript
server: {
    androidScheme: 'https',  // Force HTTPS
}
```

### 2. **No Sensitive Data in LocalStorage**

- Tokens alleen in cookies (HttpOnly)
- Images niet persistent opslaan

### 3. **API Validation**

- Backend valideert alle image uploads
- Rate limiting op AI endpoints

---

## Testing Strategy

### Unit Tests

- Camera service mock responses
- API service network handling
- Platform detection logic

### Integration Tests

- Camera → Analysis flow
- Error handling scenarios
- Network failure recovery

### Manual Testing

- **Web**: Chrome, Firefox, Safari
- **Android**: Emulator + real device (meerdere Android versies)
- **iOS**: Simulator + real device (als beschikbaar)

---

## Future Improvements

### Mogelijke Uitbreidingen:

1. **Offline Support**
    - Cache recent assumptions
    - Queue photos for later upload

2. **Push Notifications**
    - Analysis complete notifications
    - New features announcements

3. **Biometric Auth**
    - Fingerprint/Face ID voor login

4. **Advanced Camera Features**
    - Flash control
    - Focus/exposure control
    - Multiple photo capture

5. **Gallery Management**
    - View history
    - Delete old photos
    - Export results

---

## Related Documentation

- [Setup Guide](./setup.md) - How to run the mobile app
- [API Documentation](../api.md) - Backend endpoints

---

## Questions?

Voor technische vragen over de mobile implementatie, check:

- Capacitor Discord
- Stack Overflow `[capacitor]` tag
- Project issue tracker

