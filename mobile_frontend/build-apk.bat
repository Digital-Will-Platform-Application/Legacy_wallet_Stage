@echo off
echo.
echo ========================================
echo   Android APK Build Script
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Checking EAS login...
eas whoami
if errorlevel 1 (
    echo.
    echo ERROR: Not logged in. Please run: eas login
    pause
    exit /b 1
)

echo.
echo Step 2: Configuring EAS project...
echo When prompted, type 'y' and press Enter
echo.
eas build:configure

if errorlevel 1 (
    echo.
    echo ERROR: Project configuration failed
    pause
    exit /b 1
)

echo.
echo Step 3: Building Android APK...
echo This will take 15-20 minutes. Building in Expo cloud...
echo.
eas build --platform android --profile preview

if errorlevel 1 (
    echo.
    echo ERROR: Build failed. Check the error messages above.
    pause
    exit /b 1
) else (
    echo.
    echo SUCCESS: Build started!
    echo Monitor your build at:
    echo https://expo.dev/accounts/sivayya/projects/digital-will-application/builds
    echo.
    echo You'll receive a download link when the build completes.
    echo.
)

pause
