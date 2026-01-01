import { DashboardHeader } from '../../../components/dashboard-header';
import { PaymentsList } from '../../../components/payments/payments-list';
import { PaymentsStats } from '../../../components/payments/payments-stats';
import { RevenueDebtsChart } from '../../../components/payments/revenue-debts-chart';
import { OfflineProvider } from '../../../components/payments/offline-provider';

export default function PaymentsPage() {
  return (
    <OfflineProvider>
      <div className="p-6 space-y-6">
        <PaymentsStats />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PaymentsList />
          <RevenueDebtsChart />
        </div>
      </div>
    </OfflineProvider>
  );
}
