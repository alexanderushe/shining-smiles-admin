import os
import django

def run():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()

    from django.contrib.auth import get_user_model
    from core.permissions import get_role
    
    User = get_user_model()
    try:
        user = User.objects.get(username='admin')
        print(f"User: {user.username}")
        print(f"Is Authenticated: {user.is_authenticated}")
        print(f"Is Superuser: {user.is_superuser}")
        print(f"Is Staff: {user.is_staff}")
        
        try:
            profile = user.profile
            print(f"Profile Role: {profile.role}")
        except Exception as e:
            print(f"Profile Error: {e}")
            
        role = get_role(user)
        print(f"Calculated Role: {role}")
        
    except User.DoesNotExist:
        print("User 'admin' not found!")

if __name__ == "__main__":
    run()
