import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Plus, MoreVertical, Pencil, Trash2, Wallet, Star } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Bankroll {
  id: string;
  name: string;
  color: string;
  description?: string;
  baseline: number;
  isDefault?: boolean;
  createdAt: string;
}

interface BankrollFormData {
  name: string;
  color: string;
  description: string;
  baseline: number;
  isDefault: boolean;
}

const BANKROLL_COLORS = [
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Pink', value: '#ec4899' },
];

function BankrollForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  initialData?: Bankroll;
  onSubmit: (data: BankrollFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [formData, setFormData] = useState<BankrollFormData>({
    name: initialData?.name || '',
    color: initialData?.color || BANKROLL_COLORS[0].value,
    description: initialData?.description || '',
    baseline: initialData?.baseline || 0,
    isDefault: initialData?.isDefault || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Bankroll Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., DraftKings, FanDuel, NFL Strategy"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="baseline">Starting Balance</Label>
        <Input
          id="baseline"
          type="number"
          value={formData.baseline}
          onChange={(e) =>
            setFormData({ ...formData, baseline: parseFloat(e.target.value) || 0 })
          }
          placeholder="0"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Color</Label>
        <div className="flex flex-wrap gap-2">
          {BANKROLL_COLORS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setFormData({ ...formData, color: color.value })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                formData.color === color.value
                  ? 'ring-2 ring-offset-2 ring-offset-background'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Notes about this bankroll..."
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Switch
            id="isDefault"
            checked={formData.isDefault}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isDefault: checked })
            }
          />
          <Label htmlFor="isDefault" className="cursor-pointer">
            Set as default bankroll
          </Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

export default function BankrollManager() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBankroll, setEditingBankroll] = useState<Bankroll | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: bankrolls = [], isLoading } = useQuery<Bankroll[]>({
    queryKey: ['/api/bankrolls'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: BankrollFormData) => {
      return await apiRequest('POST', '/api/bankrolls', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bankrolls'] });
      toast({ title: 'Bankroll Created', description: 'Your new bankroll has been created.' });
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create bankroll',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: BankrollFormData }) => {
      return await apiRequest('PATCH', `/api/bankrolls/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bankrolls'] });
      toast({ title: 'Bankroll Updated', description: 'Your bankroll has been updated.' });
      setEditingBankroll(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update bankroll',
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/bankrolls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bankrolls'] });
      toast({ title: 'Bankroll Deleted', description: 'The bankroll has been deleted.' });
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete bankroll',
        variant: 'destructive',
      });
    },
  });

  const handleCreate = (data: BankrollFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: BankrollFormData) => {
    if (editingBankroll) {
      updateMutation.mutate({ id: editingBankroll.id, data });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bankrolls</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2" />
              <div className="h-6 bg-muted rounded w-1/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Bankrolls</h3>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Bankroll
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Bankroll</DialogTitle>
              <DialogDescription>
                Track separate bankrolls for different sportsbooks or strategies.
              </DialogDescription>
            </DialogHeader>
            <BankrollForm
              onSubmit={handleCreate}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {bankrolls.length === 0 ? (
        <Card className="p-8 text-center">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-semibold mb-2">No Bankrolls Yet</h4>
          <p className="text-muted-foreground text-sm mb-4">
            Create separate bankrolls to track different sportsbooks or betting strategies.
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Bankroll
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bankrolls.map((bankroll) => (
            <Card
              key={bankroll.id}
              className="p-4 relative overflow-hidden"
              style={{ borderLeftColor: bankroll.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{bankroll.name}</h4>
                    {bankroll.isDefault && (
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    )}
                  </div>
                  {bankroll.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {bankroll.description}
                    </p>
                  )}
                  <p className="text-2xl font-bold font-mono mt-2">
                    ${bankroll.baseline.toLocaleString()}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingBankroll(bankroll)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteId(bankroll.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingBankroll} onOpenChange={() => setEditingBankroll(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bankroll</DialogTitle>
            <DialogDescription>Update your bankroll settings.</DialogDescription>
          </DialogHeader>
          {editingBankroll && (
            <BankrollForm
              initialData={editingBankroll}
              onSubmit={handleUpdate}
              onCancel={() => setEditingBankroll(null)}
              isSubmitting={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Bankroll?"
        description="This will delete the bankroll. Any bets assigned to this bankroll will be moved to your general tracking. This action cannot be undone."
      />
    </div>
  );
}
