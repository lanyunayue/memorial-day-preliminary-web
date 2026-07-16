<#
.SYNOPSIS
    Cleanup script for Web JS files accidentally written to E:\lifetime HarmonyOS project.
.DESCRIPTION
    Default mode is -WhatIf (preview only). Use -Apply to actually delete files.
    Only targets confirmed contamination paths. Does NOT delete Git-tracked files.
.PARAMETER Apply
    Actually perform deletion. Without this flag, runs in preview/WhatIf mode only.
.EXAMPLE
    .\cleanup-lifetime-web-contamination.ps1           # Preview only
    .\cleanup-lifetime-web-contamination.ps1 -Apply    # Actually delete
#>
param(
    [switch]$Apply
)

$ErrorActionPreference = 'Stop'
$targetRoot = 'E:\lifetime'
$contaminatedDirs = @(
    'src\reminders',
    'src\sync'
)
$knownFiles = @(
    'src\reminders\reminder-engine.js',
    'src\reminders\reminder-repository.js',
    'src\reminders\reminder-scheduler.js',
    'src\reminders\reminder-status.js',
    'src\reminders\calendar-bridge.js',
    'src\sync\device-identity.js',
    'src\sync\crypto-envelope.js',
    'src\sync\sync-client.js',
    'src\sync\sync-conflict.js',
    'src\sync\sync-status.js'
)

function Get-FileSha256($path) {
    if (-not (Test-Path $path -PathType Leaf)) { return 'NOT_FOUND' }
    return (Get-FileHash -Path $path -Algorithm SHA256).Hash.ToLower()
}

function Test-GitTracked($repoRoot, $relativePath) {
    Push-Location $repoRoot
    try {
        $result = & git ls-files --error-unmatch $relativePath 2>&1
        return ($LASTEXITCODE -eq 0)
    } catch {
        return $false
    } finally {
        Pop-Location
    }
}

Write-Host "=== SHIKE v2.0.0-rc5.1 Web Contamination Cleanup ===" -ForegroundColor Cyan
Write-Host "Mode: $(if($Apply){'APPLY (will delete)'}else{'WHATIF (preview only)'})" -ForegroundColor $(if($Apply){'Red'}else{'Yellow'})
Write-Host ""

if (-not (Test-Path $targetRoot)) {
    Write-Host "Target root $targetRoot does not exist. Nothing to do." -ForegroundColor Green
    exit 0
}

# Check git status of E:\lifetime
Push-Location $targetRoot
$gitRepo = $false
try {
    $null = & git rev-parse --git-dir 2>&1
    if ($LASTEXITCODE -eq 0) {
        $gitRepo = $true
        Write-Host "[INFO] E:\lifetime is a Git repository." -ForegroundColor Gray
        $gitStatus = & git status --short 2>&1
        if ($gitStatus) {
            Write-Host "[WARN] E:\lifetime has uncommitted changes (first 10 lines):" -ForegroundColor Yellow
            $gitStatus | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
        }
    }
} catch {
    Write-Host "[INFO] E:\lifetime is not a Git repository (or git unavailable)." -ForegroundColor Gray
}
Pop-Location

Write-Host ""
Write-Host "=== Scanning contaminated files ===" -ForegroundColor Cyan

$filesToDelete = @()
$filesSkipped = @()

foreach ($relPath in $knownFiles) {
    $fullPath = Join-Path $targetRoot $relPath
    if (Test-Path $fullPath -PathType Leaf) {
        $sha = Get-FileSha256 $fullPath
        $tracked = if ($gitRepo) { Test-GitTracked $targetRoot $relPath } else { $false }
        $item = [PSCustomObject]@{
            Path = $relPath
            FullPath = $fullPath
            SHA256 = $sha
            GitTracked = $tracked
            LastWriteTime = (Get-Item $fullPath).LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
            Length = (Get-Item $fullPath).Length
        }
        if ($tracked) {
            Write-Host "[SKIP - GIT TRACKED] $relPath  SHA=$($sha.Substring(0,12))...  Size=$($item.Length)B  Modified=$($item.LastWriteTime)" -ForegroundColor Red
            $filesSkipped += $item
        } else {
            Write-Host "[DELETE]         $relPath  SHA=$($sha.Substring(0,12))...  Size=$($item.Length)B  Modified=$($item.LastWriteTime)" -ForegroundColor $(if($Apply){'Yellow'}else{'Gray'})
            $filesToDelete += $item
        }
    } else {
        Write-Host "[NOT FOUND]      $relPath" -ForegroundColor DarkGray
    }
}

