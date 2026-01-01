#!/bin/bash
set -e

echo "========================================"
echo "ENTRYPOINT: Starting Django application"
echo "========================================"

echo "Waiting for postgres to be ready..."
until python -c "import psycopg2; psycopg2.connect(host='db', port=5432, user='ss_admin', password='root', dbname='shining_smiles')" 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done
echo "PostgreSQL is ready!"

echo "Running database migrations..."
python manage.py migrate --noinput || {
  echo "ERROR: Migration failed!"
  python manage.py migrate --noinput --verbosity 2
  exit 1
}
echo "Migrations completed successfully"

echo "Starting Django server..."
exec "$@"
