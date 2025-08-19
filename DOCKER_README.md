# Dojo Platform - Docker Setup Guide

## Quick Start

### Prerequisites
- Docker Desktop installed and running
- Make (optional, for using Makefile commands)
- Git

### Initial Setup

1. **Clone the repository** (if not already done)
```bash
git clone <repository-url>
cd Dojo
```

2. **Copy environment variables**
```bash
cp .env.example .env
# Edit .env with your preferred values
```

3. **Start development services** (Database & Cache only)
```bash
# Using Make
make dev-up

# Or using docker-compose directly
docker-compose -f docker-compose.dev.yml up -d
```

4. **Verify services are running**
```bash
# Using Make
make status

# Or using docker
docker ps
```

## Available Services

### Development Mode (`docker-compose.dev.yml`)
Perfect for local development when running backend and frontend locally:

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache server |
| Adminer | 8080 | Database GUI (http://localhost:8080) |
| Redis Commander | 8081 | Redis GUI (http://localhost:8081) |

### Production Mode (`docker-compose.yml`)
Full stack deployment with all services:

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Main database |
| Redis | 6379 | Cache server |
| Backend API | 5000 | Node.js API server |
| Frontend | 3000 | Next.js application |

## Common Commands

### Using Make (Recommended)

```bash
# Development services
make dev-up          # Start DB & Cache
make dev-down        # Stop services
make dev-logs        # View logs
make dev-clean       # Remove everything

# Database operations
make db-shell        # Connect to PostgreSQL
make db-backup       # Create backup
make db-restore      # Restore backup

# Redis operations
make redis-cli       # Connect to Redis
make redis-flush     # Clear cache

# Full stack
make up              # Start all services
make down            # Stop all services
make build           # Build images
make logs            # View all logs
```

### Using Docker Compose Directly

```bash
# Start development services
docker-compose -f docker-compose.dev.yml up -d

# Stop development services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Start full stack
docker-compose up -d

# Stop full stack
docker-compose down
```

## Database Access

### Using Adminer (Web UI)
1. Navigate to http://localhost:8080
2. Login with:
   - System: PostgreSQL
   - Server: postgres
   - Username: postgres
   - Password: postgres (or your DB_PASSWORD)
   - Database: dojo_platform

### Using psql (Command Line)
```bash
# Using Make
make db-shell

# Using Docker
docker exec -it dojo-postgres psql -U postgres -d dojo_platform
```

### Connection String
```
postgresql://postgres:postgres@localhost:5432/dojo_platform
```

## Redis Access

### Using Redis Commander (Web UI)
1. Navigate to http://localhost:8081
2. Redis is automatically connected

### Using Redis CLI
```bash
# Using Make
make redis-cli

# Using Docker
docker exec -it dojo-redis redis-cli
```

### Common Redis Commands
```bash
# In Redis CLI
KEYS *              # List all keys
GET key_name        # Get value
DEL key_name        # Delete key
FLUSHALL           # Clear all data
INFO               # Server information
```

## Development Workflow

### Starting Fresh Development Environment
```bash
# 1. Clean any existing containers
make dev-clean

# 2. Start services
make dev-up

# 3. Run backend locally
cd dojo-backend
npm run dev

# 4. Run frontend locally (in another terminal)
cd dojo-platform
npm run dev
```

### Checking Service Health
```bash
# Check if services are healthy
make status

# View service logs if there are issues
make dev-logs
```

### Troubleshooting

#### Port Already in Use
```bash
# Find process using port (example for 5432)
# Windows
netstat -ano | findstr :5432

# Mac/Linux
lsof -i :5432

# Then kill the process or change the port in docker-compose.dev.yml
```

#### Container Won't Start
```bash
# Check logs
docker-compose -f docker-compose.dev.yml logs postgres
docker-compose -f docker-compose.dev.yml logs redis

# Remove and recreate
make dev-clean
make dev-up
```

#### Database Connection Issues
1. Ensure Docker Desktop is running
2. Check if container is healthy: `docker ps`
3. Verify environment variables in .env
4. Try restarting: `make dev-restart`

#### Redis Connection Issues
1. Check if Redis is running: `docker ps | grep redis`
2. Test connection: `docker exec dojo-redis redis-cli ping`
3. Check logs: `docker logs dojo-redis`

## Data Persistence

- PostgreSQL data is stored in a Docker volume: `dojo_postgres_data`
- Redis data is stored in a Docker volume: `dojo_redis_data`
- Data persists between container restarts
- Use `make dev-clean` to remove all data and start fresh

## Backup and Restore

### Database Backup
```bash
# Create backup
make db-backup
# Creates: backup_YYYYMMDD_HHMMSS.sql

# Manual backup to specific file
docker exec dojo-postgres pg_dump -U postgres dojo_platform > my_backup.sql
```

### Database Restore
```bash
# Restore using Make
make db-restore
# Enter filename when prompted

# Manual restore
docker exec -i dojo-postgres psql -U postgres dojo_platform < my_backup.sql
```

## Security Notes

⚠️ **Important for Production:**
- Change default passwords in .env
- Use strong JWT_SECRET
- Don't commit .env file to git
- Consider using Docker secrets for sensitive data
- Enable SSL for PostgreSQL in production
- Set Redis password in production

## Performance Tips

1. **PostgreSQL Optimization**
   - Adjust shared_buffers and work_mem for your workload
   - Enable query logging for debugging
   - Use pg_stat_statements extension

2. **Redis Optimization**
   - Monitor memory usage with INFO command
   - Configure maxmemory policy
   - Use appropriate eviction strategy

3. **Docker Resources**
   - Allocate sufficient memory in Docker Desktop settings
   - Monitor with `docker stats`

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## Support

For issues or questions:
1. Check the logs: `make dev-logs`
2. Review this documentation
3. Check Docker Desktop resources
4. Restart services: `make dev-restart`