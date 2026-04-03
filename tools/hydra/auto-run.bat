@echo off
cd /d D:\AIOS\tools\hydra
echo [%date% %time%] HYDRA Auto-Run started >> hydra-data\auto-run.log

echo [%date% %time%] Waiting for current pipeline to finish... >> hydra-data\auto-run.log
:WAIT_LOOP
timeout /t 30 /nobreak >nul
findstr /c:"Pipeline complete" hydra-data\full-run-final.log >nul 2>&1
if errorlevel 1 goto WAIT_LOOP

echo [%date% %time%] Current pipeline finished. Starting Wave 2 (125 sources)... >> hydra-data\auto-run.log

echo ============================================ >> hydra-data\auto-run.log
echo WAVE 2 — Full Pipeline with 125 sources >> hydra-data\auto-run.log
echo ============================================ >> hydra-data\auto-run.log

node --max-old-space-size=512 bin/hydra.js run --verbose > hydra-data\wave2-run.log 2>&1

echo [%date% %time%] Wave 2 finished. >> hydra-data\auto-run.log

echo [%date% %time%] Starting scheduler + Telegram bot... >> hydra-data\auto-run.log
node --max-old-space-size=512 bin/hydra.js schedule start >> hydra-data\scheduler.log 2>&1
