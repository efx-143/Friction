@echo off
REM 
setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"

REM 
for /f "usebackq tokens=*" %%i in (`wsl wslpath -u "%SCRIPT_DIR%..\node_modules\hermes-compiler\hermesc\linux64-bin\hermesc"`) do set "HERMESC_PATH=%%i"

REM 
set "ARGS="
:argloop
if "%~1"=="" goto :run
set "ARG=%~1"
set "ARG=!ARG:\=/!"
echo !ARG! | findstr /r "^[A-Za-z]:/" >nul 2>&1
if !errorlevel! == 0 (
  for /f "usebackq tokens=*" %%p in (`wsl wslpath -u "!ARG!"`) do set "ARG=%%p"
)
set "ARGS=!ARGS! !ARG!"
shift
goto :argloop

:run
REM 
wsl !HERMESC_PATH! !ARGS!
exit /b %errorlevel%