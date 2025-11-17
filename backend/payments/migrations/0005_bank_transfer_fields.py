from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0004_reference_details'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='reference_number',
            field=models.CharField(max_length=100, blank=True, null=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='transfer_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='payment',
            name='bank_name',
            field=models.CharField(max_length=100, blank=True, null=True),
        ),
    ]