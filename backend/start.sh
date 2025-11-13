#!/bin/bash
# Railway startup script - handles dynamic PORT environment variable

# Use Railway's PORT or default to 8000
PORT=${PORT:-8000}

echo "Starting Gunicorn on port $PORT..."

# Start gunicorn with the Railway PORT
exec gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind "0.0.0.0:$PORT" \
    --log-level info \
    --access-logfile - \
    --error-logfile -
