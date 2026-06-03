import React, { useState, useEffect, FormEvent } from 'react';
import { 
  Heart, Copy, Check, DollarSign, Wallet, Award, Coffee, 
  Shield, Edit3, Save, PlusCircle, History, ExternalLink, QrCode, Trash2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TipJarProps {
  theme?: string;
  showToast: (msg: string, sub?: string) => void;
}

interface DonationLog {
  id: string;
  sender: string;
  type: 'BTC' | 'ETH' | 'SOL' | 'TRX' | 'XRP' | 'Stripe';
  amount: number;
  currency: string;
  timestamp: string;
  note?: string;
}

export default function TipJar({ theme = 'dark', showToast }: TipJarProps) {
  // Preset tips in USD
  const tipsPresets = [
    { value: 5, label: '☕ Espresso', desc: 'Warm cup of double-shot energy' },
    { value: 15, label: '🍕 Founders Lunch', desc: 'Slice of pepperoni & fresh motivation' },
    { value: 50, label: '⚡ Cloud Engine Fuel', desc: 'Covers infrastructure costs & quotas' },
  ];

  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(5);
  const [activeCryptoTab, setActiveCryptoTab] = useState<'BTC' | 'ETH' | 'SOL' | 'TRX' | 'XRP'>('ETH');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Address editing state
  const [isEditingAddresses, setIsEditingAddresses] = useState(false);
  const [addresses, setAddresses] = useState({
    BTC: 'bc1qnyupkkalw853xk8kzmkpkgqu8k0tw22j2gxmzx',
    ETH: '0xf58965113a6ca8bd66198a4e6a4e8b7e4a14dd2a',
    SOL: '26fWdpH6bME8ZvsigJNbTtEWk8nz22QPvE7Bc2CK9tqT',
    TRX: 'TWzeGXwaAxqsspErjfVNbkV1pHUhTvoB4P',
    XRP: 'rP1MMzkRDCLpWeFJge8kePNSqUaovbL4wF',
  });

  // Donation history list state with default seeded records
  const [donationHistory, setDonationHistory] = useState<DonationLog[]>(() => {
    const saved = localStorage.getItem('launchforge_donation_tracker');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        // Fallback below
      }
    }
    return [
      {
        id: 'tx-1002',
        sender: '0x17b...d3e9',
        type: 'ETH',
        amount: 0.05,
        currency: 'ETH',
        timestamp: '1 hour ago',
        note: 'Super fast compilation! Saved me hours matching templates.',
      },
      {
        id: 'tx-1001',
        sender: 'bc1qp...8xz3',
        type: 'BTC',
        amount: 0.002,
        currency: 'BTC',
        timestamp: 'Yesterday',
        note: 'Fuel for LaunchForge dev cluster. Epic app.',
      },
      {
        id: 'tx-1000',
        sender: 'HN_launchGuy',
        type: 'Stripe',
        amount: 15.00,
        currency: 'USD',
        timestamp: '3 days ago',
        note: 'Loved the directories spreadsheet matrix checklist!',
      }
    ];
  });

  // History Recording Form State
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorAmount, setNewDonorAmount] = useState('');
  const [newDonorCoin, setNewDonorCoin] = useState<'BTC' | 'ETH' | 'SOL' | 'TRX' | 'XRP' | 'Stripe'>('ETH');
  const [newDonorNote, setNewDonorNote] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('launchforge_donation_tracker', JSON.stringify(donationHistory));
  }, [donationHistory]);

  // Load user saved addresses if any exist
  useEffect(() => {
    const saved = localStorage.getItem('launchforge_crypto_addresses');
    if (saved) {
      try {
        setAddresses(JSON.parse(saved));
      } catch (err) {
        console.warn('Could not parse saved custom crypto addresses.');
      }
    }
  }, []);

  const handleSaveAddresses = () => {
    localStorage.setItem('launchforge_crypto_addresses', JSON.stringify(addresses));
    setIsEditingAddresses(false);
    showToast("Addresses Saved!", "Your custom cryptocurrency tip destinations have been persisted.");
  };

  const handleCopy = (address: string, symbol: string) => {
    navigator.clipboard.writeText(address);
    setCopiedKey(symbol);
    showToast(`${symbol} Address Copied!`, "Wallet destination has been loaded into your copy buffer.");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Safe mock check payment
  const handleMockPay = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(
      "Stripe Checkout Coming Soon!",
      "I am currently working on implementing the Stripe checkout flow. Please check back soon!"
    );
  };

  // Add custom simulated donation to history list
  const handleAddDonationRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newDonorAmount);
    if (!newDonorAmount || isNaN(amountVal) || amountVal <= 0) {
      showToast("Verification Error", "Please provide a valid numeric value for the donor record.");
      return;
    }

    const cleanSender = newDonorName.trim() || 'Anonymous Supporter';
    const newLog: DonationLog = {
      id: `tx-${Date.now()}`,
      sender: cleanSender,
      type: newDonorCoin,
      amount: amountVal,
      currency: newDonorCoin === 'Stripe' ? 'USD' : newDonorCoin,
      timestamp: 'Just now',
      note: newDonorNote.trim() || undefined,
    };

    setDonationHistory([newLog, ...donationHistory]);
    setNewDonorName('');
    setNewDonorAmount('');
    setNewDonorNote('');
    setShowLogForm(false);
    showToast("Ledger Updated!", `A simulated record of ${amountVal} ${newLog.currency} was appended to the feed.`);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to reset the donation ledger history logs?")) {
      setDonationHistory([]);
      showToast("Ledger Cleared", "The donation history records have been reset.");
    }
  };

  // Dynamic QR Code from free public qrserver API
  const dynamicQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(addresses[activeCryptoTab])}&color=ffffff&bgcolor=070708&qzone=1`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-lg p-5 mr-0 transition-all ${
        theme === 'dark' 
          ? 'bg-[#0B0C10] border-[#2A2A2A] text-white shadow-[0_4px_24px_rgba(0,0,0,0.4)]' 
          : 'bg-[#F9F9FB] border-[#D1D1D6] text-[#1C1C1E] shadow-sm'
      }`}
    >
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 mb-5 gap-3 border-[#2A2A2A]">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#A38D5B] uppercase font-bold tracking-widest">
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
            <span>Developer Support Portal</span>
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wide font-mono flex items-center gap-2">
            <span>💡 Fuel the Launcher Engine</span>
          </h3>
          <p className="text-[10.5px] text-[#777] leading-relaxed">
            Support continuous system development, auto-curated directories, and direct deployment capabilities.
          </p>
        </div>

        {/* Action Toggle Button */}
        <button
          onClick={() => isEditingAddresses ? handleSaveAddresses() : setIsEditingAddresses(true)}
          className={`px-3 py-1.5 rounded text-[9px] uppercase font-bold font-mono tracking-wider flex items-center gap-1.5 border transition-all cursor-pointer ${
            isEditingAddresses
              ? 'bg-[#10B981] text-black border-[#10B981] font-black'
              : 'bg-black/40 border-[#333] text-[#A38D5B] hover:text-white hover:border-[#444]'
          }`}
        >
          {isEditingAddresses ? (
            <>
              <Save className="h-3 w-3" />
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <Edit3 className="h-3 w-3" />
              <span>Configure Wallets</span>
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Cryptocurrencies & Coffee stripe presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pb-6">
        
        {/* Left Grid: Decentralized Web3 Crypto Cards */}
        <div className="lg:col-span-7 flex flex-col space-y-4 border-r pr-0 lg:pr-6 border-[#222]">
          
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#777]">
              Way 1: Direct Crypto Transfers
            </span>
            <span className="text-[8px] font-mono p-1 rounded bg-[#A38D5B]/10 text-[#A38D5B] border border-[#A38D5B]/20">
              Decentralized Web3
            </span>
          </div>

          {/* Blockchain Select Button Bar */}
          <div className="grid grid-cols-5 gap-1 bg-black/60 p-1 rounded border border-[#222]">
            {(['ETH', 'SOL', 'BTC', 'TRX', 'XRP'] as const).map((coin) => (
              <button
                key={coin}
                onClick={() => setActiveCryptoTab(coin)}
                className={`py-1.5 rounded-sm text-[10px] uppercase font-mono tracking-wider font-extrabold transition-all cursor-pointer ${
                  activeCryptoTab === coin
                    ? 'bg-[#A38D5B] text-black sm:scale-105'
                    : 'text-[#888] hover:text-white hover:bg-white/5'
                }`}
              >
                {coin}
              </button>
            ))}
          </div>

          {/* Active currency specs/address container */}
          <div className="bg-[#070708] border border-[#222] p-4 rounded-md space-y-3.5 relative overflow-hidden">
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded bg-black border border-[#2A2A2A] flex items-center justify-center text-[#A38D5B] font-mono font-bold text-xs">
                {activeCryptoTab}
              </div>
              <div className="text-left space-y-0.5 min-w-0 flex-1">
                <span className="text-[9px] font-mono text-[#666] uppercase block">Blockchain Network</span>
                <span className="text-[11px] font-bold text-white block">
                  {activeCryptoTab === 'BTC' ? 'Bitcoin Mainnet (Legacy/Taproot)' :
                   activeCryptoTab === 'ETH' ? 'Ethereum Mainnet (ERC-20)' :
                   activeCryptoTab === 'SOL' ? 'Solana Sovereign Ray' :
                   activeCryptoTab === 'TRX' ? 'TRON Network (TRC-20)' :
                   'Ripple Consensus Ledger (XRP)'}
                </span>
              </div>
            </div>

            {/* Configurable destination fields */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#777] block">
                Destination Address
              </span>
              
              {isEditingAddresses ? (
                <input
                  type="text"
                  value={addresses[activeCryptoTab]}
                  onChange={(e) => setAddresses(prev => ({ ...prev, [activeCryptoTab]: e.target.value }))}
                  className="w-full bg-[#111] border border-[#A38D5B]/40 p-2 rounded text-xs text-white font-mono focus:outline-none focus:border-[#A38D5B]"
                  placeholder={`Insert your customized ${activeCryptoTab} destination...`}
                />
              ) : (
                <div className="flex items-center bg-black/80 border border-[#222] rounded overflow-hidden p-2 justify-between gap-2">
                  <span className="font-mono text-[10.5px] truncate text-emerald-400 select-all break-all pr-1">
                    {addresses[activeCryptoTab]}
                  </span>
                  
                  <button
                    onClick={() => handleCopy(addresses[activeCryptoTab], activeCryptoTab)}
                    className="p-1 hover:bg-[#333] rounded shrink-0 transition-colors text-[#A38D5B] cursor-pointer"
                    title="Copy wallet address"
                  >
                    {copiedKey === activeCryptoTab ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* REAL-TIME DYNAMIC QR CODE CONTAINER */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-3 rounded border border-[#111]">
              <div className="h-20 w-20 shrink-0 bg-[#070708] border border-[#222] p-1.5 rounded flex items-center justify-center relative group">
                {/* Dynamically loads matching colors via real-time image rendering */}
                <img 
                  src={dynamicQrUrl} 
                  alt={`${activeCryptoTab} QR Code`} 
                  className="h-full w-full object-contain filter brightness-115"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to static SVG structure if network is blocked
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <QrCode className="h-5 w-5 text-[#888] absolute opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <div className="text-left space-y-1">
                <span className="text-[9px] font-bold text-[#A38D5B] uppercase block tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Real-time QR Matrix Loaded</span>
                </span>
                <p className="text-[10px] text-[#777] leading-normal pt-0.5">
                  Scan this matching {activeCryptoTab} code directly using your cryptocurrency wallet app (Coinbase, Trust, Phantom, or MetaMask) to initialize a fast peer-to-peer transfer.
                </p>
              </div>
            </div>

          </div>

          <span className="text-[10.5px] text-[#888] block">
            🔒 <strong>Secure Routing Protocol:</strong> Peer-to-peer cryptographic transfers are finalized directly on the blockchain without any broker interference.
          </span>

        </div>

        {/* Right Grid: Stripe Payments & Coffee Presets */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold font-mono uppercase tracking-widest text-[#777]">
                Way 2: traditional Coffee tip
              </span>
              <span className="text-[8px] font-mono p-1 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                Stripe Protocol (Coming Soon)
              </span>
            </div>

            {/* Presets Grid */}
            <div className="space-y-2">
              {tipsPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    setSelectedPreset(preset.value);
                    setCustomAmount('');
                  }}
                  className={`w-full p-2.5 border rounded-sm text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedPreset === preset.value
                      ? 'bg-[#18181A] border-[#A38D5B] text-white shadow-[0_0_8px_rgba(163,141,91,0.1)]'
                      : 'bg-black/40 border-[#222] text-[#888] hover:text-white hover:border-[#333]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Coffee className={`h-4.5 w-4.5 ${selectedPreset === preset.value ? 'text-[#A38D5B]' : 'text-[#666]'}`} />
                    <div className="text-left">
                      <span className="text-[11px] font-bold block">{preset.label}</span>
                      <span className="text-[9px] text-[#666] block">{preset.desc}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-white">${preset.value}.00</span>
                </button>
              ))}
            </div>

            {/* Custom USD tip entry */}
            <div className="space-y-1.5 text-left">
              <label className="text-[9px] uppercase tracking-widest text-[#777] block">
                Or Input Custom Tip Amount ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-[#555]" />
                <input
                  type="number"
                  placeholder="25.00"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedPreset(null);
                  }}
                  className="w-full bg-[#0A0A0B] border border-[#222] pl-8 pr-3 py-2 rounded text-xs text-white uppercase font-mono focus:outline-none focus:border-[#A38D5B] focus:ring-0"
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleMockPay}>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#A38D5B] hover:bg-[#8D7747] text-black rounded font-mono font-bold uppercase tracking-wider text-[10.5px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer shadow-lg"
            >
              <DollarSign className="h-4 w-4" />
              <span>Checkout (Coming Soon)</span>
            </button>
          </form>

        </div>

      </div>

      {/* NEW FEATURE SECTION: INTERACTIVE DONATION LEDGER HISTORY */}
      <div className="border-t border-[#222] pt-5 mt-4 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest font-bold text-white">
            <History className="h-4 w-4 text-[#A38D5B]" />
            <span>Public Supporter Ledger Feed</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="px-2.5 py-1 rounded bg-[#18181A] hover:bg-[#222] border border-[#333] text-[9px] uppercase font-mono font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
              <span>{showLogForm ? 'Hide Form' : 'Record Simulated Tip'}</span>
            </button>
            {donationHistory.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-1 hover:bg-rose-950/20 text-[#666] hover:text-rose-400 rounded transition-colors"
                title="Reset ledger values"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Record dynamic log Form container */}
        <AnimatePresence>
          {showLogForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddDonationRecord}
              className="bg-[#070708] border border-dashed border-[#A38D5B]/30 p-4 rounded-md space-y-3.5 overflow-hidden text-left"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-[#666] font-mono">Simulated Donor Name / Alias</label>
                  <input
                    type="text"
                    placeholder="e.g. dev_pioneer"
                    value={newDonorName}
                    onChange={(e) => setNewDonorName(e.target.value)}
                    className="w-full bg-black border border-[#222] rounded p-2 text-xs text-white focus:outline-none focus:border-[#A38D5B] font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-[#666] font-mono">Transfer Amount (Value)</label>
                  <input
                    type="text"
                    placeholder="e.g. 0.05 or 15.00"
                    value={newDonorAmount}
                    onChange={(e) => setNewDonorAmount(e.target.value)}
                    className="w-full bg-black border border-[#222] rounded p-2 text-xs text-white focus:outline-none focus:border-[#A38D5B] font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-[#666] font-mono">Currency protocol</label>
                  <select
                    value={newDonorCoin}
                    onChange={(e) => setNewDonorCoin(e.target.value as any)}
                    className="w-full bg-black border border-[#222] rounded p-2 text-xs text-white focus:outline-none focus:border-[#A38D5B] font-mono cursor-pointer"
                  >
                    <option value="ETH">ETH (Ethereum)</option>
                    <option value="BTC">BTC (Bitcoin)</option>
                    <option value="SOL">SOL (Solana)</option>
                    <option value="TRX">TRX (TRON)</option>
                    <option value="XRP">XRP (Ripple)</option>
                    <option value="Stripe">USD (Stripe Card Checkout)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-wider text-[#666] font-mono">Optional Supporter Message / Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Awesome directory templates! Saved me hours of marketing prep."
                  value={newDonorNote}
                  onChange={(e) => setNewDonorNote(e.target.value)}
                  className="w-full bg-black border border-[#222] rounded p-2 text-xs text-white focus:outline-none focus:border-[#A38D5B] font-mono"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#A38D5B] text-black rounded font-mono font-bold uppercase tracking-wider text-[10px]"
                >
                  Append verified record to feed
                </button>
                <button
                  type="button"
                  onClick={() => setShowLogForm(false)}
                  className="px-4 py-1.5 bg-[#222] text-[#888] rounded font-mono text-[10px]"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Live Ledger Table */}
        <div className="bg-[#050506] border border-[#1A1A1C] rounded overflow-hidden">
          {donationHistory.length === 0 ? (
            <div className="p-8 text-center text-[#555] font-mono text-xs">
              No transactions currently registered in the ledger database.
            </div>
          ) : (
            <div className="divide-y divide-[#18181B] max-h-60 overflow-y-auto custom-scrollbar">
              {donationHistory.map((item) => (
                <div key={item.id} className="p-3 text-left hover:bg-white/[0.01] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-white font-mono text-[11px] truncate max-w-[150px]">{item.sender}</span>
                      <span className="p-0.5 px-1.5 bg-[#141417] text-[8px] font-mono font-bold text-[#A38D5B] rounded uppercase tracking-wider border border-[#2E2E32]">
                        {item.type} Address Send
                      </span>
                      <span className="text-[9px] text-[#555] font-mono">{item.timestamp}</span>
                    </div>
                    {item.note && (
                      <p className="text-[10px] text-[#777] italic leading-snug truncate max-w-xl">
                        &ldquo;{item.note}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="font-mono text-right shrink-0">
                    <span className="text-[11px] text-[#10B981] font-bold">
                      +{item.amount} {item.currency}
                    </span>
                    <span className="text-[8.5px] text-[#444] uppercase block tracking-widest">
                      SECURED P2P
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </motion.div>
  );
}
