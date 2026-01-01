import { DashboardHeader } from '../../../components/dashboard-header';
import { DailySummary } from '../../../components/reports/daily-summary';
import { CampusSummary } from '../../../components/reports/campus-summary';
import { CashierActivityReport } from '../../../components/reports/cashier-activity-report';
import { TermFeesReport } from '../../../components/reports/term-fees-report';
import { RevenueComparisonChart } from '../../../components/reports/revenue-comparison-chart';
import { CampusPerformanceChart } from '../../../components/reports/campus-performance-chart';
import { PaymentMethodsDistribution } from '../../../components/reports/payment-methods-distribution';
import { StudentBalanceSheet } from '../../../components/reports/student-balance-sheet';

export default function ReportsPage() {
    return (
        <div className="p-6 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailySummary />
                <CampusSummary />
            </div>

            {/* Revenue Trend Analysis */}
            <div className="grid grid-cols-1 gap-6">
                <RevenueComparisonChart />
            </div>

            {/* Campus Performance Comparison & Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CampusPerformanceChart />
                <PaymentMethodsDistribution />
            </div>

            {/* Cashier Activity & Term Fees */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CashierActivityReport />
                <TermFeesReport />
            </div>

            {/* Student Balance Sheet */}
            <div className="grid grid-cols-1 gap-6">
                <StudentBalanceSheet />
            </div>
        </div>
    );
}
