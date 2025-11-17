from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('payments', '0004_profile'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='role',
            field=models.CharField(max_length=20, choices=[('cashier', 'Cashier'), ('accountant', 'Accountant'), ('admin', 'Admin'), ('auditor', 'Auditor')]),
        ),
    ]