/**
 * SEO utility functions for managing meta tags and structured data
 */

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  structuredData?: Record<string, any>;
}

/**
 * Updates document meta tags dynamically
 */
export function updateMetaTags(config: SEOConfig) {
  // Update title
  document.title = config.title;

  // Update or create meta tags
  updateMetaTag('name', 'description', config.description);
  
  if (config.keywords) {
    updateMetaTag('name', 'keywords', config.keywords);
  }

  // Open Graph tags
  updateMetaTag('property', 'og:title', config.title);
  updateMetaTag('property', 'og:description', config.description);
  updateMetaTag('property', 'og:type', config.ogType || 'website');
  
  if (config.canonical) {
    updateMetaTag('property', 'og:url', config.canonical);
  }
  
  if (config.ogImage) {
    updateMetaTag('property', 'og:image', config.ogImage);
  }

  // Twitter tags
  updateMetaTag('property', 'twitter:title', config.title);
  updateMetaTag('property', 'twitter:description', config.description);
  
  if (config.ogImage) {
    updateMetaTag('property', 'twitter:image', config.ogImage);
  }

  // Canonical URL
  if (config.canonical) {
    updateLinkTag('canonical', config.canonical);
  }

  // Robots meta tag
  if (config.noindex) {
    updateMetaTag('name', 'robots', 'noindex, nofollow');
  } else {
    updateMetaTag('name', 'robots', 'index, follow');
  }

  // Structured data
  if (config.structuredData) {
    updateStructuredData(config.structuredData);
  }
}

function updateMetaTag(attribute: string, value: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${value}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  
  element.href = href;
}

function updateStructuredData(data: Record<string, any>) {
  // Remove existing structured data script
  const existingScript = document.getElementById('structured-data');
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.id = 'structured-data';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * SEO configurations for different pages
 */
export const seoConfigs = {
  home: {
    title: 'Sports Betting Charts - Track Your Betting Profit & ROI',
    description: 'Track your sports betting balance with detailed analytics, running balance calculations, and visual charts. Import CSV data and monitor your profit/loss over time.',
    keywords: 'sports betting, betting tracker, bankroll management, betting analytics, profit calculator, ROI tracker, betting balance, sports gambling tracker',
    canonical: 'https://sportsbettingcharts.com/',
    ogImage: 'https://sportsbettingcharts.com/og-image.png',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Sports Betting Charts',
      applicationCategory: 'FinanceApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '150',
      },
      description: 'Track your sports betting balance with detailed analytics, running balance calculations, and visual charts.',
      operatingSystem: 'Web Browser',
      browserRequirements: 'Requires JavaScript. Modern browser recommended.',
    },
  },
  
  landing: {
    title: 'Sports Betting Tracker - Know Your Real Profit | Sports Betting Charts',
    description: 'Most affordable sports betting tracker. Track every bet, tip fee, and expense to know your real ROI. Free forever, premium features available. No account required.',
    keywords: 'sports betting tracker, betting analytics, tip fee tracker, bankroll management, betting ROI, profit calculator, sports gambling, betting charts',
    canonical: 'https://sportsbettingcharts.com/home',
    ogImage: 'https://sportsbettingcharts.com/og-image.png',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Sports Betting Charts',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web Browser',
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          name: 'Free Plan',
          description: 'Unlimited bet tracking with analytics',
        },
        {
          '@type': 'Offer',
          price: '9',
          priceCurrency: 'USD',
          name: 'Premium Plan',
          description: 'Cloud sync, multiple bankrolls, and advanced features',
          priceValidUntil: '2026-12-31',
        },
      ],
      description: 'Track your sports betting performance with detailed analytics and know your real profit after all expenses.',
      featureList: [
        'Unlimited bet tracking',
        'Visual charts and analytics',
        'Tip expense tracking',
        'Profit calculator',
        'CSV import/export',
        'Cloud sync (Premium)',
      ],
    },
  },

  login: {
    title: 'Login - Sports Betting Charts',
    description: 'Log in to Sports Betting Charts to sync your betting data across devices and access premium features.',
    canonical: 'https://sportsbettingcharts.com/login',
    noindex: true,
  },

  signup: {
    title: 'Sign Up - Sports Betting Charts',
    description: 'Create a free account to sync your betting data across devices and unlock cloud backup.',
    canonical: 'https://sportsbettingcharts.com/signup',
    noindex: true,
  },

  subscribe: {
    title: 'Premium Plans - Sports Betting Charts',
    description: 'Upgrade to Premium for $9/month. Get cloud sync, multiple bankrolls, streak analysis, advanced export options, and priority support.',
    keywords: 'sports betting premium, betting tracker subscription, cloud sync betting data',
    canonical: 'https://sportsbettingcharts.com/subscribe',
    ogImage: 'https://sportsbettingcharts.com/og-image.png',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Sports Betting Charts Premium',
      description: 'Premium subscription for Sports Betting Charts with cloud sync and advanced features',
      offers: {
        '@type': 'Offer',
        price: '9.00',
        priceCurrency: 'USD',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: 'https://sportsbettingcharts.com/subscribe',
      },
      brand: {
        '@type': 'Brand',
        name: 'Sports Betting Charts',
      },
    },
  },

  account: {
    title: 'My Account - Sports Betting Charts',
    description: 'Manage your Sports Betting Charts account, subscription, and settings.',
    canonical: 'https://sportsbettingcharts.com/account',
    noindex: true,
  },
};

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbs(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate organization structured data
 */
export function generateOrganization() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sports Betting Charts',
    url: 'https://sportsbettingcharts.com',
    logo: 'https://sportsbettingcharts.com/favicon.svg',
    sameAs: [
      // Add social media links here when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      availableLanguage: 'English',
    },
  };
}
