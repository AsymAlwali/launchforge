import { LaunchRequest } from '../types';

export interface PreloadStartup extends LaunchRequest {
  tagline: string;
}

export const PRELOAD_STARTUPS: PreloadStartup[] = [
  {
    productName: 'One Question',
    websiteUrl: 'https://onequestion.space',
    tagline: 'AI-Powered Q&A Pages That Answer Visitors with YOUR Knowledge',
    rawDescription: 'Stop answering the same question twice. One Question provides custom, highly stylized landing profile nodes (onequestion.space/yourname) that sync with your background manuals, text notes, and prior answering transcripts to autonomously resolve user, customer, or reader inquiries utilizing your exact personal voice and verified knowledge.',
    keywords: 'autonomous support, knowledge base, custom q&a, creators productivity, landing profile links, ask me anything',
    pricingType: 'Freemium',
    primaryCategory: 'AI & Customer Experience'
  },
  {
    productName: 'LaunchForge AI',
    websiteUrl: 'https://launchforge.ai',
    tagline: 'Autonomous Multi-Directory Launch Director & Character Constraint-Safe Pitch Compiler',
    rawDescription: 'Crafted living on a challenge with intense resource constraints by an active indie maker, LaunchForge AI compiles ready-to-copy character-counted directory pitches across several platforms like Product Hunt, BetaList, and AlternativeTo. It features inline live SEO auditing, custom SVG banner creation and countdown scheduling in single-screen, lightning swift flow.',
    keywords: 'bootstrappers directory, character limits compiler, indie hackers launchpad, automation tools, product marketing',
    pricingType: 'Free',
    primaryCategory: 'Developer Tools'
  },
  {
    productName: 'ReviewShield',
    websiteUrl: 'https://reviewshield.ai',
    tagline: 'Autonomous App Store Bad Review Alert & Auto-Responder for Slack',
    rawDescription: 'ReviewShield connects to App Store & Google Play developer feeds. It continuously screens review logs 24/7. When a 1-star or 2-star review is published, it checks the context with NLP, tags the active bug category, drafts an empathetic, solution-oriented reply, and pushes a crisp interactive notification directly into the company’s Slack support channel so developers can address issues instantly.',
    keywords: 'churn reduction, customer support, apple app store, slack custom notification, app developer tool, review monitor',
    pricingType: 'Freemium',
    primaryCategory: 'Developer Tools'
  },
  {
    productName: 'SlowQuery Guard',
    websiteUrl: 'https://slowqueryguard.io',
    tagline: 'Database Slow Query Watchdog & Auto-Index Generator',
    rawDescription: 'SlowQuery Guard is a lightweight server side observer that continuously tails Postgres or MySQL slow query logs. Instead of bloated general monitors, it excels at one task: detecting database queries taking >1.5 seconds, running an isolated EXPLAIN command, and generating the exact ready-to-run raw SQL indexes required to optimize performance, delivered straight to your developer Discord or email box.',
    keywords: 'database optimization, database monitor, postgresql index builder, mysql slow queries, devops automation, cloud health',
    pricingType: 'Paid',
    primaryCategory: 'Database & DevOps'
  },
  {
    productName: 'ReceiptExpiry',
    websiteUrl: 'https://receiptexpiry.com',
    tagline: 'Image Scan Grocery Expiration Monitor & Minimal Recipe Drafts',
    rawDescription: 'ReceiptExpiry solves the single simple problem of grocery waste. Users upload a quick photo of their supermarket receipt. The AI extracts items, looks up standard food shelf-lives, schedules custom push warnings exactly 48 hours before ingredients go stale, and streams 3 ultra-simple 15-minute recipes to empty the fridge before the food expires.',
    keywords: 'waste reducer, grocery tracker, scan receipts, quick meal planner, local storage grocery alarm, home planner app',
    pricingType: 'Free',
    primaryCategory: 'Lifestyle & Productivity'
  }
];
