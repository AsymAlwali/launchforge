import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Monitor, FileText, CheckCircle2, Terminal, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DemoWalkthrough() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playBackProgress, setPlaybackProgress] = useState(0);

  const demoSteps = [
    {
      title: 'Step 1: Apply Startup Preset parameters',
      action: 'Apply presets with Shift + P. LaunchForge automatically hydrates copy variables.',
      screenState: '[FORM INPUTS] hydration completed. Value: "Developer tools client suite"...',
      caption: 'We will begin by picking a live startup template preset. Watch as character lengths adjust.',
    },
    {
      title: 'Step 2: Automate Copywrite constraints',
      action: 'Synthesize drafts with Shift + S. Gemini compiles precise taglines tailored individually.',
      screenState: '[NLP ANALYSIS] suggested tagline: "Autonomous multi-directory builder for hackers"...',
      caption: 'Clicking Synthesize triggers Gemini. It curates tags, descriptions, and character lengths.',
    },
    {
      title: 'Step 3: Access Clipboard copying controls',
      action: 'Tap copy values in any card. A checkmark confirms character-safe content cached.',
      screenState: '[COPY CLIPBOARD] tagline copied successfully! "Matches Product Hunt 60-char rules"...',
      caption: 'Tap any copy icon to save drafts. Character counts auto-update so you never get flagged.',
    },
    {
      title: 'Step 4: Bring Your Own Key (BYOK)',
      action: 'Paste Gemini token, click save. LaunchForge directs SDK prompts client-side.',
      screenState: '[BYOK] local cache saved under window.localStorage. "Use client mode: true"...',
      caption: 'For privacy, you can paste custom Gemini tokens directly. Operations run on-device.',
    },
    {
      title: 'Step 5: Dynamic Code Handshakes',
      action: 'Click "Live-Verify Handshake via Clerk". Watch terminal run connectivity test.',
      screenState: '[DIAGNOSTICS] status: Synced. Clerk Token verified, Supabase DB 100% online...',
      caption: 'Integrate Supabase databases and Clerk login suites with instant sandbox connectivity tests.',
    },
  ];

  // Simulation timer for playback progression
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setPlaybackProgress((prev) => {
        const next = prev + 4;
        if (next >= 100) {
          // Move to next step or loop back
          setCurrentStepIndex((currIdx) => {
            if (currIdx === demoSteps.length - 1) {
              setIsPlaying(false);
              return 0; // wrap back
            }
            return currIdx + 1;
          });
          return 0;
        }
        return next;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, demoSteps.length]);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setPlaybackProgress(0);
  };

  const currentStep = demoSteps[currentStepIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121214] border border-[#232326] rounded-md p-5 font-mono text-xs text-left space-y-4"
    >
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#222] pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-[#A38D5B] uppercase font-bold tracking-wider">
            <Monitor className="h-4 w-4" />
            <span>Interactive Demo Walkthrough video & Simulator</span>
          </div>
          <span className="text-[10px] text-[#777] block">Simulate and master live directory launch procedures in 60 seconds.</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleReset}
            className="p-1.5 bg-[#0F0F0F] hover:bg-[#1A1A1E] border border-[#222] rounded-sm text-[#888] hover:text-white transition-colors cursor-pointer"
            title="Reset Simulator Player"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleTogglePlay}
            className={`flex items-center gap-1 px-3 py-1 rounded-sm text-[10px] uppercase font-bold font-mono tracking-wider transition-all cursor-pointer ${
              isPlaying 
                ? 'bg-amber-950/40 text-amber-500 border border-amber-900/40' 
                : 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900/30'
            }`}
          >
            {isPlaying ? <Pause className="h-3 w-3 fill-amber-500" /> : <Play className="h-3 w-3 fill-emerald-400" />}
            <span>{isPlaying ? 'Pause Demo' : 'Play Walkthrough'}</span>
          </button>
        </div>
      </div>

      {/* Walkthrough Frame Mock Player screen */}
      <div className="bg-black border border-[#1A1A1D] rounded-md overflow-hidden relative shadow-inner">
        {/* Top header decoration matching a real browser */}
        <div className="bg-[#0C0C0E] px-3.5 py-2 border-b border-[#131316] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500/80" />
            <span className="h-2 w-2 rounded-full bg-yellow-500/80" />
            <span className="h-2 w-2 rounded-full bg-green-500/80" />
          </div>
          <div className="text-[9px] text-[#555] select-none bg-[#050506] px-4 py-0.5 rounded border border-[#1A1A1D]">
            launchforge.ai/demo_walkthrough
          </div>
          <span className="text-[8px] bg-red-950/40 text-red-500 px-1 py-0.5 rounded uppercase font-bold animate-pulse">
            ● SIMULATOR LIVE
          </span>
        </div>

        {/* Dynamic Display area */}
        <div className="p-5 min-h-[140px] flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[9px] text-[#A38D5B] font-bold">
              <Terminal className="h-3.5 w-3.5" />
              <span>LOG: ACTIVE SIMULATION WORKSPACE STATE</span>
            </div>

            {/* Simulated active system terminal screen log */}
            <div className="bg-[#050506] border border-[#161619] p-3 rounded font-mono text-[10.5px] text-[#8C90AA] whitespace-pre-wrap select-all leading-relaxed relative min-h-[60px]">
              <div className="text-[#A38D5B] font-bold mb-1">// {currentStep.title}</div>
              {currentStep.screenState}
              <span className="animate-pulse text-[#A38D5B]">_</span>
            </div>
          </div>

          {/* Subtitles caption ticker track */}
          <div className="border-t border-[#131316] pt-2 text-[11px] font-sans leading-relaxed text-[#DCDCDC] min-h-[36px] italic">
            "{currentStep.caption}"
          </div>
        </div>

        {/* Audio/Progress progress line tracker */}
        <div className="h-1 bg-[#1A1A1F] relative">
          <div 
            className="h-full bg-[#A38D5B] transition-all duration-100 ease-linear shadow-[0_0_8px_#A38D5B]" 
            style={{ width: `${isPlaying ? playBackProgress : (currentStepIndex + 1) * 20}%` }} 
          />
        </div>
      </div>

      {/* Guide Steps timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 pt-1">
        {demoSteps.map((step, idx) => {
          const isActive = currentStepIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => {
                setCurrentStepIndex(idx);
                setPlaybackProgress(0);
              }}
              type="button"
              className={`p-2 border rounded text-[10px] text-left transition-all ${
                isActive 
                  ? 'bg-[#151310] border-[#A38D5B] text-white' 
                  : 'bg-[#0E0E10] border-[#222] text-[#777] hover:border-[#333] hover:text-white'
              }`}
            >
              <div className="font-bold mb-0.5 font-mono text-[9px]">STEP 0{idx + 1}</div>
              <p className="line-clamp-2 text-[9.5px]/relaxed leading-tight">{step.title.split(': ')[1]}</p>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
