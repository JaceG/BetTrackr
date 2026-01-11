import { Link, useParams, useLocation } from 'wouter';
import { useSEO } from '@/hooks/use-seo';
import { useAuth } from '@/hooks/use-auth';
import { getBlogPostBySlug, BlogPost as BlogPostType } from '@/data/blog-posts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	TrendingUp,
	ArrowLeft,
	Calendar,
	Clock,
	Tag,
	User,
	ChevronRight,
	ArrowRight,
	UserCircle,
} from 'lucide-react';

// Import dashboard screenshots for blog posts
import dashboardMain from '@assets/dashboard-main.png';
import dashboardChart from '@assets/dashboard-chart.png';
import dashboardHistory from '@assets/dashboard-history.png';

// Import competitor screenshots for comparison post
import wagerlensMain from '@assets/wagerlens-main.png';
import betchekrMain from '@assets/betchekr-main.png';
import actionnetworkMain from '@assets/actionnetwork-main.png';
import pikkitMain from '@assets/pikkit-main.png';

// Import source screenshots for citation/reference
import vsinFlatBetting from '@assets/vsin-flat-betting.png';
import gamblingsitesBankroll from '@assets/gamblingsites-bankroll.png';
import sportsbettingdimeBankroll from '@assets/sportsbettingdime-bankroll.png';
import inplayliveLosingStreak from '@assets/inplaylive-losing-streak.png';
import predictemBankroll from '@assets/predictem-bankroll.png';
import bettingtoolsBlog from '@assets/bettingtools-blog.png';
import oddshopperBankroll from '@assets/oddsshopper-bankroll.png';
import atsstatsScaling from '@assets/atsstats-scaling.png';
import highstakesdbMental from '@assets/highstakesdb-mental.png';

// Import ROI topic screenshots
import sportsinsightsStatistical from '@assets/sportsinsights-statistical.png';
import boydsbetsVig from '@assets/boydsbets-vig.png';
import tsplivePro from '@assets/tsplive-pro.png';
import sportshandleEv from '@assets/sportshandle-ev.png';
import siVigJuice from '@assets/si-vig-juice.png';
import boydsbetsBreakeven from '@assets/boydsbets-breakeven.png';

// Import responsible gambling topic screenshots
import ncpgHelpline from '@assets/ncpg-helpline.png';
import responsiblegamblingProblem from '@assets/responsiblegambling-problem.png';
import gamAnon from '@assets/gam-anon.png';
import azProblemgambling from '@assets/az-problemgambling.png';
import ga20questions from '@assets/ga-20questions.png';

// Import edge-finding topic screenshots
import sportsinsightsContrarian from '@assets/sportsinsights-contrarian.png';
import actionnetworkNbaPlayoffs from '@assets/actionnetwork-nba-playoffs.png';
import gamingtodayLineshopping from '@assets/gamingtoday-lineshopping.png';
import oddshopperHome from '@assets/oddsshopper-home.png';
import bestoddsPlayerprops from '@assets/bestodds-playerprops.png';

