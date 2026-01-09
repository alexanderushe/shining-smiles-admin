import os
import django
import random

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from agents.models import AgentAction
from core.models import School

def create_samples():
    try:
        school = School.objects.get(code='SSA') # Shining Smiles Academy
    except:
        print("School 'SSA' not found. Make sure fix_admin.py has run.")
        return

    # Clear existing
    AgentAction.objects.filter(school=school).delete()

    actions = [
        {
            "agent_name": "BursarBot",
            "title": "Unusual Payment Volume detected",
            "description": "Total collections for today ($2,400) are 300% higher than the daily average. Please verify if a bulk payment event occurred.",
            "priority": "medium",
            "action_payload": {"date": "2024-10-24", "total": 2400, "average": 800}
        },
        {
            "agent_name": "SecurityOverseer",
            "title": "High-Value Void Attempt",
            "description": "User 'John Doe' attempted to void a receipt of $450.00. This requires explicit admin approval.",
            "priority": "high",
            "action_payload": {"receipt": "REC-992", "amount": 450.00, "user": "john_doe"}
        },
        {
            "agent_name": "Guardian",
            "title": "Potential Truancy: Sarah Smith",
            "description": "Student Sarah Smith (Grade 4) has been marked absent for 3 consecutive Fridays. Recommend parent contact.",
            "priority": "low",
            "action_payload": {"student": "Sarah Smith", "absences": ["2024-10-04", "2024-10-11", "2024-10-18"]}
        }
    ]

    for a in actions:
        AgentAction.objects.create(
            school=school,
            agent_name=a['agent_name'],
            title=a['title'],
            description=a['description'],
            priority=a['priority'],
            status='open',
            action_payload=a['action_payload']
        )
        print(f"Created action: {a['title']}")

    print("Success! 3 Sample Actions created for SSA.")

if __name__ == "__main__":
    create_samples()
