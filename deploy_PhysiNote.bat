@echo off
title PhysiNote Deploy Tool
echo ===================================================
echo  PhysiNote Deploy Tool
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Adding changes to Git...
git add index.html main.js style.css GEMINI.md deploy_PhysiNote.bat
if %errorlevel% neq 0 (
    echo [ERROR] Git add failed.
    goto error_end
)

echo [2/3] Committing changes...
set "commit_msg=PhysiNote update (%date% %time%)"
git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo [INFO] Nothing to commit or commit skipped.
)

echo [3/3] Pushing to GitHub (origin main)...
git push origin main
if %errorlevel% neq 0 (
    echo [ERROR] Git push failed.
    goto error_end
)

echo.
echo ===================================================
echo  Deployment complete!
echo ===================================================
goto end

:error_end
echo.
echo [ERROR] Deployment failed during process.

:end
echo.
pause
