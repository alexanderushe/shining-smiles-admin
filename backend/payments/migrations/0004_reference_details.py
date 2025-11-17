from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0003_alter_payment_term'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='reference_details',
            field=models.CharField(max_length=255, blank=True, null=True),
        ),
    ]