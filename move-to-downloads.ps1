# Move the Northlight Studio project out of OneDrive and into Downloads.
#
#   Right-click -> Run with PowerShell,  or from a terminal:
#     powershell -ExecutionPolicy Bypass -File .\move-to-downloads.ps1
#
# What it does:
#   1. creates C:\Users\ITS\Downloads\DeepSeek if needed
#   2. copies everything except node_modules and .git
#   3. counts files on both sides and refuses to delete the source unless the
#      destination has at least as many files
#   4. deletes the source copy
#
# Pass -CopyOnly to keep the original where it is.

[CmdletBinding()]
param(
    [string]$Destination = "C:\Users\ITS\Downloads\DeepSeek",
    [switch]$CopyOnly
)

$ErrorActionPreference = "Stop"

$source = Split-Path -Parent $MyInvocation.MyCommand.Path
$excluded = @("node_modules", ".git")

Write-Host ""
Write-Host "Source      : $source"
Write-Host "Destination : $Destination"
Write-Host ""

if (-not (Test-Path -LiteralPath $source)) {
    throw "Source folder not found: $source"
}

if (-not (Test-Path -LiteralPath $Destination)) {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    Write-Host "Created destination folder."
}

$items = @(Get-ChildItem -LiteralPath $source -Force |
    Where-Object { $excluded -notcontains $_.Name })

if ($items.Count -eq 0) {
    throw "Nothing to move: the source folder is empty."
}

Write-Host "Copying $($items.Count) top-level items..."
foreach ($item in $items) {
    Copy-Item -LiteralPath $item.FullName -Destination $Destination -Recurse -Force
    Write-Host "  + $($item.Name)"
}

# Verify before deleting anything.
$sourceFiles = @(Get-ChildItem -LiteralPath $source -File -Recurse -Force |
    Where-Object { $_.FullName -notmatch '\\node_modules\\|\\.git\\' })
$destFiles = @(Get-ChildItem -LiteralPath $Destination -File -Recurse -Force)

Write-Host ""
Write-Host "Source files      : $($sourceFiles.Count)"
Write-Host "Destination files : $($destFiles.Count)"

if ($destFiles.Count -lt $sourceFiles.Count) {
    throw "Verification failed: destination has fewer files than the source. Source left untouched."
}

if ($CopyOnly) {
    Write-Host ""
    Write-Host "Copy-only mode: original files left in place."
    Write-Host "Project copied to $Destination"
    return
}

Write-Host ""
Write-Host "Verification passed. Removing the original copy..."
foreach ($item in $items) {
    Remove-Item -LiteralPath $item.FullName -Recurse -Force
}

$leftovers = @(Get-ChildItem -LiteralPath $source -Force |
    Where-Object { $excluded -notcontains $_.Name })

Write-Host ""
Write-Host "Done. Project is now at: $Destination"
if ($leftovers.Count -gt 0) {
    Write-Host "Note: these were left behind in the old folder:"
    $leftovers | ForEach-Object { Write-Host "  - $($_.Name)" }
}
Write-Host ""
Write-Host "Next:"
Write-Host "  cd `"$Destination`""
Write-Host "  npm install"
Write-Host "  npm run dev"
