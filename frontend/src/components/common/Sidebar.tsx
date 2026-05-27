import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Target, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { UserMenu } from './UserMenu';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Target, label: 'Leads' },
  { to: '/users', icon: Users, label: 'Team', adminOnly: true },
];

interface SidebarProps {
  onClose: () => void;
  mobile?: boolean;
}

export function Sidebar({ onClose, mobile }: SidebarProps) {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col border-r border-border bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">LeadFlow</span>
        </div>
        {mobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          if (item.adminOnly && user?.role !== 'ADMIN') return null;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={mobile ? onClose : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive ? 'text-primary' : 'text-gray-400')} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <Separator />

      {/* User menu */}
      <div className="p-3">
        <UserMenu />
      </div>
    </div>
  );
}
