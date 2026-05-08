FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

ARG BUST=20260508-5
RUN echo "Build: $BUST"

COPY . .

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
