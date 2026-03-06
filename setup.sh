#!/bin/bash

echo "Starting Safe Step Setup (Linux/Mac)..."

echo "Building and starting containers..."
docker-compose up -d --build

echo "Generating App Key..."
docker-compose exec backend php artisan key:generate

echo "Running Database Migrations and Seeding..."
docker-compose exec backend php artisan migrate:fresh --seed

echo "Optimizing Laravel..."
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache

echo "Setup Complete!"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"