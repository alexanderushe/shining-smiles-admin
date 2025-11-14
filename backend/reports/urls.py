from django.urls import path
from .views import ReportSummaryView

urlpatterns = [
    path('<int:id>/', ReportSummaryView.as_view(), name='report-summary'),
]
