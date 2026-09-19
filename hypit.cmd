@echo off
setlocal
set "LAUNCHER_DIR=%~dp0"
set "LAUNCHER=%LAUNCHER_DIR%bin\hypit.mjs"
if not exist "%LAUNCHER%" (
  echo Hypit dependencies are not installed in %LAUNCHER_DIR%; run: pnpm install --frozen-lockfile >&2
  exit /b 1
)
node "%LAUNCHER%" %*

