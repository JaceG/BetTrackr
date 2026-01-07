import { useEffect } from 'react';
import { updateMetaTags, type SEOConfig } from '@/lib/seo';

/**
 * Hook to update SEO meta tags for a page
 * @param config - SEO configuration object
 */
export function useSEO(config: SEOConfig) {
  useEffect(() => {
    updateMetaTags(config);

    // Cleanup function to reset to default on unmount
    return () => {
      // Optionally reset to default home page meta tags
      // This prevents stale meta tags when navigating
    };
  }, [config]);
}
