from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('reports', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Reconciliation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('expected_total', models.DecimalField(decimal_places=2, max_digits=10)),
                ('actual_amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('variance', models.DecimalField(decimal_places=2, max_digits=10)),
                ('status', models.CharField(choices=[('balanced', 'Balanced'), ('short', 'Short'), ('over', 'Over')], max_length=20)),
                ('notes', models.CharField(blank=True, max_length=255)),
                ('cashier', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]