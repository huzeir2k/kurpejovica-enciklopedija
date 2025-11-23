#!/bin/bash

# Kurpejovica Enciklopedija Deployment Script for DigitalOcean
# This script sets up the application on a fresh Ubuntu server

set -e

echo "================================"
echo "Setting up Kurpejovica Backend"
echo "================================"

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
echo "Installing PostgreSQL..."
sudo apt-get install -y postgresql postgresql-contrib

# Install Docker (optional, for containerized deployment)
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt-get install -y docker-compose

# Create application directory
echo "Setting up application directory..."
sudo mkdir -p /var/www/kurpejovica
sudo chown -R $USER:$USER /var/www/kurpejovica

# Clone repository (if not already present)
if [ ! -d "/var/www/kurpejovica/.git" ]; then
    echo "Cloning repository..."
    git clone <your-repo-url> /var/www/kurpejovica
fi

cd /var/www/kurpejovica

# Setup environment files
echo "Setting up environment files..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
fi

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Setup database
echo "Setting up PostgreSQL database..."
sudo -u postgres psql -c "CREATE DATABASE kurpejovica_db;" || true
sudo -u postgres psql -c "CREATE USER kurpejovica WITH PASSWORD 'change_me_in_production';" || true

# Run migrations
echo "Running database migrations..."
npm run migrate

# (Optional) Seed sample data
read -p "Do you want to seed sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run seed
fi

# Create systemd service for auto-start
echo "Creating systemd service..."
sudo tee /etc/systemd/system/kurpejovica.service > /dev/null <<EOF
[Unit]
Description=Kurpejovica Enciklopedija Backend
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/var/www/kurpejovica/backend
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10

# Environment variables
EnvironmentFile=/var/www/kurpejovica/.env

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable kurpejovica
sudo systemctl start kurpejovica

# Setup Nginx reverse proxy (optional)
echo "Setting up Nginx reverse proxy..."
sudo apt-get install -y nginx

sudo tee /etc/nginx/sites-available/kurpejovica > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/kurpejovica /etc/nginx/sites-enabled/
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt (optional)
echo "⚠️  To set up HTTPS, run:"
echo "sudo apt-get install certbot python3-certbot-nginx"
echo "sudo certbot --nginx -d your-domain.com"

echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Service status:"
sudo systemctl status kurpejovica --no-pager
echo ""
echo "Next steps:"
echo "1. Edit .env with production settings"
echo "2. Configure domain in Nginx"
echo "3. Set up SSL certificate with certbot"
echo "4. Monitor logs: journalctl -u kurpejovica -f"
