# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements
COPY backend/requirements-deploy.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements-deploy.txt

# Copy backend code
COPY backend/ ./backend/

# Expose port
EXPOSE 8000

# Start command
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
