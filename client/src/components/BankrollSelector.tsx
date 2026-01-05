import { useQuery } from '@tanstack/react-query';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wallet } from 'lucide-react';

interface Bankroll {
  id: string;
  name: string;
  color: string;
  description?: string;
  baseline: number;
  isDefault?: boolean;
}

interface BankrollSelectorProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
}

export default function BankrollSelector({
  value,
  onChange,
  disabled,
}: BankrollSelectorProps) {
  const { data: bankrolls = [], isLoading } = useQuery<Bankroll[]>({
    queryKey: ['/api/bankrolls'],
  });

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading bankrolls..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (bankrolls.length === 0) {
    return null; // Don't show selector if no bankrolls exist
  }

  return (
    <Select
      value={value || 'none'}
      onValueChange={(val) => onChange(val === 'none' ? undefined : val)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select bankroll">
          {value ? (
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    bankrolls.find((b) => b.id === value)?.color || '#888',
                }}
              />
              <span>{bankrolls.find((b) => b.id === value)?.name || 'Select bankroll'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span>No bankroll (General)</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <span>No bankroll (General)</span>
          </div>
        </SelectItem>
        {bankrolls.map((bankroll) => (
          <SelectItem key={bankroll.id} value={bankroll.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: bankroll.color }}
              />
              <span>{bankroll.name}</span>
              {bankroll.isDefault && (
                <span className="text-xs text-muted-foreground">(Default)</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
