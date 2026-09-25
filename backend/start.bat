@echo off
echo Starting Portfolio Analytics Backend...
call ..\env\Scripts\activate
cd /d %~dp0
uvicorn main:app --reload --port 8000
