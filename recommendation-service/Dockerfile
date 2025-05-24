FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .
COPY models.py .
COPY enums.py .

# Expose port
EXPOSE 8001

# Run the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
