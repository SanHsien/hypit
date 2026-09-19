[CmdletBinding()]
param(
    [switch]$Quick
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot

$env:NODE_NO_WARNINGS = "1"
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"

Write-Host "==> Type check (pnpm check)"
pnpm check
if ($LASTEXITCODE -ne 0) {
    throw "Type check failed with exit code $LASTEXITCODE"
}

if ($Quick) {
    Write-Host "==> Quick test pass (hyperframes capture-process)"
    node --import tsx --test packages/provider-hyperframes-local/test/capture-process.test.ts
    if ($LASTEXITCODE -ne 0) {
        throw "Quick test failed with exit code $LASTEXITCODE"
    }
} else {
    Write-Host "==> Full test suite (pnpm test)"
    node test/run.mjs
    if ($LASTEXITCODE -ne 0) {
        throw "Test suite failed with exit code $LASTEXITCODE"
    }
}

Write-Host "==> Check upstream updates"
python tools/check_upstream_updates.py --strict
if ($LASTEXITCODE -ne 0) {
    throw "Upstream check failed with exit code $LASTEXITCODE"
}

Write-Host "WINDOWS DEV CHECK GREEN"

