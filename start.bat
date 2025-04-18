@echo off
REM Load environment variables from .env file
if exist .env (
  for /f "tokens=*" %%a in (.env) do (
    set %%a
  )
) else (
  echo Error: .env file not found!
  exit /b 1
)

REM Start the scoreboard server
npm start 