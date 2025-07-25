#!/bin/bash

# =============================================================================
# Circle Deployment Script
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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    error "Please don't run this script as root"
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    error "Docker is not installed. Please install Docker first."
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose is not installed. Please install Docker Compose first."
fi

# Check if .env file exists
if [ ! -f .env ]; then
    warn ".env file not found. Creating from example..."
    if [ -f env.example ]; then
        cp env.example .env
        warn "Please edit .env file with your actual values before continuing."
        info "Run: nano .env"
        exit 1
    else
        error "env.example file not found. Cannot create .env file."
    fi
fi

# Parse command line arguments
COMMAND=${1:-"deploy"}
MODE=${2:-"production"}

log "Starting Circle deployment..."
info "Command: $COMMAND"
info "Mode: $MODE"

case $COMMAND in
    "deploy")
        log "🚀 Starting full deployment..."
        
        # Pull latest changes (if in git repo)
        if [ -d ".git" ]; then
            log "📥 Pulling latest changes from git..."
            git pull origin main || warn "Git pull failed or not in git repo"
        fi
        
        # Build and start services
        log "🏗️ Building Docker images..."
        docker-compose build --no-cache
        
        log "📦 Starting services..."
        docker-compose up -d
        
        log "⏳ Waiting for services to be healthy..."
        sleep 30
        
        # Check services health
        log "🔍 Checking services health..."
        docker-compose ps
        
        log "✅ Deployment completed!"
        log "🌐 Your application should be available at: http://circles.uz"
        ;;
        
    "start")
        log "▶️ Starting Circle services..."
        docker-compose up -d
        log "✅ Services started!"
        ;;
        
    "stop")
        log "⏹️ Stopping Circle services..."
        docker-compose down
        log "✅ Services stopped!"
        ;;
        
    "restart")
        log "🔄 Restarting Circle services..."
        docker-compose down
        docker-compose up -d
        log "✅ Services restarted!"
        ;;
        
    "update")
        log "🔄 Updating Circle application..."
        
        # Pull latest changes
        if [ -d ".git" ]; then
            log "📥 Pulling latest changes..."
            git pull origin main
        fi
        
        # Rebuild and restart
        log "🏗️ Rebuilding images..."
        docker-compose build --no-cache
        
        log "🔄 Restarting services..."
        docker-compose down
        docker-compose up -d
        
        log "✅ Update completed!"
        ;;
        
    "backup")
        log "💾 Creating backup..."
        
        # Create backup directory
        BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        
        # Backup database
        log "📊 Backing up database..."
        docker-compose exec -T db pg_dump -U $DB_USER $DB_NAME > "$BACKUP_DIR/database.sql"
        
        # Backup media files
        log "📁 Backing up media files..."
        docker cp circle_backend:/app/media "$BACKUP_DIR/"
        
        # Compress backup
        log "🗜️ Compressing backup..."
        tar -czf "$BACKUP_DIR.tar.gz" -C ./backups "$(basename $BACKUP_DIR)"
        rm -rf "$BACKUP_DIR"
        
        log "✅ Backup created: $BACKUP_DIR.tar.gz"
        ;;
        
    "logs")
        SERVICE=${2:-""}
        if [ -z "$SERVICE" ]; then
            log "📋 Showing all logs..."
            docker-compose logs -f --tail=50
        else
            log "📋 Showing logs for $SERVICE..."
            docker-compose logs -f --tail=50 "$SERVICE"
        fi
        ;;
        
    "status")
        log "📊 Circle services status:"
        docker-compose ps
        echo ""
        log "💾 Disk usage:"
        df -h
        echo ""
        log "🧠 Memory usage:"
        free -h
        ;;
        
    "shell")
        SERVICE=${2:-"backend"}
        log "🐚 Opening shell in $SERVICE..."
        docker-compose exec "$SERVICE" /bin/bash
        ;;
        
    "clean")
        warn "This will remove all unused Docker images and containers!"
        read -p "Are you sure? (y/N) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "🧹 Cleaning up Docker..."
            docker system prune -f
            docker volume prune -f
            log "✅ Cleanup completed!"
        else
            info "Cleanup cancelled."
        fi
        ;;
        
    "help")
        echo "Circle Deployment Script"
        echo ""
        echo "Usage: $0 [COMMAND] [OPTIONS]"
        echo ""
        echo "Commands:"
        echo "  deploy     - Full deployment (build + start)"
        echo "  start      - Start services"
        echo "  stop       - Stop services"
        echo "  restart    - Restart services"
        echo "  update     - Update and restart"
        echo "  backup     - Create backup"
        echo "  logs       - Show logs (add service name as 2nd arg)"
        echo "  status     - Show system status"
        echo "  shell      - Open shell (add service name as 2nd arg)"
        echo "  clean      - Clean unused Docker resources"
        echo "  help       - Show this help"
        echo ""
        echo "Examples:"
        echo "  $0 deploy"
        echo "  $0 logs backend"
        echo "  $0 shell frontend"
        echo "  $0 backup"
        ;;
        
    *)
        error "Unknown command: $COMMAND. Use '$0 help' for available commands."
        ;;
esac 