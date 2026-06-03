import { useEffect, useState } from 'react';
import { Keyboard, Shield, Sparkles, Download, CheckSquare, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShortcutsProps {
  onSynthesize: () => void;
  onExport: () => void;
  onShowChecklist: () => void;
  onToggleDeveloper: () => void;
  onSelectRandomPreset: () => void;
  showToast: (msg: string, sub?: string) => void;
}

export default function ShortcutsPanel({ 
  onSynthesize, 
  onExport, 
  onShowChecklist, 
  onToggleDeveloper, 
  onSelectRandomPreset,
  showToast 
}: ShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut if user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.shiftKey) {
        switch (e.key.toUpperCase()) {
          case 'S':
            onSynthesize();
            e.preventDefault();
            break;
          case 'X':
            onExport();
            e.preventDefault();
            break;
          case 'C':
            onShowChecklist();
            e.preventDefault();
            break;
          case 'D':
            onToggleDeveloper();
            e.preventDefault();
            break;
          case 'P':
            onSelectRandomPreset();
            e.preventDefault();
            break;
          case 'K':
            setIsOpen(prev => !prev);
            e.preventDefault();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSynthesize, onExport, onShowChecklist, onToggleDeveloper, onSelectRandomPreset]);

  return (
    <div className="relative">
      {/* Mini Legend Activator */}
      <button
        onClick={() => setIsOpen(true)}
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0F0F0F] hover:bg-[#1A1A1E] border border-[#2A2A2A] rounded-sm text-[11px] font-mono tracking-wider text-[#A38D5B] transition-all cursor-pointer hover:border-[#A38D5B]/50"
      >
        <Keyboard className="h-3.5 w-3.5" />
        <span>Shortcuts (Shift+K)</span>
      </button>

      {/* Interactive Modal Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/70 z-50 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed left-1/2 top-48 -translate-x-1/2 w-full max-w-sm bg-[#121214] border border-[#2E2E33] rounded shadow-[0_16px_48px_rgba(0,0,0,0.85)] z-50 p-5 font-mono text-xs text-left"
            >
              <div className="flex items-center justify-between border-b border-[#242428] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-[#A38D5B]" />
                  <span className="text-white font-bold uppercase tracking-wider text-[11px]">System Hotkeys</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[#1E1E22] rounded text-[#888] hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[10px] text-[#777] leading-relaxed mb-4">
                Tap combinations at any time (as long as you are not focused in text editors or parameter entry boxes) to command the launch system instantly.
              </p>

              <div className="space-y-2.5">
                {[
                  { keys: ['Shift', 'S'], desc: 'Synthesize & compile package drafts', action: onSynthesize },
                  { keys: ['Shift', 'X'], desc: 'Export complete JSON bundle offline', action: onExport },
                  { keys: ['Shift', 'P'], desc: 'Cycle & apply startup demo presets', action: onSelectRandomPreset },
                  { keys: ['Shift', 'D'], desc: 'Toggle self-serve developer panel view', action: onToggleDeveloper },
                  { keys: ['Shift', 'C'], desc: 'Jump pointer to active submissions checklists', action: onShowChecklist },
                  { keys: ['Shift', 'K'], desc: 'Toggle this hotkey controller blueprint', action: () => setIsOpen(prev => !prev) },
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      item.action();
                      setIsOpen(false);
                    }}
                    className="flex justify-between items-center hover:bg-[#1A1A1E] p-1.5 rounded border border-transparent hover:border-[#202024] transition-all cursor-pointer group"
                  >
                    <span className="text-[#aaa] group-hover:text-white transition-colors">{item.desc}</span>
                    <div className="flex gap-0.5">
                      {item.keys.map((k) => (
                        <kbd key={k} className="px-1.5 py-0.5 bg-[#0F0F0F] border border-[#222] rounded text-[9px] font-bold text-[#A38D5B] text-center min-w-[20px]">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#1C1C1F] pt-3 mt-4 text-[10px] text-[#555] text-center">
                LaunchForge Automation Engine v1.8
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
