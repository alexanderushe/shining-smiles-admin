# Docker Unified Setup

**✅ Verified Working Setup** - Run your entire application stack (database, backend, frontend) with a single command.

## ⚡ Quick Start

**From the project root directory:**

```bash
# Start everything (first time - will build)
docker-compose up --build

# Start in background (detached mode)
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f
```

**That's it!** All 3 services will start automatically:
- ✅ PostgreSQL Database (port 5433)
- ✅ Django Backend API (port 8000)
- ✅ Next.js Frontend (port 3000)

## 🌐 Access Your Application

Once running, access:

- **Frontend App:** http://localhost:3000
- **Students Page:** http://localhost:3000/students
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/swagger/
- **Django Admin:** http://localhost:8000/admin

---

## ⚠️ Migrating from Old Setup

**If you previously ran `backend/docker-compose.yml`**, stop it first:

```bash
# Stop old backend-only containers
docker-compose -f backend/docker-compose.yml down

# Then start new unified setup
docker-compose up
```

**Why?** The old setup only ran backend + database. The new unified setup runs **all 3 services** from the project root.

---

## 📦 Services

The docker-compose configuration includes three services:

| Service | Container Name | Port | Description |
|---------|---------------|------|-------------|
| **db** | `shining_db` | 5433 | PostgreSQL 15 database |
| **backend** | `shining_backend` | 8000 | Django REST API |
| **frontend** | `shining_frontend` | 3000 | Next.js application |

All services are connected via the `shining-network` Docker network.

---

## 🚀 First Time Setup

**1. Build and Start Services:**
```bash
# From project root
docker-compose up --build
```

Wait for all services to start. You'll see:
- ✅ Database ready messages
- ✅ Backend: `Django version X.X, using settings 'core.settings'`
- ✅ Frontend: `✓ Ready in XXXms`

**2. Run Database Migrations:**

Open a **new terminal** (keep the containers running):
```bash
# Run Django migrations
docker-compose exec backend python manage.py migrate

# Create superuser (optional)
docker-compose exec backend python manage.py createsuperuser
```

**3. Verify Everything Works:**
- Open http://localhost:3000/students
- Open http://localhost:8000/swagger/

---

## 💻 Development Workflow

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

## 🔧 Troubleshooting

### Frontend Not Starting (Port 3000 Issue)

**Problem:** Backend works, but http://localhost:3000 doesn't load.

**Solution:** You might have the old Docker setup running.

```bash
# Check what's running
docker ps

# If you see old "backend-web" container, stop it:
docker-compose -f backend/docker-compose.yml down

# Start the new unified setup
docker-compose up
```

### Port Already in Use

If you get "port already in use" error:

```bash
# Check what's using the ports
docker ps

# Stop conflicting containers
docker stop $(docker ps -q)

# Or kill processes using specific ports
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5433 | xargs kill -9  # Database
```

### Database Connection Issues

```bash
# Restart just the database
docker-compose restart db

# View database logs
docker-compose logs db

# If migrations fail, ensure database is ready
docker-compose exec backend python manage.py migrate
```

### Containers Keep Restarting

```bash
# View logs to see the error
docker-compose logs -f

# Common issues:
# - Missing dependencies: rebuild with --build
# - Port conflicts: check docker ps
# - Database not ready: wait a few seconds and retry
```

### Clean Slate (Nuclear Option)

When nothing else works:

```bash
# Stop and remove EVERYTHING (including data)
docker-compose down -v

# Remove all images
docker rmi $(docker images -q)

# Rebuild from scratch
docker-compose up --build
```

⚠️ **Warning:** This deletes all database data!

### First Build Takes Forever

**This is normal!** First build downloads:
- Node.js base image (~130 MB)
- Python base image (~130 MB)  
- All npm packages for frontend
- All Python packages for backend

**Total time:** 5-10 minutes on first build.

**Future builds:** Instant (Docker caches everything)

## Notes

- Hot reload is enabled for both frontend and backend
- Database data persists in a Docker volume (`postgres_data`)
- Frontend `node_modules` are stored in the container (not synced to host)
- All services are connected via a custom network (`shining-network`)
