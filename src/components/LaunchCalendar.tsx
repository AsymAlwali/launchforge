import { useState } from 'react';
import { Calendar, Clock, CheckSquare, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LaunchCalendarProps {
  productName: string;
}

export default function LaunchCalendar({ productName }: LaunchCalendarProps) {
  const [activeDayIndex, setActiveDayIndex] = useState<number>(5); // Default to launch day
  const [calendarCompletion, setCalendarCompletion] = useState<{ [key: number]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('launchforge_calendar_completion');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return { 0: true, 1: true };
  });

  const launchTimeline = [
    {
      day: 'D - 5',
      title: 'Target Audits & Copy Benchmarking',
      description: 'Fill in core keyword list, check against product scope, and run LaunchForge directory draft synthesizer to compile copy limits.',
      tips: 'Ensure target keywords have at least 1,500 monthly searches to leverage organic positioning drafts.',
    },
    {
      day: 'D - 4',
      title: 'Landing Page Diagnostics',
      description: 'Integrate dynamic email sign-up modules, clear value-props above the fold, and test cross-device loading speeds.',
      tips: 'Page size should verify under 1.8MB to bypass bouncing early traffic segments.',
    },
    {
      day: 'D - 3',
      title: 'Vector Media & Hero Banners',
      description: 'Design and custom-generate promotional social banners using the LaunchForge SVG Banner Generator.',
      tips: 'Match dimensions to high resolution settings (e.g., 600x340 px SVG for alternative directory previews).',
    },
    {
      day: 'D - 2',
      title: 'Hunter Partnerships & Teaser Alignment',
      description: 'Reach out to top hunter profiles, list scheduled product teasers, and coordinate launch hour times.',
      tips: 'Product Hunt launches reset exactly at 12:01 AM PST. Schedule matching alignment guides accordingly.',
    },
    {
      day: 'D - 1',
      title: 'Viral Social Buffer Curations',
      description: 'Format copy for Hacker News, Twitter threads, Indie Hackers, and Reddit startups. Double check character constraints.',
      tips: 'Ensure Twitter tagline is under 60-character bounds to protect readability margins.',
    },
    {
      day: 'D 0',
      title: 'GO LIVE - Global Directory Submission',
      description: 'Launch completely on Product Hunt, dispatch community emails, trigger directory linkbacks, and monitor active traffic pipelines.',
      tips: 'Respond to all comments within 15 minutes during the initial 4-hour golden interval to boost algorithmic indexing.',
    },
    {
      day: 'D + 1',
      title: 'Thank-You Campaigns & Index Analytics',
      description: 'Send personal thank-you updates, update community milestones on Twitter/LinkedIn, and log converted visitor statistics.',
      tips: 'Share a screenshot of active directory rankings to stimulate late-day conversion spikes.',
    },
  ];

  const handleToggleCalendarStep = (index: number) => {
    const next = { ...calendarCompletion, [index]: !calendarCompletion[index] };
    setCalendarCompletion(next);
    localStorage.setItem('launchforge_calendar_completion', JSON.stringify(next));
  };

  const curr = launchTimeline[activeDayIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121214] border border-[#232326] rounded-md p-5 font-mono text-xs text-left space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#222] pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-[#A38D5B] uppercase font-bold tracking-wider">
            <Calendar className="h-4 w-4" />
            <span>Founders Launch Countdown Calendar</span>
          </div>
          <span className="text-[10px] text-[#777] block">Daily step-by-step master checklist mapping launch milestones.</span>
        </div>
      </div>

      {/* Week Day Selector Blocks */}
      <div className="grid grid-cols-7 gap-1.5">
        {launchTimeline.map((item, idx) => {
          const isSelected = activeDayIndex === idx;
          const isDone = !!calendarCompletion[idx];
          return (
            <button
              key={idx}
              onClick={() => setActiveDayIndex(idx)}
              type="button"
              className={`p-2.5 rounded-sm border transition-all text-center relative group cursor-pointer ${
                isSelected 
                  ? 'bg-[#1D1B15] border-[#A38D5B] text-white' 
                  : isDone
                    ? 'bg-[#0E1510] border-emerald-950/50 text-emerald-500/80 hover:bg-[#121E15]'
                    : 'bg-[#0E0E10] border-[#202022] text-[#888] hover:text-white hover:bg-[#141416]'
              }`}
            >
              <div className="text-[10px] font-bold tracking-tight">{item.day}</div>
              <div className="h-1 w-1 mx-auto mt-1 rounded-full" style={{ backgroundColor: isSelected ? '#A38D5B' : (isDone ? '#10B981' : '#444') }} />
              {isDone && <span className="absolute top-0.5 right-0.5 text-[8px] text-emerald-500">✓</span>}
            </button>
          );
        })}
      </div>

      {/* Selected Day Expanded Panel */}
      <div className="bg-[#09090A] border border-[#1E1E22] p-4 rounded-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1E1E22] pb-2.5">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-0.5 bg-[#141416] border border-[#2A2A2E] text-white font-bold rounded text-[9px] uppercase tracking-wider text-[#A38D5B]">
              {curr.day}
            </kbd>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider truncate">{curr.title}</h4>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#888] hover:text-white text-[10px]">
            <input
              type="checkbox"
              checked={!!calendarCompletion[activeDayIndex]}
              onChange={() => handleToggleCalendarStep(activeDayIndex)}
              className="rounded bg-[#1A1A1D] border-[#333] text-[#A38D5B] focus:ring-0 h-3.5 w-3.5 cursor-pointer"
            />
            <span>Mark Day Completed</span>
          </label>
        </div>

        {/* Content body */}
        <p className="text-[#AAA] leading-relaxed text-[11px] font-sans">
          {curr.description}
        </p>

        {/* Expert Tip Badge */}
        <div className="bg-[#141E18]/15 border border-emerald-950/30 p-2.5 rounded text-[10.5px] text-emerald-400 leading-relaxed flex items-start gap-1.5">
          <Sparkles className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
          <div>
            <span className="font-bold text-white block text-[9px] uppercase tracking-[0.05em] mb-0.5">LAUNCHFORGE COMPLIANCE TIP</span>
            {curr.tips}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
