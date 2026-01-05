import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	TrendingUp,
	BarChart3,
	Calculator,
	Download,
	Shield,
	Zap,
	ChevronRight,
	Check,
	Star,
	ArrowRight,
} from 'lucide-react';

// Import screenshots
import dashboardMain from '@assets/dashboard-main.png';
import dashboardChart from '@assets/dashboard-chart.png';
import dashboardHistory from '@assets/dashboard-history.png';

export default function Landing() {
	return (
		<div className="min-h-screen bg-background">
			{/* Navigation */}
			<nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md">
				<div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
							<TrendingUp className="w-5 h-5 text-white" />
						</div>
						<span className="text-xl font-bold tracking-tight">Sports Betting Charts</span>
					</div>
					<div className="flex items-center gap-3">
						<Link href="/login">
							<Button variant="ghost" size="sm">
								Log in
							</Button>
						</Link>
						<Link href="/">
							<Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
								Open App
							</Button>
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="pt-32 pb-20 px-4 relative overflow-hidden">
				{/* Background gradient effects */}
				<div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent" />
				<div className="absolute top-40 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
				<div className="absolute top-60 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl" />
				
				<div className="max-w-5xl mx-auto text-center relative z-10">
					{/* Badge */}
					<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 animate-fade-in">
						<Zap className="w-4 h-4" />
						Most affordable betting tracker on the market
					</div>

					{/* Headlines */}
					<h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
						<span className="block text-foreground">Stop guessing.</span>
						<span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
							Start tracking.
						</span>
					</h1>

					<p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
						Know your <span className="text-foreground font-semibold">real</span> betting profit. 
						Track every bet, every tip fee, every dollar—so you actually know if you're winning.
					</p>

					{/* CTAs */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
						<Link href="/">
							<Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6 h-auto group">
								Start Tracking Free
								<ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
							</Button>
						</Link>
						<Link href="/subscribe">
							<Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto border-2">
								View Premium
							</Button>
						</Link>
					</div>

					{/* Social proof */}
					<div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
						<div className="flex items-center gap-1">
							<Check className="w-4 h-4 text-emerald-500" />
							No account required
						</div>
						<div className="flex items-center gap-1">
							<Check className="w-4 h-4 text-emerald-500" />
							100% free to use
						</div>
						<div className="flex items-center gap-1">
							<Check className="w-4 h-4 text-emerald-500" />
							Works offline
						</div>
					</div>
				</div>
			</section>

			{/* Screenshot Hero */}
			<section className="px-4 pb-20">
				<div className="max-w-6xl mx-auto">
					<div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl shadow-emerald-500/5">
						<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
						<img 
							src={dashboardMain} 
							alt="Sports Betting Charts Dashboard showing balance tracking and profit calculator" 
							className="w-full"
						/>
					</div>
				</div>
			</section>

			{/* Problem/Solution Section */}
			<section className="py-20 px-4 bg-card/50">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Most bettors have no idea if they're actually profitable
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Between tip service fees, multiple sportsbooks, and scattered records—
							it's nearly impossible to know your real ROI. Until now.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						<Card className="bg-card border-border/50 hover:border-emerald-500/30 transition-colors">
							<CardContent className="pt-6">
								<div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
									<Calculator className="w-6 h-6 text-emerald-500" />
								</div>
								<h3 className="text-xl font-semibold mb-2">Track Tip Fees</h3>
								<p className="text-muted-foreground">
									Factor in your tip service costs so you know your <span className="text-foreground">true</span> profit after expenses.
								</p>
							</CardContent>
						</Card>

						<Card className="bg-card border-border/50 hover:border-emerald-500/30 transition-colors">
							<CardContent className="pt-6">
								<div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center mb-4">
									<BarChart3 className="w-6 h-6 text-teal-500" />
								</div>
								<h3 className="text-xl font-semibold mb-2">Visualize Performance</h3>
								<p className="text-muted-foreground">
									Beautiful charts show your balance over time with customizable date ranges.
								</p>
							</CardContent>
						</Card>

						<Card className="bg-card border-border/50 hover:border-emerald-500/30 transition-colors">
							<CardContent className="pt-6">
								<div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
									<TrendingUp className="w-6 h-6 text-cyan-500" />
								</div>
								<h3 className="text-xl font-semibold mb-2">Set Weekly Goals</h3>
								<p className="text-muted-foreground">
									Our profit calculator tells you exactly how much you need per bet to hit your goals.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Feature Showcase - Chart */}
			<section className="py-20 px-4">
				<div className="max-w-6xl mx-auto">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div>
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 text-sm font-medium mb-4">
								<BarChart3 className="w-4 h-4" />
								Performance Analytics
							</div>
							<h2 className="text-3xl md:text-4xl font-bold mb-4">
								See your progress at a glance
							</h2>
							<p className="text-lg text-muted-foreground mb-6">
								Watch your bankroll grow (or identify problems early) with our interactive balance chart. 
								Filter by day, week, month, or view your entire history.
							</p>
							<ul className="space-y-3">
								{[
									'Track running balance in real-time',
									'View performance by any time range',
									'Identify winning and losing streaks',
									'See peak balance and max drawdown',
								].map((feature, i) => (
									<li key={i} className="flex items-center gap-3">
										<div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
											<Check className="w-3 h-3 text-emerald-500" />
										</div>
										<span className="text-muted-foreground">{feature}</span>
									</li>
								))}
							</ul>
						</div>
						<div className="rounded-xl overflow-hidden border border-border/50 shadow-xl">
							<img 
								src={dashboardChart} 
								alt="Balance over time chart showing profit trends" 
								className="w-full"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Feature Showcase - History */}
			<section className="py-20 px-4 bg-card/50">
				<div className="max-w-6xl mx-auto">
					<div className="grid lg:grid-cols-2 gap-12 items-center">
						<div className="order-2 lg:order-1 rounded-xl overflow-hidden border border-border/50 shadow-xl">
							<img 
								src={dashboardHistory} 
								alt="Bet history table with detailed entries" 
								className="w-full"
							/>
						</div>
						<div className="order-1 lg:order-2">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-medium mb-4">
								<Download className="w-4 h-4" />
								Complete History
							</div>
							<h2 className="text-3xl md:text-4xl font-bold mb-4">
								Every bet, perfectly organized
							</h2>
							<p className="text-lg text-muted-foreground mb-6">
								Log your bets with all the details that matter. See your running balance after each bet, 
								add notes, and export everything for tax season.
							</p>
							<ul className="space-y-3">
								{[
									'Log bet amount, winnings, and notes',
									'See running balance after each bet',
									'Import/export CSV for backup',
									'Edit or delete any entry',
								].map((feature, i) => (
									<li key={i} className="flex items-center gap-3">
										<div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
											<Check className="w-3 h-3 text-emerald-500" />
										</div>
										<span className="text-muted-foreground">{feature}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Pricing Section */}
			<section className="py-20 px-4">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Free forever. Premium when you're ready.
						</h2>
						<p className="text-lg text-muted-foreground">
							Start tracking for free—no account needed. Upgrade for cloud sync and advanced features.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
						{/* Free Tier */}
						<Card className="bg-card border-2 border-border/50">
							<CardContent className="pt-6">
								<div className="text-center mb-6">
									<h3 className="text-xl font-semibold mb-2">Free</h3>
									<div className="text-4xl font-bold">$0</div>
									<p className="text-sm text-muted-foreground mt-1">Forever free</p>
								</div>
								<ul className="space-y-3 mb-6">
									{[
										'Unlimited bet tracking',
										'Balance charts & analytics',
										'Profit calculator',
										'Tip expense tracking',
										'CSV import/export',
										'Works offline',
									].map((feature, i) => (
										<li key={i} className="flex items-center gap-3">
											<Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>
								<Link href="/">
									<Button variant="outline" className="w-full">
										Start Free
									</Button>
								</Link>
							</CardContent>
						</Card>

						{/* Premium Tier */}
						<Card className="bg-card border-2 border-emerald-500/50 relative overflow-hidden">
							<div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-white text-xs font-medium rounded-bl-lg">
								Best Value
							</div>
							<CardContent className="pt-6">
								<div className="text-center mb-6">
									<h3 className="text-xl font-semibold mb-2">Premium</h3>
									<div className="text-4xl font-bold">
										$9<span className="text-lg font-normal text-muted-foreground">/mo</span>
									</div>
									<p className="text-sm text-muted-foreground mt-1">Cancel anytime</p>
								</div>
								<ul className="space-y-3 mb-6">
									{[
										'Everything in Free, plus:',
										'Cloud sync across devices',
										'Automatic backup',
										'Streak analysis',
										'Multiple bankrolls',
										'Advanced export (PDF, Excel)',
										'Priority support',
										'Early access to new features',
									].map((feature, i) => (
										<li key={i} className="flex items-center gap-3">
											<Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>
								<Link href="/subscribe">
									<Button className="w-full bg-emerald-600 hover:bg-emerald-700">
										Go Premium
										<ChevronRight className="w-4 h-4 ml-1" />
									</Button>
								</Link>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-20 px-4 bg-card/50">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Get started in 30 seconds
						</h2>
						<p className="text-lg text-muted-foreground">
							No signup required. Just open the app and start tracking.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								step: '1',
								title: 'Set your baseline',
								description: 'Enter your starting bankroll to begin tracking your performance.',
							},
							{
								step: '2',
								title: 'Log your bets',
								description: 'Add each bet with the amount wagered and your winnings or losses.',
							},
							{
								step: '3',
								title: 'Track your profit',
								description: 'Watch your charts update and know your real ROI after all expenses.',
							},
						].map((item, i) => (
							<div key={i} className="text-center">
								<div className="w-12 h-12 rounded-full bg-emerald-500 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
									{item.step}
								</div>
								<h3 className="text-xl font-semibold mb-2">{item.title}</h3>
								<p className="text-muted-foreground">{item.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Final CTA */}
			<section className="py-20 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h2 className="text-3xl md:text-5xl font-bold mb-6">
						Ready to know your{' '}
						<span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
							real profit?
						</span>
					</h2>
					<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
						Join thousands of bettors who finally know whether they're winning or losing. 
						Start tracking for free—no account required.
					</p>
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link href="/">
							<Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-lg px-10 py-6 h-auto">
								Start Tracking Now
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						</Link>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="border-t py-12 px-4">
				<div className="max-w-6xl mx-auto">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
								<TrendingUp className="w-5 h-5 text-white" />
							</div>
							<span className="text-lg font-bold">Sports Betting Charts</span>
						</div>
						<div className="flex items-center gap-6 text-sm text-muted-foreground">
							<Link href="/">
								<span className="hover:text-foreground transition-colors cursor-pointer">App</span>
							</Link>
							<Link href="/subscribe">
								<span className="hover:text-foreground transition-colors cursor-pointer">Premium</span>
							</Link>
							<Link href="/login">
								<span className="hover:text-foreground transition-colors cursor-pointer">Login</span>
							</Link>
							<Link href="/signup">
								<span className="hover:text-foreground transition-colors cursor-pointer">Sign Up</span>
							</Link>
						</div>
						<p className="text-sm text-muted-foreground">
							© {new Date().getFullYear()} Sports Betting Charts. All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
