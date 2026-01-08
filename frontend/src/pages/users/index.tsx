import { DashboardHeader } from '../../components/dashboard-header';
import { UserList } from '../../components/users/user-list';

export default function UsersPage() {
    return (
        <div className="flex-1 p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system users and their roles.</p>
                </div>
            </div>
            <UserList />
        </div>
    );
}
