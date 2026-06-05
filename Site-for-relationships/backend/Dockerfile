# Backend Dockerfile – PHP 8.2 with Apache and MySQL PDO support
FROM php:8.2-apache

# Install PHP extensions required by the project
RUN docker-php-ext-install pdo pdo_mysql

# Enable Apache mod_rewrite for clean URLs
RUN a2enmod rewrite headers

# Set the Apache document root to the backend directory
ENV APACHE_DOCUMENT_ROOT=/var/www/html

# Custom Apache config to allow .htaccess overrides and CORS headers
RUN echo '<Directory /var/www/html>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/custom.conf \
    && a2enconf custom

# Copy backend source code into the container
COPY . /var/www/html/

# Use Docker-compatible config (reads from env vars)
RUN if [ -f /var/www/html/config.docker.php ]; then \
      cp /var/www/html/config.docker.php /var/www/html/config.php; \
    fi

# Create uploads directory and set permissions
RUN mkdir -p /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/uploads

# Expose port 80
EXPOSE 80
