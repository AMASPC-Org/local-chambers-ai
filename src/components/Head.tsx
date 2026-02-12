import React, { useEffect } from 'react';

interface HeadProps {
  title: string;
  description: string;
  structuredData?: object;
}

/**
 * Dynamic SEO and AI-Optimization component.
 * Injects Schema.org JSON-LD into the head for LLM parsing.
 */
export const Head: React.FC<HeadProps> = ({ title, description, structuredData }) => {
  useEffect(() => {
    // 1. Update Title
    document.title = `${title} | localchambers.ai`;
    
    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // 3. Inject JSON-LD (Structured Data)
    // We remove existing scripts to avoid duplicates on route change
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    if (structuredData) {
      const script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup happens automatically by the removal logic above on next render
    };
  }, [title, description, structuredData]);

  return null;
};