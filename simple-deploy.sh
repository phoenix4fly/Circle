#!/bin/bash

# =============================================================================
# Circle Simple Deployment Script (без Docker)
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Project paths
PROJECT_DIR="/var/www/circle"
BACKEND_DIR="$PROJECT_DIR/circle-backend"
FRONTEND_DIR="$PROJECT_DIR/circle-frontend"
VENV_DIR="$PROJECT_DIR/.venv"

# Parse command line arguments
COMMAND=${1:-"deploy"}

log "🚀 Starting Circle simple deployment..."
info "Command: $COMMAND"

case $COMMAND in
    "install-deps")
        log "📦 Installing system dependencies..."
        
        # Update system
        sudo apt update && sudo apt upgrade -y
        
        # Install Python and Node.js
        sudo apt install -y python3 python3-pip python3-venv python3-dev
        sudo apt install -y postgresql postgresql-contrib libpq-dev
        sudo apt install -y redis-server
        sudo apt install -y nginx
        sudo apt install -y git curl wget unzip htop
        
        # Install Node.js 18+
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        # Install PM2 for process management
        sudo npm install -g pm2
        
        log "✅ System dependencies installed!"
        ;;
        
    "setup-project")
        log "🏗️ Setting up project..."
        
        # Create project directory
        sudo mkdir -p $PROJECT_DIR
        sudo chown -R $USER:$USER $PROJECT_DIR
        
        # Copy project files (assumes current directory has the project)
        if [ -d "./circle-backend" ]; then
            log "📁 Copying project files..."
            cp -r . $PROJECT_DIR/
        else
            error "Project files not found! Run this script from project root."
        fi
        
        # Create Python virtual environment
        log "🐍 Creating Python virtual environment..."
        cd $PROJECT_DIR
        python3 -m venv .venv
        source .venv/bin/activate
        
        # Install Python dependencies
        log "📦 Installing Python dependencies..."
        cd $BACKEND_DIR
        pip install -r requirements.txt
        
        # Install Node.js dependencies
        log "📦 Installing Node.js dependencies..."
        cd $FRONTEND_DIR
        npm install
        
        log "✅ Project setup completed!"
        ;;
        
    "setup-db")
        log "🗄️ Setting up database..."
        
        # Create PostgreSQL database and user
        sudo -u postgres psql << EOF
CREATE DATABASE circle_db;
CREATE USER circle_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE circle_db TO circle_user;
\q
EOF
        
        # Run Django migrations
        cd $BACKEND_DIR
        source $VENV_DIR/bin/activate
        python manage.py migrate
        
        # Create superuser (interactive)
        echo "Creating Django superuser..."
        python manage.py createsuperuser
        
        # Load initial data
        if [ -f "apps/tours/fixtures/tours_data.json" ]; then
            python manage.py loaddata apps/tours/fixtures/tours_data.json
        fi
        
        log "✅ Database setup completed!"
        ;;
        
    "build")
        log "🏗️ Building applications..."
        
        # Build frontend
        cd $FRONTEND_DIR
        npm run build
        
        # Collect Django static files
        cd $BACKEND_DIR
        source $VENV_DIR/bin/activate
        python manage.py collectstatic --noinput
        
        log "✅ Build completed!"
        ;;
        
    "start")
        log "▶️ Starting Circle services..."
        
        # Start Redis
        sudo systemctl start redis-server
        sudo systemctl enable redis-server
        
        # Start PostgreSQL
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
        
        # Start backend with PM2
        cd $BACKEND_DIR
        source $VENV_DIR/bin/activate
        pm2 start "gunicorn --bind 127.0.0.1:8000 --workers 4 circle.wsgi:application" --name circle-backend
        
        # Start frontend with PM2
        cd $FRONTEND_DIR
        pm2 start npm --name circle-frontend -- start
        
        # Start Celery worker
        cd $BACKEND_DIR
        source $VENV_DIR/bin/activate
        pm2 start "celery -A circle worker --loglevel=info" --name circle-worker
        
        # Save PM2 configuration
        pm2 save
        pm2 startup
        
        log "✅ Services started!"
        ;;
        
    "stop")
        log "⏹️ Stopping Circle services..."
        
        pm2 stop circle-backend circle-frontend circle-worker || true
        
        log "✅ Services stopped!"
        ;;
        
    "restart")
        log "🔄 Restarting Circle services..."
        
        pm2 restart circle-backend circle-frontend circle-worker
        
        log "✅ Services restarted!"
        ;;
        
    "deploy")
        log "🚀 Starting full deployment..."
        
        # Pull latest changes if in git repo
        if [ -d ".git" ]; then
            log "📥 Pulling latest changes..."
            git pull origin main || warn "Git pull failed"
        fi
        
        # Build applications
        ./simple-deploy.sh build
        
        # Restart services
        ./simple-deploy.sh restart
        
        log "✅ Deployment completed!"
        log "🌐 Your application should be available at: http://your-server-ip/"
        ;;
        
    "setup-nginx")
        log "🌐 Setting up Nginx..."
        
        # Create Nginx configuration
        sudo tee /etc/nginx/sites-available/circle << 'EOF'
