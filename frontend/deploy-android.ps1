# Dark Tech - Android Deployment Helper
# This script waits for the emulator to be ready before deploying

Write-Host "Dark Tech Android Deployment Helper" -ForegroundColor Cyan
Write-Host ""

# Configuration
$adbPath = "C:\Users\Borys\AppData\Local\Android\Sdk\platform-tools\adb.exe"
$apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
$packageName = "nl.parallax.darktech"
$activityName = "$packageName/.MainActivity"
$maxWaitTime = 60

# Check if ADB exists
if (-not (Test-Path $adbPath))
{
    Write-Host "ERROR: ADB not found at: $adbPath" -ForegroundColor Red
    Write-Host "Please update the adbPath variable in this script." -ForegroundColor Yellow
    exit 1
}

# Function to check if device is ready
function Test-DeviceReady
{
    param($deviceId)

    try
    {
        $bootComplete = & $adbPath -s $deviceId shell getprop sys.boot_completed 2> $null
        return $bootComplete -eq "1"
    }
    catch
    {
        return $false
    }
}

# Get list of devices
Write-Host "Checking for connected devices..." -ForegroundColor Yellow
$devices = & $adbPath devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" }

if (-not $devices)
{
    Write-Host "ERROR: No devices found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please start an emulator or connect a device:" -ForegroundColor Yellow
    Write-Host "  1. Open Android Studio" -ForegroundColor Gray
    Write-Host "  2. Tools -> Device Manager" -ForegroundColor Gray
    Write-Host "  3. Start an emulator" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Parse device ID
$deviceLine = $devices[0]
$deviceId = ($deviceLine -split '\s+')[0]

Write-Host "SUCCESS: Found device: $deviceId" -ForegroundColor Green
Write-Host ""

# Wait for device to be ready
Write-Host "Waiting for device to be ready..." -ForegroundColor Yellow
$waited = 0
$isReady = $false

while ($waited -lt $maxWaitTime)
{
    if (Test-DeviceReady -deviceId $deviceId)
    {
        $isReady = $true
        break
    }

    Write-Host "  Still waiting... ($waited/$maxWaitTime seconds)" -ForegroundColor Gray
    Start-Sleep -Seconds 2
    $waited += 2
}

if (-not $isReady)
{
    Write-Host "ERROR: Device not ready after $maxWaitTime seconds" -ForegroundColor Red
    Write-Host "Please wait for the emulator to fully boot and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "SUCCESS: Device is ready!" -ForegroundColor Green
Write-Host ""

# Check if APK exists
if (-not (Test-Path $apkPath))
{
    Write-Host "WARNING: APK not found at: $apkPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Building the app..." -ForegroundColor Yellow
    npm run build
    npx cap sync

    if (-not (Test-Path $apkPath))
    {
        Write-Host "ERROR: Build failed or APK still not found" -ForegroundColor Red
        exit 1
    }
}

# Install APK
Write-Host "Installing APK..." -ForegroundColor Yellow
try
{
    $installResult = & $adbPath -s $deviceId install -r $apkPath 2>&1

    if ($installResult -match "Success")
    {
        Write-Host "SUCCESS: App installed successfully!" -ForegroundColor Green
    }
    else
    {
        Write-Host "WARNING: Install result: $installResult" -ForegroundColor Yellow
    }
}
catch
{
    Write-Host "ERROR: Installation failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Start the app
Write-Host "Starting the app..." -ForegroundColor Yellow
try
{
    $startResult = & $adbPath -s $deviceId shell am start -n $activityName 2>&1

    if ($startResult -match "Starting")
    {
        Write-Host "SUCCESS: App started successfully!" -ForegroundColor Green
    }
    else
    {
        Write-Host "WARNING: Start result: $startResult" -ForegroundColor Yellow
    }
}
catch
{
    Write-Host "ERROR: Failed to start app: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check your emulator/device - the Dark Tech app should be running!" -ForegroundColor Green
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  View logs:    adb logcat | Select-String 'Capacitor'" -ForegroundColor Gray
Write-Host "  Restart app:  adb -s $deviceId shell am start -n $activityName" -ForegroundColor Gray
Write-Host "  Stop app:     adb -s $deviceId shell am force-stop $packageName" -ForegroundColor Gray
Write-Host ""
