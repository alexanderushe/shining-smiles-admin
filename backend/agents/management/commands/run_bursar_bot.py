from django.core.management.base import BaseCommand
from core.models import School
from students.models import Student
from payments.models import Payment
from agents.models import AgentAction
from django.db.models import Sum

class Command(BaseCommand):
    help = 'Runs the BursarBot to identify overdue payments'

    def handle(self, *args, **options):
        self.stdout.write("🤖 BursarBot waking up...")
        
        # simplified logic: Term Fee is $500
        TERM_FEE = 500.00
        
        schools = School.objects.filter(is_active=True)
        
        for school in schools:
            students = Student.objects.filter(school=school)
            self.stdout.write(f"Scanning {students.count()} students in {school.name}...")
            
            for student in students:
                # Calculate total payments for current term (hardcoded term 1 2024 for demo)
                total_paid = Payment.objects.filter(
                    student=student, 
                    term='1', 
                    academic_year=2024,
                    status='posted'
                ).aggregate(Sum('amount'))['amount__sum'] or 0.00
                
                balance = TERM_FEE - float(total_paid)
                
                if balance > 0:
                    self.stdout.write(f"⚠️ Defaulter: {student.first_name} {student.last_name} owes ${balance}")
                    
                    # Create/Update Agent Action
                    # "Get or Create" to avoid spamming duplicates every time the bot runs
                    action, created = AgentAction.objects.get_or_create(
                        school=school,
                        agent_name='BursarBot',
                        title=f"Overdue Fees: {student.first_name} {student.last_name}",
                        status='open', # Only create if not already resolved/dismissed? 
                                       # Actually get_or_create on open status ensures we don't duplicate OPEN ones.
                        defaults={
                            'description': f"Student owes ${balance} (Paid ${total_paid} of ${TERM_FEE}). Last payment was low.",
                            'priority': 'high' if balance > 300 else 'medium',
                            'action_payload': {
                                'student_id': student.id,
                                'balance': balance,
                                'total_paid': float(total_paid)
                            }
                        }
                    )
                    
                    if created:
                        self.stdout.write(f"   -> Created Escalation Task #{action.id}")
                    else:
                        self.stdout.write(f"   -> Task #{action.id} already exists")
                        
        self.stdout.write("🤖 BursarBot finished.")
