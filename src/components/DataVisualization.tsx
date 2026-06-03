import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Radio, Compass, Layers, CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface DataVisualizationProps {
  checklist: { [key: string]: boolean };
  pricingType: string;
  primaryCategory: string;
}

export default function DataVisualization({ checklist, pricingType, primaryCategory }: DataVisualizationProps) {
  const [coefficient, setCoefficient] = useState<number>(1.0); // Interactive scale slider

  // Calculate parameters dynamically
  const isPaid = pricingType === 'Paid';
  const openSourceMultiplier = pricingType === 'Open Source' ? 1.35 : 1.0;
  const freeMultiplier = (pricingType === 'Free' || pricingType === 'Freemium') ? 1.25 : 0.95;

  // Track completed percentage
  const totalChecklistItems = Object.keys(checklist).length || 9;
  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;
  const checklistRatio = completedChecklistCount / totalChecklistItems;
  const readinessPercentage = Math.round(checklistRatio * 100);

  // Dynamic predicted impressions metrics
  const platforms = [
    {
      id: 'hunt',
      name: 'Product Hunt',
      baseReach: 28000,
      badge: 'High Impact Launch',
      color: '#DA552F',
      efficiency: 0.88,
    },
    {
      id: 'beta',
      name: 'BetaList',
      baseReach: 9500,
      badge: 'Early Adopter Focus',
      color: '#4B9CD3',
      efficiency: 0.72,
    },
    {
      id: 'alternative',
      name: 'AlternativeTo',
      baseReach: 14000,
      badge: 'Search Intent SEO',
      color: '#16A085',
      efficiency: 0.82,
    },
    {
      id: 'hub',
      name: 'SaaS Hub',
      baseReach: 8000,
      badge: 'Directory Indexing',
      color: '#8E44AD',
      efficiency: 0.65,
    },
  ];

  const parsedReachData = platforms.map((p) => {
    // Math logic based on checklist completion & coefficients
    const growthCoeff = 0.5 + (checklistRatio * 0.5); // Max 1.0 based on checklist
    const reachResult = Math.round(p.baseReach * freeMultiplier * openSourceMultiplier * coefficient * growthCoeff);
    const convertedVisitors = Math.round(reachResult * (p.efficiency * 0.045)); // ~4% average click-through efficiency
    return {
      ...p,
      reach: reachResult,
      visitors: convertedVisitors,
    };
  });

  const totalPredictedReach = parsedReachData.reduce((acc, p) => acc + p.reach, 0);
  const totalPredictedConversions = parsedReachData.reduce((acc, p) => acc + p.visitors, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121214] border border-[#232326] rounded-md p-5 font-mono text-xs text-left space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-[#A38D5B] uppercase font-bold tracking-wider">
            <BarChart3 className="h-4 w-4" />
            <span>Launch Reach Analytics & Traffic Model</span>
          </div>
          <span className="text-[10px] text-[#777] block">Algorithmic metrics based on inputs and checklists.</span>
        </div>

        {/* Dynamic coefficient controller slider */}
        <div className="flex items-center gap-2 bg-[#0A0A0C] border border-[#222] px-2.5 py-1 rounded-sm text-[10px]">
          <span className="text-[#888]">Modifier:</span>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={coefficient}
            onChange={(e) => setCoefficient(parseFloat(e.target.value))}
            className="w-16 accent-[#A38D5B] cursor-pointer"
            title="Adjust scaling factor for reach calculation"
          />
          <span className="text-white font-bold">{coefficient.toFixed(1)}x</span>
        </div>
      </div>

      {/* Grid: High level aggregated statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#09090A] border border-[#1E1E22] p-3 rounded">
          <div className="flex items-center gap-1 text-[#888] text-[9px] uppercase tracking-wider mb-1">
            <Radio className="h-3 w-3 text-red-400" />
            <span>Aggregated Reach</span>
          </div>
          <div className="text-lg font-bold text-white font-display select-all">
            {totalPredictedReach.toLocaleString()} <span className="text-[10px] font-mono text-[#888] font-light">Impressions</span>
          </div>
          <span className="text-[9px] text-[#555] block mt-1">Multiplier: {pricingType} model influence.</span>
        </div>

        <div className="bg-[#09090A] border border-[#1E1E22] p-3 rounded">
          <div className="flex items-center gap-1 text-[#888] text-[9px] uppercase tracking-wider mb-1">
            <Users className="h-3 w-3 text-emerald-400" />
            <span>Calculated Visitors</span>
          </div>
          <div className="text-lg font-bold text-emerald-400 font-display select-all">
            ~{totalPredictedConversions.toLocaleString()} <span className="text-[10px] font-mono text-emerald-600 font-light">Clicks</span>
          </div>
          <span className="text-[9px] text-[#555] block mt-1">Based on directory click coefficients.</span>
        </div>

        <div className="bg-[#09090A] border border-[#1E1E22] p-3 rounded">
          <div className="flex items-center gap-1 text-[#888] text-[9px] uppercase tracking-wider mb-1">
            <CheckSquare className="h-3 w-3 text-[#A38D5B]" />
            <span>SEO Readiness Gate</span>
          </div>
          <div className="text-lg font-bold text-white font-display">
            {readinessPercentage}% <span className="text-[10px] font-mono text-[#A38D5B] font-light">Complete</span>
          </div>
          <span className="text-[9px] text-[#555] block mt-1">{completedChecklistCount}/{totalChecklistItems} tasks satisfied.</span>
        </div>
      </div>

      {/* Interactive Custom SVG Chart Graph */}
      <div className="space-y-2">
        <span className="text-[9px] uppercase tracking-widest text-[#888] font-mono block pl-1">Predicted Multi-Directory Reach Share</span>
        
        <div className="space-y-3.5 bg-[#09090A] border border-[#1C1C1F] p-4 rounded-md">
          {parsedReachData.map((plat) => {
            const maxReachInSet = Math.max(...parsedReachData.map(p => p.reach));
            const barWidthPercent = maxReachInSet > 0 ? (plat.reach / maxReachInSet) * 100 : 0;
            return (
              <div key={plat.id} className="space-y-1.5">
                <div className="flex items-baseline justify-between gap-2 text-[10.5px]">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: plat.color }} />
                    <span className="text-white">{plat.name}</span>
                    <span className="text-[8px] font-mono font-light text-[#555] bg-[#141416] border border-[#222] px-1 py-0.5 rounded-xs uppercase">
                      {plat.badge}
                    </span>
                  </div>
                  <div className="font-mono text-[#AAA]">
                    <span className="text-white font-bold">{plat.reach.toLocaleString()}</span> imp {' '}
                    <span className="text-[10px] text-[#666]">({plat.visitors.toLocaleString()} conversions)</span>
                  </div>
                </div>

                {/* Animated progress bar layout */}
                <div className="h-2 w-full bg-[#151518] rounded-full overflow-hidden border border-[#222]/40 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidthPercent}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: plat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Growth Recommendation Card Footer */}
      <div className="p-3 bg-[#1C120A]/35 border border-amber-950/20 rounded-md text-[10.5px] leading-relaxed text-[#D29E65] flex items-start gap-2">
        <TrendingUp className="h-4.5 w-4.5 shrink-0 text-amber-500 mt-0.5" />
        <div>
          <span className="font-bold uppercase text-white block text-[9.5px]">Launch Strategy Advisory</span>
          {readinessPercentage < 50 ? (
            <span>Your index is below 50%. Mark off checkboxes inside directory-specific guides to raise predicted traffic efficiency index of directories by over +{Math.round((1 - checklistRatio) * 35)}%.</span>
          ) : (
            <span>Stellar ready state configured! Directory targeting model predicts strong index placement based on your {pricingType} categories. We recommend booking launch targeting around midweek intervals.</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
