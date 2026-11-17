@echo off
REM ==============================================================================
REM FINCORE - Automated Database Restore Script (Windows)
REM Usage: restore_db.bat [path_to_backup_file]
REM ==============================================================================
setlocal enabledelayedexpansion

if "%~1"=="" (
    echo Usage: restore_db.bat [path_to_backup_file]
    exit /b 1
)

set BACKUP_FILE=%~1
set PG_HOST=%POSTGRES_HOST%
if "%PG_HOST%"=="" set PG_HOST=localhost

set PG_PORT=%POSTGRES_PORT%
if "%PG_PORT%"=="" set PG_PORT=5432

set PG_USER=%POSTGRES_USER%
if "%PG_USER%"=="" set PG_USER=postgres

set PG_DB=%POSTGRES_DB%
if "%PG_DB%"=="" set PG_DB=fincore

echo [FINCORE] WARNING: Restoring from %BACKUP_FILE% into %PG_DB% on %PG_HOST%:%PG_PORT%...
echo Press Ctrl+C to cancel or
pause

pg_restore -h %PG_HOST% -p %PG_PORT% -U %PG_USER% -d %PG_DB% -v -c "%BACKUP_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo [FINCORE] Database restore completed successfully.
) else (
    echo [FINCORE] pg_restore exited with code %ERRORLEVEL% (check if tables already existed).
)

endlocal
