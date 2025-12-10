import os
import django

def run():
    # Setup Django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

    from django.contrib.auth import get_user_model
    from payments.models import Profile
    User = get_user_model()
    username = 'admin'
    password = 'password123'
    email = 'admin@shiningsmiles.edu'

    if not User.objects.filter(username=username).exists():
        user = User.objects.create_superuser(username=username, email=email, password=password)
        print(f"Superuser '{username}' created successfully.")
        
        # Ensure profile exists and has Admin role
        # Try/catch to handle if Profile is automatically created by signals
        try:
             profile, created = Profile.objects.get_or_create(user=user)
             profile.role = 'Admin'
             profile.save()
             print(f"Profile for '{username}' updated to Admin role.")
        except Exception as e:
            print(f"Warning updating profile: {e}")

    else:
        print(f"Superuser '{username}' already exists.")

if __name__ == "__main__":
    run()