// Image map for blog post references
const blogImages: Record<string, { src: string; alt: string }> = {
	'dashboard-main': {
		src: dashboardMain,
		alt: 'Sports Betting Charts dashboard showing balance tracking and betting statistics',
	},
	'dashboard-chart': {
		src: dashboardChart,
		alt: 'Balance over time chart showing profit trends and performance',
	},
	'dashboard-history': {
		src: dashboardHistory,
		alt: 'Bet history table with detailed entries and running balance',
	},
	wagerlens: {
		src: wagerlensMain,
		alt: 'WagerLens betting analytics platform homepage',
	},
	betchekr: {
		src: betchekrMain,
		alt: 'BetChekr AI betting assistant platform homepage',
	},
	actionnetwork: {
		src: actionnetworkMain,
		alt: 'Action Network sports betting platform homepage',
	},
	pikkit: {
		src: pikkitMain,
		alt: 'Pikkit sports bet tracker app homepage',
	},
	'vsin-flat-betting': {
		src: vsinFlatBetting,
		alt: 'VSiN article on flat betting bankroll management',
	},
	'gamblingsites-bankroll': {
		src: gamblingsitesBankroll,
		alt: 'GamblingSites.com bankroll management guide',
	},
	'sportsbettingdime-bankroll': {
		src: sportsbettingdimeBankroll,
		alt: 'Sports Betting Dime bankroll management guide',
	},
	'inplaylive-losing-streak': {
		src: inplayliveLosingStreak,
		alt: 'InPlayLive article on managing bankroll during losing streaks',
	},
	'predictem-bankroll': {
		src: predictemBankroll,
		alt: 'Predictem ultimate guide to bankroll management',
	},
	'bettingtools-blog': {
		src: bettingtoolsBlog,
		alt: 'BettingTools sports betting blog and guides',
	},
	'oddsshopper-bankroll': {
		src: oddshopperBankroll,
		alt: 'OddsShopper bankroll building guide',
	},
	'atsstats-scaling': {
		src: atsstatsScaling,
		alt: 'ATS Stats article on scaling unit size',
	},
	'highstakesdb-mental': {
		src: highstakesdbMental,
		alt: 'HighStakesDB mental strategies for losing streaks',
	},
	'sportsinsights-statistical': {
		src: sportsinsightsStatistical,
		alt: 'Sports Insights article on statistical significance in betting',
	},
	'boydsbets-vig': {
		src: boydsbetsVig,
		alt: 'BoydsBets guide explaining vig and juice in sports betting',
	},
	'tsplive-pro': {
		src: tsplivePro,
		alt: 'TSP Live article on what qualifies as a professional bettor',
	},
	'sportshandle-ev': {
		src: sportshandleEv,
		alt: 'SportsHandle guide explaining expected value in betting',
	},
	'si-vig-juice': {
		src: siVigJuice,
		alt: 'Sports Illustrated article explaining vig and juice',
	},
	'boydsbets-breakeven': {
		src: boydsbetsBreakeven,
		alt: 'BoydsBets article on break-even percentage in betting',
	},
	'ncpg-helpline': {
		src: ncpgHelpline,
		alt: 'National Council on Problem Gambling helpline information',
	},
	'responsiblegambling-problem': {
		src: responsiblegamblingProblem,
		alt: 'Responsible Gambling Council - Numbers don\'t lie quiz',
	},
	'gam-anon': {
		src: gamAnon,
		alt: 'Gam-Anon support for families affected by problem gambling',
	},
	'az-problemgambling': {
		src: azProblemgambling,
		alt: 'Arizona Problem Gambling warning signs checklist',
	},
	'ga-20questions': {
		src: ga20questions,
		alt: 'Gamblers Anonymous 20 Questions self-assessment',
	},
	'sportsinsights-contrarian': {
		src: sportsinsightsContrarian,
		alt: 'Sports Insights optimal levels for betting against the public',
	},
	'actionnetwork-nba-playoffs': {
		src: actionnetworkNbaPlayoffs,
		alt: 'Action Network NBA playoff betting trends and stats',
	},
	'gamingtoday-lineshopping': {
		src: gamingtodayLineshopping,
		alt: 'Gaming Today guide to line shopping in sports betting',
	},
	'oddsshopper-home': {
		src: oddshopperHome,
		alt: 'OddsShopper sports betting tools and odds comparison',
	},
	'bestodds-playerprops': {
		src: bestoddsPlayerprops,
		alt: 'BestOdds Edge player props betting tools',
	},
};

