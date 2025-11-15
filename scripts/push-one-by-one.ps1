$ErrorActionPreference = 'Continue'
Set-Location 'C:\Users\rauna\OneDrive\Desktop\ecoverify_app'

if (Test-Path .git/index.lock) { Remove-Item -Force .git/index.lock }

function Commit-Push {
  param([string[]]$Paths, [string]$Message)

  foreach ($p in $Paths) {
    # Stage new/modified or deleted paths
    cmd /c "git add -A -- `"$p`" 2>nul"
  }

  $staged = @(git diff --cached --name-only 2>$null)
  if (-not $staged -or $staged.Count -eq 0) {
    Write-Host "SKIP: $Message"
    return $false
  }

  git commit -m $Message
  if ($LASTEXITCODE -ne 0) {
    Write-Host "COMMIT FAIL: $Message"
    return $false
  }

  git push origin master
  if ($LASTEXITCODE -ne 0) {
    Write-Host "PUSH FAIL: $Message"
    exit 1
  }

  Write-Host "OK: $Message"
  return $true
}

$jobs = @(
  @{ p=@('CHECKLIST.md'); m='chore: remove obsolete CHECKLIST.md' },
  @{ p=@('COMPLETION_REPORT.txt'); m='chore: remove obsolete COMPLETION_REPORT.txt' },
  @{ p=@('DEPLOYMENT.md'); m='chore: remove obsolete DEPLOYMENT.md' },
  @{ p=@('INDEX.md'); m='chore: remove obsolete INDEX.md' },
  @{ p=@('PRESENTATION.md'); m='chore: remove obsolete PRESENTATION.md' },
  @{ p=@('PROJECT_SUMMARY.md'); m='chore: remove obsolete PROJECT_SUMMARY.md' },
  @{ p=@('START_HERE.txt'); m='chore: remove obsolete START_HERE.txt' },
  @{ p=@('setup.bat'); m='chore: remove legacy setup.bat script' },
  @{ p=@('SUBMIT_THIS.md'); m='docs: clear outdated SUBMIT_THIS notes' },
  @{ p=@('README.md'); m='docs: add EcoVerify project README' },
  @{ p=@('frontend/api/alternatives.ts'); m='chore: remove legacy alternatives API route' },
  @{ p=@('frontend/api/analytics.ts'); m='chore: remove legacy analytics API route' },
  @{ p=@('frontend/api/auth.ts'); m='chore: remove legacy auth API route' },
  @{ p=@('frontend/api/products.ts'); m='chore: remove legacy products API route' },
  @{ p=@('frontend/api/search.ts'); m='chore: remove legacy search API route' },
  @{ p=@('frontend/api/verify.ts'); m='chore: remove legacy verify API route' },
  @{ p=@('frontend/src/pages/Analytics.js'); m='chore: remove legacy Analytics page' },
  @{ p=@('frontend/src/pages/BrandDashboard.js'); m='chore: remove legacy BrandDashboard.js' },
  @{ p=@('frontend/src/pages/Home.js'); m='chore: remove legacy Home.js' },
  @{ p=@('frontend/src/pages/ProductDetails.js'); m='chore: remove legacy ProductDetails.js' },
  @{ p=@('frontend/src/pages/SearchProducts.js'); m='chore: remove legacy SearchProducts.js' },
  @{ p=@('frontend/src/pages/UserProfile.js'); m='chore: remove legacy UserProfile.js' },
  @{ p=@('frontend/src/App.js'); m='chore: remove legacy App.js' },
  @{ p=@('frontend/src/App.css'); m='chore: remove legacy App.css' },
  @{ p=@('frontend/src/index.js'); m='chore: remove legacy index.js entry' },
  @{ p=@('frontend/public/index.html'); m='chore: remove CRA public index.html' },
  @{ p=@('frontend/.gitignore'); m='chore: add Vite frontend gitignore' },
  @{ p=@('frontend/.oxlintrc.json'); m='chore: add oxlint config' },
  @{ p=@('frontend/vite.config.js'); m='build: add Vite config with Tailwind and path aliases' },
  @{ p=@('frontend/jsconfig.json'); m='build: add jsconfig path aliases' },
  @{ p=@('frontend/index.html'); m='build: add Vite index.html entry' },
  @{ p=@('frontend/package.json'); m='build: update package.json for Vite EcoVerify stack' },
  @{ p=@('frontend/package-lock.json'); m='build: add package-lock for reproducible installs' },
  @{ p=@('frontend/public/favicon.svg'); m='assets: add EcoVerify favicon' },
  @{ p=@('frontend/public/_redirects'); m='deploy: add SPA redirects for static hosts' },
  @{ p=@('frontend/vercel.json'); m='deploy: add Vercel SPA rewrite config' },
  @{ p=@('frontend/README.md'); m='docs: add frontend setup README' },
  @{ p=@('frontend/src/main.jsx'); m='feat: add React main entrypoint' },
  @{ p=@('frontend/src/index.css'); m='style: add Tailwind theme and base styles' },
  @{ p=@('frontend/src/lib/utils.js'); m='feat: add cn utility helper' },
  @{ p=@('frontend/src/components/ui/button.jsx'); m='feat: add Button UI component' },
  @{ p=@('frontend/src/components/ui/input.jsx'); m='feat: add Input UI component' },
  @{ p=@('frontend/src/components/ui/label.jsx'); m='feat: add Label UI component' },
  @{ p=@('frontend/src/components/ui/badge.jsx'); m='feat: add Badge UI component' },
  @{ p=@('frontend/src/components/ui/switch.jsx'); m='feat: add Switch UI component' },
  @{ p=@('frontend/src/components/ui/select.jsx'); m='feat: add Select UI component' },
  @{ p=@('frontend/src/components/ui/slider.jsx'); m='feat: add Slider UI component' },
  @{ p=@('frontend/src/components/ui/tabs.jsx'); m='feat: add Tabs UI component' },
  @{ p=@('frontend/src/components/ui/table.jsx'); m='feat: add Table UI component' },
  @{ p=@('frontend/src/components/data/productData.jsx'); m='feat: add mock product database and helpers' },
  @{ p=@('frontend/src/components/PageHeader.jsx'); m='feat: add PageHeader component' },
  @{ p=@('frontend/src/components/SectionCard.jsx'); m='feat: add SectionCard component' },
  @{ p=@('frontend/src/components/TrustScoreCircle.jsx'); m='feat: add TrustScoreCircle component' },
  @{ p=@('frontend/src/components/ScoreBreakdown.jsx'); m='feat: add ScoreBreakdown component' },
  @{ p=@('frontend/src/context/AuthContext.jsx'); m='feat: add auth and preferences context' },
  @{ p=@('frontend/src/lib/barcodeHistory.js'); m='feat: add BarcodeHistory local storage entity' },
  @{ p=@('frontend/src/lib/ai.js'); m='feat: add AI scan and EcoExplain helpers' },
  @{ p=@('frontend/src/components/Layout.jsx'); m='feat: add app Layout with desktop and mobile nav' },
  @{ p=@('frontend/src/components/home/QuickScan.jsx'); m='feat: add QuickScan photo barcode and search' },
  @{ p=@('frontend/src/components/home/BarcodeHistoryPanel.jsx'); m='feat: add BarcodeHistoryPanel component' },
  @{ p=@('frontend/src/components/home/EcoImpactWidget.jsx'); m='feat: add EcoImpactWidget community stats' },
  @{ p=@('frontend/src/components/home/TrendingProducts.jsx'); m='feat: add TrendingProducts component' },
  @{ p=@('frontend/src/components/home/CategoryShortcuts.jsx'); m='feat: add CategoryShortcuts component' },
  @{ p=@('frontend/src/components/home/RecentScans.jsx'); m='feat: add RecentScans component' },
  @{ p=@('frontend/src/components/home/DailyEcoTip.jsx'); m='feat: add DailyEcoTip component' },
  @{ p=@('frontend/src/pages/Home.jsx'); m='feat: add Home scan landing page' },
  @{ p=@('frontend/src/pages/ProductDetail.jsx'); m='feat: add ProductDetail analysis page' },
  @{ p=@('frontend/src/pages/Alternatives.jsx'); m='feat: add Alternatives comparison page' },
  @{ p=@('frontend/src/pages/History.jsx'); m='feat: add History timeline page' },
  @{ p=@('frontend/src/pages/Profile.jsx'); m='feat: add Profile and settings page' },
  @{ p=@('frontend/src/pages/BrandDashboard.jsx'); m='feat: add BrandDashboard and BrandAuth' },
  @{ p=@('frontend/src/pages/FAQ.jsx'); m='feat: add FAQ page with accordion categories' },
  @{ p=@('frontend/src/pages/Privacy.jsx'); m='feat: add Privacy Policy page' },
  @{ p=@('frontend/src/pages/Terms.jsx'); m='feat: add Terms of Service page' },
  @{ p=@('frontend/src/pages/DataUsage.jsx'); m='feat: add Data Usage Policy page' },
  @{ p=@('frontend/src/App.jsx'); m='feat: wire React Router for all EcoVerify pages' },
  @{ p=@('frontend/src/assets'); m='assets: add frontend image assets' },
  @{ p=@('scripts/push-one-by-one.ps1'); m='chore: add sequential commit push helper script' }
)

$count = 0
foreach ($job in $jobs) {
  $did = Commit-Push -Paths $job.p -Message $job.m
  if ($did) { $count++ }
}

Write-Host "DONE. Commits pushed this run: $count"
git log --oneline -25
Write-Host 'STATUS:'
git status --short