server {
    listen 80;
    server_name circles.uz www.circles.uz _;
    
    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API (Django)
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /var/www/circle/circle-backend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Media files
    location /media/ {
        alias /var/www/circle/circle-backend/media/;
        expires 1M;
        add_header Cache-Control "public";
    }
}
EOF
        
        # Enable site
        sudo ln -sf /etc/nginx/sites-available/circle /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # Test and restart Nginx
        sudo nginx -t
        sudo systemctl restart nginx
        sudo systemctl enable nginx
        
        log "✅ Nginx setup completed!"
        ;;
        
    "status")
        log "📊 Circle services status:"
        pm2 list
        echo ""
        log "💾 Disk usage:"
        df -h
        echo ""
        log "🧠 Memory usage:"
        free -h
        echo ""
        log "🌐 Nginx status:"
        sudo systemctl status nginx --no-pager -l
        ;;
        
    "logs")
        SERVICE=${2:-"all"}
        if [ "$SERVICE" = "all" ]; then
            log "📋 Showing all logs..."
            pm2 logs
        else
            log "📋 Showing logs for $SERVICE..."
            pm2 logs "$SERVICE"
        fi
        ;;
        
    "backup")
        log "💾 Creating backup..."
        
        BACKUP_DIR="/backup/circle/$(date +%Y%m%d_%H%M%S)"
        sudo mkdir -p "$BACKUP_DIR"
        
        # Backup database
        log "📊 Backing up database..."
        sudo -u postgres pg_dump circle_db > "$BACKUP_DIR/database.sql"
        
        # Backup media files
        log "📁 Backing up media files..."
        sudo cp -r $BACKEND_DIR/media "$BACKUP_DIR/"
        
        # Compress backup
        log "🗜️ Compressing backup..."
        sudo tar -czf "$BACKUP_DIR.tar.gz" -C /backup/circle "$(basename $BACKUP_DIR)"
        sudo rm -rf "$BACKUP_DIR"
        
        log "✅ Backup created: $BACKUP_DIR.tar.gz"
        ;;
        
    "help")
        echo "Circle Simple Deployment Script"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  install-deps  - Install system dependencies"
        echo "  setup-project - Setup project files and venv"
        echo "  setup-db     - Setup PostgreSQL database"
        echo "  setup-nginx  - Setup Nginx reverse proxy"
        echo "  build        - Build frontend and collect static"
        echo "  start        - Start all services"
        echo "  stop         - Stop all services"
        echo "  restart      - Restart all services"
        echo "  deploy       - Full deployment"
        echo "  status       - Show system status"
        echo "  logs         - Show logs (add service name as 2nd arg)"
        echo "  backup       - Create backup"
        echo "  help         - Show this help"
        echo ""
        echo "Full installation example:"
        echo "  $0 install-deps"
        echo "  $0 setup-project"
        echo "  $0 setup-db"
        echo "  $0 setup-nginx"
        echo "  $0 start"
        ;;
        
    *)
        error "Unknown command: $COMMAND. Use '$0 help' for available commands."
        ;;
esac 