export default function BlogPost() {
	const params = useParams<{ slug: string }>();
	const [, setLocation] = useLocation();
	const post = getBlogPostBySlug(params.slug || '');

	// Set SEO meta tags for the blog post
	useSEO(
		post
			? {
					title: `${post.title} | Sports Betting Charts Blog`,
					description: post.description,
					keywords: post.tags.join(', '),
					canonical: `https://sportsbettingcharts.com/blog/${post.slug}`,
					ogType: 'article',
					structuredData: {
						'@context': 'https://schema.org',
						'@type': 'BlogPosting',
						headline: post.title,
						description: post.description,
						author: {
							'@type': 'Organization',
							name: post.author,
						},
						datePublished: post.publishedAt,
						dateModified: post.updatedAt || post.publishedAt,
						publisher: {
							'@type': 'Organization',
							name: 'Sports Betting Charts',
							logo: {
								'@type': 'ImageObject',
								url: 'https://sportsbettingcharts.com/favicon.svg',
							},
						},
						mainEntityOfPage: {
							'@type': 'WebPage',
							'@id': `https://sportsbettingcharts.com/blog/${post.slug}`,
						},
					},
			  }
			: {
					title: 'Post Not Found | Sports Betting Charts Blog',
					description: 'The requested blog post could not be found.',
					noindex: true,
			  }
	);

	if (!post) {
		return (
			<div className='min-h-screen bg-background'>
				<BlogNav />
				<div className='max-w-3xl mx-auto px-4 py-20 text-center'>
					<h1 className='text-4xl font-bold mb-4'>Post Not Found</h1>
					<p className='text-muted-foreground mb-8'>
						The blog post you're looking for doesn't exist or has
						been moved.
					</p>
					<Link href='/blog'>
						<Button>
							<ArrowLeft className='w-4 h-4 mr-2' />
							Back to Blog
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background'>
			<BlogNav />

			{/* Hero Section */}
			<header className='pt-28 pb-12 px-4 relative overflow-hidden'>
				{/* Background gradient effects */}
				<div className='absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent' />
				<div className='absolute top-40 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl' />

				<div className='max-w-3xl mx-auto relative z-10'>
					{/* Breadcrumb */}
					<nav className='flex items-center gap-2 text-sm text-muted-foreground mb-6'>
						<Link href='/home'>
							<span className='hover:text-foreground transition-colors cursor-pointer'>
								Home
							</span>
						</Link>
						<ChevronRight className='w-4 h-4' />
						<Link href='/blog'>
							<span className='hover:text-foreground transition-colors cursor-pointer'>
								Blog
							</span>
						</Link>
						<ChevronRight className='w-4 h-4' />
						<span className='text-foreground'>{post.category}</span>
					</nav>

					{/* Category Badge */}
					<div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-medium mb-4'>
						<Tag className='w-3.5 h-3.5' />
						{post.category}
					</div>

					{/* Title */}
					<h1 className='text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-[1.15]'>
						{post.title}
					</h1>

					{/* Description */}
					<p className='text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed'>
						{post.description}
					</p>

					{/* Meta info */}
					<div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
						<div className='flex items-center gap-2'>
							<User className='w-4 h-4' />
							<span>{post.author}</span>
						</div>
						<div className='flex items-center gap-2'>
							<Calendar className='w-4 h-4' />
							<time dateTime={post.publishedAt}>
								{new Date(post.publishedAt).toLocaleDateString(
									'en-US',
									{
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									}
								)}
							</time>
						</div>
						<div className='flex items-center gap-2'>
							<Clock className='w-4 h-4' />
							<span>{post.readTime}</span>
						</div>
					</div>
				</div>
			</header>

			{/* Article Content */}
			<article className='px-4 pb-16'>
				<div className='max-w-3xl mx-auto'>
					<div
						className='prose prose-lg dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-emerald-500 prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-blockquote:border-l-emerald-500 prose-blockquote:bg-emerald-500/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-table:text-sm prose-th:bg-muted prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-border prose-li:text-muted-foreground prose-li:marker:text-emerald-500 max-w-none'
						dangerouslySetInnerHTML={{
							__html: parseMarkdown(post.content),
						}}
					/>

					{/* Tags */}
					<div className='mt-12 pt-8 border-t border-border'>
						<div className='flex flex-wrap items-center gap-2'>
							<span className='text-sm text-muted-foreground mr-2'>
								Tags:
							</span>
							{post.tags.map((tag) => (
								<span
									key={tag}
									className='px-3 py-1 text-sm bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors'>
									{tag}
								</span>
							))}
						</div>
					</div>
				</div>
			</article>

			{/* CTA Section */}
			<section className='px-4 pb-20'>
				<div className='max-w-3xl mx-auto'>
					<Card className='bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20'>
						<CardContent className='pt-8 pb-8 text-center'>
							<h2 className='text-2xl font-bold mb-3'>
								Ready to Master Your Bankroll?
							</h2>
							<p className='text-muted-foreground mb-6 max-w-lg mx-auto'>
								Start tracking your bets today and see your real
								profit after all expenses. Free forever, no
								account required.
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

function BlogNav() {
	const { user, isAuthenticated } = useAuth();

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
					<Link href='/blog'>
						<span className='text-muted-foreground hover:text-foreground transition-colors cursor-pointer'>
							Blog
						</span>
					</Link>
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

/**
 * Simple markdown parser for blog content
 * Handles: headings, paragraphs, bold, italic, links, code, blockquotes, lists, tables, horizontal rules, images
 */
function parseMarkdown(markdown: string): string {
	let html = markdown;

	// Store image HTML in placeholders to protect from escaping
	const imagePlaceholders: string[] = [];

	// Process image placeholders and store them
	// Format: ![IMAGE:image-id] or ![IMAGE:image-id](caption)
	html = html.replace(
		/!\[IMAGE:([^\]]+)\](?:\(([^)]+)\))?/g,
		(_, imageId, caption) => {
			const image = blogImages[imageId];
			if (image) {
				const captionHtml = caption
					? `<figcaption class="text-center text-sm text-muted-foreground mt-3">${caption}</figcaption>`
					: '';
				const figureHtml = `<figure class="my-8 -mx-4 md:mx-0"><div class="rounded-xl overflow-hidden border border-border/50 shadow-lg"><img src="${image.src}" alt="${image.alt}" class="w-full" loading="lazy" /></div>${captionHtml}</figure>`;
				const placeholderIndex = imagePlaceholders.length;
				imagePlaceholders.push(figureHtml);
				return `___IMAGE_PLACEHOLDER_${placeholderIndex}___`;
			}
			return ''; // Remove placeholder if image not found
		}
	);

	// Escape HTML entities first (but preserve backticks and special markdown chars)
	html = html
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	// Code blocks (must be done before other transformations)
	html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
		return `<pre><code class="language-${
			lang || 'text'
		}">${code.trim()}</code></pre>`;
	});

	// Inline code
	html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

	// Tables
	html = html.replace(
		/\n\|(.+)\|\n\|[-\s|]+\|\n((?:\|.+\|\n?)+)/g,
		(_, header, rows) => {
			const headerCells = header
				.split('|')
				.filter((c: string) => c.trim())
				.map((c: string) => `<th>${c.trim()}</th>`)
				.join('');
			const bodyRows = rows
				.trim()
				.split('\n')
				.map((row: string) => {
					const cells = row
						.split('|')
						.filter((c: string) => c.trim())
						.map((c: string) => `<td>${c.trim()}</td>`)
						.join('');
					return `<tr>${cells}</tr>`;
				})
				.join('');
			return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
		}
	);

	// Blockquotes
	html = html.replace(/^&gt; (.+)$/gm, '<blockquote><p>$1</p></blockquote>');

	// Headings
	html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
	html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
	html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

	// Horizontal rules
	html = html.replace(/^---$/gm, '<hr />');

	// Links - must be done before bold/italic so they can work inside links
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
		// External links open in new tab
		return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
	});

	// Bold and italic
	html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
	html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

	// Unordered lists
	html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
	html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

	// Ordered lists
	html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

	// Checkbox items (for the checklist)
	html = html.replace(
		/- ☐ (.+)/g,
		'<li class="flex items-start gap-2"><span class="text-muted-foreground">☐</span> $1</li>'
	);

	// Paragraphs - wrap remaining text blocks
	html = html
		.split('\n\n')
		.map((block) => {
			const trimmed = block.trim();
			if (
				!trimmed ||
				trimmed.startsWith('<h') ||
				trimmed.startsWith('<ul') ||
				trimmed.startsWith('<ol') ||
				trimmed.startsWith('<li') ||
				trimmed.startsWith('<blockquote') ||
				trimmed.startsWith('<pre') ||
				trimmed.startsWith('<table') ||
				trimmed.startsWith('<hr') ||
				trimmed.startsWith('___IMAGE_PLACEHOLDER_')
			) {
				return trimmed;
			}
			return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
		})
		.join('\n\n');

	// Restore image placeholders with actual HTML
	imagePlaceholders.forEach((figureHtml, index) => {
		html = html.replace(`___IMAGE_PLACEHOLDER_${index}___`, figureHtml);
	});

	return html;
}
