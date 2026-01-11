import { Link } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { useAuth } from '@/hooks/use-auth';
import { getAllBlogPosts } from '@/data/blog-posts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
	TrendingUp,
	Calendar,
	Clock,
	ArrowRight,
	Tag,
	UserCircle,
	Sparkles,
} from 'lucide-react';

export default function Blog() {
	const { user, isAuthenticated } = useAuth();
	const blogPosts = getAllBlogPosts();

	useSEO({
		title: 'Sports Betting Strategy Blog | Tips, Guides & Expert Insights',
		description:
			'Learn winning sports betting strategies, bankroll management, and get expert insights from Sports Betting Charts. Free guides to help you profit from your betting.',
		keywords:
			'sports betting blog, betting strategy, bankroll management, betting tips, sports betting guide, capper reviews',
		canonical: 'https://sportsbettingcharts.com/blog',
		ogType: 'website',
	});

	// Highlight the datsq9 post
	const featuredPost = blogPosts.find(
		(post) => post.slug === 'capper-spotlight-datsq9'
	);
	const otherPosts = blogPosts.filter(
		(post) => post.slug !== 'capper-spotlight-datsq9'
	);

	return (
		<div className='min-h-screen bg-background'>
			<BlogNav user={user} isAuthenticated={isAuthenticated} />

			{/* Hero Section */}
			<header className='pt-28 pb-12 px-4 relative overflow-hidden'>
				{/* Background gradient effects */}
				<div className='absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent' />
				<div className='absolute top-40 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl' />
				<div className='absolute top-60 right-1/4 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl' />

				<div className='max-w-5xl mx-auto relative z-10'>
					<div className='text-center'>
						<Badge className='mb-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'>
							<TrendingUp className='w-3 h-3 mr-1' />
							Expert Insights
						</Badge>
						<h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.15]'>
							Sports Betting Strategy Blog
						</h1>
						<p className='text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed'>
							Learn winning strategies, master bankroll
							management, and get expert insights to profit from
							your sports betting.
						</p>
					</div>
				</div>
			</header>

			{/* Featured Post - DatsQ9 Spotlight */}
			{featuredPost && (
				<section className='px-4 pb-12'>
					<div className='max-w-5xl mx-auto'>
						<div className='flex items-center gap-2 mb-4'>
							<Sparkles className='w-5 h-5 text-emerald-500' />
							<h2 className='text-xl font-bold'>Featured Post</h2>
						</div>
						<Link href={`/blog/${featuredPost.slug}`}>
							<Card className='group hover:border-emerald-500/50 transition-all duration-300 cursor-pointer bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent border-emerald-500/20 relative overflow-hidden'>
								{/* Decorative corner badge */}
								<div className='absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg'>
									<Sparkles className='w-3 h-3' />
									Featured
								</div>

								<CardHeader className='pb-3'>
									<Badge className='w-fit mb-3 bg-emerald-500/10 text-emerald-500 border-emerald-500/20'>
										<Tag className='w-3 h-3 mr-1' />
										{featuredPost.category}
									</Badge>
									<h3 className='text-2xl md:text-3xl font-bold tracking-tight group-hover:text-emerald-500 transition-colors leading-tight'>
										{featuredPost.title}
									</h3>
								</CardHeader>
								<CardContent>
									<p className='text-muted-foreground mb-4 leading-relaxed'>
										{featuredPost.description}
									</p>
									<div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4'>
										<div className='flex items-center gap-2'>
											<Calendar className='w-4 h-4' />
											<time
												dateTime={
													featuredPost.publishedAt
												}>
												{new Date(
													featuredPost.publishedAt
												).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</time>
										</div>
										<div className='flex items-center gap-2'>
											<Clock className='w-4 h-4' />
											<span>{featuredPost.readTime}</span>
										</div>
									</div>
									<div className='flex items-center gap-2 text-emerald-500 font-medium group-hover:gap-3 transition-all'>
										Read Full Article
										<ArrowRight className='w-4 h-4' />
									</div>
								</CardContent>
							</Card>
						</Link>
					</div>
				</section>
			)}

			{/* All Blog Posts */}
			<section className='px-4 pb-20'>
				<div className='max-w-5xl mx-auto'>
					<h2 className='text-2xl font-bold mb-6'>All Articles</h2>
					<div className='grid gap-6 md:grid-cols-2'>
						{otherPosts.map((post) => (
							<Link key={post.slug} href={`/blog/${post.slug}`}>
								<Card className='group hover:border-emerald-500/30 transition-all duration-300 cursor-pointer h-full'>
									<CardHeader className='pb-3'>
										<Badge className='w-fit mb-3 bg-muted text-muted-foreground'>
											<Tag className='w-3 h-3 mr-1' />
											{post.category}
										</Badge>
										<h3 className='text-xl font-bold tracking-tight group-hover:text-emerald-500 transition-colors leading-tight'>
											{post.title}
										</h3>
									</CardHeader>
									<CardContent>
										<p className='text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2'>
											{post.description}
										</p>
										<div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3'>
											<div className='flex items-center gap-1.5'>
												<Calendar className='w-3.5 h-3.5' />
												<time
													dateTime={post.publishedAt}>
													{new Date(
														post.publishedAt
													).toLocaleDateString(
														'en-US',
														{
															year: 'numeric',
															month: 'short',
															day: 'numeric',
														}
													)}
												</time>
											</div>
											<div className='flex items-center gap-1.5'>
												<Clock className='w-3.5 h-3.5' />
												<span>{post.readTime}</span>
											</div>
										</div>
										<div className='flex items-center gap-2 text-emerald-500 text-sm font-medium group-hover:gap-3 transition-all'>
											Read Article
											<ArrowRight className='w-4 h-4' />
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='px-4 pb-20'>
				<div className='max-w-5xl mx-auto'>
					<Card className='bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20'>
						<CardContent className='pt-8 pb-8 text-center'>
							<h2 className='text-2xl md:text-3xl font-bold mb-3'>
								Ready to Track Your Bets Like a Pro?
							</h2>
							<p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>
								Join thousands of bettors using Sports Betting
								Charts to track their performance, manage
								bankrolls, and maximize profits. Free forever,
								no account required.
							</p>
							<div className='flex flex-col sm:flex-row items-center justify-center gap-3'>
								<Link href='/'>
									<Button
										size='lg'
										className='bg-emerald-600 hover:bg-emerald-700'>
										Start Tracking Free
										<ArrowRight className='w-4 h-4 ml-2' />
									</Button>
								</Link>
								<Link href='/home'>
									<Button size='lg' variant='outline'>
										Learn More
									</Button>
								</Link>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Footer */}
			<footer className='border-t py-12 px-4'>
				<div className='max-w-6xl mx-auto'>
					<div className='flex flex-col md:flex-row items-center justify-between gap-4'>
						<div className='flex items-center gap-2'>
							<div className='w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center'>
								<TrendingUp className='w-5 h-5 text-white' />
							</div>
							<span className='text-lg font-bold'>
								Sports Betting Charts
							</span>
						</div>
						<div className='flex items-center gap-6 text-sm text-muted-foreground'>
							<Link href='/'>
								<span className='hover:text-foreground transition-colors cursor-pointer'>
									App
								</span>
							</Link>
							<Link href='/blog'>
								<span className='hover:text-foreground transition-colors cursor-pointer'>
									Blog
								</span>
							</Link>
							<Link href='/subscribe'>
								<span className='hover:text-foreground transition-colors cursor-pointer'>
									Premium
								</span>
							</Link>
							<Link href='/login'>
								<span className='hover:text-foreground transition-colors cursor-pointer'>
									Login
								</span>
							</Link>
						</div>
						<p className='text-sm text-muted-foreground'>
							© {new Date().getFullYear()} Sports Betting Charts.
							All rights reserved.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}

function BlogNav({
	user,
	isAuthenticated,
}: {
	user: any;
	isAuthenticated: boolean;
}) {
	return (
		<nav className='fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md'>
			<div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Link href='/home'>
						<div className='flex items-center gap-2 cursor-pointer'>
							<div className='w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center'>
								<TrendingUp className='w-5 h-5 text-white' />
							</div>
							<span className='text-xl font-bold tracking-tight'>
								Sports Betting Charts
							</span>
						</div>
					</Link>
					<span className='text-muted-foreground mx-2'>/</span>
					<span className='text-foreground font-medium'>Blog</span>
				</div>
				<div className='flex items-center gap-3'>
					{isAuthenticated ? (
						<>
							<Link href='/account'>
								<Button variant='ghost' size='sm'>
									<UserCircle className='w-4 h-4 mr-2' />
									{user?.username}
								</Button>
							</Link>
							<Link href='/'>
								<Button
									size='sm'
									className='bg-emerald-600 hover:bg-emerald-700'>
									Open App
								</Button>
							</Link>
						</>
					) : (
						<>
							<Link href='/login'>
								<Button variant='ghost' size='sm'>
									Log in
								</Button>
							</Link>
							<Link href='/'>
								<Button
									size='sm'
									className='bg-emerald-600 hover:bg-emerald-700'>
									Open App
								</Button>
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
