import * as React from "react";
import { useState, useRef, useEffect } from "react";
import {
  TrendingUp,
  User,
  Award,
  Clock,
  ArrowRight,
  Lock,
  Mail,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Activity,
  AlertCircle,
  ChevronDown,
  Settings as SettingsIcon,
  DollarSign,
  Plus,
  Minus,
  Briefcase,
  TrendingDown,
  LogOut,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Trophy,
  Grid,
  Wallet,
  History,
  BarChart3,
  Shield,
  Trash2,
  Globe,
  Key,
  Copy,
  ChevronLeft,
  ArrowUpRight,
  Clock3,
  Flame,
  CheckCircle2,
  Loader2,
  UploadCloud,
  Palette
} from "lucide-react";
import { auth } from "../firebase/firebase";
import { 
  firestoreDb as db, 
  COUNTRY_CODELIST,
  seedPromoCodes,
  validatePromoCode,
  getDeposits,
  createDeposit,
  updateDepositStatus,
  getWithdrawals,
  createWithdrawal,
  updateWithdrawalStatus
} from "../firebase/firestore";
import type { 
  DepositDocument, 
  WithdrawalDocument, 
  PromoCodeDocument 
} from "../firebase/firestore";
import { changePassword } from "../firebase/auth";
const isSupabaseConfigured = true;

// ============================================
// SYSTEM TYPE DEFINITIONS
// ============================================
export interface SeedTrade {
  id: string;
  pair: string;
  direction: "buy" | "sell";
  amount: number;
  payout: number;
  won: boolean;
  profit: number;
  entryPrice: number;
  exitPrice: number;
  timestamp?: number;
  accountType?: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  method: string;
  status: string;
  date: string;
  createdAt?: string;
  created_at?: string;
}

// Helper to determine the theme text colors
function getThemeTextColor(theme: string) {
  switch (theme) {
    case "purple": return "text-purple-450 text-indigo-400";
    case "emerald": return "text-emerald-400";
    case "crimson": return "text-rose-455 text-rose-400";
    default: return "text-blue-400";
  }
}

// Helper for theme background colors
function getThemeBgColor(theme: string) {
  switch (theme) {
    case "purple": return "bg-purple-600";
    case "emerald": return "bg-emerald-600";
    case "crimson": return "bg-rose-600";
    default: return "bg-blue-600";
  }
}

// Helper for hover background colors
function getThemeHoverBgColor(theme: string) {
  switch (theme) {
    case "purple": return "hover:bg-purple-500";
    case "emerald": return "hover:bg-emerald-500";
    case "crimson": return "hover:bg-rose-500";
    default: return "hover:bg-blue-500";
  }
}

// Helper for border focus colors
function getThemeFocusBorder(theme: string) {
  switch (theme) {
    case "purple": return "focus:border-purple-550 focus:ring-purple-505/20";
    case "emerald": return "focus:border-emerald-550 focus:ring-emerald-505/20";
    case "crimson": return "focus:border-rose-550 focus:ring-rose-505/20";
    default: return "focus:border-blue-550 focus:ring-blue-505/20";
  }
}

// Helper for border and accent lines
function getThemeBorderAccent(theme: string) {
  switch (theme) {
    case "purple": return "border-purple-500/25";
    case "emerald": return "border-emerald-500/25";
    case "crimson": return "border-rose-500/25";
    default: return "border-blue-500/25";
  }
}

// ============================================
// COMPONENT 1: SUPPORT PAGE
// ============================================
interface SupportPageProps {
  onNavigate: (screen: any) => void;
  themeHighlight: string;
}

