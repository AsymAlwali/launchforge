import { Twitter, ShieldCheck, Mail, Heart, ArrowUpRight, Flame } from 'lucide-react';
import { motion } from 'motion/react';
// @ts-ignore
import asymProfileImage from '../assets/images/asym_profile_1780496819972.png';

export default function FounderProfile() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="bg-[#121214] border border-[#232326] p-6 rounded-md text-xs space-y-4 shadow-xl text-[#AAA]"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#222] pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={asymProfileImage} 
              alt="Asym Alwali"
              className="h-12 w-12 rounded-full border-2 border-[#A38D5B] object-cover bg-black"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#121214]" title="Active Builder" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display">Asym Alwali</h4>
            <span className="text-[10px] font-mono text-[#A38D5B] uppercase tracking-wider block">@Asym_Alwali</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://x.com/Asym_Alwali"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#171719] hover:bg-[#202023] border border-[#2C2C30] rounded-sm text-[10px] font-mono text-white transition-all cursor-pointer"
          >
            <Twitter className="h-3.5 w-3.5 text-[#1DA1F2]" />
            <span>X Profile</span>
            <ArrowUpRight className="h-3 w-3 text-[#555]" />
          </a>
        </div>
      </div>

      <div className="space-y-3 leading-relaxed">
        <div>
          <span className="text-[9px] uppercase font-mono tracking-widest text-[#888] block mb-1">Writer Bootstrapper Manifesto</span>
          <p className="font-serif italic text-white/90 text-xs">
            "I'm on an intense, passionate challenge to build software under severe resource constraints. LaunchForge AI is born from active struggle."
          </p>
        </div>
        <p>
          As an active writer-bootstrapper navigating the constraints of indie hacking, get-to-market speed is everything. Launching a new product like <strong>One Question</strong> meant spending precious hours rewriting core taglines and elevator pitches to satisfy dozens of character-count bottlenecks. 
        </p>
        <p>
          I built LaunchForge AI to eliminate this duplicate grunt work. In a single screen flow, it compiles clean drafts, runs integrated SEO keyword checks, schedules chronological day-by-day actions, and exports completely offline-safe JSON blueprints.
        </p>
      </div>

      <div className="pt-2 border-t border-[#1F1F22] flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-[#666]">
        <div className="flex items-center gap-1 text-amber-500">
          <Flame className="h-3.5 w-3.5" />
          <span>Bootstrapper Challenge Mode Active</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="h-3 w-3 text-red-500 fill-red-500" />
          <span>For Bootstrapped Startups</span>
        </div>
      </div>
    </motion.div>
  );
}
