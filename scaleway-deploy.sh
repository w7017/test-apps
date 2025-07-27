#!/bin/bash

# Scaleway Deployment Script for GMAO SaaS Application
# This script deploys the GMAO application to Scaleway using Docker and Scaleway Container Registry

set -e

# Configuration
PROJECT_NAME="gmao-saas"
SCALEWAY_REGION="fr-par"
SCALEWAY_ZONE="fr-par-1"
REGISTRY_NAMESPACE="gmao-registry"
CONTAINER_NAME="gmao-backend"
DATABASE_NAME="gmao-postgres"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting GMAO SaaS deployment to Scaleway...${NC}"

# Check if required tools are installed
check_requirements() {
    echo -e "${YELLOW}📋 Checking requirements...${NC}"
    
    if ! command -v scw &> /dev/null; then
        echo -e "${RED}❌ Scaleway CLI not found. Please install it first.${NC}"
        echo "Visit: https://github.com/scaleway/scaleway-cli"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not found. Please install Docker first.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All requirements satisfied${NC}"
}

# Initialize Scaleway CLI
init_scaleway() {
    echo -e "${YELLOW}🔧 Initializing Scaleway CLI...${NC}"
    
    if [ -z "$SCW_ACCESS_KEY" ] || [ -z "$SCW_SECRET_KEY" ]; then
        echo -e "${RED}❌ Scaleway credentials not found.${NC}"
        echo "Please set SCW_ACCESS_KEY and SCW_SECRET_KEY environment variables"
        echo "Or run: scw init"
        exit 1
    fi
    
    scw config set access-key="$SCW_ACCESS_KEY"
    scw config set secret-key="$SCW_SECRET_KEY"
    scw config set default-region="$SCALEWAY_REGION"
    scw config set default-zone="$SCALEWAY_ZONE"
    
    echo -e "${GREEN}✅ Scaleway CLI configured${NC}"
}

# Create Container Registry namespace
create_registry() {
    echo -e "${YELLOW}📦 Setting up Container Registry...${NC}"
    
    # Check if namespace exists
    if scw registry namespace list | grep -q "$REGISTRY_NAMESPACE"; then
        echo -e "${GREEN}✅ Registry namespace '$REGISTRY_NAMESPACE' already exists${NC}"
    else
        echo -e "${BLUE}Creating registry namespace...${NC}"
        scw registry namespace create name="$REGISTRY_NAMESPACE" region="$SCALEWAY_REGION"
        echo -e "${GREEN}✅ Registry namespace created${NC}"
    fi
    
    # Get registry endpoint
    REGISTRY_ENDPOINT=$(scw registry namespace list | grep "$REGISTRY_NAMESPACE" | awk '{print $4}')
    echo -e "${GREEN}📍 Registry endpoint: $REGISTRY_ENDPOINT${NC}"
}

# Build and push Docker image
build_and_push() {
    echo -e "${YELLOW}🔨 Building and pushing Docker image...${NC}"
    
    # Build the image
    echo -e "${BLUE}Building Docker image...${NC}"
    cd backend
    docker build -t "$REGISTRY_ENDPOINT/$CONTAINER_NAME:latest" .
    
    # Login to Scaleway registry
    echo -e "${BLUE}Logging in to Scaleway registry...${NC}"
    docker login "$REGISTRY_ENDPOINT" -u nologin -p "$SCW_SECRET_KEY"
    
    # Push the image
    echo -e "${BLUE}Pushing image to registry...${NC}"
    docker push "$REGISTRY_ENDPOINT/$CONTAINER_NAME:latest"
    
    echo -e "${GREEN}✅ Image pushed successfully${NC}"
    cd ..
}

# Create PostgreSQL database
create_database() {
    echo -e "${YELLOW}🗄️ Setting up PostgreSQL database...${NC}"
    
    # Check if database exists
    if scw rdb instance list | grep -q "$DATABASE_NAME"; then
        echo -e "${GREEN}✅ Database '$DATABASE_NAME' already exists${NC}"
        DB_ENDPOINT=$(scw rdb instance list | grep "$DATABASE_NAME" | awk '{print $5}')
    else
        echo -e "${BLUE}Creating PostgreSQL database...${NC}"
        scw rdb instance create \
            name="$DATABASE_NAME" \
            engine="PostgreSQL-15" \
            node-type="DB-DEV-S" \
            region="$SCALEWAY_REGION"
        
        echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
        sleep 60
        
        DB_ENDPOINT=$(scw rdb instance list | grep "$DATABASE_NAME" | awk '{print $5}')
        echo -e "${GREEN}✅ Database created at: $DB_ENDPOINT${NC}"
    fi
    
    # Generate database URL
    DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    DATABASE_URL="postgresql://gmao_user:$DB_PASSWORD@$DB_ENDPOINT:5432/gmao_db"
    
    echo -e "${GREEN}📍 Database URL: $DATABASE_URL${NC}"
}

