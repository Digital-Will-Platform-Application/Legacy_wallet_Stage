# EAS Login and Build Script
# This script helps you login and build the APK

Write-Host "🔐 EAS Login and APK Build Script" -ForegroundColor Green
Write-Host "==================================`n" -ForegroundColor Green

Set-Location $PSScriptRoot

Write-Host "Step 1: Checking current login status..." -ForegroundColor Cyan
$currentUser = eas whoami 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Currently logged in as: $currentUser" -ForegroundColor Yellow
    if ($currentUser -ne "kreddyking") {
        Write-Host "⚠️  Wrong account! Need to login as 'kreddyking'" -ForegroundColor Red
        Write-Host "Logging out..." -ForegroundColor Yellow
        eas logout
        Start-Sleep -Seconds 2
    } else {
        Write-Host "✅ Already logged in as kreddyking`n" -ForegroundColor Green
        $skipLogin = $true
    }
} else {
    Write-Host "Not logged in.`n" -ForegroundColor Yellow
    $skipLogin = $false
}

if (-not $skipLogin) {
    Write-Host "Step 2: Logging in to EAS..." -ForegroundColor Cyan
    Write-Host "Please enter your kreddyking credentials when prompted:`n" -ForegroundColor Yellow
    Write-Host "Username/Email: kreddyking (or your Expo email)" -ForegroundColor White
    Write-Host "Password: [Enter your password]`n" -ForegroundColor White
    
    eas login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ Login failed!" -ForegroundColor Red
        Write-Host "Possible issues:" -ForegroundColor Yellow
        Write-Host "  - Wrong username/email" -ForegroundColor White
        Write-Host "  - Wrong password" -ForegroundColor White
        Write-Host "  - Account doesn't exist" -ForegroundColor White
        Write-Host "`nTry:" -ForegroundColor Yellow
        Write-Host "  1. Go to https://expo.dev and verify your account" -ForegroundColor White
        Write-Host "  2. Reset password if needed" -ForegroundColor White
        Write-Host "  3. Use: eas login --web (for browser login)`n" -ForegroundColor White
        exit 1
    }
    
    Write-Host "`n✅ Login successful!`n" -ForegroundColor Green
}

Write-Host "Step 3: Verifying login..." -ForegroundColor Cyan
$verifiedUser = eas whoami 2>&1
if ($verifiedUser -match "kreddyking") {
    Write-Host "✅ Verified: Logged in as kreddyking`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: Not logged in as kreddyking (showing: $verifiedUser)" -ForegroundColor Yellow
    Write-Host "Continuing anyway...`n" -ForegroundColor Yellow
}

Write-Host "Step 4: Initializing EAS project..." -ForegroundColor Cyan
Write-Host "When prompted 'Would you like to create a project?', type 'y' and press Enter`n" -ForegroundColor Yellow

eas init

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Project initialization may have been skipped or failed" -ForegroundColor Yellow
    Write-Host "This is okay if the project already exists. Continuing...`n" -ForegroundColor Yellow
}

Write-Host "Step 5: Building Android APK..." -ForegroundColor Cyan
Write-Host "⏳ This will take 15-20 minutes`n" -ForegroundColor Yellow

eas build --platform android --profile preview

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Build started successfully!" -ForegroundColor Green
    Write-Host "📊 Monitor your build at:" -ForegroundColor Cyan
    Write-Host "   https://expo.dev/accounts/kreddyking/projects/digital-will-application/builds`n" -ForegroundColor White
    Write-Host "💡 You'll receive a download link when the build completes.`n" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Build failed. Check the error messages above." -ForegroundColor Red
    exit 1
}
