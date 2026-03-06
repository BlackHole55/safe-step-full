#!/bin/bash

echo "Starting Safe Step Setup (Linux/Mac)..."

echo "Building and starting containers..."
docker-compose up -d --build

docker-compose exec backend cp .env.example .env

echo "Generating App Key..."
docker-compose exec backend php artisan key:generate

echo "Waiting for Database to be ready..."
# Loop until 'pg_isready' returns success from inside the db container
until docker-compose exec db pg_isready -U safestep_user -d safe_step_db; do
  echo "Database is unavailable - sleeping..."
  sleep 2
done

echo "Running Database Migrations and Seeding..."
docker-compose exec backend php artisan migrate:fresh --seed

echo "Optimizing Laravel..."
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache

echo "Setup Complete!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"