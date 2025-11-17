from django.urls import path
from .views import ReportSummaryView, CashierDailyView, TermSummaryView, StudentBalanceView, ReconciliationView

urlpatterns = [
    path('<int:id>/', ReportSummaryView.as_view(), name='report-summary'),
    path('cashier-daily/', CashierDailyView.as_view(), name='cashier-daily'),
    path('term-summary/', TermSummaryView.as_view(), name='term-summary'),
    path('student-balance/', StudentBalanceView.as_view(), name='student-balance'),
    path('reconciliation/', ReconciliationView.as_view(), name='reconciliation'),
]
