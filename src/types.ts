export type PricingCategory = 'Free' | 'Freemium' | 'Paid' | 'Open Source';

export interface LaunchRequest {
  productName: string;
  websiteUrl: string;
  rawDescription: string;
  keywords: string;
  pricingType: PricingCategory;
  primaryCategory: string;
}

export interface PlatformDraft {
  platformId: string;
  platformName: string;
  url: string;
  tagline: string;
  shortDescription: string;
  longDescription?: string;
  suggestedCategory: string;
  tags: string[];
  maxLimits: {
    tagline: number;
    shortDescription: number;
    longDescription?: number;
  };
}

export interface SocialPost {
  network: 'HackerNews' | 'TwitterX' | 'RedditStartups' | 'IndieHackers' | 'LinkedIn';
  title?: string;
  content: string;
  bestPractices: string;
}

export interface SEOPackage {
  metaTitle: string;
  metaDescription: string;
  seoKeywords: string[];
  structuredSnippet?: string;
}

export interface LaunchPackage {
  productName: string;
  pricingType: PricingCategory;
  primaryCategory: string;
  fallbackMode?: boolean;
  fallbackError?: string;
  analyzedPitch: {
    strengths: string[];
    gaps: string[];
    suggestedHook: string;
  };
  platformDrafts: PlatformDraft[];
  socialPosts: SocialPost[];
  seoPackage: SEOPackage;
}

export interface SimulationStep {
  id: string;
  platformId: string;
  platformName: string;
  status: 'idle' | 'linking' | 'structuring' | 'validating' | 'completed' | 'failed';
  progress: number;
  message: string;
  estimatedAIIfluenceScore: number;
  logLines: string[];
}
