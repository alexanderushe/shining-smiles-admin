import pytest
from django.db import transaction
from django.test import TransactionTestCase
from datetime import date
from tests.factories import StudentFactory
from payments.models import Payment


class TestTransactionRollback(TransactionTestCase):
    reset_sequences = True

    def test_atomic_block_rolls_back_on_error(self):
        student = StudentFactory()
        year = date.today().year
        initial_count = Payment.objects.count()
        try:
            with transaction.atomic():
                Payment.objects.create(
                    student=student,
                    amount=11.00,
                    payment_method="Cash",
                    receipt_number="TX-ROLL-1",
                    status="pending",
                    term="1",
                    academic_year=year,
                    cashier_name="TX",
                )
                raise RuntimeError("forced error")
        except RuntimeError:
            pass
        assert Payment.objects.count() == initial_count