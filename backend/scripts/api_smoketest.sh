#!/usr/bin/env bash
set -euo pipefail
BASE="http://localhost:8000/api/v1"
DATE="$(date +%F)"
YEAR="$(date +%Y)"

echo "== Create/Get Cashier User =="
CID=$(docker compose exec -T web python manage.py shell -c "from django.contrib.auth.models import User; u, c = User.objects.get_or_create(username='cashier1', defaults={'email': 'cashier1@example.com'}); c and (u.set_password('password') or u.save()); print(u.id)")
echo "Cashier ID: $CID"

echo "\n== API Root =="
curl -s "$BASE/"

echo "\n== Create Campus =="
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"name":"Test Campus","location":"City","code":"TEST001"}' \
  "$BASE/students/campuses/" || true

CAMP_ID=$(curl -s "$BASE/students/campuses/" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d[0]["id"])')
echo "Campus ID: $CAMP_ID"

echo "\n== Create Student =="
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"student_number":"S1001","first_name":"Jane","last_name":"Doe","dob":"2008-01-01","current_grade":"Grade 9","campus_id":'"$CAMP_ID"'}' \
  "$BASE/students/" || true

SID=$(curl -s "$BASE/students/" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d[0]["id"])')
echo "Student ID: $SID"

echo "\n== Create Pending Payment =="
PEND_ID=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"student":'"$SID"',"amount":100.50,"payment_method":"Cash","receipt_number":"R-'"$DATE"'-A","status":"pending","term":"1","academic_year":'"$YEAR"',"cashier_id":'"$CID"'}' \
  "$BASE/payments/" | python3 -c 'import sys,json; print(json.load(sys.stdin)["id"])')
echo "Pending Payment ID: $PEND_ID"

echo "\n== Create Posted Payment =="
POST_ID=$(curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"student":'"$SID"',"amount":75.00,"payment_method":"Card","receipt_number":"R-'"$DATE"'-B","status":"posted","term":"1","academic_year":'"$YEAR"',"cashier_id":'"$CID"'}' \
  "$BASE/payments/" | python3 -c 'import sys,json; print(json.load(sys.stdin)["id"])')
echo "Posted Payment ID: $POST_ID"

echo "\n== PATCH Posted Payment (Expected Fail) =="
curl -s -X PATCH -H 'Content-Type: application/json' -d '{"amount":80.00}' "$BASE/payments/$POST_ID/"

echo "\n== DELETE Posted Payment (Expected Fail) =="
curl -i -s -X DELETE "$BASE/payments/$POST_ID/"

echo "\n== Payments List =="
curl -s "$BASE/payments/?page=1&page_size=5"

echo "\n== Cashier Daily Report =="
curl -s "$BASE/reports/cashier-daily/?date=$DATE&cashier_id=$CID"

echo "\n== Term Summary Report =="
curl -s "$BASE/reports/term-summary/?term=1&year=$YEAR"

echo "\n== Student Balance Report =="
curl -s "$BASE/reports/student-balance/?student_id=$SID"

echo "\n== Reconciliation POST =="
curl -s -X POST -H 'Content-Type: application/json' \
  -d '{"cashier_id":'"$CID"',"date":"'"$DATE"'","actual_amount":95.00,"notes":"Till close"}' \
  "$BASE/reports/reconciliation/"

echo "\n== Reconciliation GET =="
curl -s "$BASE/reports/reconciliation/"