import { Search, ShieldAlert, BadgeCheck, Compass, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface SEOAnalyzerProps {
  productName: string;
  websiteUrl: string;
  rawDescription: string;
  keywords: string;
}

export default function SEOAnalyzer({ productName, websiteUrl, rawDescription, keywords }: SEOAnalyzerProps) {
  // Parsing parameters
  const nameLen = productName.trim().length;
  const descLen = rawDescription.trim().length;
  const wordCount = rawDescription.trim().split(/\s+/).filter(Boolean).length;
  const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);

  // Math validations
  const matches = keywordList.filter(kw => {
    if (!kw) return false;
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    return regex.test(productName) || regex.test(rawDescription);
  });

  const matchingDensity = keywordList.length > 0 ? (matches.length / keywordList.length) * 100 : 0;
  
  // URL check
  const hasValidUrl = websiteUrl.startsWith('http://') || websiteUrl.startsWith('https://');

  // Calculates a direct Score
  let scorePoints = 10; // BASE points
  if (nameLen > 1) scorePoints += 15;
  if (descLen > 80) scorePoints += 20;
  if (descLen > 200) scorePoints += 10;
  if (hasValidUrl) scorePoints += 20;
  if (keywordList.length > 0) scorePoints += 15;
  if (matches.length > 0) scorePoints += 10;

  const totalScore = Math.min(scorePoints, 100);

  // Recommendations generator
  const suggestions = [];
  if (nameLen === 0) suggestions.push('Please input a Product Name to check title optimization.');
  if (websiteUrl.trim().length === 0) suggestions.push('Add website link for crawler linkback profiling.');
  else if (!hasValidUrl) suggestions.push('URL protocol missing (use absolute HTTP/HTTPS addresses).');
  
  if (descLen < 120) {
    suggestions.push(`Pitch is too short (${descLen} chars). Expand to at least 150 characters to increase keyword depth.`);
  }
  
  if (keywordList.length === 0) {
    suggestions.push('Assign search keywords to see automatic density matching calculations.');
  } else if (matches.length === 0) {
    suggestions.push(`Keywords assigned but not found in the description text. Blend terms like "${keywordList[0]}" into the copy.`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121214] border border-[#232326] rounded-md p-5 font-mono text-xs text-left space-y-4"
    >
      {/* Title */}
      <div className="flex items-center justify-between border-b border-[#222] pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-[#A38D5B] uppercase font-bold tracking-wider">
            <Search className="h-4 w-4" />
            <span>SEO pitch analyzer & Keyword Auditor</span>
          </div>
          <span className="text-[10px] text-[#777] block">Live crawler density analyzer vetting tag alignment.</span>
        </div>
      </div>

      {/* Grid view of metrics and ratings */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#09090A] border border-[#1E1E22] p-4 rounded-md">
        
        {/* Left Circular score meter (4/12 col) */}
        <div className="sm:col-span-4 flex flex-col justify-center items-center text-center space-y-2 border-r border-[#1E1E22]/60 last:border-0">
          <div className="relative h-18 w-18 flex items-center justify-center">
            {/* Simple CSS Circular SVG graph representing scoring metrics */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle
                cx="36"
                cy="36"
                r="30"
                className="stroke-[#1C1C1F] fill-none"
                strokeWidth="5"
              />
              <circle
                cx="36"
                cy="36"
                r="30"
                className="stroke-[#A38D5B] fill-none"
                strokeDasharray="188.4"
                strokeDashoffset={188.4 - (188.4 * totalScore) / 100}
                strokeWidth="5"
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
              />
            </svg>
            <span className="text-lg font-bold text-white font-display select-none">{totalScore}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-mono tracking-widest text-[#888] block">SEO Safety Score</span>
          </div>
        </div>

        {/* Right breakdown columns (8/12 col) */}
        <div className="sm:col-span-8 space-y-3 pl-1">
          <div className="grid grid-cols-2 gap-3 text-[10.5px]">
            <div>
              <span className="text-[#666] block uppercase text-[8px] tracking-wider mb-0.5">Copy Length</span>
              <span className="text-white font-bold">{descLen} Characters</span>
              <span className="text-[#555] block">({wordCount} words)</span>
            </div>
            <div>
              <span className="text-[#666] block uppercase text-[8px] tracking-wider mb-0.5">Keyword Match</span>
              <span className="text-white font-bold">{matches.length} / {keywordList.length} Linked</span>
              <span className="text-[#555] block">({Math.round(matchingDensity)}% density)</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-[#1E1E22]/40">
            <span className="text-[8px] uppercase font-mono bg-[#1C110C] text-amber-500 border border-amber-950/40 px-2 py-0.5 rounded-sm" title="Length constraint checks">
              PH limit check: {nameLen > 20 ? '⚠️ Title Heavy' : '✓ Safe'}
            </span>
            <span className="text-[8px] uppercase font-mono bg-[#0E1511] text-emerald-400 border border-emerald-950/40 px-2 py-0.5 rounded-sm">
              Link integrity: {hasValidUrl ? '✓ absolute URL' : '⚠️ missing HTTP prefix'}
            </span>
          </div>
        </div>

      </div>

      {/* Dynamic Action Suggestions list */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[9px] uppercase tracking-widest text-[#777] font-mono block pl-1">SEO Enhancement Recommendations</span>
        <div className="bg-[#09090A] border border-[#1E1E22] p-3 rounded-md space-y-2">
          {suggestions.length === 0 ? (
            <div className="flex items-start gap-1.5 text-emerald-400 text-[10.5px] leading-relaxed">
              <BadgeCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
              <span>Perfect copywriting alignment! Your pitch parameters contain deep keyword saturation, ideal description lengths, and secure URL linkages. You are ready to launch.</span>
            </div>
          ) : (
            suggestions.map((sug, idx) => (
              <div key={idx} className="flex items-start gap-2 text-[10.5px] leading-relaxed text-[#AAA]">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{sug}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
