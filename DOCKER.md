# Docker Unified Setup

This project now supports running the entire stack (database, backend, frontend) with a single Docker command.

## Quick Start

### Start Everything
```bash
docker-compose up
```

### Start in Detached Mode (Background)
```bash
docker-compose up -d
```

### Stop Everything
```bash
docker-compose down
```

### Rebuild Containers (after dependency changes)
```bash
docker-compose up --build
```

## Services

The docker-compose configuration includes three services:

1. **Database (PostgreSQL)** - Port 5433
2. **Backend (Django)** - Port 8000
3. **Frontend (Next.js)** - Port 3000

## Accessing the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Backend Admin:** http://localhost:8000/admin
- **API Docs:** http://localhost:8000/swagger/

## Development Workflow

### First Time Setup
```bash
# Build and start all services
docker-compose up --build

# In a new terminal, run migrations
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser
```

### Daily Development
```bash
# Start all services
docker-compose up

# Your code changes will auto-reload (hot reload enabled)
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f db
```

### Run Django Commands
```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser

# Run tests
docker-compose exec backend pytest
```

### Install New Dependencies

**Backend (Python):**
```bash
# Add package to requirements.txt, then:
docker-compose exec backend pip install -r requirements.txt

# Or rebuild:
docker-compose up --build backend
```

**Frontend (npm):**
```bash
# Install inside container
docker-compose exec frontend npm install <package-name>

# Or rebuild:
docker-compose up --build frontend
```

## Troubleshooting

### Port Already in Use
If you get a "port already in use" error:
```bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

### Database Connection Issues
```bash
# Restart the database
docker-compose restart db

# Or rebuild everything
docker-compose down
docker-compose up --build
```

### Clean Slate (Nuclear Option)
```bash
# Stop and remove all containers, networks, volumes
docker-compose down -v

# Rebuild everything
docker-compose up --build
```

## Notes

- Hot reload is enabled for both frontend and backend
- Database data persists in a Docker volume (`postgres_data`)
- Frontend `node_modules` are stored in the container (not synced to host)
- All services are connected via a custom network (`shining-network`)
