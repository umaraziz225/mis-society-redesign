<#
.SYNOPSIS
  Builds MIS410_CSUSM_Redesign_submission.zip: the website plus the documents the assignment asks for.

.DESCRIPTION
  Uses an allow-list, so only these go in the zip:
    - the six pages (index, resources, careers, events, about, join)
    - css/, js/, images/, vendor/, quiz/
    - README.md, VIBE_CODING_LOG.md
    - docs/project-summary-outline.md and docs/presentation-outline.md
  Everything else stays out: tests/ (and tests/node_modules), tests/screenshots, scripts/, .git, .claude,
  docs/screenshots and the other developer files.
  The zip stores paths with forward slashes, so it also unzips correctly on macOS and Linux.
  After building, the script re-opens the zip and checks it.

.PARAMETER OutDir
  Folder to write the zip into. Default: the project folder (the zip is git-ignored).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\make-submission-zip.ps1
#>
param(
    [string]$OutDir = ""
)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = Split-Path -Parent $PSScriptRoot
if (-not $OutDir) { $OutDir = $root }
$zipPath = Join-Path $OutDir "MIS410_CSUSM_Redesign_submission.zip"

$include = @(
    "index.html", "resources.html", "careers.html", "events.html", "about.html", "join.html",
    "css", "js", "images", "vendor", "quiz",
    "README.md", "VIBE_CODING_LOG.md",
    "docs/project-summary-outline.md", "docs/presentation-outline.md"
)

# 1. Everything on the allow-list must exist
$missing = $include | Where-Object { -not (Test-Path (Join-Path $root $_)) }
if ($missing) { throw "Missing from the project folder: $($missing -join ', ')" }

# 2. Copy the allow-list into a temporary staging folder (keeps the folder structure)
$stage = Join-Path ([System.IO.Path]::GetTempPath()) ("mis410-submission-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $stage | Out-Null
try {
    foreach ($item in $include) {
        $src = Join-Path $root $item
        $dst = Join-Path $stage $item
        New-Item -ItemType Directory -Force -Path (Split-Path -Parent $dst) | Out-Null
        Copy-Item -LiteralPath $src -Destination $dst -Recurse -Force
    }
    # Safety net: drop anything that must never ship, even if it was nested inside an allowed folder
    Get-ChildItem -LiteralPath $stage -Recurse -Force -Directory |
        Where-Object { $_.Name -in @("node_modules", ".git", ".claude", "screenshots") } |
        Remove-Item -Recurse -Force

    # 3. Write the zip by hand so every entry name uses forward slashes
    if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
    $zip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        $stagePrefix = (Resolve-Path -LiteralPath $stage).Path.TrimEnd("\") + "\"
        Get-ChildItem -LiteralPath $stage -Recurse -File -Force | ForEach-Object {
            $name = $_.FullName.Substring($stagePrefix.Length).Replace("\", "/")
            [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, $name, [System.IO.Compression.CompressionLevel]::Optimal)
        }
    } finally { $zip.Dispose() }
} finally {
    Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue
}

# 4. Check the zip we just built
$check = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
    $names = $check.Entries | ForEach-Object { $_.FullName }
} finally { $check.Dispose() }

$bad = $names | Where-Object { $_ -match '\\' -or $_ -match '^(tests|scripts|\.git|\.claude)(/|$)' -or $_ -match '(^|/)(node_modules|screenshots)(/|$)' }
if ($bad) { throw "The zip contains files that must not ship: $($bad -join ', ')" }
foreach ($need in @("index.html", "quiz/index.html", "quiz/js/data.js", "css/style.css", "js/main.js", "vendor/bootstrap/bootstrap.min.css", "README.md", "VIBE_CODING_LOG.md", "docs/project-summary-outline.md", "docs/presentation-outline.md")) {
    if ($names -notcontains $need) { throw "The zip is missing $need" }
}

$sizeMb = [math]::Round((Get-Item -LiteralPath $zipPath).Length / 1MB, 2)
Write-Host ""
Write-Host "Built $zipPath"
Write-Host "  $($names.Count) files, $sizeMb MB"
Write-Host "  Top level: $((($names | ForEach-Object { ($_ -split '/')[0] }) | Sort-Object -Unique) -join ', ')"
Write-Host "  Checked: forward-slash paths, no tests/, scripts/, node_modules, screenshots, .git or .claude."
