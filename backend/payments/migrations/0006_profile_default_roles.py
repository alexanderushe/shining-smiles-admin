from django.db import migrations
from django.conf import settings


def assign_default_roles(apps, schema_editor):
    User = apps.get_model(settings.AUTH_USER_MODEL.split('.')[0], settings.AUTH_USER_MODEL.split('.')[-1])
    Profile = apps.get_model('payments', 'Profile')
    for user in User.objects.all():
        if not hasattr(user, 'profile'):
            role = 'admin' if (getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False)) else 'cashier'
            Profile.objects.create(user=user, role=role)


class Migration(migrations.Migration):
    dependencies = [
        ('payments', '0005_alter_profile_role'),
    ]

    operations = [
        migrations.RunPython(assign_default_roles, migrations.RunPython.noop),
    ]