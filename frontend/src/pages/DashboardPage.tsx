import { useAuth } from '@/app/providers/AuthProvider';
import { AdminDashboard } from '@/features/dashboard/AdminDashboard';
import { EmployeeDashboard } from '@/features/dashboard/EmployeeDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <AdminDashboard /> : <EmployeeDashboard />;
}
