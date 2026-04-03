@echo off
cd /d D:\AIOS\tools\hydra
echo Starting HYDRA full pipeline at %date% %time%...
node --max-old-space-size=512 bin/hydra.js run --verbose > hydra-data\full-run-final.log 2>&1
echo Pipeline finished at %date% %time% with exit code %errorlevel%
