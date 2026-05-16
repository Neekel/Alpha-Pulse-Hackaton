# Stage 1: builder — install dependencies in an isolated environment
FROM python:3.11-slim AS builder

# Install build-time system dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment to isolate Python packages
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install Python dependencies from requirements.txt
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt


# Stage 2: runtime — lean final image without build tooling
FROM python:3.11-slim AS runtime

# Install only the runtime system libraries needed at execution time
RUN apt-get update && apt-get install -y --no-install-recommends \
    libffi8 \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Bring in the pre-built virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Reduce image noise and improve log visibility in Railway
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Copy application source from the backend directory
COPY backend/ .

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
