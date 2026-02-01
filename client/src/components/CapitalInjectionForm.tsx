import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface CapitalInjection {
	id: string;
	date: string;
	amount: number;
	notes?: string;
}

interface CapitalInjectionFormProps {
	open: boolean;
	onClose: () => void;
	onSave: (injection: {
		date: string;
		amount: number;
		notes: string;
	}) => void;
	initialData?: CapitalInjection;
}

export default function CapitalInjectionForm({
	open,
	onClose,
	onSave,
	initialData,
}: CapitalInjectionFormProps) {
	const [date, setDate] = useState('');
	const [amount, setAmount] = useState('');
	const [notes, setNotes] = useState('');

	useEffect(() => {
		if (open) {
			if (initialData) {
				setDate(initialData.date);
				setAmount(initialData.amount.toString());
				setNotes(initialData.notes || '');
			} else {
				const now = new Date();
				const localDateTime = new Date(
					now.getTime() - now.getTimezoneOffset() * 60000
				)
					.toISOString()
					.slice(0, 16);
				setDate(localDateTime);
				setAmount('');
				setNotes('');
			}
		}
	}, [open, initialData]);

	const handleSave = () => {
		if (!date || !amount) return;

		onSave({
			date,
			amount: Number(amount),
			notes,
		});

		onClose();
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>
						{initialData ? 'Edit' : 'Add'} Cash Deposit
					</DialogTitle>
					<DialogDescription>
						Record additional funds added to your bankroll
					</DialogDescription>
				</DialogHeader>
				<div className='space-y-4 py-4'>
					<div className='space-y-2'>
						<Label htmlFor='injection-date'>Date & Time</Label>
						<Input
							id='injection-date'
							type='datetime-local'
							value={date}
							onChange={(e) => setDate(e.target.value)}
							data-testid='input-injection-date'
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='injection-amount'>Amount</Label>
						<Input
							id='injection-amount'
							type='number'
							placeholder='How much did you deposit?'
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							data-testid='input-injection-amount'
						/>
						<p className='text-xs text-muted-foreground'>
							Enter the amount you added to your betting bankroll
						</p>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='injection-notes'>
							Notes (Optional)
						</Label>
						<Textarea
							id='injection-notes'
							placeholder='e.g., Bonus deposit, winnings from another site...'
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							className='resize-none'
							rows={2}
							data-testid='input-injection-notes'
						/>
					</div>
				</div>
				<DialogFooter>
					<Button variant='outline' onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSave}
						disabled={!date || !amount}
						data-testid='button-save-injection'>
						{initialData ? 'Update' : 'Add'} Deposit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