Write-Host ""
Write-Host "=== Directory scan ===" -ForegroundColor Cyan
foreach ($dir in $contaminatedDirs) {
    $fullDir = Join-Path $targetRoot $dir
    if (Test-Path $fullDir -PathType Container) {
        $remainingFiles = Get-ChildItem $fullDir -File -Recurse -ErrorAction SilentlyContinue
        Write-Host "[DIR EXISTS] $dir ($($remainingFiles.Count) files)" -ForegroundColor Yellow
        # Check for unexpected files (not in knownFiles list)
        foreach ($f in $remainingFiles) {
            $rel = $f.FullName.Substring($targetRoot.Length + 1).Replace('\','/')
            if ($knownFiles -notcontains $rel) {
                Write-Host "  [UNEXPECTED] $rel ($($f.Length)B)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "[DIR GONE]   $dir" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host "  Files to delete: $($filesToDelete.Count)" -ForegroundColor $(if($filesToDelete.Count -gt 0){'Yellow'}else{'Green'})
Write-Host "  Files skipped (git tracked): $($filesSkipped.Count)" -ForegroundColor Red
Write-Host ""

if (-not $Apply) {
    Write-Host "Preview mode. Run with -Apply to perform deletion." -ForegroundColor Yellow
    Write-Host "PS> .\tools\cleanup-lifetime-web-contamination.ps1 -Apply" -ForegroundColor Gray
    exit 0
}

if ($filesSkipped.Count -gt 0) {
    Write-Host "REFUSING TO DELETE: $($filesSkipped.Count) file(s) are tracked by Git. Manual review required." -ForegroundColor Red
    Write-Host "Aborting Apply. No files were deleted." -ForegroundColor Red
    exit 1
}

if ($filesToDelete.Count -eq 0) {
    Write-Host "No files to delete." -ForegroundColor Green
    exit 0
}

Write-Host "Proceeding with deletion..." -ForegroundColor Yellow
$deleted = 0
foreach ($item in $filesToDelete) {
    try {
        Remove-Item $item.FullPath -Force
        Write-Host "  [DELETED] $($item.Path)" -ForegroundColor Green
        $deleted++
    } catch {
        Write-Host "  [ERROR] $($item.Path): $_" -ForegroundColor Red
    }
}

# Clean up empty directories
foreach ($dir in $contaminatedDirs) {
    $fullDir = Join-Path $targetRoot $dir
    if (Test-Path $fullDir -PathType Container) {
        $remaining = Get-ChildItem $fullDir -File -Recurse -ErrorAction SilentlyContinue
        if (-not $remaining) {
            try {
                Remove-Item $fullDir -Force -Recurse
                Write-Host "  [DIR REMOVED] $dir (was empty)" -ForegroundColor Green
            } catch {
                Write-Host "  [DIR ERROR] $dir : $_" -ForegroundColor Red
            }
        } else {
            Write-Host "  [DIR KEPT] $dir still contains $($remaining.Count) file(s)" -ForegroundColor Yellow
        }
    }
}

# Also check if src/ itself is now empty and can be removed
$srcDir = Join-Path $targetRoot 'src'
if (Test-Path $srcDir -PathType Container) {
    $srcRemaining = Get-ChildItem $srcDir -ErrorAction SilentlyContinue
    if (-not $srcRemaining) {
        try {
            Remove-Item $srcDir -Force
            Write-Host "  [DIR REMOVED] src (was empty after cleanup)" -ForegroundColor Green
        } catch {
            Write-Host "  [DIR KEPT] src: $_" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "Done. Deleted $deleted file(s)." -ForegroundColor Green
