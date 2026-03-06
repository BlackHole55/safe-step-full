FROM php:8.4-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl

# Install PHP extensions (Postgres + Zip)
RUN docker-php-ext-install pdo pdo_pgsql zip bcmath mbstring gd

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy files and install dependencies
COPY . .
RUN composer update --no-interaction --no-dev --optimize-autoloader --no-scripts

# Set permissions for Laravel
RUN mkdir -p /var/www/storage /var/www/bootstrap/cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000
CMD ["php-fpm"]