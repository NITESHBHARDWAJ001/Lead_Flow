import { Target, TrendingUp, UserCheck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEmployeeDashboard } from '@/hooks/queries/useDashboard';
import { useAuth } from '@/app/providers/AuthProvider';
import { StatCard } from '@/components/common/StatCard';
import { LeadStatusBadge } from '@/components/common/LeadStatusBadge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import { LEAD_SOURCE_LABELS } from '@/constants';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export function EmployeeDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useEmployeeDashboard();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name.split(' ')[0]}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Here's your personal performance overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Leads"
          value={data?.stats.totalLeads ?? 0}
          icon={Target}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          loading={isLoading}
        />
        <StatCard
          title="Interested"
          value={data?.stats.interestedLeads ?? 0}
          icon={TrendingUp}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          loading={isLoading}
        />
        <StatCard
          title="Converted"
          value={data?.stats.convertedLeads ?? 0}
          icon={UserCheck}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          loading={isLoading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${data?.stats.conversionRate ?? 0}%`}
          icon={BarChart3}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Status Distribution */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">My Lead Distribution</CardTitle>
            <CardDescription>Current status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={data?.statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="count"
                    >
                      {data?.statusDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5 w-full">
                  {data?.statusDistribution.map((item) => (
                    <div key={item.status} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                        <span className="text-muted-foreground text-xs">{item.status}</span>
                      </div>
                      <span className="font-semibold text-xs">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Leads */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              <CardDescription>Your latest lead updates</CardDescription>
            </div>
            <Link to="/leads" className="text-xs text-primary hover:underline font-medium">
              View all →
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : data?.recentLeads.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">No leads yet</div>
            ) : (
              <div className="divide-y divide-border">
                {data?.recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    to={`/leads/${lead.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {LEAD_SOURCE_LABELS[lead.source]} · {formatDateTime(lead.updatedAt)}
                      </p>
                    </div>
                    <LeadStatusBadge status={lead.status} />
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
