@echo off
echo.
echo ========================================
echo    AIOX-Core Quick Diagnostic (CMD)
echo ========================================
echo.

echo Checking Node.js...
node --version 2>nul
if %errorlevel% neq 0 (
    echo   ERROR: Node.js NOT INSTALLED!
    echo   Download: https://nodejs.org/
) else (
    echo   Node.js: OK
)

echo.
echo Checking npm...
npm --version 2>nul
if %errorlevel% neq 0 (
    echo   ERROR: npm NOT INSTALLED!
) else (
    echo   npm: OK
)

echo.
echo Checking npx...
npx --version 2>nul
if %errorlevel% neq 0 (
    echo   ERROR: npx NOT FOUND!
) else (
    echo   npx: OK
)

echo.
echo Checking Git...
git --version 2>nul
if %errorlevel% neq 0 (
    echo   WARNING: Git not installed (optional)
    echo   Download: https://git-scm.com/
) else (
    echo   Git: OK
)

echo.
echo Checking npm prefix...
for /f "tokens=*" %%i in ('npm config get prefix 2^>nul') do set NPM_PREFIX=%%i
echo   npm prefix: %NPM_PREFIX%

echo.
echo Checking aiox-core availability on npm...
npm view aiox-core version 2>nul
if %errorlevel% neq 0 (
    echo   ERROR: Cannot access npm registry!
    echo   Check your internet/firewall settings
) else (
    echo   aiox-core: Available
)

echo.
echo ========================================
echo    Testing npx aiox-core@latest
echo ========================================
echo.
echo Running: npx aiox-core@latest --version
echo (This may take a moment on first run...)
echo.
npx aiox-core@latest --version
if %errorlevel% neq 0 (
    echo.
    echo   ERROR: npx aiox-core failed!
    echo.
    echo Common fixes:
    echo   1. Update Node.js to v18+: https://nodejs.org/
    echo   2. Update npm: npm install -g npm@latest
    echo   3. Clear cache: npm cache clean --force
    echo   4. Check firewall/proxy settings
) else (
    echo.
    echo   SUCCESS! You can now run:
    echo   npx aiox-core@latest
)

echo.
pause
