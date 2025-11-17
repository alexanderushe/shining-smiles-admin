import factory
from django.contrib.auth.models import User
from students.models import Campus, Student
from payments.models import Payment, Profile
from datetime import date as dt_date

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    username = factory.Sequence(lambda n: f"user{n}")
    email = factory.LazyAttribute(lambda o: f"{o.username}@example.com")
    profile = factory.RelatedFactory('tests.factories.ProfileFactory', 'user')
    @factory.post_generation
    def password(obj, create, extracted, **kwargs):
        obj.set_password(extracted or "password")
        obj.save()

class ProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Profile
    user = factory.SubFactory(UserFactory)
    role = Profile.Role.CASHIER

class CampusFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Campus
    name = factory.Sequence(lambda n: f"Campus{n}")
    location = "Test City"
    code = factory.Sequence(lambda n: f"CODE{n}")

class StudentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Student
    student_number = factory.Sequence(lambda n: f"SSC{1000+n}")
    first_name = "Test"
    last_name = factory.Sequence(lambda n: f"Student{n}")
    dob = factory.LazyFunction(lambda: dt_date(2010, 1, 1))
    current_grade = "Grade 1"
    campus = factory.SubFactory(CampusFactory)

class PaymentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Payment
    student = factory.SubFactory(StudentFactory)
    amount = 100.00
    payment_method = "Cash"
    receipt_number = factory.Sequence(lambda n: f"R{n}")
    status = "pending"
    date = factory.LazyFunction(lambda: dt_date.today())
    cashier_name = "Auto"
    # If your model now requires term & academic_year:
    term = "1"
    academic_year = factory.LazyFunction(lambda: dt_date.today().year)
