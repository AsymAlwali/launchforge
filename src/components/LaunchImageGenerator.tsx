import { useState, useRef, useEffect } from 'react';
import { Camera, Download, RefreshCw, Sparkles, Check, Image as ImageIcon, AlertTriangle, Cpu, HelpCircle, LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ImageGeneratorProps {
  productName: string;
  tagline: string;
  primaryCategory: string;
  showToast: (msg: string, sub?: string) => void;
}

export default function LaunchImageGenerator({ productName, tagline, primaryCategory, showToast }: ImageGeneratorProps) {
  // Tabs: 'svg' | 'ai'
  const [activeMode, setActiveMode] = useState<'svg' | 'ai'>('svg');

  // ---------------- SVG MODE STATE ----------------
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const [useWatermark, setUseWatermark] = useState(true);
  const [roundedCorners, setRoundedCorners] = useState(true);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const gradients = [
    { name: 'Midnight Onyx', from: '#0F0F11', to: '#1C1C24', text: '#A38D5B', tagBg: '#A38D5B1A' },
    { name: 'Aurora Borealis', from: '#020C0D', to: '#0B2925', text: '#10B981', tagBg: '#10B9811D' },
    { name: 'Cosmic Magenta', from: '#09050C', to: '#260B28', text: '#EC4899', tagBg: '#EC48991F' },
    { name: 'Ocean Eclipse', from: '#040810', to: '#0A2540', text: '#3B82F6', tagBg: '#3B82F61C' },
  ];
  const currGradient = gradients[backgroundIndex];

  // ---------------- AI MODE STATE ----------------
  const [aiModel, setAiModel] = useState<'gemini-2.5-flash-image' | 'imagen-4.0-generate-001'>('gemini-2.5-flash-image');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '1:1' | '4:3'>('16:9');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMsgIndex, setGenerationMsgIndex] = useState(0);
  const [isFallbackImage, setIsFallbackImage] = useState(false);
  const [fallbackReasonText, setFallbackReasonText] = useState<string | null>(null);

  const generationMessages = [
    'Mapping startup product context...',
    'Expanding descriptive marketing prompts...',
    'Querying Gemini vision model pipeline...',
    'Synthesizing ultra-high fidelity pixels...',
    'Injecting high-contrast branding shades...',
    'Refining textures, anti-aliasing details...',
    'Finalizing visual matrix layers...'
  ];

  // Sync default AI prompt when productName or tagline changes
  useEffect(() => {
    const cleanTag = tagline && !tagline.startsWith('Synthesize') 
      ? tagline 
      : 'the next-gen startup solver automating directory marketing launches';
    setAiPrompt(
      `A premium minimalist dark cosmic visual poster for a high-tech startup named "${productName || 'LaunchForge'}", featuring flat vector designs, futuristic isometric grid lines, subtle neon highlights, professional marketing graphic.`
    );
  }, [productName, tagline]);

  // Interval animation for generator messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationMsgIndex((prev) => (prev + 1) % generationMessages.length);
      }, 2000);
    } else {
      setGenerationMsgIndex(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // SVG Download helper
  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = svgUrl;
      const formattedName = (productName || 'launchforge').toLowerCase().replace(/[^a-z0-9]+/g, '_');
      downloadAnchor.download = `${formattedName}_ph_meta_card.svg`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(svgUrl);

      showToast("Download Succeeded!", "High-definition SVG brand asset downloaded.");
    } catch (err) {
      showToast("Download Failed", "Could not export SVG meta poster.");
    }
  };

  // AI Image Synthesize helper
  const handleGenerateAIImage = async () => {
    setIsGenerating(true);
    setGeneratedImageUrl(null);
    setIsFallbackImage(false);
    setFallbackReasonText(null);

    // Read custom key from localStorage for extreme BYOK consistency
    const customKey = localStorage.getItem('launchforge_byok_key') || '';
    const useByok = localStorage.getItem('launchforge_use_byok') === 'true';

    try {
      const response = await fetch('/api/generate-ai-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          model: aiModel,
          aspectRatio: aspectRatio,
          customGeminiKey: useByok && customKey ? customKey : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('API server returned an error error response.');
      }

      const data = await response.json();
      setGeneratedImageUrl(data.imageUrl);
      setIsFallbackImage(!!data.isFallback);
      if (data.isFallback) {
        setFallbackReasonText(data.fallbackReason || 'Key error or rate limit hit on the server.');
        showToast("AI Fallback Rendered", "Seeded placeholder generated due to restricted server key.");
      } else {
        showToast("Synthesis Complete!", "Custom Gemini AI graphic created successfully!");
      }
    } catch (err: any) {
      const defaultFallbackUrl = `https://picsum.photos/seed/${encodeURIComponent(aiPrompt.substring(0,30))}/800/450`;
      setGeneratedImageUrl(defaultFallbackUrl);
      setIsFallbackImage(true);
      setFallbackReasonText(err.message || 'Fatal generation error occurred.');
      showToast("AI Fallback Active", "Reverted safely to high fidelity Picsum template.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadAIImage = async () => {
    if (!generatedImageUrl) return;
    try {
      // If base64 or source
      if (generatedImageUrl.startsWith('data:')) {
        const downloadAnchor = document.createElement('a');
        downloadAnchor.href = generatedImageUrl;
        const formattedName = (productName || 'launchforge').toLowerCase().replace(/[^a-z0-9]+/g, '_');
        downloadAnchor.download = `${formattedName}_ai_banner.png`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("Download Succeeded!", "AI-generated PNG image saved.");
        return;
      }

      // If URL, fetch it to prevent CORS downloads issues
      const res = await fetch(generatedImageUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      const formattedName = (productName || 'launchforge').toLowerCase().replace(/[^a-z0-9]+/g, '_');
      downloadAnchor.download = `${formattedName}_ai_banner.jpg`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(blobUrl);
      showToast("Download Succeeded!", "AI template image downloaded.");
    } catch (err) {
      // Easy fallback to window.open if blocked
      window.open(generatedImageUrl, '_blank');
      showToast("Opened in New Tab", "Right-click and choose 'Save Image As' to download.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#121214] border border-[#232326] rounded-md p-5 font-mono text-xs text-left space-y-5"
    >
      {/* Header Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#222] pb-4 gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-[#A38D5B] uppercase font-bold tracking-wider">
            <Camera className="h-4 w-4" />
            <span>Launch Branding Image Suite</span>
          </div>
          <span className="text-[10px] text-[#777] block">Design vector graphics or generate high-fidelity AI backgrounds.</span>
        </div>

        {/* Toggle Mode buttons */}
        <div className="flex bg-[#0A0A0B] p-0.5 rounded border border-[#222] self-start sm:self-auto">
          <button
            onClick={() => setActiveMode('svg')}
            className={`px-3 py-1.5 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer ${
              activeMode === 'svg'
                ? 'bg-[#A38D5B] text-black font-extrabold'
                : 'text-[#888] hover:text-white'
            }`}
          >
            🎨 Vector SVG
          </button>
          <button
            onClick={() => setActiveMode('ai')}
            className={`px-3 py-1.5 rounded-sm text-[10px] uppercase font-bold tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
              activeMode === 'ai'
                ? 'bg-[#A38D5B] text-black font-extrabold'
                : 'text-[#888] hover:text-white'
            }`}
          >
            <Sparkles className="h-3 w-3 shrink-0" />
            <span>Gemini AI Studio</span>
          </button>
        </div>
      </div>

      {activeMode === 'svg' ? (
        /* ==================== SVG VECTOR POSTER GENERATOR ==================== */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Column Preview Canvas (7/12 cols) */}
          <div className="md:col-span-7 flex flex-col justify-center items-center bg-[#070708] border border-[#1E1E22] p-4 rounded-md min-h-[220px] select-none relative group">
            
            <svg
              ref={svgRef}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 600 340"
              className="w-full h-auto max-w-sm rounded overflow-hidden border border-[#2D2D32] shadow-lg shadow-black/80"
              style={{ borderRadius: roundedCorners ? '8px' : '0' }}
            >
              <defs>
                <linearGradient id={`grad-${backgroundIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={currGradient.from} />
                  <stop offset="100%" stopColor={currGradient.to} />
                </linearGradient>
              </defs>

              <rect width="600" height="340" fill={`url(#grad-${backgroundIndex})`} />
              
              <path d="M0,34 L600,34 M0,306 L600,306" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />
              <path d="M100,0 L100,340 M500,0 L500,340" stroke="#ffffff" strokeOpacity="0.04" strokeWidth="1" />

              <circle cx="300" cy="170" r="140" fill={currGradient.text} fillOpacity="0.02" filter="blur(20px)" />

              <text
                x="300"
                y="145"
                textAnchor="middle"
                fill="#FFFFFF"
                fontFamily="Geneva, sans-serif"
                fontSize="34"
                fontWeight="900"
                letterSpacing="-0.03em"
              >
                {(productName || 'LaunchForge').toUpperCase()}
              </text>

              {(() => {
                const fullTag = tagline || 'Automate charakter-constrained launch materials in seconds.';
                const limit = 42;
                if (fullTag.length > limit) {
                  const part1 = fullTag.substring(0, limit);
                  const part2 = fullTag.length > limit * 2 ? fullTag.substring(limit, limit * 2 - 3) + '...' : fullTag.substring(limit);
                  return (
                    <>
                      <text x="300" y="190" textAnchor="middle" fill="#8E929E" fontFamily="Courier, monospace" fontSize="13" letterSpacing="-0.01em">
                        {part1}
                      </text>
                      <text x="300" y="210" textAnchor="middle" fill="#8E929E" fontFamily="Courier, monospace" fontSize="13" letterSpacing="-0.01em">
                        {part2}
                      </text>
                    </>
                  );
                }
                return (
                  <text x="300" y="195" textAnchor="middle" fill="#8E929E" fontFamily="Courier, monospace" fontSize="13" letterSpacing="-0.01em">
                    {fullTag}
                  </text>
                );
              })()}

              <g transform="translate(300, 248)">
                <rect
                  x="-80"
                  y="-13"
                  width="160"
                  height="26"
                  rx="13"
                  fill={currGradient.text}
                  fillOpacity="0.1"
                  stroke={currGradient.text}
                  strokeOpacity="0.3"
                  strokeWidth="1"
                />
                <text x="0" y="4" textAnchor="middle" fill={currGradient.text} fontFamily="Courier, monospace" fontSize="10" fontWeight="bold">
                  {primaryCategory || 'Developer Tools'}
                </text>
              </g>

              {useWatermark && (
                <text x="300" y="320" textAnchor="middle" fill="#ffffff" fillOpacity="0.25" fontFamily="Courier, monospace" fontSize="9" letterSpacing="0.2em">
                  SYNTHESIZED VIA LAUNCHFORGE_AI
                </text>
              )}
            </svg>

            <span className="text-[10px] text-[#555] block mt-2">Perfect lightweight vector meta asset. No API quota spent.</span>
          </div>

          {/* Right Column Controls (5/12 cols) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#777] block mb-1.5">1. Gradient Theme Palette</span>
                <div className="grid grid-cols-2 gap-2">
                  {gradients.map((grad, idx) => (
                    <button
                      key={grad.name}
                      type="button"
                      onClick={() => setBackgroundIndex(idx)}
                      className={`p-2 border rounded-sm text-left transition-all cursor-pointer ${
                        backgroundIndex === idx 
                          ? 'bg-[#18181A] border-[#A38D5B] text-white' 
                          : 'bg-[#0E0E10] border-[#222] text-[#888] hover:text-white hover:border-[#333]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }} />
                        <span className="text-[10px] truncate">{grad.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[9px] uppercase tracking-widest text-[#777] block">2. Canvas Rendering Assets</span>
                
                <label className="flex items-center gap-2 cursor-pointer text-[#AAA] hover:text-white transition-colors">
                  <input 
                    type="checkbox"
                    checked={useWatermark}
                    onChange={(e) => setUseWatermark(e.target.checked)}
                    className="rounded border-[#333] text-[#A38D5B] focus:ring-0 h-3.5 w-3.5 bg-black cursor-pointer"
                  />
                  <span>Include Base Watermark Accent</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-[#AAA] hover:text-white transition-colors">
                  <input 
                    type="checkbox"
                    checked={roundedCorners}
                    onChange={(e) => setRoundedCorners(e.target.checked)}
                    className="rounded border-[#333] text-[#A38D5B] focus:ring-0 h-3.5 w-3.5 bg-black cursor-pointer"
                  />
                  <span>Apply Border Frame Curve</span>
                </label>
              </div>
            </div>

            <button
              onClick={handleDownloadSVG}
              type="button"
              className="w-full py-2.5 bg-[#A38D5B] hover:bg-[#8D7747] text-black rounded font-mono font-bold uppercase tracking-wider text-[10.5px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Vector Asset</span>
            </button>
          </div>

        </div>
      ) : (
        /* ==================== AI IMAGE GENERATOR MODE ==================== */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Left Column Preview Window */}
          <div className="md:col-span-7 flex flex-col justify-center items-center bg-[#070708] border border-[#1E1E22] p-4 rounded-md min-h-[250px] relative font-mono text-center">
            
            {/* If Not Generating and No Image is Generated yet */}
            {!isGenerating && !generatedImageUrl && (
              <div className="p-6 max-w-xs space-y-3">
                <div className="h-10 w-10 rounded-full bg-[#1A140E] border border-[#A38D5B]/30 flex items-center justify-center mx-auto text-[#A38D5B]">
                  <ImageIcon className="h-5 w-5" />
                </div>
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">Gemini Image Pipeline Idle</h4>
                <p className="text-[10px] text-[#777] leading-relaxed">
                  Tailor your custom generation prompt on the right side panel and click "Synthesize via Gemini AI" to initialize live diffusion.
                </p>
              </div>
            )}

            {/* If Generating Progress State */}
            {isGenerating && (
              <div className="p-6 max-w-sm space-y-4 animate-pulse">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-black border border-[#A38D5B] flex items-center justify-center mx-auto text-[#A38D5B] animate-spin">
                    <RefreshCw className="h-5 w-5" />
                  </div>
                  <Sparkles className="h-4 w-4 text-emerald-400 absolute top-0 right-[41%] animate-bounce" />
                </div>
                
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase tracking-widest text-[#A38D5B] font-bold block">
                    {generationMessages[generationMsgIndex]}
                  </span>
                  <p className="text-[10px] text-[#666]">
                    Please stand by. Embedding text concepts into multimodality tensors...
                  </p>
                </div>
                
                <div className="w-48 bg-[#111] h-1.5 rounded-full overflow-hidden mx-auto border border-[#222]">
                  <div className="bg-[#A38D5B] h-full rounded-full animate-loadingBar" style={{ width: '70%' }} />
                </div>
              </div>
            )}

            {/* If Image is Rendered */}
            {!isGenerating && generatedImageUrl && (
              <div className="w-full space-y-3">
                <div className="relative overflow-hidden rounded border border-[#2E2E33] shadow-lg shadow-black/90">
                  <img
                    src={generatedImageUrl}
                    alt="AI Generated Banner Material"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto max-h-[200px] object-cover hover:scale-[1.02] transition-transform duration-300"
                  />
                  
                  {isFallbackImage && (
                    <div className="absolute top-2 right-2 bg-[#1C140E] border border-amber-500/40 text-amber-300 text-[8px] font-bold uppercase font-mono px-2 py-0.5 rounded shadow flex items-center gap-1">
                      <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />
                      <span>Seeded Local Preview</span>
                    </div>
                  )}
                </div>

                {isFallbackImage && (
                  <div className="p-3 bg-[#130E0A] border border-amber-500/20 rounded text-left text-[10px] text-amber-200/90 leading-relaxed space-y-1 select-all">
                    <span className="font-bold text-[#A38D5B] uppercase block text-[8px] tracking-wider">⚠️ API Key Warning / Restrictions:</span>
                    <p>{fallbackReasonText || 'Your current server key is leaked or quota-limited. Showing a secure high fidelity visual mock.'}</p>
                    <span className="text-[#888] block text-[8px] leading-relaxed pt-1">
                      💡 Bring a fresh valid Gemini API Key in the **💻 Tech Sandbox** to unlock absolute AI text & image diffusion.
                    </span>
                  </div>
                )}

                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleDownloadAIImage}
                    className="px-4 py-1.5 bg-[#222] hover:bg-[#333] text-white rounded-sm text-[10px] uppercase font-bold tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Image</span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedImageUrl);
                      showToast("Copied Image Data!", "Direct image URL values stored to clipboard.");
                    }}
                    className="px-4 py-1.5 bg-[#121214] border border-[#222] hover:bg-[#1A1A1C] text-[#888] hover:text-white rounded-sm text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Copy URL</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column Config */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3.5 text-left">
              
              {/* Model selection */}
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#777] block mb-1">1. Model Orchestration</span>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value as any)}
                  className="w-full bg-[#0A0A0B] border border-[#222] text-[#888] focus:text-white focus:outline-none focus:border-[#A38D5B] rounded p-2 text-[11px] font-mono cursor-pointer"
                >
                  <option value="gemini-2.5-flash-image">Gemini 2.5 Image (Lite, Fast)</option>
                  <option value="imagen-4.0-generate-001">Imagen 4.0 Generate (Photorealistic)</option>
                </select>
              </div>

              {/* Text art prompt */}
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#777] block mb-1">2. Custom Visual Prompt</span>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                  className="w-full bg-[#0A0A0B] border border-[#222] text-white focus:outline-none focus:border-[#A38D5B] rounded p-2 text-[10.5px] leading-relaxed font-mono resize-none focus:ring-0"
                  placeholder="Describe your desired image..."
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#777] block mb-1">3. Render Aspect Ratio</span>
                <div className="grid grid-cols-3 gap-2">
                  {(['16:9', '1:1', '4:3'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-1.5 border rounded-sm font-bold text-center transition-all cursor-pointer ${
                        aspectRatio === ratio
                          ? 'bg-[#18181A] border-[#A38D5B] text-white'
                          : 'bg-[#0E0E10] border-[#222] text-[#888] hover:text-white hover:border-[#333]'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Synthesize triggers */}
            <button
              onClick={handleGenerateAIImage}
              disabled={isGenerating || !aiPrompt.trim()}
              type="button"
              className="w-full py-2.5 bg-[#A38D5B] hover:bg-[#8D7747] disabled:bg-[#222] disabled:text-[#555] disabled:cursor-not-allowed text-black rounded font-mono font-bold uppercase tracking-wider text-[10.5px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isGenerating ? 'Synthesizing...' : 'Synthesize via Gemini AI'}</span>
            </button>
          </div>

        </div>
      )}
    </motion.div>
  );
}
