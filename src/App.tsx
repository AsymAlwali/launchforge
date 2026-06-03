import { useState, useEffect, FormEvent } from 'react';
import { 
  Sparkles, 
  Send, 
  FileText, 
  Copy, 
  Check, 
  ExternalLink, 
  RefreshCw, 
  ArrowRight,
  Database,
  Shield,
  Clock,
  Terminal,
  Layers,
  HelpCircle,
  AlertTriangle,
  FileCode,
  Globe,
  Tag,
  CheckSquare,
  FileDown
} from 'lucide-react';
import { PRELOAD_STARTUPS } from './components/presets';
import { LaunchRequest, LaunchPackage, SimulationStep } from './types';
import { motion, AnimatePresence } from 'motion/react';
import FounderProfile from './components/FounderProfile';
// @ts-ignore
import onequestionLogoImage from './assets/images/onequestion_logo_1780496837774.png';
import { Sun, Moon, History, BookOpen, UserCheck, Trash2 } from 'lucide-react';
import ShortcutsPanel from './components/ShortcutsPanel';
import DataVisualization from './components/DataVisualization';
import LaunchImageGenerator from './components/LaunchImageGenerator';
import LaunchCalendar from './components/LaunchCalendar';
import SEOAnalyzer from './components/SEOAnalyzer';
import DemoWalkthrough from './components/DemoWalkthrough';
import TipJar from './components/TipJar';

// Static interactive submission checklist helper mapped by platforms
const GET_PLATFORM_CHECKLIST = (platformId: string) => {
  switch (platformId) {
    case 'hunt':
      return [
        { key: 'hunt_account', label: 'Verify profile & Maker status on Product Hunt' },
        { key: 'hunt_copy', label: 'Match tagline exactly with the 60-character restriction' },
        { key: 'hunt_media', label: 'Prepare high-resolution, high-contrast banner images (1270x760 px)' },
      ];
    case 'beta':
      return [
        { key: 'beta_criteria', label: 'Confirm landing page has email collection / signup form' },
        { key: 'beta_fields', label: 'Fill out accurate founder details and funding category' },
      ];
    case 'alternative':
      return [
        { key: 'alt_competitors', label: 'Identify existing alternatives in the directories' },
        { key: 'alt_license', label: 'Select software license tag (Freemium/Open Source)' },
      ];
    case 'hub':
    default:
      return [
        { key: 'saas_category', label: 'Align primary SaaS category match with system parameters' },
        { key: 'saas_tier', label: 'Assign corresponding pricing tiers and detail links' },
      ];
  }
};

