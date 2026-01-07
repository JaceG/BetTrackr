import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Share2,
	Download,
	Copy,
	Check,
	TrendingUp,
	TrendingDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareableStatsCardProps {
	currentBalance: number;
	totalProfit: number;
	winRate: number;
	winCount: number;
	lossCount: number;
	roi: number;
	periodLabel?: string;
}

export default function ShareableStatsCard({
	currentBalance,
	totalProfit,
	winRate,
	winCount,
	lossCount,
	roi,
	periodLabel = 'All Time',
}: ShareableStatsCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);
	const [isCopied, setIsCopied] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const { toast } = useToast();

	const isProfit = totalProfit >= 0;

	const generateImage = async (): Promise<Blob | null> => {
		if (!cardRef.current) return null;

		setIsGenerating(true);

		try {
			// Dynamically import html-to-image
			const { toPng } = await import('html-to-image');

			const dataUrl = await toPng(cardRef.current, {
				quality: 1,
				pixelRatio: 2,
				backgroundColor: '#0f172a', // Dark background
			});

			// Convert data URL to blob
			const res = await fetch(dataUrl);
			const blob = await res.blob();
			return blob;
		} catch (error) {
			console.error('Error generating image:', error);
			toast({
				title: 'Error',
				description: 'Failed to generate image. Please try again.',
				variant: 'destructive',
			});
			return null;
		} finally {
			setIsGenerating(false);
		}
	};

	const handleDownload = async () => {
		const blob = await generateImage();
		if (!blob) return;

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `betting-stats-${
			new Date().toISOString().split('T')[0]
		}.png`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		toast({
			title: 'Downloaded!',
			description: 'Your stats card has been saved.',
		});
	};

	const handleCopy = async () => {
		const blob = await generateImage();
		if (!blob) return;

		try {
			await navigator.clipboard.write([
				new ClipboardItem({ 'image/png': blob }),
			]);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
			toast({
				title: 'Copied!',
				description: 'Image copied to clipboard.',
			});
		} catch (error) {
			toast({
				title: 'Copy failed',
				description: 'Your browser may not support copying images.',
				variant: 'destructive',
			});
		}
	};

	const handleShare = async () => {
		const blob = await generateImage();
		if (!blob) return;

		const file = new File([blob], 'betting-stats.png', {
			type: 'image/png',
		});

		if (navigator.share && navigator.canShare({ files: [file] })) {
			try {
				await navigator.share({
					files: [file],
					title: 'My Betting Stats',
					text: `Check out my betting performance! ${
						isProfit ? '📈' : '📉'
					}`,
				});
			} catch (error) {
				if ((error as Error).name !== 'AbortError') {
					handleDownload();
				}
			}
		} else {
			handleDownload();
		}
	};

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant='outline' size='sm' className='gap-2'>
					<Share2 className='w-4 h-4' />
					<span className='hidden sm:inline'>Share Stats</span>
				</Button>
			</DialogTrigger>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle>Share Your Stats</DialogTitle>
					<DialogDescription>
						Generate an image of your betting performance to share
						on social media.
					</DialogDescription>
				</DialogHeader>

				{/* Preview Card */}
				<div className='flex justify-center py-4'>
					<div
						ref={cardRef}
						className='w-[320px] p-6 rounded-2xl'
						style={{
							background:
								'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
							fontFamily: 'Inter, system-ui, sans-serif',
						}}>
						{/* Header */}
						<div className='flex items-center justify-between mb-6'>
							<div className='flex items-center gap-2'>
								<div className='w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center'>
									<TrendingUp className='w-5 h-5 text-white' />
								</div>
								<span className='text-white font-semibold text-sm'>
									Sports Betting Charts
								</span>
							</div>
							<span className='text-slate-400 text-xs'>
								{periodLabel}
							</span>
						</div>

						{/* Main Stat */}
						<div className='text-center mb-6'>
							<p className='text-slate-400 text-xs uppercase tracking-wider mb-1'>
								Total Profit
							</p>
							<p
								className={`text-4xl font-bold font-mono ${
									isProfit
										? 'text-emerald-400'
										: 'text-red-400'
								}`}>
								{isProfit ? '+' : '-'}$
								{Math.abs(totalProfit).toLocaleString()}
							</p>
							<div
								className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-xs ${
									isProfit
										? 'bg-emerald-500/20 text-emerald-400'
										: 'bg-red-500/20 text-red-400'
								}`}>
								{isProfit ? (
									<TrendingUp className='w-3 h-3' />
								) : (
									<TrendingDown className='w-3 h-3' />
								)}
								{roi >= 0 ? '+' : ''}
								{roi.toFixed(1)}% ROI
							</div>
						</div>

						{/* Stats Grid */}
						<div className='grid grid-cols-3 gap-3'>
							<div className='text-center p-3 rounded-lg bg-slate-800/50'>
								<p className='text-slate-400 text-[10px] uppercase tracking-wider mb-1'>
									Win Rate
								</p>
								<p className='text-white font-bold text-lg'>
									{winRate.toFixed(1)}%
								</p>
							</div>
							<div className='text-center p-3 rounded-lg bg-slate-800/50'>
								<p className='text-slate-400 text-[10px] uppercase tracking-wider mb-1'>
									Wins
								</p>
								<p className='text-emerald-400 font-bold text-lg'>
									{winCount}
								</p>
							</div>
							<div className='text-center p-3 rounded-lg bg-slate-800/50'>
								<p className='text-slate-400 text-[10px] uppercase tracking-wider mb-1'>
									Losses
								</p>
								<p className='text-red-400 font-bold text-lg'>
									{lossCount}
								</p>
							</div>
						</div>

						{/* Footer */}
						<div className='mt-4 pt-4 border-t border-slate-700/50 text-center'>
							<p className='text-slate-500 text-[10px]'>
								sportsbettingcharts.com
							</p>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className='flex gap-2'>
					<Button
						onClick={handleShare}
						className='flex-1 gap-2'
						disabled={isGenerating}>
						<Share2 className='w-4 h-4' />
						Share
					</Button>
					<Button
						variant='outline'
						onClick={handleDownload}
						disabled={isGenerating}>
						<Download className='w-4 h-4' />
					</Button>
					<Button
						variant='outline'
						onClick={handleCopy}
						disabled={isGenerating}>
						{isCopied ? (
							<Check className='w-4 h-4' />
						) : (
							<Copy className='w-4 h-4' />
						)}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