# Deploy container
deploy_container() {
    echo -e "${YELLOW}🚀 Deploying container...${NC}"
    
    # Generate JWT secret
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    
    # Check if container exists
    if scw container container list | grep -q "$CONTAINER_NAME"; then
        echo -e "${BLUE}Updating existing container...${NC}"
        CONTAINER_ID=$(scw container container list | grep "$CONTAINER_NAME" | awk '{print $1}')
        
        scw container container update "$CONTAINER_ID" \
            registry-image="$REGISTRY_ENDPOINT/$CONTAINER_NAME:latest" \
            environment-variables="DATABASE_URL=$DATABASE_URL,JWT_SECRET=$JWT_SECRET,NODE_ENV=production"
    else
        echo -e "${BLUE}Creating new container...${NC}"
        scw container container create \
            name="$CONTAINER_NAME" \
            registry-image="$REGISTRY_ENDPOINT/$CONTAINER_NAME:latest" \
            port=3001 \
            cpu-limit=1000 \
            memory-limit=1024 \
            min-scale=1 \
            max-scale=5 \
            environment-variables="DATABASE_URL=$DATABASE_URL,JWT_SECRET=$JWT_SECRET,NODE_ENV=production" \
            region="$SCALEWAY_REGION"
    fi
    
    # Deploy the container
    CONTAINER_ID=$(scw container container list | grep "$CONTAINER_NAME" | awk '{print $1}')
    scw container container deploy "$CONTAINER_ID"
    
    echo -e "${GREEN}✅ Container deployed successfully${NC}"
    
    # Get container URL
    sleep 30
    CONTAINER_URL=$(scw container container list | grep "$CONTAINER_NAME" | awk '{print $6}')
    echo -e "${GREEN}🌐 Application URL: https://$CONTAINER_URL${NC}"
}

# Setup domain (optional)
setup_domain() {
    if [ -n "$CUSTOM_DOMAIN" ]; then
        echo -e "${YELLOW}🌐 Setting up custom domain...${NC}"
        
        CONTAINER_ID=$(scw container container list | grep "$CONTAINER_NAME" | awk '{print $1}')
        
        scw container domain create \
            hostname="$CUSTOM_DOMAIN" \
            container-id="$CONTAINER_ID" \
            region="$SCALEWAY_REGION"
        
        echo -e "${GREEN}✅ Custom domain configured: https://$CUSTOM_DOMAIN${NC}"
        echo -e "${YELLOW}⚠️  Don't forget to update your DNS records!${NC}"
    fi
}

# Run database migrations
run_migrations() {
    echo -e "${YELLOW}🔄 Running database migrations...${NC}"
    
    # This would typically be done through a job or init container
    # For now, we'll provide instructions
    echo -e "${BLUE}📋 Manual migration steps:${NC}"
    echo "1. Connect to your database using the credentials above"
    echo "2. Run the SQL schema from backend/src/database/schema.sql"
    echo "3. Run the seed script from backend/src/database/seed.js"
    
    echo -e "${YELLOW}💡 Consider setting up a CI/CD pipeline for automated migrations${NC}"
}

# Cleanup function
cleanup() {
    echo -e "${YELLOW}🧹 Cleanup options:${NC}"
    echo "To remove all resources:"
    echo "  scw container container delete $CONTAINER_NAME"
    echo "  scw rdb instance delete $DATABASE_NAME"
    echo "  scw registry namespace delete $REGISTRY_NAMESPACE"
}

# Main deployment function
main() {
    echo -e "${BLUE}🎯 GMAO SaaS Deployment Script${NC}"
    echo -e "${BLUE}================================${NC}"
    
    check_requirements
    init_scaleway
    create_registry
    build_and_push
    create_database
    deploy_container
    setup_domain
    run_migrations
    
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}================================${NC}"
    echo -e "${GREEN}📱 Your GMAO application is now live${NC}"
    echo -e "${GREEN}🔗 API Health Check: https://$CONTAINER_URL/health${NC}"
    echo -e "${GREEN}📊 Monitor your application in Scaleway Console${NC}"
    echo ""
    echo -e "${YELLOW}📝 Next steps:${NC}"
    echo "1. Update your frontend to use the new API endpoint"
    echo "2. Configure your domain DNS if using custom domain"
    echo "3. Set up monitoring and alerts"
    echo "4. Configure backup strategy for your database"
    echo ""
    cleanup
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "cleanup")
        cleanup
        ;;
    "help")
        echo "Usage: $0 [deploy|cleanup|help]"
        echo "  deploy  - Deploy the application (default)"
        echo "  cleanup - Show cleanup commands"
        echo "  help    - Show this help"
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information"
        exit 1
        ;;
esac