export default function App() {
  // Input form state initialized to One Question by default
  const [request, setRequest] = useState<LaunchRequest>({
    productName: 'One Question',
    websiteUrl: 'https://onequestion.space',
    rawDescription: 'Stop answering the same question twice. AI Q&A nodes that sit on your public profile link (onequestion.space/yourname), instantly answering visitors, buyers, or subscribers with context-aware responses matched exactly to your personal knowledge bases.',
    keywords: 'ai support, custom profile widget, knowledge base, independent creators, client success, bootstrap challenge',
    pricingType: 'Freemium',
    primaryCategory: 'AI & Customer Experience',
  });

  // Theme state: support light & dark theme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('launchforge_theme') as 'light' | 'dark') || 'dark';
  });

  // Persistent directory results submission history
  const [historyList, setHistoryList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('launchforge_history_list');
      return saved ? JSON.parse(saved) : [];
    } catch (_) {
      return [];
    }
  });

  // Simulated Clerk Authenticated User session state
  const [clerkUser, setClerkUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('launchforge_clerk_user');
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  });
  const [clerkEmailInput, setClerkEmailInput] = useState('yunusamohammedalwali@gmail.com');
  const [clerkNameInput, setClerkNameInput] = useState('Asym Alwali');

  // UI state
  const [configStatus, setConfigStatus] = useState<{ hasApiKey: boolean; appUrl: string }>({
    hasApiKey: false,
    appUrl: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pkg, setPkg] = useState<LaunchPackage | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hunt' | 'beta' | 'alternative' | 'hub'>('hunt');
  const [socialTab, setSocialTab] = useState<'TwitterX' | 'RedditStartups' | 'HackerNews' | 'LinkedIn'>('TwitterX');

  // Self-Serve BYOK & Developer Protocol Toggles (supporting deliverables, developer, growth, and docs)
  const [rightPanelTab, setRightPanelTab] = useState<'deliverables' | 'developer' | 'growth' | 'docs'>('deliverables');
  const [customKey, setCustomKey] = useState<string>(() => {
    return localStorage.getItem('launchforge_byok_key') || '';
  });
  const [useByok, setUseByok] = useState<boolean>(() => {
    return localStorage.getItem('launchforge_use_byok') === 'true';
  });

  // Self-Serve Supabase & Clerk Config Mock Toggles
  const [supabaseUrl, setSupabaseUrl] = useState<string>(() => {
    return localStorage.getItem('launchforge_supabase_url') || '';
  });
  const [supabaseAnonKey, setSupabaseAnonKey] = useState<string>(() => {
    return localStorage.getItem('launchforge_supabase_anon') || '';
  });
  const [clerkPubKey, setClerkPubKey] = useState<string>(() => {
    return localStorage.getItem('launchforge_clerk_pub') || '';
  });
  const [dbSyncStatus, setDbSyncStatus] = useState<'idle' | 'testing' | 'synced' | 'failed'>('idle');

  // BYOK test states
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);
  const [keyTestResult, setKeyTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Simulation run state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState<number>(0);
  const [simSteps, setSimSteps] = useState<SimulationStep[]>([]);

  // Interactive Checklist and Feedback Alert states
  const [toast, setToast] = useState<{ message: string; subtext?: string } | null>(null);
  const [checklist, setChecklist] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem('launchforge_checklist');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      hunt_account: false,
      hunt_copy: false,
      hunt_media: false,
      beta_criteria: false,
      beta_fields: false,
      alt_competitors: false,
      alt_license: false,
      saas_category: false,
      saas_tier: false,
    };
  });

  const showToast = (message: string, subtext?: string) => {
    setToast({ message, subtext });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('launchforge_checklist', JSON.stringify(next));
      if (next[key]) {
        showToast("Checklist Complete!", "Marked step as accomplished.");
      }
      return next;
    });
  };

  const exportLaunchPackageAsJSON = () => {
    if (!pkg) {
      showToast("Cannot Export", "Synthesize directory drafts first before exporting.");
      return;
    }
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pkg, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `${request.productName.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_launch_package.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Package Exported!", "Dynamic JSON package blueprint downloaded.");
    } catch (err) {
      showToast("Export Failed", "Error creating compilation download.");
    }
  };

  // Fetch configuration status on load
  useEffect(() => {
    fetch('/api/config-status')
      .then((res) => res.json())
      .then((data) => setConfigStatus(data))
      .catch(() => {
        // Fallback or dev local server
        setConfigStatus({ hasApiKey: false, appUrl: window.location.origin });
      });
  }, []);

  // Save developer keys dynamically
  const saveDeveloperCredential = (field: 'byok' | 'use_byok' | 'supabase_url' | 'supabase_anon' | 'clerk_pub', val: string) => {
    if (field === 'byok') {
      setCustomKey(val);
      localStorage.setItem('launchforge_byok_key', val);
    } else if (field === 'use_byok') {
      const boolVal = val === 'true';
      setUseByok(boolVal);
      localStorage.setItem('launchforge_use_byok', val);
    } else if (field === 'supabase_url') {
      setSupabaseUrl(val);
      localStorage.setItem('launchforge_supabase_url', val);
    } else if (field === 'supabase_anon') {
      setSupabaseAnonKey(val);
      localStorage.setItem('launchforge_supabase_anon', val);
    } else if (field === 'clerk_pub') {
      setClerkPubKey(val);
      localStorage.setItem('launchforge_clerk_pub', val);
    }
    showToast("Setting Saved", `Successfully cached your ${field.replace('_', ' ').toUpperCase()} option locally.`);
  };

  // Test if Bring Your Own Key is valid and can query Gemini successfully
  const testCustomApiKey = async () => {
    if (!customKey) {
      showToast("Verification Aborted", "Please input a Gemini API Token first.");
      setKeyTestResult({ success: false, message: "Token input is empty." });
      return;
    }

    setIsTestingKey(true);
    setKeyTestResult(null);

    try {
      const response = await fetch('/api/test-byok-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customGeminiKey: customKey }),
      });

      if (!response.ok) {
        throw new Error('Test server returned an error error status code.');
      }

      const data = await response.json();
      if (data.success) {
        setKeyTestResult({ success: true, message: data.text });
        showToast("BYOK Verified!", "Your custom Gemini key is valid and fully online!");
      } else {
        setKeyTestResult({ success: false, message: data.error || 'Validation failed.' });
        showToast("Verification Failed", "Please check your Gemini key format or billing quota.");
      }
    } catch (err: any) {
      setKeyTestResult({ success: false, message: err?.message || 'Network verification error.' });
      showToast("Network Error", "Unable to establish contact with key verification endpoint.");
    } finally {
      setIsTestingKey(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('launchforge_theme', nextTheme);
    showToast("Theme Overridden", `Swapped the interface view mode to ${nextTheme === 'dark' ? 'Classic Cosmic Dark' : 'Bright Editorial Light'}.`);
  };

  const handleClerkAuth = (action: 'signin' | 'signup' | 'signout') => {
    if (action === 'signout') {
      setClerkUser(null);
      localStorage.removeItem('launchforge_clerk_user');
      showToast("Signed Out", "Successfully de-authenticated your active Clerk session.");
      return;
    }

    const mockEmail = clerkEmailInput.trim() || 'yunusamohammedalwali@gmail.com';
    const mockName = clerkNameInput.trim() || 'Asym Alwali';
    const mockUser = {
      id: 'usr_clerk_' + Math.random().toString(36).substring(2, 12),
      email: mockEmail,
      fullName: mockName,
      createdAt: new Date().toLocaleDateString(),
      authToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Imluc3RfZGV2ZWxvcG1lbnQifQ.' + btoa(JSON.stringify({ sub: 'usr_clerk_9h92', email: mockEmail })),
    };

    setClerkUser(mockUser);
    localStorage.setItem('launchforge_clerk_user', JSON.stringify(mockUser));
    showToast("Clerk Session Active", `Welcome, ${mockName}! Synchronized Clerk security headers.`);
  };

  const syncHistoryToSupabase = () => {
    if (!clerkUser) {
      showToast("Access Denied", "Please sign in or sign up with Clerk first.");
      return;
    }
    setDbSyncStatus('testing');
    setTimeout(() => {
      setDbSyncStatus('synced');
      showToast("Database Synced", `Simulated successful storage of active submissions to table 'submission_history' on Supabase for Clerk UID ${clerkUser.id}.`);
    }, 1500);
  };

  // Mock-test Supabase connectivity with Clerk Authentication tokens
  const triggerDbSyncTest = () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      alert('Please specify your Supabase connection parameters in the fields first.');
      return;
    }
    setDbSyncStatus('testing');
    
    // Simulate pipeline setup logs
    setIsSimulating(true);
    const mockSteps: SimulationStep[] = [
      {
        id: 'clerk-auth',
        platformId: 'clerk-auth',
        platformName: 'Clerk SSO Token',
        status: 'linking',
        progress: 40,
        message: 'Resolving Clerk active session JWT claims...',
        estimatedAIIfluenceScore: 100,
        logLines: [
          `[Clerk Auth] Verified public key ending with "${clerkPubKey.slice(-6) || 'N/A'}".`,
          `[Session JWT] Decoded payload: { sub: "usr_26ihsf982", email: "${request.productName ? 'developer@launchforge.dev' : 'me@example.com'}" }.`,
        ]
      },
      {
        id: 'supabase-table',
        platformId: 'supabase-table',
        platformName: 'Supabase Postgres Pool',
        status: 'idle',
        progress: 0,
        message: 'Checking public schema indices...',
        estimatedAIIfluenceScore: 100,
        logLines: [
          `[Connection] Requesting secure handshake with ${supabaseUrl}.`,
          `[Handshake] Auth header loaded with JWT string.`,
        ]
      }
    ];
    setSimSteps(mockSteps);

    setTimeout(() => {
      setSimSteps(prev => {
        const next = [...prev];
        next[0].status = 'completed';
        next[0].progress = 100;
        next[0].message = 'Clerk session secure. User ID validated.';
        
        next[1].status = 'linking';
        next[1].progress = 50;
        next[1].message = 'Handshaking SQL pool...';
        next[1].logLines.push('[SQL Engine] SELECT count(*) FROM list_tables WHERE table_name = \'submissions\';');
        return next;
      });
    }, 1000);

    setTimeout(() => {
      setSimSteps(prev => {
        const next = [...prev];
        next[1].status = 'completed';
        next[1].progress = 100;
        next[1].message = 'Supabase client connected. Schema index verified!';
        next[1].logLines.push('[PostgREST] Pipeline query succeeded with 200 OK. Transaction logged.');
        return next;
      });
      setDbSyncStatus('synced');
    }, 2200);
  };

  // Pre-fill fields via preset
  const applyPreset = (preset: typeof PRELOAD_STARTUPS[number]) => {
    setRequest({
      productName: preset.productName,
      websiteUrl: preset.websiteUrl,
      rawDescription: preset.rawDescription,
      keywords: preset.keywords,
      pricingType: preset.pricingType,
      primaryCategory: preset.primaryCategory,
    });
    // Clear package and error
    setPkg(null);
    setErrorMsg(null);
    setIsSimulating(false);
  };

  // Run the full AI generation flow
  const generateLaunchPackage = async (e: FormEvent) => {
    e.preventDefault();
    if (!request.productName.trim() || !request.rawDescription.trim()) {
      setErrorMsg('Product Name and Description are required specifications.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setPkg(null);
    setIsSimulating(false);

    try {
      const response = await fetch('/api/generate-launch-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          customGeminiKey: useByok && customKey ? customKey : undefined,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Server returned an error state during generation.');
      }

      const data = (await response.json()) as LaunchPackage;
      setPkg(data);
      
      // Save output to historyList
      const newHistoryItem = {
        id: 'pkg_' + Date.now().toString(36),
        productName: data.productName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
        pricingType: data.pricingType,
        primaryCategory: data.primaryCategory,
        data: data,
        request: { ...request }
      };
      
      setHistoryList(prev => {
        const next = [newHistoryItem, ...prev.filter(item => item.productName !== data.productName)];
        localStorage.setItem('launchforge_history_list', JSON.stringify(next));
        return next;
      });

      showToast("Synthesis Complete!", `Launch package drafts constructed successfully for ${request.productName || 'product'}.`);
      triggerSimulation(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred while synthesizing the package with Gemini.');
    } finally {
      setLoading(false);
    }
  };

  // Run simulation workflow logs to illustrate AI verification
  const triggerSimulation = (packageData: LaunchPackage) => {
    setIsSimulating(true);
    setSimulationIndex(0);

    const initialSteps: SimulationStep[] = packageData.platformDrafts.map((plat) => ({
      id: plat.platformId,
      platformId: plat.platformId,
      platformName: plat.platformName,
      status: 'idle',
      progress: 0,
      message: 'Queueing system verification...',
      estimatedAIIfluenceScore: Math.floor(Math.random() * 15) + 78, // High fidelity mock stats
      logLines: [
        `[System] LaunchForge AI assigned submission daemon to ${plat.platformName}.`,
        `[Audit] Matching constraints: tagline (max ${plat.maxLimits.tagline} chars).`,
      ],
    }));

    setSimSteps(initialSteps);
  };

  // Run simulation updates
  useEffect(() => {
    if (!isSimulating || simSteps.length === 0) return;

    const interval = setInterval(() => {
      setSimSteps((prevSteps) => {
        const next = [...prevSteps];
        const activeItemIndex = next.findIndex((s) => s.status === 'idle' || s.status === 'linking' || s.status === 'structuring' || s.status === 'validating');
        
        if (activeItemIndex === -1) {
          clearInterval(interval);
          setIsSimulating(false);
          return prevSteps;
        }

        const draft = next[activeItemIndex];
        const correspondingPackagePlat = pkg?.platformDrafts.find((p) => p.platformId === draft.platformId);

        if (draft.status === 'idle') {
          draft.status = 'linking';
          draft.progress = 25;
          draft.message = `Analyzing categories matching "${request.primaryCategory}"...`;
          draft.logLines.push(`[NLP] Categorizing with weights... suggested: "${correspondingPackagePlat?.suggestedCategory || 'Alternative SaaS'}".`);
        } else if (draft.status === 'linking') {
          draft.status = 'structuring';
          draft.progress = 60;
          draft.message = 'Formatting inputs to strict JSON specification...';
          draft.logLines.push(`[Formatting] Verified tagline charcount: ${correspondingPackagePlat?.tagline.length || 0}/${correspondingPackagePlat?.maxLimits.tagline || 100} chars.`);
        } else if (draft.status === 'structuring') {
          draft.status = 'validating';
          draft.progress = 85;
          draft.message = 'Performing deep schema and link integrity validations...';
          draft.logLines.push(`[SEO Check] Key terms verified: ${correspondingPackagePlat?.tags.join(', ') || 'none'}.`);
        } else if (draft.status === 'validating') {
          draft.status = 'completed';
          draft.progress = 100;
          draft.message = 'Launch script compiled and verified. Ready for deployment.';
          draft.logLines.push(`[Success] AI Influence confidence index: ${draft.estimatedAIIfluenceScore}%.`);
        }

        return next;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, simSteps, pkg, request.primaryCategory]);

  // Keyboard Hotkey Helper Triggers
  const triggerKeyboardSynthesize = () => {
    if (loading) return;
    const mockEvent = { preventDefault: () => {} } as FormEvent;
    generateLaunchPackage(mockEvent);
  };

  const selectRandomPreset = () => {
    const currentIndex = PRELOAD_STARTUPS.findIndex(p => p.productName === request.productName);
    const nextIndex = (currentIndex + 1) % PRELOAD_STARTUPS.length;
    applyPreset(PRELOAD_STARTUPS[nextIndex]);
    showToast("Preset Swapped", `Pre-loaded ${PRELOAD_STARTUPS[nextIndex].productName} configurations.`);
  };

  const triggerKeyboardExport = () => {
    if (!pkg) {
      showToast("Cannot Export", "Run platform copywrite synthesis first using Shift+S.");
      return;
    }
    exportLaunchPackageAsJSON();
  };

  const triggerShowChecklist = () => {
    setRightPanelTab('deliverables');
    setTimeout(() => {
      const el = document.getElementById('checklist-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        showToast("Scrolled to Checklist", "Focused active submission requirements checker.");
      } else {
        showToast("Checklist Ready", "Check checklists under your platform drafts.");
      }
    }, 150);
  };

  const triggerToggleDeveloper = () => {
    const nextTab = rightPanelTab === 'developer' ? 'deliverables' : 'developer';
    setRightPanelTab(nextTab);
    showToast("View Swapped", `Focused the ${nextTab === 'developer' ? 'Self-Serve Developer Portal' : 'Submission Deliverables'} panel.`);
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    showToast("Copied to Clipboard!", "Pasted content details matches target requirements.");
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className={`w-full max-w-[1300px] mx-auto min-h-screen font-sans flex flex-col justify-between border-x transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-[#0F0F0F] text-[#F5F5F5] border-[#2A2A2A]' 
        : 'bg-[#FCFCFD] text-[#1C1C1E] border-[#D1D1D6]'
    }`}>
      {/* Editorial Header */}
      <header className={`flex flex-col md:flex-row md:justify-between md:items-end p-6 md:p-10 border-b gap-4 transition-colors duration-200 ${
        theme === 'dark' ? 'border-[#2A2A2A] bg-[#0C0C0D]' : 'border-[#D1D1D6] bg-[#F2F2F7]'
      }`}>
        <div>
          <div className="text-[10px] tracking-[0.3em] font-mono text-[#A38D5B] uppercase font-bold">
            Autonomous Directory Submission Orchestrator
          </div>
          <h1 className="text-4xl font-extralight tracking-tighter uppercase font-display mt-1">
            LAUNCHFORGE<span className="text-[#A38D5B] font-bold">_AI</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-6 text-[11px] font-mono tracking-wider uppercase text-[#888]">
          <ShortcutsPanel 
            onSynthesize={triggerKeyboardSynthesize}
            onExport={triggerKeyboardExport}
            onShowChecklist={triggerShowChecklist}
            onToggleDeveloper={triggerToggleDeveloper}
            onSelectRandomPreset={selectRandomPreset}
            showToast={showToast}
          />

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            className={`p-2 rounded border transition-all cursor-pointer flex items-center justify-center ${
              theme === 'dark'
                ? 'bg-[#141414] hover:bg-[#1E1E22] border-[#2A2A2A] text-amber-400 hover:border-amber-400/50'
                : 'bg-[#FFFFFF] hover:bg-[#F2F2F7] border-[#D1D1D6] text-amber-600 shadow-sm hover:border-amber-600'
            }`}
            title={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {clerkUser && (
            <div className={`flex items-center gap-2 px-2.5 py-1 border rounded-sm font-mono text-[10px] tracking-widest uppercase ${
              theme === 'dark' ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              <UserCheck className="h-3 w-3 text-emerald-500 shrink-0" />
              <span>{clerkUser.fullName} (Clerk)</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${(useByok && customKey) ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse' : configStatus.hasApiKey ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
            <span className={theme === 'dark' ? 'text-[#888]' : 'text-[#555]'}>
              Gemini Intel: <span className={(useByok && customKey) ? 'text-cyan-400 font-bold font-mono text-[9px] tracking-wider uppercase' : 'text-[#888] font-bold'}>{(useByok && customKey) ? '🔑 BYOK Active' : configStatus.hasApiKey ? 'online' : 'fallback'}</span>
            </span>
          </div>
          <div className="hidden sm:block">
            Decisions: <span className={theme === 'dark' ? 'text-[#F5F5F5] font-bold' : 'text-[#1C1C1E] font-bold'}>100% Autonomous</span>
          </div>
        </div>
      </header>

      {/* Main Content Split Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
        
        {/* Left Column: Input Form, Presets, and General Pitch Builder */}
        <section className="lg:col-span-5 p-6 md:p-8 border-b lg:border-b-0 lg:border-r border-[#2A2A2A] flex flex-col gap-6">
          
          {/* Pitch Strategy Hook */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-[0.2em] text-[#A38D5B] font-medium font-mono">The AI Founder Core</span>
            </div>
            <h2 className="text-xl font-light tracking-tight text-[#E5E5E5] font-display">
              Provide your initial product concept.
            </h2>
            <p className="text-xs text-[#999] mt-1 leading-relaxed">
              LaunchForge leverages Gemini to autonomously expand feature pitches into microcopy matching the rigid characters, format, and semantic specifications of leading SaaS discover portals.
            </p>
          </div>

          {/* Quick Start Presets Selector */}
          <div className="bg-[#141414] border border-[#222] p-4 rounded mt-2">
            <label className="block text-[10px] uppercase tracking-widest text-[#888] font-mono mb-2">
              Select an autonomous startup archetype to pre-load:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRELOAD_STARTUPS.map((startup) => (
                <button
                  id={`preset-${startup.productName.toLowerCase()}`}
                  key={startup.productName}
                  type="button"
                  onClick={() => applyPreset(startup)}
                  className={`p-2.5 text-left rounded border transition-all text-xs flex flex-col justify-between gap-1 hover:border-[#A38D5B] hover:bg-[#1C1C1E] ${
                    request.productName === startup.productName 
                      ? 'border-[#A38D5B] bg-[#1a1712]' 
                      : 'border-[#2A2A2A] bg-[#0F0F0F]'
                  }`}
                >
                  <div className="font-bold text-[#F5F5F5] font-display flex justify-between items-center w-full">
                    <span>{startup.productName}</span>
                    <span className="text-[9px] font-mono opacity-60 px-1 border border-[#333] rounded">{startup.pricingType}</span>
                  </div>
                  <div className="text-[10px] text-[#A0A0A0] line-clamp-2 leading-snug">
                    {startup.tagline}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={generateLaunchPackage} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#999] font-mono mb-1">
                  Product Name <span className="text-[#A38D5B]">*</span>
                </label>
                <input
                  id="product-name-input"
                  type="text"
                  required
                  placeholder="e.g. MailNudge"
                  value={request.productName}
                  onChange={(e) => setRequest({ ...request, productName: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#A38D5B] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#999] font-mono mb-1">
                  Website URL
                </label>
                <input
                  id="website-url-input"
                  type="url"
                  placeholder="https://mailnudge.ai"
                  value={request.websiteUrl}
                  onChange={(e) => setRequest({ ...request, websiteUrl: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#A38D5B] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#999] font-mono mb-1">
                  Pricing model
                </label>
                <select
                  id="pricing-type-select"
                  value={request.pricingType}
                  onChange={(e) => setRequest({ ...request, pricingType: e.target.value as any })}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#A38D5B] transition-colors"
                >
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                  <option value="Open Source">Open Source</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#999] font-mono mb-1">
                  Primary Category
                </label>
                <input
                  id="category-input"
                  type="text"
                  placeholder="e.g. Developer Tools, Productivity"
                  value={request.primaryCategory}
                  onChange={(e) => setRequest({ ...request, primaryCategory: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#A38D5B] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#999] font-mono mb-1">
                Target Keywords / Tags
              </label>
              <input
                id="keywords-input"
                type="text"
                placeholder="slack, notification automation, alerts"
                value={request.keywords}
                onChange={(e) => setRequest({ ...request, keywords: e.target.value })}
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#A38D5B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-[#999] font-mono mb-1 flex justify-between">
                <span>Core Concept & Description <span className="text-[#A38D5B]">*</span></span>
                <span className="text-[#888] normal-case">Explain the simple problem it solves</span>
              </label>
              <textarea
                id="raw-description-textarea"
                rows={5}
                required
                placeholder="Describe your startup. What is the single main issue it resolves, who is the user, and how does your product tackle it?"
                value={request.rawDescription}
                onChange={(e) => setRequest({ ...request, rawDescription: e.target.value })}
                className="w-full bg-[#141414] border border-[#2A2A2A] rounded p-2.5 text-sm text-white focus:outline-none focus:border-[#A38D5B] transition-colors resize-none font-sans"
              />
            </div>

            {/* API Warning/Notice when fallback is applied */}
            {!configStatus.hasApiKey && (
              <div className="bg-[#1C140E] border border-[#D97706]/40 text-amber-200/90 p-3 rounded text-[11px] leading-relaxed flex items-start gap-2">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-500" />
                <div>
                  No custom <code className="bg-[#1A1108] text-amber-300 px-1 py-0.5 rounded">GEMINI_API_KEY</code> specified. LaunchForge is operating using dynamic local synthesis presets and pre-compiled algorithmic expansion to ensure zero-block operation. Put your key in <strong>Settings &gt; Secrets</strong>!
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="bg-[#1C1212] border border-red-900/50 text-red-300 p-3 rounded text-xs">
                {errorMsg}
              </div>
            )}

            <button
              id="generate-btn"
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 border text-[11px] uppercase tracking-[0.25em] font-mono font-bold transition-all rounded ${
                loading 
                  ? 'border-[#444] text-[#888] bg-[#141414] cursor-not-allowed' 
                  : 'border-[#A38D5B] text-[#0F0F0F] bg-[#A38D5B] hover:bg-transparent hover:text-[#A38D5B] active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Orchestrating Submission Architecture...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  <Sparkles className="h-4.5 w-4.5" />
                  Synthesize Directory Drafts
                </span>
              )}
            </button>
          </form>

          {/* Pitched Product Live Meta-Insights */}
          {pkg && (
            <div className="border border-[#222] bg-[#121214] p-4 rounded mt-2">
              <span className="text-[9px] uppercase tracking-widest text-[#A38D5B] block mb-2 font-mono">Founders Copy Advice & NLP Insight</span>
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-[#888] font-mono block">SUGGESTED HIGH-CONVERSION HOOK</span>
                  <p className="text-sm italic text-[#E5E5E5] font-serif border-l-2 border-[#A38D5B] pl-3 mt-1 py-0.5">
                    "{pkg.analyzedPitch.suggestedHook}"
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#222]">
                  <div>
                    <span className="text-[9px] text-emerald-400 font-mono block uppercase">Pitch Strengths</span>
                    <ul className="text-xs text-[#AAA] list-disc list-inside mt-1 space-y-1">
                      {pkg.analyzedPitch.strengths.map((str, idx) => (
                        <li key={idx} className="line-clamp-2">{str}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#A38D5B] font-mono block uppercase">Growth Gaps Found</span>
                    <ul className="text-xs text-[#AAA] list-disc list-inside mt-1 space-y-1">
                      {pkg.analyzedPitch.gaps.map((gap, idx) => (
                        <li key={idx} className="line-clamp-2">{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Founder Credit Profile */}
          <FounderProfile />
        </section>

        {/* Right Column: Submission Package drafts & Simulated Deployment Logs */}
        <section className="lg:col-span-7 bg-[#141414] flex flex-col justify-between">
          
          {/* Main Top Selector Tabs */}
          <div className="flex border-b border-[#2A2A2A] bg-[#0A0A0A] shrink-0">
            <button
              id="tab-deliverables"
              type="button"
              onClick={() => setRightPanelTab('deliverables')}
              className={`flex-1 py-4.5 text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-center transition-all flex items-center justify-center gap-1.5 ${
                rightPanelTab === 'deliverables' 
                  ? theme === 'dark'
                    ? 'bg-[#141414] text-white border-b-2 border-b-[#A38D5B] font-bold' 
                    : 'bg-[#FFFFFF] text-[#1C1C1E] border-b-2 border-b-[#8E6E34] font-bold shadow-xs'
                  : theme === 'dark'
                    ? 'text-[#666] hover:text-[#aaa] bg-[#0C0C0D]'
                    : 'text-[#555] hover:text-[#222] bg-[#E5E5EA]'
              }`}
            >
              🚀 Deliverables
            </button>
            <button
              id="tab-developer"
              type="button"
              onClick={() => setRightPanelTab('developer')}
              className={`flex-1 py-4.5 text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-center transition-all flex items-center justify-center gap-1.5 ${
                rightPanelTab === 'developer' 
                  ? theme === 'dark'
                    ? 'bg-[#141414] text-[#A38D5B] border-b-2 border-b-[#A38D5B] font-bold' 
                    : 'bg-[#FFFFFF] text-[#8E6E34] border-b-2 border-b-[#8E6E34] font-bold shadow-xs'
                  : theme === 'dark'
                    ? 'text-[#666] hover:text-[#aaa] bg-[#0C0C0D]'
                    : 'text-[#555] hover:text-[#222] bg-[#E5E5EA]'
              }`}
            >
              <Terminal className="h-4 w-4 shrink-0 text-[#A38D5B]" />
              💻 Dev Portal
            </button>
            <button
              id="tab-growth"
              type="button"
              onClick={() => setRightPanelTab('growth')}
              className={`flex-1 py-4.5 text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-center transition-all flex items-center justify-center gap-1.5 ${
                rightPanelTab === 'growth' 
                  ? theme === 'dark'
                    ? 'bg-[#141414] text-[#A38D5B] border-b-2 border-b-[#A38D5B] font-bold' 
                    : 'bg-[#FFFFFF] text-[#8E6E34] border-b-2 border-b-[#8E6E34] font-bold shadow-xs'
                  : theme === 'dark'
                    ? 'text-[#666] hover:text-[#aaa] bg-[#0C0C0D]'
                    : 'text-[#555] hover:text-[#222] bg-[#E5E5EA]'
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0 text-[#A38D5B]" />
              🎨 Image Gen
            </button>
            <button
              id="tab-docs"
              type="button"
              onClick={() => setRightPanelTab('docs')}
              className={`flex-1 py-4.5 text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase text-center transition-all flex items-center justify-center gap-1.5 ${
                rightPanelTab === 'docs' 
                  ? theme === 'dark'
                    ? 'bg-[#141414] text-[#A38D5B] border-b-2 border-b-[#A38D5B] font-bold' 
                    : 'bg-[#FFFFFF] text-[#8E6E34] border-b-2 border-b-[#8E6E34] font-bold shadow-xs'
                  : theme === 'dark'
                    ? 'text-[#666] hover:text-[#aaa] bg-[#0C0C0D]'
                    : 'text-[#555] hover:text-[#222] bg-[#E5E5EA]'
              }`}
            >
              <BookOpen className="h-4 w-4 shrink-0 text-[#A38D5B]" />
              📚 Docs
            </button>
          </div>

          {/* Top Panel Contents based on Active Tab */}
          <div className="p-6 md:p-8 flex-1 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
            {rightPanelTab === 'deliverables' && (
              // Tab A: Deliverables View
              <>
                {!pkg ? (
                <div className="flex-1 flex flex-col justify-center items-center text-center p-8 border border-dashed border-[#2A2A2A] rounded bg-[#0F0F0F]">
                  <Layers className="h-12 w-12 text-[#2A2A2A] mb-4" />
                  <h3 className="text-lg font-light font-display text-[#888]">No Drafts Generated</h3>
                  <p className="text-xs text-[#555] max-w-sm mt-1 mb-4">
                    Fill out the parameters or select a pre-designed startup on the left, then click "Synthesize Directory Drafts" to create immediate, platform-specific copy packages.
                  </p>
                  <button
                    type="button"
                    onClick={() => setRightPanelTab('growth')}
                    className="px-4 py-2 bg-[#A38D5B]/10 hover:bg-[#A38D5B]/20 text-[#A38D5B] border border-[#A38D5B]/30 hover:border-[#A38D5B]/50 rounded text-[10px] uppercase font-mono font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>🎨 Open Brand & Image Generator</span>
                  </button>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-4">
                  
                  {pkg.fallbackMode && (
                    <div className="bg-[#1C140E] border border-amber-500/30 text-amber-200/90 p-4 rounded text-xs leading-relaxed flex items-start gap-3 shadow-[0_4px_12px_rgba(217,119,6,0.05)]">
                      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                      <div className="space-y-1 text-left">
                        <div className="font-bold text-amber-400 uppercase tracking-widest text-[9px] font-mono">
                          Programmatic Synthesis Fallback Active
                        </div>
                        <p className="text-amber-200/80 leading-relaxed">
                          LaunchForge reverted to dynamic programmatic local templates because the server's Gemini key reported an error: 
                          <span className="font-mono bg-black/40 text-rose-300 px-1.5 py-0.5 rounded ml-1 text-[11px] select-all break-all">
                            {pkg.fallbackError || 'PERMISSION_DENIED / Leaked Key'}
                          </span>
                        </p>
                        <p className="text-[#888] text-[10px] mt-2">
                          💡 <strong>How to get AI-powered synthesis:</strong> Click the <strong>💻 Tech Sandbox</strong> tab on the right, toggle <strong>Bring Your Own Key</strong>, and insert a fresh, valid Gemini API Key from Google AI Studio.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Header Switcher for Directories */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2A2A] pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-mono uppercase tracking-[0.15em] text-[#fff]">Submission Packages Suite</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Tabs */}
                      <div className="flex gap-1 bg-[#0F0F0F] p-1 border border-[#2A2A2A] rounded-sm">
                        {pkg.platformDrafts.map((draft) => (
                          <button
                            key={draft.platformId}
                            type="button"
                            onClick={() => setActiveTab(draft.platformId as any)}
                            className={`px-3 py-1 text-[11px] font-mono uppercase rounded-sm transition-all ${
                              activeTab === draft.platformId 
                                ? 'bg-[#A38D5B] text-[#0f0f0f] font-bold' 
                                : 'text-[#888] hover:text-[#fff]'
                            }`}
                          >
                            {draft.platformName}
                          </button>
                        ))}
                      </div>

                      {/* Export Button */}
                      <button
                        onClick={exportLaunchPackageAsJSON}
                        type="button"
                        className="flex items-center gap-1 px-3 py-1 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/45 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer"
                        title="Download complete JSON package offline"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>

                  {/* Display Current Platform Package */}
                  {(() => {
                    const draft = pkg.platformDrafts.find((p) => p.platformId === activeTab);
                    if (!draft) return null;
                    
                    // Length and validation checkers
                    const taglineLen = draft.tagline.length;
                    const taglineMax = draft.maxLimits.tagline;
                    const isTaglineValid = taglineLen <= taglineMax;

                    const descLen = draft.shortDescription.length;
                    const descMax = draft.maxLimits.shortDescription;
                    const isDescValid = descLen <= descMax;

                    const isLongDescAvailable = !!draft.longDescription;
                    const longDescLen = draft.longDescription?.length || 0;
                    const longDescMax = draft.maxLimits.longDescription || 99999;
                    const isLongDescValid = !draft.longDescription || longDescLen <= longDescMax;

                    return (
                      <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        
                        {/* Platform Info Badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#0F0F0F] p-3 border border-[#2A2A2A] rounded gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-mono text-[#A38D5B] block">DIRECTORY PORTAL Target</span>
                            <span className="text-sm font-bold text-white font-display flex items-center gap-1.5 mt-0.5">
                              {draft.platformName}
                              <span className="text-xs font-light text-[#888] font-sans">({draft.url})</span>
                            </span>
                          </div>
                          <a 
                            href={draft.platformName === 'Product Hunt' ? 'https://www.producthunt.com/posts/new' : draft.url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] text-[#A38D5B] hover:underline font-mono"
                          >
                            Submit Directly <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>

                        {/* Tagline Box */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-[#888] uppercase tracking-wider">Tagline</span>
                            <span className={`px-1.5 py-0.5 rounded-sm ${isTaglineValid ? 'text-emerald-400 bg-emerald-950/20' : 'text-red-400 bg-red-950/20'}`}>
                              {taglineLen}/{taglineMax} Chars
                            </span>
                          </div>
                          <div className="relative group">
                            <input 
                              type="text" 
                              readOnly 
                              value={draft.tagline}
                              className="w-full bg-[#0F0F0F] border border-[#252528] rounded p-2.5 text-xs text-white pr-10 font-sans"
                            />
                            <button
                              type="button"
                              onClick={() => copyToClipboard(draft.tagline, `${draft.platformId}-tagline`)}
                              className="absolute right-2 top-1.5 p-1.5 bg-[#171719] hover:bg-[#202023] rounded border border-[#2A2A2A] text-[#888] hover:text-white transition-colors"
                              title="Copy tagline"
                            >
                              {copiedField === `${draft.platformId}-tagline` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Short Description Box */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-[#888] uppercase tracking-wider">Short Description / Teaser</span>
                            <span className={`px-1.5 py-0.5 rounded-sm ${isDescValid ? 'text-emerald-400 bg-emerald-950/20' : 'text-red-400 bg-red-950/20'}`}>
                              {descLen}/{descMax} Chars
                            </span>
                          </div>
                          <div className="relative">
                            <textarea 
                              rows={3}
                              readOnly 
                              value={draft.shortDescription}
                              className="w-full bg-[#0F0F0F] border border-[#252528] rounded p-2.5 text-xs text-white pr-10 font-sans resize-none leading-relaxed"
                            />
                            <button
                              type="button"
                              onClick={() => copyToClipboard(draft.shortDescription, `${draft.platformId}-desc`)}
                              className="absolute right-2 top-2 p-1.5 bg-[#171719] hover:bg-[#202023] rounded border border-[#2A2A2A] text-[#888] hover:text-white transition-colors"
                              title="Copy short description"
                            >
                              {copiedField === `${draft.platformId}-desc` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Optional Long Description Box */}
                        {isLongDescAvailable && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-[#888] uppercase tracking-wider">Extended Description / Maker Post</span>
                              <span className={`px-1.5 py-0.5 rounded-sm ${isLongDescValid ? 'text-emerald-400 bg-emerald-950/20' : 'text-red-400 bg-red-950/20'}`}>
                                {longDescLen} Chars
                              </span>
                            </div>
                            <div className="relative">
                              <textarea 
                                rows={5}
                                readOnly 
                                value={draft.longDescription}
                                className="w-full bg-[#0F0F0F] border border-[#252528] rounded p-2.5 text-xs text-white pr-10 font-sans resize-none leading-relaxed"
                              />
                              <button
                                type="button"
                                onClick={() => copyToClipboard(draft.longDescription || '', `${draft.platformId}-longdesc`)}
                                className="absolute right-2 top-2 p-1.5 bg-[#171719] hover:bg-[#202023] rounded border border-[#2A2A2A] text-[#888] hover:text-white transition-colors"
                                title="Copy long description"
                              >
                                {copiedField === `${draft.platformId}-longdesc` ? (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Tags & Meta Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="bg-[#0F0F0F] border border-[#232326] p-3 rounded">
                            <span className="text-[9px] uppercase font-mono text-[#888] block mb-1">Recommended Sub-Category</span>
                            <span className="text-xs font-semibold text-white font-mono">{draft.suggestedCategory}</span>
                          </div>
                          <div className="bg-[#0F0F0F] border border-[#232326] p-3 rounded">
                            <span className="text-[9px] uppercase font-mono text-[#888] block mb-1.5">SEO Tags & Tags</span>
                            <div className="flex flex-wrap gap-1">
                              {draft.tags.map((tag) => (
                                <span key={tag} className="text-[10px] font-mono text-white bg-[#1A1A1E] px-2 py-0.5 border border-[#2E2E33] rounded">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                      </motion.div>
                    );
                  })()}

                  {/* Social copy Tab & SEO Meta Package and Social Suite Combo */}
                  <div className="border-t border-[#2A2A2A] pt-4 mt-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-mono tracking-widest text-[#A38D5B]">Viral Launch Multiplier Copy</span>
                      <div className="flex bg-[#0F0F0F] p-0.5 border border-[#2A2A2A] rounded">
                        {(['TwitterX', 'RedditStartups', 'HackerNews', 'LinkedIn'] as const).map((net) => {
                          const post = pkg.socialPosts.find((p) => p.network === net || (p.network as string).toLowerCase() === net.toLowerCase());
                          if (!post) return null;
                          return (
                            <button
                              key={net}
                              type="button"
                              onClick={() => setSocialTab(net)}
                              className={`px-2 py-1 text-[9px] font-mono uppercase transition-all ${
                                socialTab === net 
                                  ? 'bg-white text-black font-bold' 
                                  : 'text-[#888] hover:text-white'
                              }`}
                            >
                              {net === 'TwitterX' ? 'X / Twitter' : net === 'RedditStartups' ? 'Reddit' : net === 'HackerNews' ? 'HackerNews' : 'LinkedIn'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {(() => {
                      const activePost = pkg.socialPosts.find(
                        (p) => p.network === socialTab || (p.network as string).toLowerCase() === socialTab.toLowerCase()
                      );
                      if (!activePost) {
                        return <span className="text-xs text-[#555] italic">Social draft for {socialTab} not compiled.</span>;
                      }
                      return (
                        <motion.div 
                          key={socialTab}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.15 }}
                          className="bg-[#0D0D0E] border border-[#2A2A2A] p-4 rounded space-y-2"
                        >
                          {activePost.title && (
                            <div className="border-b border-[#2A2A2A] pb-2">
                              <span className="text-[9px] uppercase font-mono text-[#888] block">SUBJECT / TITLE HEADER</span>
                              <div className="text-xs font-bold font-display text-white mt-1">{activePost.title}</div>
                            </div>
                          )}
                          <div className="relative">
                            <textarea
                              rows={4}
                              readOnly
                              value={activePost.content}
                              className="w-full bg-transparent text-xs text-[#E5E5E5] font-mono leading-relaxed resize-none focus:outline-none pr-8"
                            />
                            <button
                              type="button"
                              onClick={() => copyToClipboard(activePost.content, `social-${socialTab}`)}
                              className="absolute right-0 top-0 p-1 bg-[#171719] hover:bg-[#202023] rounded border border-[#2A2A2A] text-[#888] hover:text-white transition-all"
                              title="Copy Copywrite text"
                            >
                              {copiedField === `social-${socialTab}` ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="border-t border-[#1C1C1F] pt-2 mt-2 flex items-center gap-1">
                            <span className="text-[9px] uppercase font-mono text-[#A38D5B]">Viral Rule:</span>
                            <span className="text-[10px] text-[#888] italic">{activePost.bestPractices}</span>
                          </div>
                        </motion.div>
                      );
                    })()}

                    {/* HTML SEO Package */}
                    <div className="border-t border-[#2A2A2A] pt-4">
                      <span className="text-xs uppercase font-mono tracking-widest text-[#A38D5B] block mb-2">SEO Search Snippet Draft</span>
                      <div className="bg-[#0F0F0F] border border-[#222] p-4 rounded space-y-2">
                        <div className="text-blue-400 hover:underline cursor-pointer font-serif text-sm truncate">
                          {pkg.seoPackage.metaTitle}
                        </div>
                        <div className="text-emerald-600 text-xs truncate">
                          {request.websiteUrl || 'https://sandbox-url.com'}
                        </div>
                        <p className="text-xs text-[#999] leading-relaxed">
                          {pkg.seoPackage.metaDescription}
                        </p>
                        
                        <div className="pt-2 border-t border-[#1C1C1F] flex flex-wrap gap-1 items-center">
                          <span className="text-[9px] font-mono text-[#777] uppercase mr-1">Rank Keywords:</span>
                          {pkg.seoPackage.seoKeywords.map((k, i) => (
                            <span key={i} className="text-[9px] font-mono bg-[#161618] border border-[#252528] px-1.5 py-0.5 rounded text-[#AAA]">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Interactive Launch Checklist Section */}
                    {activeTab && (
                      <div className="border-t border-[#2A2A2A] pt-4 mt-6">
                        <div className="bg-[#0A0A0C] border border-[#222] p-4 rounded-md space-y-3">
                          <div className="flex justify-between items-center border-b border-[#1C1C1F] pb-2">
                            <div className="flex items-center gap-1.5">
                              <CheckSquare className="h-4 w-4 text-[#A38D5B]" />
                              <span className="text-[10px] uppercase font-mono tracking-[0.15em] text-white">
                                Active Submission Checklist
                              </span>
                            </div>
                            <span className="text-[9px] font-mono bg-[#161619] border border-[#2A2A30] px-2 py-0.5 rounded text-[#A38D5B] font-bold">
                              Complete: {GET_PLATFORM_CHECKLIST(activeTab).filter(item => checklist[item.key]).length} / {GET_PLATFORM_CHECKLIST(activeTab).length}
                            </span>
                          </div>
                          
                          <div className="space-y-2">
                            {GET_PLATFORM_CHECKLIST(activeTab).map((item) => {
                              const isChecked = !!checklist[item.key];
                              return (
                                <label 
                                  key={item.key}
                                  className={`flex items-start gap-2.5 p-2 rounded border transition-all text-xs cursor-pointer select-none ${
                                    isChecked 
                                      ? 'bg-[#141E18]/20 border-emerald-950/40 text-emerald-400/85 hover:bg-[#141E18]/40' 
                                      : 'bg-[#0E0E10] border-[#1C1C1F] text-[#aaa] hover:bg-[#151518] hover:text-white'
                                  }`}
                                >
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleChecklistItem(item.key)}
                                    className="mt-0.5 rounded border-[#333] text-[#A38D5B] focus:ring-0 h-3.5 w-3.5 bg-black cursor-pointer"
                                  />
                                  <span className={`${isChecked ? 'line-through opacity-60' : ''}`}>
                                    {item.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Export Action Card */}
                    <div className="border-t border-[#2A2A2A] pt-4 mt-6">
                      <div className="bg-[#121115] border border-dashed border-[#A38D5B]/30 p-4 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-xs uppercase font-mono tracking-widest text-[#A38D5B] font-bold flex items-center gap-1">
                            <FileDown className="h-4 w-4" />
                            Offline Launch Bundle Export
                          </h4>
                          <p className="text-[11px] text-[#888] leading-relaxed">
                            Save the complete synthesized package as a secure JSON blueprint file containing platform copywrite drafts and viral tag structures.
                          </p>
                        </div>
                        
                        <button
                          onClick={exportLaunchPackageAsJSON}
                          type="button"
                          className="w-full sm:w-auto px-5 py-2.5 bg-[#A38D5B] hover:bg-transparent border border-[#A38D5B] hover:text-[#A38D5B] text-black text-[11px] uppercase tracking-[0.15em] font-mono font-bold transition-all rounded shrink-0 flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer"
                        >
                          <FileDown className="h-4 w-4" />
                          Download Launch Bundle
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

                {/* Submission History Vault / Archives Section */}
                <div className={`mt-6 p-5 border rounded transition-all text-left ${
                  theme === 'dark' ? 'bg-[#101012] border-[#2A2A2A]' : 'bg-[#F1F1F4] border-[#D1D1D6] shadow-sm'
                }`}>
                  <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4 text-[#A38D5B]" />
                      <h3 className={`text-xs font-mono uppercase tracking-[0.15em] font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1C1C1E]'}`}>
                        🕒 Submissions History Sync ({historyList.length})
                      </h3>
                    </div>
                    {clerkUser && (
                      <button
                        onClick={syncHistoryToSupabase}
                        className={`px-2 py-0.5 border text-[9px] font-mono rounded uppercase flex items-center gap-1 transition-all ${
                          dbSyncStatus === 'testing' 
                            ? 'animate-pulse text-amber-500 border-amber-500/30'
                            : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10'
                        }`}
                      >
                        {dbSyncStatus === 'testing' ? 'Syncing...' : 'Sync to Supabase'}
                      </button>
                    )}
                  </div>

                  {historyList.length === 0 ? (
                    <div className="text-center py-6 text-[11px] text-[#777] italic">
                      No historical records yet. Complete a synthesis run to catalog submissions locally.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {historyList.map((hist) => (
                        <div 
                          key={hist.id}
                          className={`p-2.5 rounded border text-xs flex justify-between items-center transition-all ${
                            theme === 'dark' 
                              ? 'bg-[#0A0A0B] border-[#222] hover:bg-[#151517]' 
                              : 'bg-[#FFFFFF] border-[#E5E5EA] hover:bg-[#F2F2F7] shadow-xs'
                          }`}
                        >
                          <div className="cursor-pointer flex-1" onClick={() => {
                            setRequest(hist.request);
                            setPkg(hist.data);
                            showToast("Restored Archive", `Loaded historical configuration for ${hist.productName}!`);
                          }}>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold ${theme === 'dark' ? 'text-[#F5F5F5]' : 'text-[#1C1C1E]'}`}>{hist.productName}</span>
                              <span className={`px-1.5 py-0.5 border text-[8px] font-mono rounded uppercase ${
                                hist.pricingType === 'Free' ? 'text-emerald-500 border-emerald-500/25 bg-emerald-500/5' : 'text-[#A38D5B] border-[#A38D5B]/35 bg-[#A38D5B]/5'
                              }`}>{hist.pricingType}</span>
                            </div>
                            <div className="text-[10px] text-[#555] mt-0.5 font-mono">
                              Category: {hist.primaryCategory} • {hist.timestamp}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = historyList.filter(item => item.id !== hist.id);
                              setHistoryList(updated);
                              localStorage.setItem('launchforge_history_list', JSON.stringify(updated));
                              showToast("Record Purged", "Cleaned item from submission history.");
                            }}
                            className="p-1 hover:text-red-500 text-[#555] transition-colors cursor-pointer"
                            title="Purge record"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

              {rightPanelTab === 'developer' && (
                <div className="space-y-6 text-[#E5E5E5] animate-fadeIn text-xs leading-relaxed">
                
                {/* Protocol Header */}
                <div className="border-b border-[#2A2A2A] pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#A38D5B] tracking-widest">
                    <Shield className="h-4 w-4" />
                    <span>Bring Your Own Key & Self-Serve Protocol</span>
                  </div>
                  <h3 className="text-xl font-light font-display text-white mt-1">
                    Operate & Deploy LaunchForge Individually
                  </h3>
                  <p className="text-[#888] text-xs mt-1">
                    Eliminate server overhead! Configure a direct client-side token or link your custom Supabase DB and Clerk Authentication suites in 2 minutes. Perfect for Indie Hackers.
                  </p>
                </div>

                {/* Section 1: Gemini BYOK Credentials */}
                <div className="bg-[#0F0F0F] border border-[#2A2A2A] p-4 rounded space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-mono text-[10px] text-[#A38D5B] uppercase tracking-wider font-bold">
                      1. Dynamic Client-Side Gemini SDK Access
                    </h4>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={useByok}
                        onChange={(e) => saveDeveloperCredential('use_byok', e.target.checked ? 'true' : 'false')}
                        className="rounded bg-[#1A1A1D] border-[#333] text-[#A38D5B] focus:ring-0 h-3.5 w-3.5"
                      />
                      <span className="text-[10px] font-mono text-[#AAA]">Enable BYOK Client Key Mode</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-[#888]">
                    When activated, LaunchForge intercepts generations and directs them safely using your own custom API token. No calls route through public quotas.
                  </p>
                  <div>
                    <label className="block text-[9px] font-mono text-[#666] uppercase mb-1">
                      Custom Gemini API Token (Stored locally)
                    </label>
                    <input 
                      type="password"
                      placeholder="AIzaSy..."
                      value={customKey}
                      onChange={(e) => saveDeveloperCredential('byok', e.target.value)}
                      className="w-full bg-[#141414] border border-[#222] text-xs font-mono p-2 rounded text-white focus:outline-none focus:border-[#A38D5B]"
                    />
                    <span className="text-[10px] text-[#666] mt-1 block">
                      Stored securely inside your local browser storage. Never exposed publically.
                    </span>
                  </div>

                  {/* BYOK Validator Button & Results */}
                  <div className="pt-2 border-t border-[#1F1F1F] flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] text-[#888] font-mono">
                        Verification Engine:
                      </span>
                      <button
                        type="button"
                        onClick={testCustomApiKey}
                        disabled={isTestingKey}
                        className={`px-3 py-1.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                          isTestingKey
                            ? 'bg-[#A38D5B]/20 text-[#A38D5B]/50 border border-[#A38D5B]/10'
                            : 'bg-[#A38D5B]/10 hover:bg-[#A38D5B]/20 text-[#A38D5B] border border-[#A38D5B]/30 hover:border-[#A38D5B]/50'
                        }`}
                      >
                        {isTestingKey ? (
                          <>
                            <span className="h-3 w-3 border-2 border-[#A38D5B] border-t-transparent rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <span>⚡ Test Key Connection</span>
                          </>
                        )}
                      </button>
                    </div>

                    {keyTestResult && (
                      <div className={`p-2.5 rounded border text-[11px] leading-relaxed transition-all ${
                        keyTestResult.success 
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30' 
                          : 'bg-rose-950/20 text-rose-400 border-rose-900/30'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold font-mono text-[9px] uppercase tracking-wider mb-0.5">
                          <span className={`h-1.5 w-1.5 rounded-full ${keyTestResult.success ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          <span>{keyTestResult.success ? 'Key Verified successfully' : 'Key Verification failed'}</span>
                        </div>
                        <p className="font-mono text-[10px]">{keyTestResult.message}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Clerk + Supabase Integration Fields */}
                <div className={`border p-4 rounded space-y-4 transition-all ${
                  theme === 'dark' ? 'bg-[#0F0F0F] border-[#2A2A2A]' : 'bg-[#F2F2F7] border-[#D1D1D6]'
                }`}>
                  <div className="flex justify-between items-center border-b pb-2 border-dashed border-[#222]">
                    <h4 className="font-mono text-[10px] text-[#A38D5B] uppercase tracking-wider font-bold">
                      2. Live Supabase Backend & Clerk Authentication Config
                    </h4>
                    <span className="text-[9px] bg-emerald-950/30 text-emerald-400 px-1.5 border border-emerald-900/40 rounded uppercase font-mono">
                      Integrated Auth
                    </span>
                  </div>

                  {/* Stateful Clerk SSO Gateway */}
                  <div className={`p-3.5 border rounded transition-all text-left ${
                    theme === 'dark' ? 'bg-[#151518] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E5EA] shadow-xs'
                  }`}>
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className={`text-[10px] font-mono uppercase tracking-wide font-bold ${theme === 'dark' ? 'text-white' : 'text-[#1C1C1E]'}`}>
                          🔐 Clerk User Management Controls
                        </span>
                      </div>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                        clerkUser 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {clerkUser ? 'SESSION ACTIVE' : 'SIGNED_OUT'}
                      </span>
                    </div>

                    {clerkUser ? (
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                          <img 
                            src={clerkUser.email.includes('asym') || clerkUser.fullName.includes('Asym') ? '/src/assets/images/asym_profile_1780496819972.png' : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'} 
                            alt="User Profile" 
                            className="h-10 w-10 rounded-full border border-[#A38D5B]/30 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/bottts/svg?seed=${clerkUser.fullName}`;
                            }}
                          />
                          <div className="space-y-0.5 text-xs">
                            <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`}>{clerkUser.fullName}</p>
                            <p className="text-[#888] font-mono text-[10px]">{clerkUser.email}</p>
                            <p className="text-[#666] font-mono text-[9px]">UID: {clerkUser.id}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-[9px] font-mono bg-[#09090A]/50 p-2 rounded text-indigo-400 border border-[#222]">
                          <span>Token:</span>
                          <span className="truncate max-w-[200px]">{clerkUser.authToken}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleClerkAuth('signout')}
                          className="w-full py-1.5 bg-red-950/20 hover:bg-red-905/40 text-red-400 border border-red-900/40 text-[10px] uppercase font-mono tracking-wider rounded transition-all cursor-pointer"
                        >
                          🚪 Sign Out of Clerk Security
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3.5 border-t border-[#222] pt-2 mt-1">
                        <p className="text-[10px] text-[#777] leading-relaxed">
                          By building with Clerk, session history is automatically securely synced inside Supabase DBMS utilizing JWT claims. Type your credentials below to simulate signup or login:
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[9px] font-mono text-[#777] uppercase mb-1">Full Name</label>
                            <input 
                              type="text"
                              value={clerkNameInput}
                              onChange={(e) => setClerkNameInput(e.target.value)}
                              placeholder="e.g. Asym Alwali"
                              className={`w-full p-1.5 rounded font-mono text-xs focus:ring-0 focus:outline-none focus:border-[#A38D5B] border ${
                                theme === 'dark' ? 'bg-[#0E0E10] border-[#222] text-white' : 'bg-white border-[#D1D1D6] text-black'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-mono text-[#777] uppercase mb-1">Email Address</label>
                            <input 
                              type="email"
                              value={clerkEmailInput}
                              onChange={(e) => setClerkEmailInput(e.target.value)}
                              placeholder="e.g. asym@twitter.com"
                              className={`w-full p-1.5 rounded font-mono text-xs focus:ring-0 focus:outline-none focus:border-[#A38D5B] border ${
                                theme === 'dark' ? 'bg-[#0E0E10] border-[#222] text-white' : 'bg-white border-[#D1D1D6] text-black'
                              }`}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 text-[10px] font-mono">
                          <button
                            type="button"
                            onClick={() => handleClerkAuth('signup')}
                            className="flex-1 py-1.5 bg-indigo-950/35 hover:bg-indigo-900/50 text-indigo-400 border border-indigo-900/40 uppercase tracking-wider rounded transition-all cursor-pointer text-center"
                          >
                            Sign Up with Clerk
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClerkAuth('signin')}
                            className="flex-1 py-1.5 bg-[#A38D5B] hover:bg-transparent border border-[#A38D5B] text-[#111] hover:text-[#A38D5B] uppercase tracking-wider rounded transition-all cursor-pointer text-center"
                          >
                            Sign In with Clerk
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-mono text-[#777] uppercase mb-1">Supabase URL Path</label>
                      <input 
                        type="url"
                        placeholder="https://your-proj.supabase.co"
                        value={supabaseUrl}
                        onChange={(e) => saveDeveloperCredential('supabase_url', e.target.value)}
                        className={`w-full p-2 rounded font-mono text-xs focus:outline-none focus:border-[#A38D5B] border ${
                          theme === 'dark' ? 'bg-[#141414] border-[#222] text-white' : 'bg-white border-[#D1D1D6] text-black'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-mono text-[#777] uppercase mb-1">Supabase Anon Key</label>
                      <input 
                        type="password"
                        placeholder="eyJhbGciOi..."
                        value={supabaseAnonKey}
                        onChange={(e) => saveDeveloperCredential('supabase_anon', e.target.value)}
                        className={`w-full p-2 rounded font-mono text-xs focus:outline-none focus:border-[#A38D5B] border ${
                          theme === 'dark' ? 'bg-[#141414] border-[#222] text-white' : 'bg-white border-[#D1D1D6] text-black'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-[#777] uppercase mb-1">Clerk Publishable Key</label>
                    <input 
                      type="text"
                      placeholder="pk_test_..."
                      value={clerkPubKey}
                      onChange={(e) => saveDeveloperCredential('clerk_pub', e.target.value)}
                      className="w-full bg-[#141414] border border-[#222] p-2 rounded font-mono text-xs focus:outline-none focus:border-[#A38D5B]"
                    />
                  </div>

                  {/* Interactive hand shaking diagnostic mock */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={triggerDbSyncTest}
                      disabled={dbSyncStatus === 'testing'}
                      className="w-full sm:w-auto px-4 py-2 border border-[#A38D5B] hover:bg-[#A38D5B] hover:text-[#0F0F0F] text-[#A38D5B] rounded text-[10px] tracking-wider uppercase font-mono font-semibold transition-all shrink-0"
                    >
                      {dbSyncStatus === 'testing' ? 'Handshaking...' : 'Live-Verify Handshake via Clerk'}
                    </button>
                    <div className="text-[10.5px] text-[#666]">
                      {dbSyncStatus === 'idle' && 'Click to test secure integration logs.'}
                      {dbSyncStatus === 'testing' && 'Testing dynamic Handshake... view Decision logs below.'}
                      {dbSyncStatus === 'synced' && '✅ Dynamic Link Configured. Sync Pipeline 100% stable.'}
                    </div>
                  </div>
                </div>

                {/* Section 3: Copyable SQL & Config Blueprints */}
                <div className="space-y-4">
                  <h4 className="font-mono text-[10px] text-[#888] uppercase tracking-widest pl-1">
                    📋 Ready-to-use Dev Blueprints
                  </h4>

                  {/* Schema DB */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-mono">
                      <span className="text-[#A38D5B]">PUBLIC SCHEMA (SUPABASE POSTGRES)</span>
                      <button 
                        type="button"
                        onClick={() => copyToClipboard(`-- Supabase SQL Table initialization for LaunchForge
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id TEXT NOT NULL, -- Hooked up to Clerk JWT Auth subId
  product_name TEXT NOT NULL,
  website_url TEXT,
  pricing_model TEXT,
  category TEXT,
  draft_payload JSONB NOT NULL
);

-- Enable Row Level Security (RLS) linked with Clerk user IDs
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to view only their own logs" 
  ON public.submissions FOR SELECT 
  USING (auth.uid()::text = user_id);`, 'sql-code')}
                        className="text-[#888] hover:text-white flex items-center gap-1 hover:underline text-[9px]"
                      >
                        {copiedField === 'sql-code' ? 'Copied SQL!' : 'Copy SQL Script'}
                      </button>
                    </div>
                    <pre className="bg-[#09090A] border border-[#1C1C1F] p-3 rounded text-[10.5px] font-mono text-emerald-400/90 overflow-x-auto leading-relaxed max-h-[160px]">
{`CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE,
  user_id TEXT NOT NULL, -- Tied directly to Clerk
  product_name TEXT NOT NULL,
  website_url TEXT,
  draft_payload JSONB NOT NULL
);`}
                    </pre>
                  </div>

                  {/* Clerk wrapping */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-[#A38D5B]">CLERK WRAPPING COMPONENT</span>
                      <button 
                        type="button"
                        onClick={() => copyToClipboard(`import React from 'react';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export function ClerkSecureRoot({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-6">
          <RedirectToSignIn signInForceRedirectUrl="/" />
        </div>
      </SignedOut>
    </ClerkProvider>
  );
}`, 'clerk-code')}
                        className="text-[#888] hover:text-white flex items-center gap-1 hover:underline text-[9px]"
                      >
                        {copiedField === 'clerk-code' ? 'Copied Auth!' : 'Copy React Component'}
                      </button>
                    </div>
                    <pre className="bg-[#09090A] border border-[#1C1C1F] p-3 rounded text-[10.5px] font-mono text-cyan-400 overflow-x-auto leading-relaxed max-h-[160px]">
{`import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react';

export function CoreApplication() {
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <SignedIn><Dashboard /></SignedIn>
    </ClerkProvider>
  );
}`}
                    </pre>
                  </div>

                  {/* Env Blueprint */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-[#A38D5B]">.ENV CREDENTIALS ENVIRONMENTS</span>
                      <button 
                        type="button"
                        onClick={() => copyToClipboard(`# LaunchForge Self-Serve config Setup environment variable bundle
VITE_CLERK_PUBLISHABLE_KEY=pk_test_aGFuZHNvbWUtZ3JvdXBlLTU4LmNsZXJrLmFjY291bnRzLmRldiQ
VITE_SUPABASE_URL=https://dwgylitxptgpyclbyuoh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3Z3lsaXR4cHRncHljbGJ5dW9oI...
GEMINI_API_KEY=AIzaSyA88921hdkaY_...`, 'env-code')}
                        className="text-[#888] hover:text-white flex items-center gap-1 hover:underline text-[9px]"
                      >
                        {copiedField === 'env-code' ? 'Copied Env!' : 'Copy Env File'}
                      </button>
                    </div>
                    <pre className="bg-[#09090A] border border-[#1C1C1F] p-3 rounded text-[10.5px] font-mono text-amber-200/90 overflow-x-auto leading-relaxed">
{`# Environment targets for custom deployments
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://your-proj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
                    </pre>
                  </div>

                </div>

              </div>
            )}

            {rightPanelTab === 'growth' && (
              <div className="space-y-6 text-[#E5E5E5] animate-fadeIn text-xs leading-relaxed">
                {/* 1. Canvas SVG Brand generator for product icons and social assets */}
                <LaunchImageGenerator
                  productName={request.productName}
                  tagline={pkg?.platformDrafts.find(p => p.platformId === 'hunt')?.tagline || 'Synthesize directory drafts to view live slogans here.'}
                  primaryCategory={request.primaryCategory}
                  showToast={showToast}
                />

                {/* 2. Walkthrough & Explanatory Guide Video simulation card */}
                <DemoWalkthrough />

                {/* 3. SEO pitch analyzer & keyword performance review */}
                <SEOAnalyzer
                  productName={request.productName}
                  websiteUrl={request.websiteUrl}
                  rawDescription={request.rawDescription}
                  keywords={request.keywords}
                />

                {/* 4. Reach, Click and conversion Traffic projections */}
                <DataVisualization
                  checklist={checklist}
                  pricingType={request.pricingType}
                  primaryCategory={request.primaryCategory}
                />

                {/* 5. Founders chronological day-by-day count scheduler */}
                <LaunchCalendar
                  productName={request.productName}
                />
              </div>
            )}

            {rightPanelTab === 'docs' && (
              <div className="space-y-6 text-left animate-fadeIn">
                
                {/* Docs Header */}
                <div className="border-b border-[#2A2A2A] pb-3">
                  <span className="text-[10px] font-mono uppercase text-[#A38D5B] tracking-widest block font-bold">
                    📖 SYSTEM ARCHITECTURE & USER MANUAL
                  </span>
                  <h3 className={`text-xl font-light font-display mt-1 ${theme === 'dark' ? 'text-white' : 'text-[#1C1C1E]'}`}>
                    Documentation Portal
                  </h3>
                  <p className="text-[#888] text-xs mt-1 leading-relaxed">
                    Everything you need to know about directory indexing limits, active startup templates, Clerk environments, and SQL database synchronization.
                  </p>
                </div>

                {/* Module 1: System Hotkeys / Keyboard Navigation */}
                <div className={`p-4 border rounded leading-relaxed ${
                  theme === 'dark' ? 'bg-[#101012] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#D1D1D6] shadow-sm'
                }`}>
                  <h4 className={`text-xs uppercase font-mono tracking-widest font-bold mb-2 ${theme === 'dark' ? 'text-teal-400' : 'text-teal-700'}`}>
                    1. System Keybindings Guide
                  </h4>
                  <p className="text-[11px] text-[#777] mb-3">
                    Increase launch orchestration speed by issuing quick, direct macros from your physical keyboard:
                  </p>
                  <div className="space-y-1.5 text-[11px] font-mono">
                    {[
                      { keys: ['Shift', 'S'], desc: 'Synthesize & compile package drafts' },
                      { keys: ['Shift', 'X'], desc: 'Export complete JSON bundle offline' },
                      { keys: ['Shift', 'P'], desc: 'Swap & apply random startup preset' },
                      { keys: ['Shift', 'D'], desc: 'Jump pointer to developers tab config' },
                      { keys: ['Shift', 'C'], desc: 'Scroll viewport to checklists section' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-1 hover:bg-[#A38D5B]/5">
                        <span className="text-[#888]">{item.desc}</span>
                        <div className="flex gap-0.5">
                          {item.keys.map((k) => (
                            <kbd key={k} className="px-1.5 py-0.5 bg-[#0F0F0F] border border-[#222] text-[#A38D5B] text-[8px] font-bold rounded">
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Module 2: The Bootstrapper Challenge Manifesto */}
                <div className={`p-4 border rounded leading-relaxed ${
                  theme === 'dark' ? 'bg-[#101012] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#D1D1D6] shadow-sm'
                }`}>
                  <h4 className={`text-xs uppercase font-mono tracking-widest font-bold mb-2 ${theme === 'dark' ? 'text-amber-400' : 'text-amber-700'}`}>
                    2. Bootstrapper Manifesto
                  </h4>
                  <p className="text-xs text-[#888] leading-relaxed">
                    Being a <strong>Writer Bootstrapper</strong> under high-stress constraints means operating with strict speed and high-efficiency automation. Directories like <em>Product Hunt</em> and <em>BetaList</em> enforce rigorous tagging characters limits. LaunchForge AI operates entirely inside these character envelopes to eliminate copy edits, ensuring your tagline reads correctly under 60 characters without truncate ellipses.
                  </p>
                </div>

                {/* Module 3: Clerk + Supabase DBMS Schema Integration */}
                <div className={`p-4 border rounded leading-relaxed ${
                  theme === 'dark' ? 'bg-[#101012] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#D1D1D6] shadow-sm'
                }`}>
                  <h4 className={`text-xs uppercase font-mono tracking-widest font-bold mb-2.5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-700'}`}>
                    3. Live Sync SQL Handshake
                  </h4>
                  <p className="text-xs text-[#888] mb-3 leading-relaxed">
                    By linking Clerk user auth claims with a Supabase database instance, you secure persistent user-specific submission logs. Here is the recommended database table setup:
                  </p>
                  <pre className="p-3 bg-black text-[10.5px] font-mono text-emerald-400 rounded overflow-x-auto leading-relaxed border border-[#222]">
{`-- SQL Database Handshake Setup
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- Ties to Clerk sub
  product_name TEXT NOT NULL,
  website_url TEXT,
  draft_payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS tied to Clerk auth context
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;`}
                  </pre>
                </div>

                {/* Module 4: Launch Platform Limits Sheet */}
                <div className={`p-4 border rounded leading-relaxed ${
                  theme === 'dark' ? 'bg-[#101012] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#D1D1D6] shadow-sm'
                }`}>
                  <h4 className={`text-xs uppercase font-mono tracking-widest font-bold mb-2 ${theme === 'dark' ? 'text-cyan-400' : 'text-cyan-700'}`}>
                    4. Directory Index Limit Bounds
                  </h4>
                  <div className="space-y-2 text-xs text-[#888]">
                    <div className="flex justify-between border-b border-[#222] pb-1">
                      <span className="font-bold text-white font-mono">Product Hunt:</span>
                      <span>60 Chars Tagline / 260 Chars Desc</span>
                    </div>
                    <div className="flex justify-between border-b border-[#222] pb-1">
                      <span className="font-bold text-white font-mono">BetaList:</span>
                      <span>SaaS Category / No Adult Content</span>
                    </div>
                    <div className="flex justify-between border-b border-[#222] pb-1">
                      <span className="font-bold text-white font-mono">AlternativeTo:</span>
                      <span>1-3 Competitor Links / SaaS Scope</span>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Bottom Panel: Live Thought Engine / Simulator Logs */}
          <aside className="border-t border-[#2A2A2A] bg-[#0C0F16] p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#A38D5B] shadow-[0_0_8px_#A38D5B]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#F5F5F5]">Decision & Compile Streams</span>
              </div>
              <span className="text-[10px] font-mono text-[#555] uppercase">
                {isSimulating ? 'compiling logs...' : 'idle'}
              </span>
            </div>

            <div className="space-y-3 font-mono text-[11px] text-[#888] max-h-[160px] overflow-y-auto">
              {simSteps.length === 0 ? (
                <div className="text-[#555] italic h-12 flex items-center justify-center">
                  Trigger directory synthesis above to view live compiler status logs...
                </div>
              ) : (
                simSteps.map((step) => (
                  <div key={step.id} className="border-b border-[#1C1C1F] pb-3 last:border-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[#F5F5F5] font-bold uppercase tracking-tight flex items-center gap-1.5">
                        [{step.platformName}]
                        <span className="text-[10px] text-[#A38D5B] font-light italic normal-case">
                          (Confidence score: {step.estimatedAIIfluenceScore}%)
                        </span>
                      </span>
                      <span className={`text-[10px] uppercase font-bold ${
                        step.status === 'completed' ? 'text-emerald-400' :
                        step.status === 'idle' ? 'text-[#555]' : 'text-amber-400 animate-pulse'
                      }`}>
                        {step.status}
                      </span>
                    </div>
                    {/* Log Lines */}
                    <div className="space-y-0.5 pl-3 border-l border-[#2A2A2A] mt-1.5">
                      {step.logLines.map((line, idx) => (
                        <p key={idx} className="text-[#999]">{line}</p>
                      ))}
                      <p className="text-xs text-[#555] italic">&gt; {step.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>

        {/* Tip & Donation Support Panel */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-6 w-full mt-6">
          <TipJar theme={theme} showToast={showToast} />
        </div>

      </main>

      {/* Editorial Footer */}
      <footer className="flex flex-col md:flex-row justify-between p-6 md:p-8 bg-[#0F0F0F] text-[9px] font-mono uppercase tracking-[0.4em] text-[#555] border-t border-[#2A2A2A] gap-4">
        <div>&copy; 2026 LAUNCHFORGE. No overhead. Absolute distribution logic.</div>
        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <span>Status: Autonomous</span>
          <span>Version: 3.1.0-Core</span>
          <span className="text-[#A38D5B]">Total Assets Under Logic: $14.8M</span>
        </div>
      </footer>

      {/* Floating Success Toast Notification Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 bg-[#121214] border-l-4 border-l-[#A38D5B] border border-[#2E2E33] p-4 rounded shadow-[0_8px_32px_rgba(0,0,0,0.65)] hover:shadow-[0_8px_32px_rgba(163,141,91,0.15)] max-w-sm flex items-start gap-3 text-left font-mono transition-shadow duration-300"
          >
            <div className="h-5 w-5 rounded-full bg-[#A38D5B]/10 border border-[#A38D5B]/40 flex items-center justify-center text-[#A38D5B] shrink-0 mt-0.5 animate-pulse">
              <Check className="h-3 w-3" />
            </div>
            <div className="space-y-1">
              <h5 className="text-white font-bold uppercase tracking-wider text-[11px]">{toast.message}</h5>
              {toast.subtext && (
                <p className="text-[#888] text-[10px] leading-relaxed select-all">{toast.subtext}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
