"""
Data migration script to create default school and assign all existing data to it.
This is a one-time migration for converting from single-tenant to multi-tenant.
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import School
from students.models import Student, Campus
from payments.models import Payment, Profile
from reports.models import Statement, Reconciliation
from notifications.models import Notification


class Command(BaseCommand):
    help = 'Create default school and migrate existing data to it'

    def add_arguments(self, parser):
        parser.add_argument(
            '--school-name',
            default='Shining Smiles',
            help='Name of the default school'
        )
        parser.add_argument(
            '--school-code',
            default='SS001',
            help='Code of the default school'
        )
        parser.add_argument(
            '--email',
            default='admin@shiningsmiles.co.zw',
            help='School contact email'
        )
        parser.add_argument(
            '--phone',
            default='+263',
            help='School contact phone'
        )

    @transaction.atomic
    def handle(self, *args, **options):
        school_name = options['school_name']
        school_code = options['school_code']
        email = options['email']
        phone = options['phone']

        self.stdout.write(f"\n🏫 Creating school: {school_name} ({school_code})")

        # Create or get default school
        school, created = School.objects.get_or_create(
            code=school_code,
            defaults={
                'name': school_name,
                'email': email,
                'phone': phone,
                'address': 'Harare, Zimbabwe',
                'city': 'Harare',
                'country': 'Zimbabwe',
                'subscription_tier': 'professional',
                'monthly_fee': 0.00,  # Existing school, no charge
                'is_active': True,
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f"✅ Created school: {school}"))
        else:
            self.stdout.write(self.style.WARNING(f"⚠️  School already exists: {school}"))

        # Migrate existing data
        self.stdout.write("\n📊 Migrating existing data to default school...")

        # Students
        students_count = Student.objects.filter(school__isnull=True).update(school=school)
        self.stdout.write(f"  ✅ Updated {students_count} students")

        # Campuses
        campuses_count = Campus.objects.filter(school__isnull=True).update(school=school)
        self.stdout.write(f"  ✅ Updated {campuses_count} campuses")

        # Payments
        payments_count = Payment.objects.filter(school__isnull=True).update(school=school)
        self.stdout.write(f"  ✅ Updated {payments_count} payments")

        # Profiles
        profiles_count = Profile.objects.filter(school__isnull=True).update(school=school)
        self.stdout.write(f"  ✅ Updated {profiles_count} user profiles")

        # Statements
        statements_count = Statement.objects.filter(school__isnull=True).update(school=school)
        self.stdout.write(f"  ✅ Updated {statements_count} statements")

        # Reconciliations
        reconciliations_count = Reconciliation.objects.filter(school__isnull=True).update(school=school)
        self.stdout.write(f"  ✅ Updated {reconciliations_count} reconciliations")

        # Notifications
        notifications_count = Notification.objects.filter(school__isnull=True).update(school=school)
        self.stdout.write(f"  ✅ Updated {notifications_count} notifications")

        total = (students_count + campuses_count + payments_count + profiles_count +
                 statements_count + reconciliations_count + notifications_count)

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Migration complete! Updated {total} total records."))
        self.stdout.write(f"   All existing data has been assigned to: {school}\n")