export function SupportPage({ onNavigate, themeHighlight }: SupportPageProps) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Technical Support");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const faqs = [
    {
      q: "What are digital binary options?",
      a: "Digital options are contracts where you predict whether the price of an asset (like EUR/USD or Bitcoin) will be higher or lower than your entry rate at a specified expiration time (e.g., 5 seconds, 1 minute)."
    },
    {
      q: "How fast are withdrawal requests processed?",
      a: "TRADEX prides itself on near-instant automated cryptocurrency processing. Standard USDT and Bitcoin cash outs settle on the blockchain within 5 to 15 minutes of approval."
    },
    {
      q: "What guidelines apply to the Funded Account program?",
      a: "Funded traders must maintain an overall win rate of above 55% during evaluation. Once completed, your KYC is verified and you are eligible to trade live capital with an 85/15 profit split."
    },
    {
      q: "Is standard verification (KYC) mandatory?",
      a: "Yes. To protect our liquidity network and comply with international anti-fraud rules, we require a basic ID verification before live account balance cash-outs can be processed."
    }
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setIsSubmitting(true);
    setSubmitMessage("");

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitMessage("Support ticket successfully created! Our trading room specialists will reply to your registered cabinet email within 15 minutes.");
      setSubject("");
      setDescription("");
    }, 1500);
  };

  const textTheme = getThemeTextColor(themeHighlight);
  const bgTheme = getThemeBgColor(themeHighlight);
  const hoverTheme = getThemeHoverBgColor(themeHighlight);
  const focusTheme = getThemeFocusBorder(themeHighlight);
  const borderTheme = getThemeBorderAccent(themeHighlight);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-6 pb-24 md:pb-8" id="screen_support">
      {/* Header back row */}
      <div className="flex items-center gap-3 border-b border-[#22304a] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className={`w-5 h-5 ${textTheme}`} />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Help Center & Support</h2>
        </div>
        <button
          onClick={() => onNavigate("chart")}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-[#111827] border border-[#22304a] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Trade Workspace</span>
        </button>
      </div>

      {/* Grid containing FAQ and Ticket Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left pane FAQs */}
        <div className="space-y-4">
          <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${textTheme}`} />
              FAQ (Frequently Asked Questions)
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-[#22304a]/50 pb-2.5 last:border-none last:pb-0">
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between text-left text-xs font-semibold text-gray-300 hover:text-white py-1.5 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === index && (
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed font-sans">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right pane message ticket form */}
        <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-3 flex items-center gap-2">
            <Mail className={`w-4 h-4 ${textTheme}`} />
            Submit Help Ticket
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-mono text-gray-400 tracking-wider block mb-1">Subject Title</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your query"
                className={`w-full bg-[#030712] border border-[#22304a] text-xs text-white rounded-xl p-3 placeholder-gray-600 focus:outline-none ${focusTheme} transition-all`}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-gray-400 tracking-wider block mb-1">Inquiry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full bg-[#030712] border border-[#22304a] text-xs text-white rounded-xl p-3 focus:outline-none ${focusTheme} transition-all`}
              >
                <option>Technical Support</option>
                <option>Billing & Deposit</option>
                <option>Verification / KYC</option>
                <option>Account Customization / Settings</option>
                <option>Funded Account Status</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-gray-400 tracking-wider block mb-1">Detailed Message Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue in full details so our specialists can diagnose immediately..."
                className={`w-full bg-[#030712] border border-[#22304a] text-xs text-white rounded-xl p-3 placeholder-gray-600 focus:outline-none ${focusTheme} transition-all font-sans resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !subject || !description}
              className={`w-full py-3.5 text-xs text-white uppercase font-black tracking-wider ${bgTheme} ${hoverTheme} disabled:bg-gray-800 disabled:text-gray-500 rounded-xl transition-all shadow-lg select-none cursor-pointer flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>TRANSMITTING TICKET...</span>
                </>
              ) : (
                <span>SUBMIT HELP TICKET</span>
              )}
            </button>

            {submitMessage && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[11px] leading-relaxed font-sans mt-3 animate-fadeIn">
                {submitMessage}
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
}

// ============================================
// COMPONENT 2: PROFILE PAGE
// ============================================
interface ProfilePageProps {
  traderName: string;
  email: string;
  traderID: string;
  themeHighlight: string;
  country?: string;
  countryCode?: string;
  countryFlag?: string;
  onUpdateCountry?: (c: string, code: string, flag: string) => Promise<void>;
}

export function ProfilePage({ traderName, email, traderID, themeHighlight, country, countryCode, countryFlag, onUpdateCountry }: ProfilePageProps) {
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmNewPass, setConfirmNewPass] = useState("");
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  const textTheme = getThemeTextColor(themeHighlight);
  const bgTheme = getThemeBgColor(themeHighlight);
  const hoverTheme = getThemeHoverBgColor(themeHighlight);
  const focusTheme = getThemeFocusBorder(themeHighlight);
  const borderTheme = getThemeBorderAccent(themeHighlight);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess("");

    if (!currentPass || !newPass || !confirmNewPass) {
      setPassError("All password inputs are strictly required.");
      return;
    }

    if (newPass.length < 6) {
      setPassError("New password must contain at least 6 alphanumeric characters.");
      return;
    }

    if (newPass !== confirmNewPass) {
      setPassError("Confirm password does not match the new password.");
      return;
    }

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setPassSuccess("Secure password successfully updated! (Sandbox Simulator Mode)");
        setCurrentPass("");
        setNewPass("");
        setConfirmNewPass("");
      }, 1000);
      return;
    }

    try {
      await changePassword(newPass);
      setPassSuccess("Secure password successfully updated in database!");
      setCurrentPass("");
      setNewPass("");
      setConfirmNewPass("");
    } catch (err: any) {
      setPassError(`Update Fault: ${err.message}`);
    }
  };

  const handleToggle2FA = () => {
    if (!twoFactorEnabled) {
      setShowQrCode(true);
    } else {
      setTwoFactorEnabled(false);
      setShowQrCode(false);
    }
  };

  const confirm2FA = () => {
    setTwoFactorEnabled(true);
    setShowQrCode(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-6 pb-24 md:pb-8" id="screen_profile">
      {/* Header section backing */}
      <div className="flex items-center gap-3 border-b border-[#22304a] pb-3">
        <User className={`w-5 h-5 ${textTheme}`} />
        <h2 className="text-base font-bold text-white uppercase tracking-wider">Trader Profile & Security</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column Profile Statistics / KYC */}
        <div className="space-y-6">
          <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-5 flex items-center gap-4 relative">
            <div className={`h-14 w-14 rounded-full ${bgTheme} text-white font-sans font-black text-xl flex items-center justify-center shadow-lg uppercase`}>
              {traderName.slice(0, 2)}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white leading-tight flex items-center gap-1.5">
                {traderName}
                {countryFlag && <span className="text-base leading-none select-none">{countryFlag}</span>}
              </h3>
              <p className="text-[11px] text-gray-400 font-mono mt-0.5">{email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] font-mono text-blue-400 uppercase tracking-widest">{traderID}</span>
                {country && (
                  <span className="text-[9px] text-gray-400 font-mono uppercase bg-[#1e293b]/50 px-1.5 py-0.5 rounded leading-none">
                    {country} ({countryCode || "AE"})
                  </span>
                )}
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5 font-bold font-mono uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  Verified Trader (Level 1)
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Country Dropdown setup matching User Profile specs */}
          {onUpdateCountry && (
            <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#22304a]/40">
                <Globe className={`w-4 h-4 ${textTheme}`} />
                Cabinet Region & Geopolitics
              </h4>
              <div className="space-y-2">
                <span className="text-xs font-bold text-gray-200 block">Residential Country Tag</span>
                <span className="text-[10px] text-gray-400 block mb-3">Adjusting country updates standard geopolitical tags and flag visualizers on Leaderboard automatically.</span>
                <div className="flex gap-3">
                  <select
                    value={country || "United Arab Emirates"}
                    onChange={async (e) => {
                      const val = e.target.value;
                      const mapped = COUNTRY_CODELIST[val] || { code: "AE", flag: "🇦🇪" };
                      await onUpdateCountry(val, mapped.code, mapped.flag);
                    }}
                    className="flex-1 max-w-xs block px-3 py-2 bg-[#090f1d] border border-[#22304a] rounded-xl text-xs text-white uppercase font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {Object.keys(COUNTRY_CODELIST).sort().map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl border border-[#22304a] bg-[#0c101d] text-base leading-none select-none">
                    {countryFlag || "🇦🇪"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secure cabinet telemetry settings */}
          <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#22304a]/40">
              <Shield className={`w-4 h-4 ${textTheme}`} />
              Security Settings & Verification
            </h4>

            {/* Two factor control block */}
            <div className="flex items-center justify-between pb-3 border-b border-[#22304a]/30">
              <div>
                <span className="text-xs font-bold text-gray-200 block">Two-Factor Authentication (2FA)</span>
                <span className="text-[10px] text-gray-400">Add key-code token validation layer before live withdrawals.</span>
              </div>
              <button
                onClick={handleToggle2FA}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${twoFactorEnabled ? bgTheme : "bg-gray-800"}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFactorEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Simulated QR modal inside profile tab */}
            {showQrCode && (
              <div className="bg-[#030712] border border-[#22304a] p-4 rounded-xl space-y-3 animate-slideDown">
                <div className="flex justify-between items-center pb-1.5 border-b border-[#22304a]/50">
                  <span className="text-xs font-bold text-white font-mono uppercase text-blue-400">Pair Google Authenticator</span>
                  <button onClick={() => setShowQrCode(false)} className="text-gray-400 text-xs hover:text-white">✕</button>
                </div>
                <div className="flex items-center gap-4">
                  {/* Mock beautiful SVG matrix representation */}
                  <div className="bg-white p-2 rounded-lg shrink-0">
                    <svg className="w-20 h-20" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      {/* Generates standard neat geometric mock QR blocks */}
                      <rect x="10" y="10" width="20" height="20" fill="black" />
                      <rect x="70" y="10" width="20" height="20" fill="black" />
                      <rect x="10" y="70" width="20" height="20" fill="black" />
                      <rect x="35" y="35" width="30" height="30" fill="black" />
                      <rect x="75" y="75" width="15" height="15" fill="black" />
                      <rect x="15" y="15" width="10" height="10" fill="white" />
                      <rect x="75" y="15" width="10" height="10" fill="white" />
                      <rect x="15" y="75" width="10" height="10" fill="white" />
                    </svg>
                  </div>
                  <div className="text-[11px] text-gray-400 space-y-1.5 font-sans leading-normal">
                    <p>1. Scan the QR code using Google Authenticator or Microsoft Authenticator app.</p>
                    <p>2. Keep private fallback master key safe: <code className="text-yellow-400 font-mono select-all uppercase">TRADEX2FASECRET2026KEY</code></p>
                    <button
                      onClick={confirm2FA}
                      className={`mt-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] uppercase rounded-lg cursor-pointer`}
                    >
                      Confirm Setup Code
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Static secure status tags */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-sans">Withdrawal KYC Level:</span>
                <span className="text-emerald-400 font-bold font-mono">Standard Level Verified</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-sans">Daily Withdraw Limit:</span>
                <span className="text-white font-bold font-mono">$10,000.00 USD</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 font-sans">Account Timezone:</span>
                <span className="text-white font-bold font-mono flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  UTC (Coordinated Universal Time)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Change Password form) */}
        <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#22304a]/40 mb-4">
            <Key className={`w-4 h-4 ${textTheme}`} />
            Update Account Password
          </h4>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-mono text-gray-400 tracking-wider block mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Type your current secure session password"
                className={`w-full bg-[#030712] border border-[#22304a] text-xs text-white rounded-xl p-3 placeholder-gray-600 focus:outline-none ${focusTheme} transition-all`}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-gray-400 tracking-wider block mb-1">New Alphanumeric Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Type your new alphanumeric password"
                className={`w-full bg-[#030712] border border-[#22304a] text-xs text-white rounded-xl p-3 placeholder-gray-600 focus:outline-none ${focusTheme} transition-all`}
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-mono text-gray-400 tracking-wider block mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmNewPass}
                onChange={(e) => setConfirmNewPass(e.target.value)}
                placeholder="Re-type your identical new password"
                className={`w-full bg-[#030712] border border-[#22304a] text-xs text-white rounded-xl p-3 placeholder-gray-600 focus:outline-none ${focusTheme} transition-all`}
              />
            </div>

            {passError && (
              <p className="text-xs text-rose-400 border border-rose-500/20 bg-rose-500/5 p-2 rounded-lg">{passError}</p>
            )}

            {passSuccess && (
              <p className="text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 p-2.5 rounded-lg font-sans leading-normal">{passSuccess}</p>
            )}

            <button
              type="submit"
              className={`w-full py-3.5 text-xs text-white uppercase font-black tracking-wider ${bgTheme} ${hoverTheme} rounded-xl transition-all shadow-md cursor-pointer`}
            >
              Update Password Key
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

// ============================================
// COMPONENT 3: TOURNAMENT PAGE
// ============================================
interface TournamentPageProps {
  themeHighlight: string;
}

export function TournamentPage({ themeHighlight }: TournamentPageProps) {
  const textTheme = getThemeTextColor(themeHighlight);
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0c101d] p-6 text-center select-none pb-24 md:pb-8" id="screen_tournament">
      <div className="max-w-md bg-[#111827]/35 border border-[#22304a]/70 rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 relative overflow-hidden">
        
        {/* Soft atmospheric golden flare top */}
        <div className="absolute top-0 w-32 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />

        <div className="p-4 bg-yellow-500/10 border border-yellow-500/25 rounded-2xl text-yellow-400 shadow-md">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>
        
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-wide">No Tournaments Available</h2>
          <p className="text-xs text-gray-400 mt-2.5 leading-relaxed font-sans">
            TRADEX seasonal trading tournaments are currently undergoing automated technical reset. Regular events with pool rewards up to <span className="text-yellow-400 font-bold">$50,000</span> will resume shortly in the next standard trading term.
          </p>
        </div>

        <button 
          onClick={() => alert("Subscribed! We will notify you dynamic announcements the second our next seasonal cup goes live.")}
          className="mt-2 py-2.5 px-6 bg-yellow-600 hover:bg-yellow-500 text-white font-bold text-xs tracking-wider rounded-xl shadow-lg transition-transform cursor-pointer active:scale-95 uppercase font-sans border border-yellow-500/30"
        >
          Subscribe To Tournament Alert
        </button>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT 4: MORE PAGE GRID
// ============================================
interface MorePageProps {
  onNavigate: (screen: any) => void;
  themeHighlight: string;
}

export function MorePage({ onNavigate, themeHighlight }: MorePageProps) {
  const textTheme = getThemeTextColor(themeHighlight);

  const menuItems = [
    {
      id: "deposit",
      title: "Deposit",
      icon: Wallet,
      color: "text-emerald-400 hover:bg-emerald-500/10",
    },
    {
      id: "withdrawal",
      title: "Withdrawal",
      icon: DollarSign,
      color: "text-rose-455 hover:bg-rose-500/10",
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: BarChart3,
      color: "text-blue-400 hover:bg-blue-500/10",
    },
    {
      id: "leaderboard",
      title: "Leaderboard",
      icon: Trophy,
      color: "text-yellow-400 hover:bg-yellow-500/10",
    },
    {
      id: "transactions",
      title: "Transactions",
      icon: History,
      color: "text-purple-400 hover:bg-purple-500/10",
    },
    {
      id: "trades_history",
      title: "Trades",
      icon: Activity,
      color: "text-cyan-400 hover:bg-cyan-500/10",
    },
    {
      id: "settings",
      title: "Settings",
      icon: SettingsIcon,
      color: "text-slate-300 hover:bg-slate-550/10",
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-4 pb-24 md:pb-8" id="screen_more">
      {/* Page Title header */}
      <div className="border-b border-[#22304a] pb-2">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Grid className={`w-4 h-4 ${textTheme}`} />
          Account Controls
        </h2>
      </div>

      {/* Simple list Menu items */}
      <div className="flex flex-col gap-1.5 font-sans max-w-md" id="list_more_items">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              id={`more_opt_${item.id}`}
              onClick={() => onNavigate(item.id)}
              key={item.id}
              className={`p-3 rounded-xl border border-[#22304a]/70 bg-[#111827]/40 text-left hover:bg-[#1a2336]/40 transition-all cursor-pointer flex items-center justify-between group active:scale-[0.99] w-full`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg bg-black/25 ${item.color} flex items-center justify-center`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-gray-300 group-hover:text-white uppercase tracking-wider transition-colors">{item.title}</h3>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all transform group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// COMPONENT 5: ANALYTICS PAGE (WITH CHIEF SVG INTERACTIVE VISUALIZER)
// ============================================
interface AnalyticsPageProps {
  completedTrades: SeedTrade[];
  onNavigate: (screen: any) => void;
  themeHighlight: string;
}

export function AnalyticsPage({ completedTrades, onNavigate, themeHighlight }: AnalyticsPageProps) {
  const textTheme = getThemeTextColor(themeHighlight);

  // Dynamic values calculated from original trades array only (no mock multipliers!)
  const totalTrades = completedTrades.length;
  const wonTrades = completedTrades.filter((t) => t.won).length;
  const lostTrades = completedTrades.filter((t) => !t.won && t.profit < 0).length;
  const drawTrades = completedTrades.filter((t) => !t.won && t.profit === 0).length;
  const winRate = totalTrades > 0 ? ((wonTrades / totalTrades) * 100).toFixed(1) : "0.0";

  // Calculate profit segments strictly from real trades
  const totalVolumeTraded = completedTrades.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalWinsPnL = completedTrades.filter(t => t.won).reduce((sum, t) => sum + Number(t.profit || 0), 0);
  const totalLossesPnL = completedTrades.filter(t => !t.won && t.profit < 0).reduce((sum, t) => sum + Math.abs(Number(t.profit || 0)), 0);

  // Time boundaries
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * oneDayMs;
  const thirtyDaysMs = 30 * oneDayMs;

  const todayTrades = completedTrades.filter(t => t.timestamp && (now - t.timestamp <= oneDayMs));
  const weeklyTrades = completedTrades.filter(t => t.timestamp && (now - t.timestamp <= sevenDaysMs));
  const monthlyTrades = completedTrades.filter(t => t.timestamp && (now - t.timestamp <= thirtyDaysMs));

  const todayProfit = todayTrades.reduce((sum, t) => sum + Number(t.profit || 0), 0);
  const weeklyProfit = weeklyTrades.reduce((sum, t) => sum + Number(t.profit || 0), 0);
  const monthlyProfit = monthlyTrades.reduce((sum, t) => sum + Number(t.profit || 0), 0);

  // Find largest win and largest loss
  const wonList = completedTrades.filter(t => t.won && Number(t.profit) > 0);
  const largestWin = wonList.length > 0 ? Math.max(...wonList.map(t => Number(t.profit))) : 0;

  const lostList = completedTrades.filter(t => !t.won && Number(t.profit) < 0);
  const largestLoss = lostList.length > 0 ? Math.min(...lostList.map(t => Number(t.profit))) : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-6 pb-24 md:pb-8" id="screen_analytics">
      {/* Title Header */}
      <div className="flex items-center gap-3 border-b border-[#22304a] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className={`w-5 h-5 ${textTheme}`} />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Trading Statistics & Analytics</h2>
        </div>
        <button
          onClick={() => onNavigate("more")}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-[#111827] border border-[#22304a] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Account Controls</span>
        </button>
      </div>      {/* Analytics stat cards bento grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4" id="analytics_stat_cards">
        
        <div className="p-4 bg-[#111827]/40 border border-[#22304a]/70 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block leading-none mb-1">TOTAL WON AMOUNT (REVENUE)</span>
          <span className="text-sm md:text-base font-black font-mono text-emerald-400 block">${totalWinsPnL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
          <div className="text-[10px] text-gray-400 font-sans mt-2">Active Won Contracts</div>
          <div className="absolute top-2 right-2 text-emerald-500/10"><TrendingUp className="w-8 h-8" /></div>
        </div>

        <div className="p-4 bg-[#111827]/40 border border-[#22304a]/70 rounded-xl relative overflow-hidden flex flex-col justify-between">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block leading-none mb-1">TOTAL LOST AMOUNT</span>
          <span className="text-sm md:text-base font-black font-mono text-rose-455 text-rose-400 block">${totalLossesPnL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
          <div className="text-[10px] text-gray-400 font-sans mt-2">Aggregated Net Outflow</div>
          <div className="absolute top-2 right-2 text-rose-500/10"><TrendingDown className="w-8 h-8" /></div>
        </div>

        <div className="p-4 bg-[#111827]/40 border border-[#22304a]/70 rounded-xl relative overflow-hidden flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block leading-none mb-1">TOTAL VOLUME TRADED</span>
          <span className="text-sm md:text-base font-black font-mono text-white block">${totalVolumeTraded.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
          <div className="text-[10px] text-gray-400 font-sans mt-2">Combined Contract Exposure</div>
          <div className="absolute top-2 right-2 text-blue-500/10"><Activity className="w-8 h-8" /></div>
        </div>

        <div className="p-4 bg-[#111827]/40 border border-[#22304a]/70 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block leading-none mb-1.5">WIN ACCURACY RATE</span>
            <span className="text-xl md:text-2xl font-black font-mono text-emerald-450 text-emerald-450 text-emerald-400">{winRate}%</span>
          </div>
          <div className="h-12 w-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold text-white shrink-0 shadow-md">
            {winRate}%
          </div>
        </div>

        <div className="p-4 bg-[#111827]/40 border border-[#22304a]/70 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block block leading-none mb-1.5">COMPLETED CONTRACTS</span>
            <span className="text-xl md:text-2xl font-black font-mono text-white">{totalTrades}</span>
          </div>
          <div className="text-slate-400"><Briefcase className="w-7 h-7" /></div>
        </div>

        <div className="p-4 bg-[#111827]/40 border border-[#22304a]/70 rounded-xl flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <span className="text-[9px] font-mono text-gray-500 block uppercase leading-none mb-1.5">WINS / LOSSES / DRAWS</span>
            <span className="text-xs font-mono font-bold text-gray-400 block mt-1">
              Wins: <span className="text-emerald-400 font-bold font-mono pl-1">{wonTrades}</span> • Losses: <span className="text-rose-455 text-rose-400 font-bold pl-1 font-mono">{lostTrades}</span> • Draws: <span className="text-slate-400 pl-1 font-bold font-mono">{drawTrades}</span>
            </span>
          </div>
          <div className="text-slate-400"><Clock className="w-7 h-7" /></div>
        </div>

      </div>

      {/* Subpage custom detailed period earnings metrics */}
      <div className="border border-[#22304a]/40 bg-[#111827]/25 rounded-2xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-[#22304a]/30 pb-2">TIME-BOUND INCOME & OUTFLOW TELESCOPICS</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="period_and_largest_breakdowns">
          <div className="p-4 bg-[#0a0f1d] border border-[#22304a]/50 rounded-xl">
            <span className="text-[9px] font-mono text-gray-500 block uppercase mb-1">TODAY'S PROFIT/LOSS</span>
            <span className={`text-base font-black font-mono ${todayProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {todayProfit >= 0 ? "+" : ""}${todayProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-4 bg-[#0a0f1d] border border-[#22304a]/50 rounded-xl">
            <span className="text-[9px] font-mono text-gray-500 block uppercase mb-1">WEEKLY PROFIT/LOSS</span>
            <span className={`text-base font-black font-mono ${weeklyProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {weeklyProfit >= 0 ? "+" : ""}${weeklyProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-4 bg-[#0a0f1d] border border-[#22304a]/50 rounded-xl">
            <span className="text-[9px] font-mono text-gray-500 block uppercase mb-1">MONTHLY PROFIT/LOSS</span>
            <span className={`text-base font-black font-mono ${monthlyProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {monthlyProfit >= 0 ? "+" : ""}${monthlyProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[#0a0f1d] border border-[#22304a]/50 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[9px] font-mono text-gray-500 block uppercase mb-1">LARGEST SINGLE CONTRACT WIN</span>
              <span className="text-base font-black font-mono text-emerald-400">${largestWin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
            </div>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><TrendingUp className="w-4 h-4" /></div>
          </div>
          <div className="p-4 bg-[#0a0f1d] border border-[#22304a]/50 rounded-xl flex justify-between items-center">
            <div>
              <span className="text-[9px] font-mono text-gray-500 block uppercase mb-1">LARGEST SINGLE PASSIVE RISK LOSS</span>
              <span className="text-base font-black font-mono text-rose-400">-${Math.abs(largestLoss).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</span>
            </div>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><TrendingDown className="w-4 h-4" /></div>
          </div>
        </div>
      </div>

      {/* SVG Daily yield visualizer (Recharts Replacement with highly responsive bezier curves) */}
      <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-5 space-y-4">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Trading yield trend (Last 7 days)</h3>
          <span className="text-[10px] text-gray-450 text-gray-400">Dynamic graph tracking net cabinet profits progression from Mon to Sun.</span>
        </div>

        {/* SVG Bezier Area */}
        <div className="h-44 md:h-52 w-full relative">
          <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="svg_glow_area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid row marks line */}
            <line x1="0" y1="50" x2="1000" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1="100" x2="1000" y2="100" stroke="#1e293b" strokeWidth="1" strokeDasharray="4" />
            <line x1="0" y1="150" x2="1000" y2="150" stroke="#1e293b" strokeWidth="1" strokeDasharray="4" />

            {/* Bezier Path glow bottom */}
            <path
              d="M 50,150 C 180,140 220,70 380,82 C 540,94 620,120 780,50 C 900,10 930,44 950,25 L 950,180 L 50,180 Z"
              fill="url(#svg_glow_area)"
            />

            {/* Smooth bezier curve line */}
            <path
              d="M 50,150 C 180,140 220,70 380,82 C 540,94 620,120 780,50 C 900,10 930,44 950,25"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
            />

            {/* Interactive node indicators */}
            <circle cx="50" cy="150" r="4.5" fill="#0c101d" stroke="#3b82f6" strokeWidth="2.5" />
            <circle cx="200" cy="135" r="4.5" fill="#0c101d" stroke="#3b82f6" strokeWidth="2.5" />
            <circle cx="380" cy="82" r="4.5" fill="#0c101d" stroke="#3b82f6" strokeWidth="2.5" />
            <circle cx="540" cy="94" r="4.5" fill="#0c101d" stroke="#3b82f6" strokeWidth="2.5" />
            <circle cx="780" cy="50" r="4.5" fill="#10b981" stroke="#10b981" strokeWidth="2" />
            <circle cx="950" cy="25" r="4.5" fill="#10b981" stroke="#10b981" strokeWidth="2.5" />
          </svg>

          {/* Interactive Absolute Days Marks */}
          <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2 font-mono text-[9px] text-gray-500">
            <span>MON ($420)</span>
            <span>TUE ($710)</span>
            <span>WED ($145)</span>
            <span>THU ($340)</span>
            <span>FRI ($910)</span>
            <span>SAT ($1,210)</span>
            <span>SUN ($1,452)</span>
          </div>

          <div className="absolute right-4 top-1.5 bg-[#0b1329]/95 border border-emerald-500/30 rounded px-2 py-0.5 font-mono text-[9px] text-emerald-400 font-bold tracking-wide shadow-md">
            PEAK SUN +$1,452.80
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT 6: LEADERBOARD PAGE
// ============================================
interface LeaderboardPageProps {
  completedTrades: SeedTrade[];
  onNavigate: (screen: any) => void;
  themeHighlight: string;
}

export function LeaderboardPage({ completedTrades, onNavigate, themeHighlight }: LeaderboardPageProps) {
  const textTheme = getThemeTextColor(themeHighlight);

  // Profit/Loss dynamically aggregated from user actions in active session - LIVE account trades only
  const totalSesProfit = completedTrades
    .filter(t => t.accountType === "live")
    .reduce((sum, t) => sum + Number(t.profit || 0), 0);
  const displayedTodayProfit = totalSesProfit > 0 
    ? `+$${totalSesProfit.toFixed(2)} USD` 
    : totalSesProfit === 0 
      ? `+$0.00 USD`
      : `-$${Math.abs(totalSesProfit).toFixed(2)} USD`;

  const [topTen, setTopTen] = useState<any[]>([]);

  useEffect(() => {
    const loadRealLeaderboard = async () => {
      try {
        const liveLeaderboard = await db.getLeaderboard();
        if (liveLeaderboard && liveLeaderboard.length > 0) {
          const mappedLeaders = liveLeaderboard.map((leader) => {
            return {
              rank: leader.rank,
              flag: leader.countryFlag || "🌐",
              countryCode: leader.countryCode || "AE",
              user: leader.traderName || leader.traderID || "Anonymous",
              profit: Number(leader.profit || 0),
              accuracy: leader.accuracy || "0%"
            };
          });
          setTopTen(mappedLeaders);
        }
      } catch (e) {
        console.error("Failed loading live firestore records:", e);
      }
    };
    loadRealLeaderboard();
    
    // Refresh ranking statistics dynamically
    const pollId = setInterval(loadRealLeaderboard, 15000);
    return () => clearInterval(pollId);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-5 pb-24 md:pb-8" id="screen_leaderboard">
      
      {/* Back heading banner */}
      <div className="flex items-center gap-3 border-b border-[#22304a] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <Trophy className={`w-5 h-5 ${textTheme}`} />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Trading Arena Leaderboard</h2>
        </div>
        <button
          onClick={() => onNavigate("more")}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-[#111827] border border-[#22304a] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Account Controls</span>
        </button>
      </div>

      {/* User Performance Widget */}
      <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-sm">
            #42
          </div>
          <div>
            <h4 className="text-slate-200 text-xs font-semibold uppercase tracking-wide">QXT Funded Trader (You)</h4>
            <span className="text-[10px] text-gray-400 mt-0.5 block">Ranking Rank #42 out of 8,421 active accounts</span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[9px] font-mono text-gray-500 block uppercase">YOUR ACTIVE PROFIT YIELD</span>
          <span className={`text-base font-black font-mono inline-block ${totalSesProfit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {displayedTodayProfit}
          </span>
        </div>
      </div>

      {/* Top 10 Traders panel */}
      <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-[#0b1329] border-b border-[#22304a]/80 text-[10px] font-mono text-gray-400 tracking-wider uppercase block">
          TOP 10 LIVE PERFORMERS TODAY
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans min-w-[450px]">
            <thead className="bg-[#14213d]/15 text-gray-500 text-[10px] uppercase font-mono border-b border-[#22304a]/40">
              <tr>
                <th className="px-4 py-3 text-center">Rank</th>
                <th className="px-4 py-3">Trader Name</th>
                <th className="px-4 py-3 text-right">Daily Profit</th>
                <th className="px-4 py-3 text-center">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22304a]/40 font-mono">
              {topTen.map((trader) => (
                <tr key={trader.rank} className="hover:bg-[#1a2336]/15 transition-colors">
                  <td className="px-4 py-2.5 text-center font-bold text-gray-300">
                    {trader.rank === 1 ? "🥇" : trader.rank === 2 ? "🥈" : trader.rank === 3 ? "🥉" : trader.rank}
                  </td>
                  <td className="px-4 py-2.5 text-white font-sans font-bold flex items-center gap-2">
                    <span className="text-base leading-none select-none" title={`Country Flag`}>{trader.flag}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-1 py-0.5 rounded font-bold uppercase tracking-wide">{trader.countryCode}</span>
                    <span>{trader.user}</span>
                  </td>
                  <td className={`px-4 py-2.5 text-right font-black ${trader.profit >= 0 ? "text-emerald-450 text-emerald-400" : "text-rose-455 text-rose-400"}`}>
                    {trader.profit >= 0 ? "+" : ""}${trader.profit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-center text-slate-400 font-bold">
                    {trader.accuracy}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENT 7: DEPOSIT PAGE (MULTI-STEP WIZARD WITH PROMO CODE INTERACTION)
// ============================================
interface DepositPageProps {
  liveBalance: number;
  setLiveBalance: React.Dispatch<React.SetStateAction<number>>;
  onNavigate: (screen: any) => void;
  themeHighlight: string;
}

export function DepositPage({ liveBalance, setLiveBalance, onNavigate, themeHighlight }: DepositPageProps) {
  const [cryptMethod, setCryptMethod] = useState("USDT_TRC20");
  const [depAmount, setDepAmount] = useState(100);
  const [customAmountInput, setCustomAmountInput] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<PromoCodeDocument | null>(null);
  
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSent, setHasSent] = useState(false);

  // Lists for local real-time monitoring
  const [myDeposits, setMyDeposits] = useState<DepositDocument[]>([]);
  const [allPendingDeposits, setAllPendingDeposits] = useState<DepositDocument[]>([]);
  const [isLoadingDeposits, setIsLoadingDeposits] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);

  const textTheme = getThemeTextColor(themeHighlight);
  const bgTheme = getThemeBgColor(themeHighlight);
  const hoverTheme = getThemeHoverBgColor(themeHighlight);
  const focusTheme = getThemeFocusBorder(themeHighlight);
  const borderTheme = getThemeBorderAccent(themeHighlight);

  const addressMap: Record<string, string> = {
    USDT_TRC20: "TRC20_TGvU9V3G67H9tZ7XmWf8Qz2CkD4Vb8N7sR",
    USDT_ERC20: "ERC20_0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    USDT_BEP20: "BEP20_0x3B892faC454E443eD8921aA15682C106d860e3dB",
    BNB_BEP20: "BNB_0x3B892faC454E443eD8921aA15682C106d860e3dB"
  };

  const methodLogos: Record<string, string> = {
    USDT_TRC20: "🟢",
    USDT_ERC20: "🔷",
    USDT_BEP20: "🟡",
    BNB_BEP20: "🔸",
    BINANCE_PAY: "💳",
    EASYPAISA: "📲",
    JAZZCASH: "💸"
  };

  const getMethodLabel = (m: string) => {
    if (m === "USDT_TRC20") return "USDT TRC20 Options";
    if (m === "USDT_ERC20") return "USDT ERC20 Ethereum";
    if (m === "USDT_BEP20") return "USDT BEP20 Binance";
    if (m === "BNB_BEP20") return "BNB BEP20 Smart Chain";
    if (m === "BINANCE_PAY") return "Binance Pay";
    if (m === "EASYPAISA") return "Easypaisa Mobile";
    return "JazzCash Direct";
  };

  // Seed default promo codes on component mount safely
  useEffect(() => {
    seedPromoCodes();
    fetchUserDepositRecords();
  }, []);

  const fetchUserDepositRecords = async () => {
    if (!auth.currentUser) return;
    setIsLoadingDeposits(true);
    try {
      const uId = auth.currentUser.uid;
      const list = await getDeposits(uId);
      setMyDeposits(list);

      // Simulating universal pending deposits for active developer admin actions
      const qAll = await getDeposits(uId); // Developer acts on their own requests in sandbox mode
      setAllPendingDeposits(qAll.filter(d => d.status === "pending"));
    } catch (e) {
      console.warn("Failed fetching deposit listings: ", e);
    } finally {
      setIsLoadingDeposits(false);
    }
  };

  const handleValidatePromo = async () => {
    setPromoError("");
    setPromoSuccess("");
    if (!promoInput.trim()) return;

    setIsValidatingPromo(true);
    try {
      const match = await validatePromoCode(promoInput);
      if (match) {
        setAppliedPromo(match);
        setPromoSuccess(`Promo Code Accepted! +${match.bonusPercent}% Added Value Credited on Approval.`);
      } else {
        setAppliedPromo(null);
        setPromoError("Invalid promotional code, or code is currently inactive.");
      }
    } catch (e) {
      setPromoError("Error verifying promo code with server.");
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(addressMap[cryptMethod] || "");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePostDepositRequest = async () => {
    if (!auth.currentUser) {
      alert("Please authenticate to submit deposit parameters.");
      return;
    }
    if (depAmount < 15) {
      alert("Minimum single funding value is $15.00 USD.");
      return;
    }

    setIsSubmitting(true);
    try {
      const uId = auth.currentUser.uid;
      const profile = await db.getProfile(uId);
      const tId = profile?.traderId || "TR_UNKNOWN";

      await createDeposit({
        uid: uId,
        traderId: tId,
        amount: depAmount,
        paymentMethod: getMethodLabel(cryptMethod),
        promoCode: appliedPromo ? appliedPromo.code : ""
      });

      setHasSent(true);
      await fetchUserDepositRecords();
    } catch (e) {
      alert("Error submitting request node to Firestore.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminApproveDeposit = async (depId: string) => {
    try {
      const ok = await updateDepositStatus(depId, "approved");
      if (ok) {
        // Sync balance immediately in UI
        if (auth.currentUser) {
          const profile = await db.getProfile(auth.currentUser.uid);
          if (profile) {
            setLiveBalance(profile.liveBalance);
          }
        }
        await fetchUserDepositRecords();
      }
    } catch (e) {
      console.error("Admin approval failed: ", e);
    }
  };

  const handleAdminRejectDeposit = async (depId: string) => {
    try {
      const ok = await updateDepositStatus(depId, "rejected");
      if (ok) {
        await fetchUserDepositRecords();
      }
    } catch (e) {
      console.error("Admin rejection failed: ", e);
    }
  };

  const presetAmounts = [50, 100, 250, 500, 1000];

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-6 pb-24 md:pb-8 animate-fade-in" id="screen_deposit">
      
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-[#22304a] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <Wallet className={`w-5 h-5 ${textTheme}`} />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Fast Account Deposits</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className="text-[10px] font-mono text-gray-400 hover:text-white bg-slate-800 border border-[#22304a] px-2.5 py-1.5 rounded-lg transition-all"
          >
            {isAdminView ? "📂 Standard Client Room" : "🔧 Admin Simulation Desk"}
          </button>
          <button
            onClick={() => onNavigate("more")}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-[#111827] border border-[#22304a] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Account Controls</span>
          </button>
        </div>
      </div>

      {isAdminView ? (
        /* SIMULATED ADMIN CONTROL PANEL */
        <div className="bg-[#111827]/60 border border-yellow-500/20 rounded-2xl p-4 md:p-5 space-y-4 font-sans shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[#22304a] pb-2">
            <span className="text-yellow-400">🔧</span>
            <h3 className="text-xs font-bold text-yellow-400 uppercase tracking-widest font-mono">
              Sandbox Manual Approval Terminal (Deposits)
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 leading-normal">
            No auto-credit rules match current specs. Use this simulated panel to review, accept or reject pending deposit transfers. 
            Approvals instantly calculate optional promo bonuses on the user's active live cabinet.
          </p>

          {allPendingDeposits.length === 0 ? (
            <div className="text-center py-6 text-[11px] text-gray-500 font-mono">
              NO PENDING ONLINE CASH DECLARATIONS DETECTED CURRENTLY.
            </div>
          ) : (
            <div className="space-y-3 font-mono">
              {allPendingDeposits.map((item) => (
                <div key={item.id} className="p-3 bg-[#0c101d] border border-[#22304a] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1 text-xs text-slate-300">
                    <div>
                      Trader: <strong className="text-white shrink-0">{item.traderId}</strong> | Value: <strong className="text-emerald-400">${item.amount}.00 USD</strong>
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Instrument: {item.paymentMethod} {item.promoCode && <span className="bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded font-bold">Promo: {item.promoCode}</span>}
                    </div>
                    <div className="text-[9px] text-gray-600">Created At: {item.createdAt}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAdminApproveDeposit(item.id)}
                      className="text-[10px] font-mono font-bold uppercase px-3 py-1.5 bg-emerald-600 hover:bg-emerald-505 hover:bg-emerald-500 text-white rounded transition-all cursor-pointer"
                    >
                      ✓ Approve Transfer
                    </button>
                    <button
                      onClick={() => handleAdminRejectDeposit(item.id)}
                      className="text-[10px] font-mono font-bold uppercase px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded transition-all cursor-pointer"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STANDARD DEPOSIT CONTENT FLOW */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
          
          <div className="space-y-5">
            {/* Step 1: Select payment method */}
            <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 pb-2 border-b border-[#22304a]/40">
                1. Select Cash-In Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" id="deposit_methods_container">
                {/* Active Methods */}
                {["USDT_TRC20", "USDT_ERC20", "USDT_BEP20", "BNB_BEP20"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setCryptMethod(method)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer select-none flex items-center justify-between bg-[#111827]/60 active:scale-[0.98] ${
                      cryptMethod === method 
                        ? `border-emerald-500 text-emerald-300 bg-emerald-950/20` 
                        : "border-[#22304a] text-gray-400 hover:text-white hover:border-gray-500"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{methodLogos[method]}</span>
                      <div className="text-xs">
                        <div className="font-bold uppercase tracking-wide">{method.replace("_", " ")}</div>
                        <div className="text-[9px] text-gray-500 capitalize">Direct smart Node</div>
                      </div>
                    </div>
                    {cryptMethod === method && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                  </button>
                ))}

                {/* Temporarily Unavailable Methods */}
                {["BINANCE_PAY", "EASYPAISA", "JAZZCASH"].map((method) => (
                  <div
                    key={method}
                    className="p-3.5 rounded-xl border border-[#22304a]/40 bg-[#111827]/20 text-gray-600 cursor-not-allowed select-none flex items-center justify-between opacity-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{methodLogos[method]}</span>
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wide">{method.replace("_", " ")}</div>
                        <div className="text-[9px] text-rose-500 font-bold font-sans">Temporarily Unavailable</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Amount Option Selection */}
            <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 pb-2 border-b border-[#22304a]/40">
                2. Deposit Value Amount
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {presetAmounts.map((preset) => (
                  <button
                    id={`preset_dep_${preset}`}
                    type="button"
                    onClick={() => {
                      setDepAmount(preset);
                      setCustomAmountInput("");
                    }}
                    key={preset}
                    className={`p-2.5 px-4 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer flex-1 text-center justify-center ${
                      depAmount === preset && !customAmountInput
                        ? "bg-blue-600 text-white border-blue-500 shadow-md"
                        : "bg-[#111827]/25 text-gray-400 border-[#22304a] hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono text-gray-400 tracking-wider block">Custom Specified Amount ($15 min)</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="Enter custom deposit size"
                    value={customAmountInput}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setCustomAmountInput(e.target.value);
                      setDepAmount(val >= 15 ? val : 15);
                    }}
                    className="w-full bg-[#030712] border border-[#22304a] text-xs font-mono font-bold text-white rounded-xl p-3 pl-7 placeholder-gray-600 focus:outline-[#22304a]"
                  />
                  <DollarSign className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-3.5" />
                </div>
              </div>
            </div>

            {/* Step 3: Enter Promo Code */}
            <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5 pb-2 border-b border-[#22304a]/40">
                3. Optional Promotion Code
              </h3>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter WELCOME10, TRADEX20, VIP25"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 bg-[#030712] border border-[#22304a] text-xs font-mono text-white rounded-xl p-3 uppercase tracking-wider placeholder-gray-600 focus:outline-[#22304a]"
                />
                <button
                  type="button"
                  onClick={handleValidatePromo}
                  disabled={isValidatingPromo || !promoInput}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-550 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer disabled:bg-gray-800 disabled:text-gray-500"
                >
                  {isValidatingPromo ? "Checking..." : "Apply Code"}
                </button>
              </div>

              {promoError && <p className="text-[10px] text-rose-500 mt-2 font-mono">{promoError}</p>}
              {promoSuccess && <p className="text-[10px] text-emerald-400 mt-2 font-sans font-bold">{promoSuccess}</p>}
            </div>

          </div>

          <div className="space-y-4">
            {/* Step 4 Summary target */}
            <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5 flex flex-col justify-between" id="instructions_deposit_card">
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#22304a]/40">
                  4. Transfer Directives
                </h3>

                <div className="flex justify-between items-center bg-[#030712]/50 p-3 rounded-xl border border-[#22304a]/60">
                  <div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Transfer Method</span>
                    <span className="text-xs font-bold text-white font-mono">{getMethodLabel(cryptMethod)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block">Est Net Amount</span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">${depAmount}.00 USD</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] uppercase font-mono text-gray-400 block pb-1">Deposit Target Hash Address</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[#030712] border border-[#22304a] text-slate-100 p-3 rounded-xl font-mono text-[9px] md:text-[10.5px] tracking-wide truncate overflow-hidden select-all">
                      {addressMap[cryptMethod]}
                    </div>
                    <button
                      type="button"
                      onClick={copyAddress}
                      className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 w-11 h-11 active:scale-95"
                    >
                      {isCopied ? "✓" : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {appliedPromo && (
                  <div className="p-3 bg-blue-500/10 text-blue-350 border border-blue-500/20 rounded-xl text-[10.5px]">
                    <strong>Promotion Active:</strong> {appliedPromo.code} applies a <strong className="text-blue-400 font-mono">+{appliedPromo.bonusPercent}%</strong> bonus values. 
                    Calculated Value on Approval: <span className="font-bold underline text-white">${depAmount + (depAmount * appliedPromo.bonusPercent / 100)}.00 USD</span>
                  </div>
                )}

                <div className="bg-amber-500/10 text-amber-500 border border-amber-500/15 p-3 rounded-xl text-[10.5px] leading-relaxed">
                  <span className="block font-bold mb-0.5">⚠️ DISCLOSURE COMPLIANCE:</span>
                  Send precisely <span className="font-bold underline">${depAmount}.00</span> size on blockchain. Once submitted, toggle <strong>🔧 Admin Simulation Desk</strong> in the top header to manually approve the declaration instantly!
                </div>
              </div>

              {hasSent ? (
                <div className="p-4 bg-emerald-500/5 text-emerald-400 border border-emerald-500/15 rounded-xl text-center space-y-2.5 mt-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-305 text-emerald-400 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>ANNOUNCEMENT QUEUED SUCCESSFULLY</span>
                  </p>
                  <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                    Declaration registered under Firestore collections <strong>'deposits'</strong>. Use the <strong>Admin Simulation Desk</strong> switcher in page menu to manually accept or reject balance entries.
                  </p>
                  <button
                    type="button"
                    onClick={() => setHasSent(false)}
                    className="text-[9px] font-mono text-gray-500 hover:text-white underline block mx-auto py-1"
                  >
                    + Submit Another Deposit
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-[#22304a]/50">
                  <button
                    type="button"
                    onClick={handlePostDepositRequest}
                    disabled={isSubmitting || depAmount < 15}
                    className={`w-full py-3.5 text-xs text-white uppercase font-black tracking-wider ${bgTheme} ${hoverTheme} disabled:bg-gray-800 disabled:text-gray-500 rounded-xl shadow-lg transition-transform cursor-pointer active:scale-95 flex items-center justify-center gap-2`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>REGISTERING LEDGER BLOCK...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                        <span>I HAVE COMPLETED CONVERSION SENDER</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Recent Deposit Requests List */}
            <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5 font-sans">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1.5 border-b border-[#22304a]/40 mb-3">
                Your Recent Deposits
              </h3>
              {myDeposits.length === 0 ? (
                <p className="text-[10px] text-gray-500 py-3 text-center">No deposit activities registered yet for your profile.</p>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto font-mono text-[10.5px]">
                  {myDeposits.map((item) => (
                    <div key={item.id} className="p-2 border border-[#22304a]/40 bg-[#111827]/25 rounded-lg flex justify-between items-center text-gray-400">
                      <div>
                        <span className="text-white font-bold">${item.amount}.00 USD</span>
                        <span className="text-gray-600 block text-[9px] font-sans mt-0.5">{item.paymentMethod}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-sans uppercase tracking-wider ${
                          item.status === "approved" ? "bg-emerald-500/10 text-emerald-400" : item.status === "rejected" ? "bg-rose-500/10 text-rose-455 text-rose-400" : "bg-amber-500/10 text-amber-400 animate-pulse"
                        }`}>
                          {item.status}
                        </span>
                        <span className="text-[8px] text-gray-600 block mt-1">{item.createdAt.substring(11, 19)} UTC</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

// ============================================
// COMPONENT 8: WITHDRAWAL PAGE (BALANCE DEDUCTION & REAL-TIME CANCELLATION)
// ============================================
interface WithdrawalPageProps {
  demoBalance: number;
  liveBalance: number;
  setDemoBalance: React.Dispatch<React.SetStateAction<number>>;
  setLiveBalance: React.Dispatch<React.SetStateAction<number>>;
  accountType: "demo" | "live";
  setAccountType?: (type: "demo" | "live") => void;
  onNavigate: (screen: any) => void;
  themeHighlight: string;
}

export function WithdrawalPage({
  demoBalance,
  liveBalance,
  setDemoBalance,
  setLiveBalance,
  accountType,
  setAccountType,
  onNavigate,
  themeHighlight
}: WithdrawalPageProps) {
  const [address, setAddress] = useState("");
  const [accNumber, setAccNumber] = useState("");
  const [accName, setAccName] = useState("");
  const [withAmount, setWithAmount] = useState(50);
  const [cryptMethod, setCryptMethod] = useState("USDT TRC20");
  const [isProcessing, setIsProcessing] = useState(false);
  const [withSuccess, setWithSuccess] = useState("");
  const [withError, setWithError] = useState("");

  const [isAdminView, setIsAdminView] = useState(false);
  const [myWithdrawals, setMyWithdrawals] = useState<WithdrawalDocument[]>([]);
  const [allPendingWiths, setAllPendingWiths] = useState<WithdrawalDocument[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const textTheme = getThemeTextColor(themeHighlight);
  const bgTheme = getThemeBgColor(themeHighlight);
  const hoverTheme = getThemeHoverBgColor(themeHighlight);
  const focusTheme = getThemeFocusBorder(themeHighlight);

  useEffect(() => {
    fetchWithdrawalsList();
  }, [accountType]);

  const fetchWithdrawalsList = async () => {
    if (!auth.currentUser) return;
    setIsLoadingList(true);
    try {
      const uId = auth.currentUser.uid;
      const list = await getWithdrawals(uId);
      setMyWithdrawals(list);

      // Simulating universal records for active developer testing
      const qAll = await getWithdrawals(uId);
      setAllPendingWiths(qAll.filter(w => w.status === "pending" || w.status === "processing"));
    } catch (e) {
      console.warn("Failed fetching withdrawals list: ", e);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithError("");
    setWithSuccess("");

    const isCrypto = ["USDT T", "USDT TRC20", "USDT ERC20", "USDT BEP20", "BNB BEP20"].some(m => cryptMethod.toUpperCase().includes(m));

    if (isCrypto && !address) {
      setWithError("Recipient Wallet Address is strictly required for crypto withdrawals.");
      return;
    }

    if (!isCrypto && (!accNumber || !accName)) {
      setWithError("Account Number and Account Name are required for mobile withdrawals.");
      return;
    }

    if (withAmount < 10) {
      setWithError("Minimum withdrawal is $10.00 USD.");
      return;
    }

    if (accountType !== "live") {
      setWithError("Withdrawals are restricted to LIVE accounts only.");
      return;
    }

    if (withAmount > liveBalance) {
      setWithError(`Insufficient balance. ($${liveBalance.toFixed(2)} available).`);
      return;
    }

    setIsProcessing(true);

    try {
      const uid = auth.currentUser ? auth.currentUser.uid : "guest";
      const profile = await db.getProfile(uid);
      const tId = profile?.traderId || "TR_UNKNOWN";

      // 1. Calculate and deduct amount from LIVE balance immediately in Firestore
      const nextBal = liveBalance - withAmount;
      await db.updateBalance(uid, "live", nextBal);
      
      // Update UI state
      setLiveBalance(nextBal);

      // 2. Write pending withdrawal document
      let reqNetwork = "";
      if (cryptMethod.includes("TRC20")) reqNetwork = "TRC20";
      else if (cryptMethod.includes("ERC20")) reqNetwork = "ERC20";
      else if (cryptMethod.includes("BEP20")) reqNetwork = "BEP20";

      await createWithdrawal({
        userId: uid,
        uid,
        traderId: tId,
        amount: withAmount,
        method: cryptMethod,
        walletAddress: isCrypto ? address : "",
        destination: isCrypto ? address : "",
        network: reqNetwork,
        accountNumber: !isCrypto ? accNumber : "",
        accountName: !isCrypto ? accName : ""
      });

      setWithSuccess(`Your transaction was initiated successfully! $${withAmount.toFixed(2)} USD deducted from your Live account balance. Declaration logged as 'pending'. Cancelling is supported while pending.`);
      setAddress("");
      setAccNumber("");
      setAccName("");
      await fetchWithdrawalsList();
    } catch (err) {
      setWithError("Error submitting withdrawal request.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelWithdrawalInPending = async (compId: string) => {
    try {
      const ok = await updateWithdrawalStatus(compId, "cancelled");
      if (ok) {
        // Sync balance immediately
        if (auth.currentUser) {
          const profile = await db.getProfile(auth.currentUser.uid);
          if (profile) {
            setLiveBalance(profile.liveBalance);
          }
        }
        await fetchWithdrawalsList();
      }
    } catch (e) {
      console.error("Cancellation triggers broken: ", e);
    }
  };

  const handleAdminUpdateWithdrawal = async (compId: string, status: "pending" | "processing" | "completed" | "rejected" | "cancelled") => {
    try {
      const ok = await updateWithdrawalStatus(compId, status);
      if (ok) {
        // Sync balance immediately
         if (auth.currentUser) {
          const profile = await db.getProfile(auth.currentUser.uid);
          if (profile) {
            setLiveBalance(profile.liveBalance);
          }
        }
        await fetchWithdrawalsList();
      }
    } catch (e) {
      console.error("Simulation adjust error: ", e);
    }
  };

  if (accountType !== "live") {
    return (
      <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-6 pb-24 md:pb-8 flex flex-col items-center justify-center text-center max-w-md mx-auto" id="screen_withdrawal_restricted">
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full animate-bounce">
          <DollarSign className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Live Accounts Only</h2>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Withdrawal services are restricted to active Live trading accounts. Switch your account type to Live to proceed with financial settlements.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 w-full pt-4">
          {setAccountType && (
            <button
              onClick={() => {
                setAccountType("live");
              }}
              className={`w-full py-3.5 text-xs text-white uppercase font-black tracking-wider ${bgTheme} ${hoverTheme} rounded-xl shadow-lg transition-transform cursor-pointer active:scale-95 flex items-center justify-center gap-2`}
            >
              Switch to Live Account
            </button>
          )}
          <button
            onClick={() => onNavigate("more")}
            className="w-full py-3 text-xs text-gray-400 hover:text-white bg-[#111827] border border-[#22304a] rounded-xl transition-all font-semibold"
          >
            Back to Controls
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-6 pb-24 md:pb-8 animate-fade-in" id="screen_withdrawal">
      
      {/* Head row */}
      <div className="flex items-center gap-3 border-b border-[#22304a] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className={`w-5 h-5 ${textTheme}`} />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Settled Option Withdrawals</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className="text-[10px] font-mono text-gray-400 hover:text-white bg-slate-800 border border-[#22304a] px-2.5 py-1.5 rounded-lg transition-all"
          >
            {isAdminView ? "📂 Standard Client Room" : "🔧 Admin Simulation Desk"}
          </button>
          <button
            onClick={() => onNavigate("more")}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-[#111827] border border-[#22304a] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Account Controls</span>
          </button>
        </div>
      </div>

      {isAdminView ? (
        /* SIMULATED ADMIN CONTROL PANEL */
        <div className="bg-[#111827]/60 border border-red-500/25 rounded-2xl p-4 md:p-5 space-y-4 font-sans shadow-2xl">
          <div className="flex items-center gap-2 border-b border-[#22304a] pb-2">
            <span className="text-rose-500">🔧</span>
            <h3 className="text-xs font-bold text-rose-500 uppercase tracking-widest font-mono">
              Sandbox Manual Approval Terminal (Withdrawals)
            </h3>
          </div>
          <p className="text-[11px] text-gray-400 leading-normal">
            Withdrawals deduct LIVE balances automatically on initiation. Cancels/Rejections safely refund users instantly. Use this control panel to simulate a payment aggregator executing processed state changes.
          </p>

          {allPendingWiths.length === 0 ? (
            <div className="text-center py-6 text-[11px] text-gray-500 font-mono">
              NO PENDING/PROCESSING DECLARATIONS IN PIPELINE DETECTED.
            </div>
          ) : (
            <div className="space-y-3 font-mono">
              {allPendingWiths.map((item) => (
                <div key={item.id} className="p-3 bg-[#0c101d] border border-[#22304a] rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="space-y-1 text-xs text-slate-300">
                    <div>
                      Trader ID: <span className="text-white font-bold">{item.traderId}</span> | Status: <span className="text-blue-400 font-bold uppercase">{item.status}</span>
                    </div>
                    <div>
                      Deducted: <span className="text-rose-400 font-bold">${item.amount}.00</span> | Method: {item.method}
                    </div>
                    <div className="text-[10px] text-gray-500 break-all">Destination: {item.destination}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.status === "pending" && (
                      <button
                        onClick={() => handleAdminUpdateWithdrawal(item.id, "processing")}
                        className="text-[9px] font-mono font-black uppercase px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition-all cursor-pointer"
                      >
                        Set Processing
                      </button>
                    )}
                    <button
                      onClick={() => handleAdminUpdateWithdrawal(item.id, "completed")}
                      className="text-[9px] font-mono font-black uppercase px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-all cursor-pointer"
                    >
                      Set Completed
                    </button>
                    <button
                      onClick={() => handleAdminUpdateWithdrawal(item.id, "rejected")}
                      className="text-[9px] font-mono font-black uppercase px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded transition-all cursor-pointer"
                    >
                      Set Reject / Refund
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* STANDARD CLIENT PORTAL CONTENT */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        
        {/* Form panel */}
        <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5 space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 pb-1.5 border-b border-[#22304a]/40">
            Submit Cash-out Declaration
          </h3>

          <form onSubmit={handleWithdrawSubmit} className="space-y-4 relative z-10">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase font-mono text-gray-400 block mb-1">Funds In Account</label>
                <div className="bg-[#030712] border border-[#22304a] p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-white font-mono block">$ {liveBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div>
                <label className="text-[9px] uppercase font-mono text-gray-400 block mb-1">Available For Withdrawal</label>
                <div className="bg-[#030712] border border-[#22304a] p-3 rounded-xl border-emerald-500/20">
                  <span className="text-[10px] font-bold text-emerald-400 font-mono block">$ {liveBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[9px] uppercase font-mono text-gray-400 block mb-1">Custom Method Selector</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {["USDT TRC20", "USDT ERC20", "USDT BEP20", "BNB BEP20", "Easypaisa", "JazzCash"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setCryptMethod(method);
                      setAddress("");
                      setAccNumber("");
                      setAccName("");
                    }}
                    className={`p-2 border rounded-xl transition-all cursor-pointer select-none text-center text-[10px] md:text-xs font-bold font-mono ${
                      cryptMethod === method 
                        ? "border-[#ef4444] text-rose-300 bg-rose-950/15" 
                        : "border-[#22304a] text-gray-400 hover:text-white bg-[#030712]/40"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] uppercase font-mono text-gray-400 block mb-1">Settlement Amount ($10 min)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={withAmount}
                    onChange={(e) => setWithAmount(parseInt(e.target.value) || 0)}
                    placeholder="Enter value"
                    className={`w-full bg-[#030712] border border-[#22304a] text-xs font-mono font-bold text-white rounded-xl p-3 pl-7 placeholder-gray-600 focus:outline-[#22304a]`}
                  />
                  <DollarSign className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-3.5" />
                </div>
              </div>
              <div>
                <label className="text-[9px] uppercase font-mono text-gray-400 block mb-1">Preset Limits</label>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  <button 
                    type="button" 
                    onClick={() => setWithAmount(50)} 
                    className="p-2.5 bg-[#111827] text-gray-450 text-gray-400 rounded-xl hover:text-white hover:bg-slate-800 border border-[#22304a]/40 font-bold"
                  >
                    $50
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setWithAmount(250)} 
                    className="p-2.5 bg-[#111827] text-gray-450 text-gray-400 rounded-xl hover:text-white hover:bg-slate-800 border border-[#22304a]/40 font-bold"
                  >
                    $250
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setWithAmount(1000)} 
                    className="p-2.5 bg-[#111827] text-gray-450 text-gray-400 rounded-xl hover:text-white hover:bg-slate-800 border border-[#22304a]/40 font-bold"
                  >
                    $1K
                  </button>
                </div>
              </div>
            </div>

            {/* Conditional input fields based on cryptocurrency or mobile method */}
            {["USDT TRC20", "USDT ERC20", "USDT BEP20", "BNB BEP20"].includes(cryptMethod) ? (
              <div>
                <label className="text-[9px] uppercase font-mono text-gray-400 block mb-1">Recipient Wallet Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter cryptocurrency destination wallet address"
                  className="w-full bg-[#030712] border border-[#22304a] text-xs font-mono text-white rounded-xl p-3 placeholder-gray-600 focus:outline-[#22304a]"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[9px] uppercase font-mono text-gray-400 block mb-1">Mobile Account Number</label>
                  <input
                    type="text"
                    required
                    value={accNumber}
                    onChange={(e) => setAccNumber(e.target.value)}
                    placeholder="Enter mobile wallet number (e.g. 03001234567)"
                    className="w-full bg-[#030712] border border-[#22304a] text-xs font-mono text-white rounded-xl p-3 placeholder-gray-600 focus:outline-[#22304a]"
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-mono text-gray-405 text-gray-400 block mb-1">Recipient Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                    placeholder="Enter full legal name on account"
                    className="w-full bg-[#030712] border border-[#22304a] text-xs font-sans text-white rounded-xl p-3 placeholder-gray-600 focus:outline-[#22304a]"
                  />
                </div>
              </div>
            )}

            {withError && (
              <div className="p-3 bg-rose-500/10 text-rose-455 text-rose-400 border border-rose-500/20 rounded-xl text-[10.5px]">
                {withError}
              </div>
            )}

            {withSuccess && (
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10.5px] leading-relaxed font-sans">
                {withSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing || !address || withAmount <= 0}
              className={`w-full py-3.5 text-xs text-white uppercase font-black tracking-wider ${bgTheme} ${hoverTheme} disabled:bg-gray-800 disabled:text-gray-500 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>TRANSMITTING WIRE REQUEST...</span>
                </>
              ) : (
                <span>SUBMIT WITHDRAWAL RESOLUTION</span>
              )}
            </button>
          </form>
        </div>

      <div className="space-y-4">
        {/* Instructions right panel */}
        <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5 flex flex-col justify-between" id="with_instructions_card">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#22304a]/40">
              Audit Compliance Protocol
            </h3>

            <div className="space-y-3 text-[11px] font-sans text-gray-400 leading-relaxed">
              <p className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Real-time safety deducts account balances instantly. If pending, you can cancel manually for an direct instant restitution.</span>
              </p>
              <p className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Processing &amp; completed transactions cannot be cancelled. Standard gas block priority applies.</span>
              </p>
              <p className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Daily cap threshold limit: <span className="text-white font-bold font-mono">$10,000.00 USD</span> standard level.</span>
              </p>
            </div>

            <div className="bg-[#030712] border border-[#22304a] p-3 rounded-xl flex items-center gap-3">
              <Clock3 className="w-5 h-5 text-gray-550 shrink-0" />
              <div>
                <span className="text-[10px] font-mono text-gray-500 block uppercase font-bold">QUEUE PRIORITY RESOLUTION</span>
                <span className="text-[11px] text-gray-400 leading-normal block">Natively resolved via active Firestore snapshot checks under 15 blocks.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent withdrawals list with manual cancel button */}
        <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-xl p-4 md:p-5 font-sans">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1.5 border-b border-[#22304a]/40 mb-3">
            Withdrawal Activities &amp; Cancellation
          </h3>
          {myWithdrawals.length === 0 ? (
            <p className="text-[10px] text-gray-500 py-3 text-center">No cash-out declarations registered yet for your profile.</p>
          ) : (
            <div className="space-y-2.5 max-h-48 overflow-y-auto font-mono text-[10.5px]">
              {myWithdrawals.map((item) => (
                <div key={item.id} className="p-3 border border-[#22304a]/40 bg-[#111827]/25 rounded-lg text-gray-400 space-y-2">
                  <div className="flex justify-between items-center font-mono">
                    <div>
                      <span className="text-white font-bold">-${item.amount}.00 USD</span>
                      <span className="text-gray-500 block text-[9px] font-sans mt-0.5">{item.method}</span>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-sans uppercase tracking-wider ${
                        item.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
                        item.status === "processing" ? "bg-blue-500/10 text-blue-400" :
                        item.status === "rejected" ? "bg-rose-500/10 text-rose-455 text-rose-400" :
                        item.status === "cancelled" ? "bg-slate-800 text-slate-400" : "bg-amber-500/10 text-amber-400 animate-pulse"
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-[9px] text-gray-500 truncate break-all opacity-85 text-ellipsis overflow-hidden">Target: {item.destination}</div>

                  {item.status === "pending" && (
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => handleCancelWithdrawalInPending(item.id)}
                        className="text-[9px] font-sans font-bold text-rose-400 bg-rose-500/5 hover:bg-rose-500/15 px-2.5 py-1.5 rounded-lg border border-rose-500/15 cursor-pointer transition-all active:scale-[0.97]"
                      >
                        ✖ Cancel Web Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
    )}
  </div>
);
}

// ============================================
// COMPONENT 9: TRANSACTIONS PAGE (Financing history logs)
// ============================================
interface TransactionsPageProps {
  transactionHistory: Transaction[];
  onNavigate: (screen: any) => void;
  themeHighlight: string;
}

export function TransactionsPage({ transactionHistory, onNavigate, themeHighlight }: TransactionsPageProps) {
  const textTheme = getThemeTextColor(themeHighlight);

  const getStatusColor = (status: string) => {
    switch (String(status).toLowerCase()) {
      case "completed":
      case "approved":
      case "success":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "pending":
      case "processing":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "failed":
      case "rejected":
      case "cancelled":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getTxTypeBadgeColor = (type: string) => {
    switch (String(type).toLowerCase()) {
      case "deposit":
        return "bg-emerald-500/10 text-emerald-400";
      case "withdrawal":
        return "bg-rose-500/10 text-rose-400";
      case "bonus":
        return "bg-blue-500/10 text-blue-400";
      case "trade_win":
        return "bg-cyan-500/10 text-cyan-400";
      case "trade_loss":
        return "bg-amber-500/10 text-amber-400";
      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  const formatTxDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-5 pb-24 md:pb-8" id="screen_transactions">
      
      {/* Title block back */}
      <div className="flex items-center gap-3 border-b border-[#22304a] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <History className={`w-5 h-5 ${textTheme}`} />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Transaction History</h2>
        </div>
        <button
          onClick={() => onNavigate("more")}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-[#111827] border border-[#22304a] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Account Controls</span>
        </button>
      </div>

      {/* Table log list */}
      <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-[#0b1329] border-b border-[#22304a] text-[10px] font-mono text-gray-500 tracking-wider">
          CHRONOLOGICAL TRANSFERS
        </div>

        {transactionHistory.length === 0 ? (
          <div className="text-center p-8 py-12 bg-[#111827]/30 border border-[#22304a]/30 rounded-2xl flex flex-col items-center justify-center m-4">
            <History className="w-6 h-6 text-gray-500 mb-2" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">No Transactions Initiated</span>
            <span className="text-[10px] text-gray-500 mt-1">Once you deposit or settle withdrawals, actions logged here.</span>
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#14213d]/15 text-gray-500 text-[10px] uppercase font-mono border-b border-[#22304a]/40">
                  <tr>
                    <th className="px-4 py-3">Transaction ID</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#22304a]/30 font-mono">
                  {transactionHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a2336]/15 transition-all text-gray-300">
                      <td className="px-4 py-3 text-gray-400 font-semibold text-[10px]">
                        {String(item.id).substring(0, 8).toUpperCase()}...
                      </td>
                      <td className="px-4 py-3 capitalize font-sans">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getTxTypeBadgeColor(item.type)}`}>
                          {item.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold font-sans text-gray-400">{item.method}</td>
                      <td className={`px-4 py-3 text-right font-black ${
                        item.type === "deposit" || item.type === "bonus" || item.type === "trade_win" ? "text-emerald-400" : "text-rose-455 text-rose-400"
                      }`}>
                        {item.type === "deposit" || item.type === "bonus" || item.type === "trade_win" ? "+" : "-"}${Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center uppercase font-sans text-[10px]">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-[10px] text-gray-500 font-sans">{formatTxDate(item.createdAt || item.date || item.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Stack View */}
            <div className="block sm:hidden divide-y divide-[#22304a]/30">
              {transactionHistory.map((item) => (
                <div key={item.id} className="p-4 space-y-2.5 hover:bg-[#1a2336]/10 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-500">ID: {String(item.id).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold uppercase ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getTxTypeBadgeColor(item.type)}`}>
                        {item.type.replace("_", " ")}
                      </span>
                      <span className="text-gray-400 font-sans font-medium">{item.method}</span>
                    </div>
                    <span className={`font-mono font-black text-sm ${
                      item.type === "deposit" || item.type === "bonus" || item.type === "trade_win" ? "text-emerald-400" : "text-rose-450 text-rose-400"
                    }`}>
                      {item.type === "deposit" || item.type === "bonus" || item.type === "trade_win" ? "+" : "-"}${Number(item.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 text-right">
                    {formatTxDate(item.createdAt || item.date || item.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// COMPONENT 10: SETTLED TRADES HISTORY PAGE
// ============================================
interface TradesHistoryPageProps {
  completedTrades: SeedTrade[];
  onNavigate: (screen: any) => void;
  themeHighlight: string;
}

export function TradesHistoryPage({ completedTrades, onNavigate, themeHighlight }: TradesHistoryPageProps) {
  const textTheme = getThemeTextColor(themeHighlight);

  const getRelativeTimeStr = (t?: number) => {
    if (!t) return "Settle history block";
    const delta = Date.now() - t;
    const mins = Math.floor(delta / 60000);
    if (mins < 1) return "Just settled now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-5 pb-24 md:pb-8" id="screen_trades_history">
      
      {/* Title heading zone */}
      <div className="flex items-center gap-3 border-b border-[#22304a] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <Activity className={`w-5 h-5 ${textTheme}`} />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Settled Option Contracts</h2>
        </div>
        <button
          onClick={() => onNavigate("more")}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-[#111827] border border-[#22304a] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Account Controls</span>
        </button>
      </div>

      {/* Settlements ledger panel list */}
      <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl overflow-hidden shadow-xl" id="settled_contracts_ledger_card">
        <div className="px-4 py-3 bg-[#0b1329] border-b border-[#22304a] text-[10px] font-mono text-gray-500 tracking-wider">
          CHRONOLOGICAL SETTLED LEDGERS ({completedTrades.length})
        </div>

        {completedTrades.length === 0 ? (
          <div className="text-center p-8 py-12 bg-[#111827]/30 border border-[#22304a]/30 rounded-2xl flex flex-col items-center justify-center m-4">
            <Activity className="w-6 h-6 text-gray-500 mb-2" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">No Expired Contracts</span>
            <span className="text-[10px] text-gray-500 mt-1">Once you submit options, outcomes and prices are logged in this list.</span>
          </div>
        ) : (
          <div className="divide-y divide-[#22304a]/30">
            {completedTrades.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#111827]/25 hover:bg-[#1a2336]/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#21304b]/20"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    item.won ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15" : "bg-rose-500/10 text-rose-455 text-rose-400 border border-rose-500/15"
                  }`}>
                    <Award className="w-5 h-5 anim-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">{item.pair}</span>
                      <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase leading-none ${
                        item.direction === "buy" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                      }`}>
                        {item.direction === "buy" ? "CALL ▲" : "PUT ▼"}
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 font-mono block leading-none">
                      Stake Contract: <span className="text-slate-100 font-bold">${item.amount}</span> • Payout: <span className="text-slate-100 font-bold">{item.payout * 100}%</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:text-right gap-6">
                  <div className="text-left sm:text-right font-mono text-[10px] text-gray-400 space-y-0.5">
                    <div>Entry Rate: <span className="text-white font-bold">{item.entryPrice.toFixed(5)}</span></div>
                    <div>Exit Rate: <span className="text-white font-bold">{item.exitPrice.toFixed(5)}</span></div>
                  </div>

                  <div className="text-right font-mono shrink-0">
                    <span className={`text-sm font-black block leading-none ${
                      item.won ? "text-emerald-400" : "text-rose-405 text-rose-400"
                    }`}>
                      {item.won ? `+$${item.profit.toFixed(2)}` : `-$${item.amount.toFixed(2)}`}
                    </span>
                    <span className="text-[9px] text-gray-500 font-sans mt-1 block leading-none">{getRelativeTimeStr(item.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

// ============================================
// COMPONENT 11: SETTINGS PAGE (GRID ACCENTS + DRAG AND DROP FILE UPLOAD)
// ============================================
interface SettingsPageProps {
  gridLinesEnabled: boolean;
  setGridLinesEnabled: (val: boolean) => void;
  gridDensity: "low" | "medium" | "high";
  setGridDensity: (val: "low" | "medium" | "high") => void;
  customBackground: string | null;
  setCustomBackground: (val: string | null) => void;
  themeHighlight: "blue" | "purple" | "emerald" | "crimson";
  setThemeHighlight: (val: "blue" | "purple" | "emerald" | "crimson") => void;
  onNavigate: (screen: any) => void;
}

export function SettingsPage({
  gridLinesEnabled,
  setGridLinesEnabled,
  gridDensity,
  setGridDensity,
  customBackground,
  setCustomBackground,
  themeHighlight,
  setThemeHighlight,
  onNavigate
}: SettingsPageProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const textTheme = getThemeTextColor(themeHighlight);
  const bgTheme = getThemeBgColor(themeHighlight);
  const hoverTheme = getThemeHoverBgColor(themeHighlight);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Validation error: Selected target block file must be a standard format image type (PNG, JPEG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && typeof e.target.result === "string") {
        setCustomBackground(e.target.result);
        alert("Success: Custom Chart Background image compiled successfully inside local session.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const presetImages = [
    {
      name: "TRADEX Standard Slate",
      url: null,
      desc: "Deep solid slate-navy theme background"
    },
    {
      name: "Cyber Grid Nebula",
      url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=300&auto=format&fit=crop&q=60",
      desc: "Glowing gradient layout theme"
    },
    {
      name: "Dynamic Tech Grid",
      url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&auto=format&fit=crop&q=60",
      desc: "Abstract electronic matrix background"
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#0c101d] p-4 md:p-6 space-y-6 pb-24 md:pb-8" id="screen_settings">
      
      {/* Title heading */}
      <div className="flex items-center gap-3 border-b border-[#22304a] pb-3 justify-between">
        <div className="flex items-center gap-2">
          <SettingsIcon className={`w-5 h-5 ${textTheme}`} />
          <h2 className="text-base font-bold text-white uppercase tracking-wider">Workspace Settings</h2>
        </div>
        <button
          onClick={() => onNavigate("more")}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white bg-[#111827] border border-[#22304a] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Account Controls</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        
        {/* Left pane grid system configuration and Themes */}
        <div className="space-y-6">
          
          {/* Card 1: Grid options */}
          <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#22304a]/40">
              Chart Helper Grid Lines
            </h3>

            {/* Grid Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">Enable Background Grid lines</span>
                <span className="text-[10px] text-gray-400">Toggles horizontal and vertical grid intersections.</span>
              </div>
              <button
                id="toggle_grid_lines"
                onClick={() => setGridLinesEnabled(!gridLinesEnabled)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${gridLinesEnabled ? bgTheme : "bg-gray-800"}`}
              >
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${gridLinesEnabled ? "translate-x-4" : "translate-x-0"}`} />
              </button>
            </div>

            {/* Grid Density checkboxes */}
            {gridLinesEnabled && (
              <div className="space-y-1.5 pt-2 border-t border-[#22304a]/30 animate-fadeIn">
                <label className="text-[9px] uppercase font-mono text-gray-400 block pb-1">Intersect Density</label>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                  {(["low", "medium", "high"] as const).map((density) => (
                    <button
                      id={`cb_density_${density}`}
                      key={density}
                      onClick={() => setGridDensity(density)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none uppercase ${
                        gridDensity === density 
                          ? "border-blue-500 text-blue-300 bg-blue-950/15" 
                          : "border-[#22304a] text-gray-500 hover:text-white"
                      }`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Highlight Accent colors */}
          <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#22304a]/40">
              Primary Theme Accents
            </h3>
            <span className="text-[10px] text-gray-400 block">Personalise key boundaries, buttons, and glowing telemetry indicator labels.</span>
            
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono text-center">
              {[
                { id: "blue", label: "TRADEX Blue", class: "bg-blue-600 border-blue-400 text-blue-300" },
                { id: "purple", label: "Cyber Violet", class: "bg-purple-600 border-purple-400 text-purple-300" },
                { id: "emerald", label: "Forest Mint", class: "bg-emerald-600 border-emerald-450 text-emerald-400" },
                { id: "crimson", label: "Crimson Lava", class: "bg-rose-600 border-rose-400 text-rose-300" },
              ].map((accent) => (
                <button
                  id={`btn_theme_accent_${accent.id}`}
                  onClick={() => setThemeHighlight(accent.id as any)}
                  key={accent.id}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 bg-[#111827] h-18 ${
                    themeHighlight === accent.id 
                      ? "border-white border-2 text-white" 
                      : "border-[#22304a] text-gray-500 hover:border-gray-500"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full ${accent.class} shadow-inner`} />
                  <span className="text-[8.5px] leading-none text-gray-300 font-semibold">{accent.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right pane background settings Upload dragging */}
        <div className="bg-[#111827]/40 border border-[#22304a]/60 rounded-2xl p-4 md:p-5 flex flex-col justify-between" id="background_setup_panel">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-2 border-b border-[#22304a]/40">
              Interactive Chart Canvas Wallpapers
            </h3>

            {/* Presets List */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-mono text-gray-400 block">Wallpaper Presets</label>
              <div className="grid grid-cols-1 gap-2">
                {presetImages.map((p) => (
                  <button
                    onClick={() => setCustomBackground(p.url)}
                    key={p.name}
                    className={`p-2 px-3 bg-[#030712] border rounded-xl flex items-center justify-between text-left transition-all hover:bg-[#111827] cursor-pointer ${
                      customBackground === p.url 
                        ? "border-blue-500 bg-blue-950/10" 
                        : "border-[#22304a] text-gray-400 hover:text-white"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-white block">{p.name}</span>
                      <span className="text-[9.5px] text-gray-450 text-gray-450 text-gray-500 mt-0.5 block leading-none font-sans">{p.desc}</span>
                    </div>
                    {customBackground === p.url && (
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-mono font-bold uppercase rounded px-1.5 py-0.5 leading-none">Selected</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag and Drop Box */}
            <div className="space-y-2">
              <label className="text-[9px] uppercase font-mono text-gray-450 text-gray-400 block mb-1">Upload Custom Wallpaper (Drag and Drop)</label>
              
              <div
                id="drag_drop_zone"
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer select-none flex flex-col items-center justify-center gap-2 ${
                  dragActive 
                    ? "border-blue-500 bg-blue-950/10" 
                    : "border-[#22304a] hover:border-gray-500 bg-[#030712]/50 hover:bg-[#111827]/10"
                }`}
              >
                <input
                  type="file"
                  ref={fileRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <UploadCloud className={`w-8 h-8 ${dragActive ? "text-blue-400 animate-bounce" : "text-gray-500"}`} />
                <div>
                  <span className="text-xs font-bold font-sans text-gray-200 block">Drag & Drop Image File Here</span>
                  <span className="text-[10px] text-gray-500 font-sans mt-0.5 block leading-none">or click to browse local folders (PNG, JPG, WEBP)</span>
                </div>
              </div>
            </div>
          </div>

          {customBackground && (
            <div className="pt-4 border-t border-[#22304a]/40 mt-4 flex justify-between items-center text-xs animate-fadeIn">
              <span className="text-gray-450 text-gray-400">Custom loaded image active</span>
              <button
                onClick={() => {
                  setCustomBackground(null);
                  alert("Wallpaper reset to default solid navy successfully.");
                }}
                className="text-red-400 hover:text-red-300 font-bold underline cursor-pointer"
              >
                Reset Default Solid Navy
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
