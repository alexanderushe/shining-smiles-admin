import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth.models import User
from core.models import School
from payments.models import Profile

def fix_admin():
    print("Checking admin user...")
    try:
        user = User.objects.get(username='admin')
        print(f"User 'admin' found. Resetting password...")
        user.set_password('admin123')
        user.save()
        print("Password set to 'admin123'.")
    except User.DoesNotExist:
        print("User 'admin' not found. Creating...")
        user = User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
        print("User 'admin' created.")

    # Check School
    school, created = School.objects.get_or_create(name='Shining Smiles Academy', defaults={'code': 'SSA'})
    if created:
        print(f"School '{school.name}' created.")
    else:
        print(f"School '{school.name}' found.")

    # Check Profile
    profile, created = Profile.objects.get_or_create(user=user, defaults={'role': 'admin', 'school': school})
    if created:
        print(f"Profile created for admin with role '{profile.role}'.")
    else:
        print(f"Profile found for admin. Updating role/school...")
        profile.role = 'admin'
        profile.school = school
        profile.save()
        print("Profile updated.")

    print("Done! Try logging in with admin / admin123")

if __name__ == "__main__":
    fix_admin()
