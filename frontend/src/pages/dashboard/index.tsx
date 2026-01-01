import { DashboardHeader } from '../../../components/dashboard-header';
import { StatsCards } from '../../../components/stats-cards';
import { EarningsChart } from '../../../components/earnings-chart';
import { EventsCalendar } from '../../../components/events-calendar';
import { TopPerformer } from '../../../components/top-performer';
import { AttendanceChart } from '../../../components/attendance-chart';

export default function DashboardPage() {
    return (
        <div className="p-6 space-y-6">
            <StatsCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EarningsChart />
                <EventsCalendar />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopPerformer />
                <AttendanceChart />
            </div>
        </div>
    );
}
