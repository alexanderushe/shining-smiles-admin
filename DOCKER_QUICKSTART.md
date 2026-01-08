# 🚀 Quick Start - Docker

## Start Everything with One Command

```bash
# From the project root directory
docker-compose up
```

That's it! This will start:
- ✅ PostgreSQL database (port 5433)
- ✅ Django backend (port 8000)
- ✅ Next.js frontend (port 3000)

## Access Your Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/swagger/

## Common Commands

### Start (Detached/Background)
```bash
docker-compose up -d
```

### Stop
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Just frontend
docker-compose logs -f frontend

# Just backend
docker-compose logs -f backend
```

### Rebuild (After Code Changes)
```bash
docker-compose up --build
```

### Run Django Commands
```bash
# Migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run tests
docker-compose exec backend pytest
```

## First Time Setup

```bash
# 1. Build and start everything
docker-compose up --build

# 2. In another terminal, run migrations
docker-compose exec backend python manage.py migrate

# 3. Create admin user (optional)
docker-compose exec backend python manage.py createsuperuser
```

**Note:** Your code changes will auto-reload! No need to restart containers.

---

For detailed documentation, see [DOCKER.md](./DOCKER.md)
