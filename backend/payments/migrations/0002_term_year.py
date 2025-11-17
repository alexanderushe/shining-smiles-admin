from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='term',
            field=models.CharField(max_length=10, default='1'),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='payment',
            name='academic_year',
            field=models.IntegerField(default=2025),
            preserve_default=False,
        ),
        migrations.AddConstraint(
            model_name='payment',
            constraint=models.UniqueConstraint(fields=('term', 'academic_year', 'receipt_number'), name='unique_receipt_per_term_year'),
        ),
    ]