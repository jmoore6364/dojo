# Dojo Platform - Docker Development Commands

# Variables
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.dev.yml
DOCKER_COMPOSE_FULL = docker-compose -f docker-compose.yml

# Development Database & Cache Commands
.PHONY: dev-up
dev-up:
	@echo "Starting development database and cache services..."
	$(DOCKER_COMPOSE_DEV) up -d

.PHONY: dev-down
dev-down:
	@echo "Stopping development services..."
	$(DOCKER_COMPOSE_DEV) down

.PHONY: dev-restart
dev-restart:
	@echo "Restarting development services..."
	$(DOCKER_COMPOSE_DEV) restart

.PHONY: dev-logs
dev-logs:
	@echo "Showing development services logs..."
	$(DOCKER_COMPOSE_DEV) logs -f

.PHONY: dev-clean
dev-clean:
	@echo "Stopping and removing development containers and volumes..."
	$(DOCKER_COMPOSE_DEV) down -v

# Full Stack Commands
.PHONY: up
up:
	@echo "Starting all services (database, cache, backend, frontend)..."
	$(DOCKER_COMPOSE_FULL) up -d

.PHONY: down
down:
	@echo "Stopping all services..."
	$(DOCKER_COMPOSE_FULL) down

.PHONY: build
build:
	@echo "Building all Docker images..."
	$(DOCKER_COMPOSE_FULL) build

.PHONY: rebuild
rebuild:
	@echo "Rebuilding all Docker images (no cache)..."
	$(DOCKER_COMPOSE_FULL) build --no-cache

.PHONY: logs
logs:
	@echo "Showing all services logs..."
	$(DOCKER_COMPOSE_FULL) logs -f

.PHONY: clean
clean:
	@echo "Stopping and removing all containers and volumes..."
	$(DOCKER_COMPOSE_FULL) down -v

# Database Commands
.PHONY: db-shell
db-shell:
	@echo "Connecting to PostgreSQL shell..."
	docker exec -it dojo-postgres psql -U postgres -d dojo_platform

.PHONY: db-backup
db-backup:
	@echo "Creating database backup..."
	docker exec dojo-postgres pg_dump -U postgres dojo_platform > backup_$(shell date +%Y%m%d_%H%M%S).sql

.PHONY: db-restore
db-restore:
	@echo "Restoring database from backup..."
	@read -p "Enter backup file name: " backup; \
	docker exec -i dojo-postgres psql -U postgres dojo_platform < $$backup

# Redis Commands
.PHONY: redis-cli
redis-cli:
	@echo "Connecting to Redis CLI..."
	docker exec -it dojo-redis redis-cli

.PHONY: redis-flush
redis-flush:
	@echo "Flushing all Redis data..."
	docker exec dojo-redis redis-cli FLUSHALL

# Status Commands
.PHONY: ps
ps:
	@echo "Showing running containers..."
	docker ps --filter "name=dojo-"

.PHONY: status
status:
	@echo "Checking services health status..."
	@docker ps --filter "name=dojo-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Help Command
.PHONY: help
help:
	@echo "Dojo Platform - Docker Commands"
	@echo ""
	@echo "Development (DB & Cache only):"
	@echo "  make dev-up        - Start PostgreSQL and Redis"
	@echo "  make dev-down      - Stop PostgreSQL and Redis"
	@echo "  make dev-restart   - Restart services"
	@echo "  make dev-logs      - Show service logs"
	@echo "  make dev-clean     - Remove containers and volumes"
	@echo ""
	@echo "Full Stack:"
	@echo "  make up            - Start all services"
	@echo "  make down          - Stop all services"
	@echo "  make build         - Build Docker images"
	@echo "  make rebuild       - Rebuild images (no cache)"
	@echo "  make logs          - Show all logs"
	@echo "  make clean         - Remove everything"
	@echo ""
	@echo "Database:"
	@echo "  make db-shell      - Connect to PostgreSQL"
	@echo "  make db-backup     - Create database backup"
	@echo "  make db-restore    - Restore from backup"
	@echo ""
	@echo "Redis:"
	@echo "  make redis-cli     - Connect to Redis CLI"
	@echo "  make redis-flush   - Flush all Redis data"
	@echo ""
	@echo "Status:"
	@echo "  make ps            - Show running containers"
	@echo "  make status        - Show health status"

# Default target
.DEFAULT_GOAL := help