import { DashboardHeader } from '../../../components/dashboard-header';
import { StudentList } from '../../../components/students/student-list';
import { StudentProfile } from '../../../components/students/student-profile';

export default function StudentsPage() {
  return (
    <div className="flex-1 flex gap-6 p-6">
      <div className="w-96">
        <StudentList />
      </div>
      <div className="flex-1">
        <StudentProfile />
      </div>
    </div>
  );
}
