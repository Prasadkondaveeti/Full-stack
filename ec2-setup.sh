#!/bin/bash
# ============================================================
# EC2 SETUP SCRIPT — Run once on each EC2 instance (dev + prod)
# Usage: chmod +x ec2-setup.sh && sudo ./ec2-setup.sh
# ============================================================

set -e

echo "📦 Updating system..."
apt-get update -y && apt-get upgrade -y

echo "🟢 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

echo "📦 Installing PM2 globally..."
npm install -g pm2

echo "🌐 Installing Nginx..."
apt-get install -y nginx

echo "📁 Creating app directories..."
mkdir -p /var/www/frontend
mkdir -p /var/www/backend

echo "🔐 Setting permissions..."
# Replace 'ubuntu' with your actual EC2 user if different
chown -R ubuntu:ubuntu /var/www/frontend
chown -R ubuntu:ubuntu /var/www/backend

echo "📝 Setting up Nginx config..."
# Copy the nginx.conf file from this project into /etc/nginx/sites-available/myapp
# Then enable it:
# sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
# sudo nginx -t
# sudo systemctl reload nginx

echo "🔁 Enable PM2 to start on boot..."
pm2 startup systemd -u ubuntu --hp /home/ubuntu
# Run the output command from above as root, then:
# pm2 save

echo "🔥 Configuring firewall (ufw)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'   # allows port 80 and 443
ufw --force enable

echo "✅ EC2 setup complete!"
echo ""
echo "Next steps:"
echo "  1. Copy nginx.conf to /etc/nginx/sites-available/myapp"
echo "  2. sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/"
echo "  3. sudo rm /etc/nginx/sites-enabled/default"
echo "  4. sudo nginx -t && sudo systemctl reload nginx"
