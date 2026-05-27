import { useState } from 'react';
import { Plus, Search, Filter, Target } from 'lucide-react';
import { useLeads } from '@/hooks/queries/useLeads';
import { useAuth } from '@/app/providers/AuthProvider';
import { useDeleteLead } from '@/hooks/mutations/useLeadMutations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { LeadStatusBadge } from '@/components/common/LeadStatusBadge';
import { LeadFormDialog } from './LeadFormDialog';
import { DeleteLeadDialog } from './DeleteLeadDialog';
import { toast } from '@/hooks/use-toast';
import type { Lead, LeadFilters, LeadSource, LeadStatus } from '@/types';
import { LEAD_SOURCE_LABELS } from '@/constants';
import { formatDate } from '@/lib/utils';
import { Link } from 'react-router-dom';

const STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'NOT_INTERESTED', label: 'Not Interested' },
  { value: 'CONVERTED', label: 'Converted' },
];

const SOURCES: Array<{ value: LeadSource; label: string }> = [
  { value: 'CALL', label: 'Call' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'FIELD', label: 'Field' },
];

export function LeadsFeature() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [filters, setFilters] = useState<LeadFilters>({ page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);

  const { data, isLoading } = useLeads({ ...filters, search: search || undefined });
  const deleteMutation = useDeleteLead();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setFilters((f) => ({ ...f, page: 1 }));
  };

  const handleDelete = async () => {
    if (!deleteLead) return;
    try {
      await deleteMutation.mutateAsync(deleteLead.id);
      toast({ title: 'Lead deleted', variant: 'success' as never });
      setDeleteLead(null);
    } catch {
      toast({ title: 'Failed to delete lead', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Leads</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? '...' : `${data?.total ?? 0} total leads`}
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={search}
                onChange={handleSearch}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.status ?? 'all'}
                onValueChange={(v) => setFilters((f) => ({ ...f, status: v === 'all' ? undefined : v as LeadStatus, page: 1 }))}
              >
                <SelectTrigger className="w-36">
                  <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select
                value={filters.source ?? 'all'}
                onValueChange={(v) => setFilters((f) => ({ ...f, source: v === 'all' ? undefined : v as LeadSource, page: 1 }))}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {SOURCES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lead</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Phone</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden md:table-cell">Source</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                {isAdmin && <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Assigned To</th>}
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hidden lg:table-cell">Created</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-5 py-4 hidden sm:table-cell"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-5 py-4 hidden md:table-cell"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    {isAdmin && <td className="px-5 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-24" /></td>}
                    <td className="px-5 py-4 hidden lg:table-cell"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-8 w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6}>
                    <EmptyState
                      icon={Target}
                      title="No leads found"
                      description="Start by creating your first lead or adjust the filters."
                      action={{ label: 'Add Lead', onClick: () => setCreateOpen(true) }}
                    />
                  </td>
                </tr>
              ) : (
                data?.items.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-5 py-4">
                      <Link to={`/leads/${lead.id}`} className="group-hover:text-primary transition-colors">
                        <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                        {lead.email && <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[160px]">{lead.email}</p>}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 hidden sm:table-cell">{lead.phone}</td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{LEAD_SOURCE_LABELS[lead.source]}</span>
                    </td>
                    <td className="px-5 py-4"><LeadStatusBadge status={lead.status} /></td>
                    {isAdmin && (
                      <td className="px-5 py-4 text-sm text-gray-600 hidden lg:table-cell">{lead.assignedTo.name}</td>
                    )}
                    <td className="px-5 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditLead(lead)} className="h-8 px-3 text-xs">
                          Edit
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteLead(lead)}
                            className="h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {((filters.page ?? 1) - 1) * (filters.limit ?? 10) + 1}–
              {Math.min((filters.page ?? 1) * (filters.limit ?? 10), data.total)} of {data.total}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page ?? 1) <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page ?? 1) >= data.totalPages}
                onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      <LeadFormDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <LeadFormDialog open={!!editLead} lead={editLead ?? undefined} onClose={() => setEditLead(null)} />
      <DeleteLeadDialog
        open={!!deleteLead}
        leadName={deleteLead?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteLead(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
