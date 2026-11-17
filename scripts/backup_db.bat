@echo off
REM ==============================================================================
REM FINCORE - Automated Database Backup Script (Windows)
REM ==============================================================================
setlocal enabledelayedexpansion

set PG_HOST=%POSTGRES_HOST%
if "%PG_HOST%"=="" set PG_HOST=localhost

set PG_PORT=%POSTGRES_PORT%
if "%PG_PORT%"=="" set PG_PORT=5432

set PG_USER=%POSTGRES_USER%
if "%PG_USER%"=="" set PG_USER=postgres

set PG_DB=%POSTGRES_DB%
if "%PG_DB%"=="" set PG_DB=fincore

set BACKUP_DIR=backups
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set mytime=%%a%%b)
set TIMESTAMP=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

set BACKUP_FILE=%BACKUP_DIR%\fincore_backup_%TIMESTAMP%.sql

echo [FINCORE] Starting database backup of '%PG_DB%' from %PG_HOST%:%PG_PORT%...
pg_dump -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -F c -b -v -f "%BACKUP_FILE%" %PG_DB%

if %ERRORLEVEL% EQU 0 (
    echo [FINCORE] Backup successfully written to %BACKUP_FILE%
) else (
    echo [FINCORE] Backup failed with error code %ERRORLEVEL%
)

endlocal
