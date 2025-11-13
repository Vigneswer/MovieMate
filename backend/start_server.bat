@echo off
echo Restarting MovieMate Backend Server...
cd /d d:\MovieMate\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
