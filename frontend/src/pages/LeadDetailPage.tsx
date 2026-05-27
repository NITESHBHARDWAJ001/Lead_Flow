import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Clock, User } from 'lucide-react';
import { useLead } from '@/hooks/queries/useLeads';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadStatusBadge } from '@/components/common/LeadStatusBadge';
import { formatDateTime, formatDate } from '@/lib/utils';
import { LEAD_SOURCE_LABELS } from '@/constants';
import { LeadFormDialog } from '@/features/leads/LeadFormDialog';
import { useState } from 'react';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: lead, isLoading } = useLead(id ?? '');
  const [editOpen, setEditOpen] = useState(false);

  const canEdit =
    user?.role === 'ADMIN' || (lead && lead.assignedTo.id === user?.id);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Lead not found.</p>
        <Button variant="link" onClick={() => navigate('/leads')}>Go back to leads</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/leads')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
            <LeadStatusBadge status={lead.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {LEAD_SOURCE_LABELS[lead.source]} · Created {formatDate(lead.createdAt)}
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setEditOpen(true)}>Edit Lead</Button>
        )}
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader><CardTitle className="text-base font-semibold">Contact Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Phone className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{lead.phone}</p>
              </div>
            </div>
            {lead.email && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                  <Mail className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{lead.email}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Assigned To</p>
                <p className="text-sm font-medium">{lead.assignedTo.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
                <Clock className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium">{formatDateTime(lead.updatedAt)}</p>
              </div>
            </div>
          </div>

          {lead.notes && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status History */}
      {lead.statusHistory && lead.statusHistory.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base font-semibold">Status History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {lead.statusHistory.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    {entry.oldStatus && <LeadStatusBadge status={entry.oldStatus} />}
                    {entry.oldStatus && <span className="text-muted-foreground text-xs">→</span>}
                    <LeadStatusBadge status={entry.newStatus} />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-700">{entry.changedBy.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <LeadFormDialog open={editOpen} lead={lead} onClose={() => setEditOpen(false)} />
    </div>
  );
}
