import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useCreateLead, useUpdateLead } from '@/hooks/mutations/useLeadMutations';
import { useUsers } from '@/hooks/queries/useUsers';
import { useAuth } from '@/app/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import type { Lead } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Invalid phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  source: z.enum(['CALL', 'WHATSAPP', 'FIELD']),
  status: z.enum(['INTERESTED', 'NOT_INTERESTED', 'CONVERTED']),
  notes: z.string().optional(),
  assignedToId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  lead?: Lead;
  onClose: () => void;
}

export function LeadFormDialog({ open, lead, onClose }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isEdit = !!lead;

  const createMutation = useCreateLead();
  const updateMutation = useUpdateLead(lead?.id ?? '');
  const { data: usersData } = useUsers({ role: 'EMPLOYEE', isActive: true, limit: 100 });

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { source: 'CALL', status: 'INTERESTED' },
  });

  useEffect(() => {
    if (lead) {
      reset({
        name: lead.name,
        phone: lead.phone,
        email: lead.email ?? '',
        source: lead.source,
        status: lead.status,
        notes: lead.notes ?? '',
        assignedToId: lead.assignedTo.id,
      });
    } else {
      reset({ source: 'CALL', status: 'INTERESTED', name: '', phone: '', email: '', notes: '' });
    }
  }, [lead, reset, open]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync(data);
        toast({ title: 'Lead updated successfully', variant: 'success' as never });
      } else {
        await createMutation.mutateAsync(data);
        toast({ title: 'Lead created successfully', variant: 'success' as never });
      }
      onClose();
    } catch {
      toast({ title: isEdit ? 'Failed to update lead' : 'Failed to create lead', variant: 'destructive' });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="John Doe" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" placeholder="+1-555-0100" {...register('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Source *</Label>
              <Controller
                control={control}
                name="source"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CALL">📞 Call</SelectItem>
                      <SelectItem value="WHATSAPP">💬 WhatsApp</SelectItem>
                      <SelectItem value="FIELD">🚗 Field</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INTERESTED">Interested</SelectItem>
                      <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
                      <SelectItem value="CONVERTED">Converted</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {isAdmin && usersData && (
            <div className="space-y-1.5">
              <Label>Assign To</Label>
              <Controller
                control={control}
                name="assignedToId"
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select employee..." /></SelectTrigger>
                    <SelectContent>
                      {usersData.items.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" placeholder="Add notes about this lead..." rows={3} {...register('notes')} />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
