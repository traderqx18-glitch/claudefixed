import * as React from "react";
import { useState, useEffect, useRef } from "react";
import tradexLogoTransparent from "./assets/images/tradex_transparent_logo_1780141365068.png";
import tradexLogoWhite from "./assets/images/tradex_white_bg_logo_1780141416887.png";
import tradexIconOnly from "./assets/images/tradex_icon_only_1780141439591.png";
import tradexHorizontal from "./assets/images/tradex_horizontal_logo_1780141464208.png";
import { 
  TrendingUp, 
  Lock, 
  Mail, 
  Check, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Activity, 
  AlertCircle,
  Clock,
  ChevronDown,
  Settings,
  Sliders,
  DollarSign,
  Plus,
  Minus,
  Briefcase,
  Play,
  TrendingDown,
  LogOut,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen,
  Pencil,
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
  Zap,
  Loader2
} from "lucide-react";
import Chart, { Candle, Trade, Drawing } from "./components/Chart";
import { 
  SupportPage, 
  ProfilePage, 
  TournamentPage, 
  MorePage, 
  AnalyticsPage, 
  LeaderboardPage, 
  DepositPage, 
  WithdrawalPage, 
  TransactionsPage, 
  TradesHistoryPage, 
  SettingsPage 
} from "./components/Pages";
import { auth } from "./firebase/firebase";
import { firestoreDb as db, COUNTRY_CODELIST, getAssets, getHistoricalCandles, submitLiveTick, AssetDocument, CandleDocument } from "./firebase/firestore";
import { loginWithEmail, signupWithEmail, logout, watchAuthState } from "./firebase/auth";
const isSupabaseConfigured = true;

// Upgraded 26 assets to support the professional OTC categories
const ASSETS = [
  // Forex OTC
  { pair: "EUR/USD OTC", basePrice: 1.08542, scale: 5, payout: 0.92, category: "Forex OTC" },
  { pair: "GBP/USD OTC", basePrice: 1.26384, scale: 5, payout: 0.88, category: "Forex OTC" },
  { pair: "AUD/CAD OTC", basePrice: 0.91254, scale: 5, payout: 0.89, category: "Forex OTC" },
  { pair: "USD/JPY OTC", basePrice: 156.421, scale: 3, payout: 0.86, category: "Forex OTC" },
  { pair: "USD/CAD OTC", basePrice: 1.36540, scale: 5, payout: 0.87, category: "Forex OTC" },
  { pair: "EUR/GBP OTC", basePrice: 0.85420, scale: 5, payout: 0.86, category: "Forex OTC" },
  { pair: "NZD/USD OTC", basePrice: 0.61240, scale: 5, payout: 0.85, category: "Forex OTC" },
  { pair: "AUD/USD OTC", basePrice: 0.66520, scale: 5, payout: 0.85, category: "Forex OTC" },
  { pair: "USD/PKR OTC", basePrice: 278.50, scale: 2, payout: 0.85, category: "Forex OTC" },
  { pair: "USD/INR OTC", basePrice: 83.30, scale: 2, payout: 0.85, category: "Forex OTC" },

  // Crypto OTC
  { pair: "BTC/USDT OTC", basePrice: 68421.50, scale: 2, payout: 0.91, category: "Crypto OTC" },
  { pair: "ETH/USDT OTC", basePrice: 3812.40, scale: 2, payout: 0.89, category: "Crypto OTC" },
  { pair: "BNB/USDT OTC", basePrice: 595.40, scale: 2, payout: 0.85, category: "Crypto OTC" },
  { pair: "SOL/USDT OTC", basePrice: 164.20, scale: 2, payout: 0.85, category: "Crypto OTC" },
  { pair: "XRP/USDT OTC", basePrice: 0.5140, scale: 4, payout: 0.82, category: "Crypto OTC" },
  { pair: "DOGE/USDT OTC", basePrice: 0.1425, scale: 4, payout: 0.80, category: "Crypto OTC" },

  // Commodities OTC
  { pair: "Gold OTC", basePrice: 2342.50, scale: 2, payout: 0.92, category: "Commodities OTC" },
  { pair: "Silver OTC", basePrice: 30.45, scale: 2, payout: 0.88, category: "Commodities OTC" },
  { pair: "Crude Oil OTC", basePrice: 82.30, scale: 2, payout: 0.85, category: "Commodities OTC" },
  { pair: "Natural Gas OTC", basePrice: 2.65, scale: 3, payout: 0.82, category: "Commodities OTC" },

  // Stocks OTC
  { pair: "Apple OTC", basePrice: 189.84, scale: 2, payout: 0.90, category: "Stocks OTC" },
  { pair: "Microsoft OTC", basePrice: 421.90, scale: 2, payout: 0.89, category: "Stocks OTC" },
  { pair: "Amazon OTC", basePrice: 180.50, scale: 2, payout: 0.88, category: "Stocks OTC" },
  { pair: "Tesla OTC", basePrice: 174.60, scale: 2, payout: 0.88, category: "Stocks OTC" },
  { pair: "Google OTC", basePrice: 173.50, scale: 2, payout: 0.87, category: "Stocks OTC" },
  { pair: "Meta OTC", basePrice: 475.20, scale: 2, payout: 0.87, category: "Stocks OTC" },
  { pair: "Nvidia OTC", basePrice: 1064.20, scale: 2, payout: 0.86, category: "Stocks OTC" },
  { pair: "Boeing OTC", basePrice: 178.40, scale: 2, payout: 0.84, category: "Stocks OTC" }
];

const COUNTRIES = [
  "Pakistan",
  "India",
  "Bangladesh",
  "UAE",
  "Saudi Arabia",
  "Qatar",
  "Bahrain",
  "Oman",
  "Kuwait",
  "UK",
  "USA",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Italy",
  "Spain",
  "Turkey",
  "South Africa",
  "Singapore",
  "Japan",
  "Brazil",
  "Mexico",
  "Argentina",
  "Malaysia",
  "Indonesia"
];

export default function App() {
  // Page Navigation / Auth state flow
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("tadex_logged_in") === "true";
  });
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("traderqx18@gmail.com");
  const [password, setPassword] = useState("password123");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [unauthView, setUnauthView] = useState<"landing" | "auth">("landing");
  const [country, setCountry] = useState("United Arab Emirates");
  const [countryCode, setCountryCode] = useState("AE");
  const [countryFlag, setCountryFlag] = useState("🇦🇪");
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  // Dashboard Options and Settings State
  const [activePair, setActivePair] = useState("EUR/USD OTC");
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "1H" | "4H" | "1D">("1m");
  const [chartType, setChartType] = useState<"candles" | "area">("candles");
  const [zoomLevel, setZoomLevel] = useState(1.0); // 0.6 to 1.5 spacing multiplier

  // Chart configuration indicators
  const [showIndicatorsPanel, setShowIndicatorsPanel] = useState(false);
  const [showPairDropdown, setShowPairDropdown] = useState(false);
  const [assetSearchQuery, setAssetSearchQuery] = useState("");
  const [selectedAssetCategory, setSelectedAssetCategory] = useState("All");
  const [indicators, setIndicators] = useState({
    ma: false,
    bb: false,
    rsi: false
  });

  // Drawing Tools State
  const [showDrawingToolsPanel, setShowDrawingToolsPanel] = useState(false);
  const [activeDrawingTool, setActiveDrawingTool] = useState<"horizontal" | "trend" | "rectangle" | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);

  // Queue for desktop notifications & floating markers for mobile
  const [notificationQueue, setNotificationQueue] = useState<{ id: string; msg: string; type: "win" | "loss" | "info" | "success" | "error" | "system"; duration?: number }[]>([]);
  const [activeNotification, setActiveNotification] = useState<{ id: string; msg: string; type: "win" | "loss" | "info" | "success" | "error" | "system"; duration?: number } | null>(null);
  const [floatingIndicators, setFloatingIndicators] = useState<{
    id: string;
    amountText: string;
    isWin: boolean;
    yPrice: number;
    createdAt: number;
  }[]>([]);

  // Trigger non-blocking in-app notification HUD
  const showToast = (msg: string, type: "win" | "loss" | "info" | "success" | "error" | "system" = "info", duration?: number) => {
    const id = "toast_" + Math.random().toString(36).substr(2, 9);
    setNotificationQueue((prev) => [...prev, { id, msg, type, duration }]);
  };

  // Synchronous FIFO queue effect for Desktop Notifications
  useEffect(() => {
    if (!activeNotification && notificationQueue.length > 0) {
      const nextNotification = notificationQueue[0];
      setNotificationQueue((prev) => prev.slice(1));
      setActiveNotification(nextNotification);

      const displayDuration = nextNotification.duration || ((nextNotification.type === "win" || nextNotification.type === "loss") ? 3200 : 4500);

      const timer = setTimeout(() => {
        setActiveNotification(null);
      }, displayDuration);

      return () => clearTimeout(timer);
    }
  }, [notificationQueue, activeNotification]);

  // User Account Balances
  const [accountType, setAccountType] = useState<"demo" | "live">("demo");
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [demoBalance, setDemoBalanceState] = useState(10000.00);
  const [liveBalance, setLiveBalanceState] = useState(1452.80);
  const [showEditDemoBalance, setShowEditDemoBalance] = useState(false);
  const [editDemoInput, setEditDemoInput] = useState("");

  const setDemoBalance = (val: number | ((curr: number) => number)) => {
    setDemoBalanceState((curr) => {
      const next = typeof val === "function" ? val(curr) : val;
      const rounded = Number(next.toFixed(2));
      return Math.max(0, rounded);
    });
  };

  const setLiveBalance = (val: number | ((curr: number) => number)) => {
    setLiveBalanceState((curr) => {
      const next = typeof val === "function" ? val(curr) : val;
      const rounded = Number(next.toFixed(2));
      return Math.max(0, rounded);
    });
  };

  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const CURRENCY_RATES: Record<string, { rate: number; symbol: string }> = {
    USD: { rate: 1.0, symbol: "$" },
    PKR: { rate: 278.5, symbol: "₨" },
    INR: { rate: 83.3, symbol: "₹" },
    AED: { rate: 3.67, symbol: "AED " },
    EUR: { rate: 0.92, symbol: "€" },
    GBP: { rate: 0.79, symbol: "£" },
    TRY: { rate: 32.2, symbol: "₺" },
    SAR: { rate: 3.75, symbol: "SR " },
    QAR: { rate: 3.64, symbol: "QR " },
    CAD: { rate: 1.36, symbol: "C$" },
    AUD: { rate: 1.51, symbol: "A$" }
  };

  const formatCurrency = (amountUSD: any) => {
    let num = Number(amountUSD);
    if (amountUSD === null || amountUSD === undefined || isNaN(num)) {
      num = 0.00;
    }
    const config = CURRENCY_RATES[selectedCurrency] || CURRENCY_RATES.USD;
    const converted = num * config.rate;
    if (isNaN(converted)) {
      return `${config.symbol}0.00`;
    }
    return `${config.symbol}${converted.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const [traderName, setTraderName] = useState("QXT Funded Trader");
  const [traderID, setTraderID] = useState("ID: 4629104");

  // Navigation state system
  const [currentScreen, setCurrentScreen] = useState<
    "chart" | "support" | "profile" | "tournament" | "more" |
    "analytics" | "leaderboard" | "deposit" | "withdrawal" | "transactions" | "trades_history" | "settings"
  >("chart");

  // Grid system settings state
  const [gridLinesEnabled, setGridLinesEnabled] = useState(true);
  const [gridDensity, setGridDensity] = useState<"low" | "medium" | "high">("medium");
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const [themeHighlight, setThemeHighlight] = useState<"blue" | "purple" | "emerald" | "crimson">("blue");

  // Transactions ledger history
  const [transactionHistory, setTransactionHistory] = useState([
    {
      id: "tx_1",
      type: "deposit",
      amount: 1000.00,
      method: "USDT (TRC20)",
      status: "completed",
      date: "2026-05-24 14:12 UTC"
    },
    {
      id: "tx_2",
      type: "withdrawal",
      amount: 200.00,
      method: "Bitcoin (BTC)",
      status: "completed",
      date: "2026-05-28 09:44 UTC"
    },
    {
      id: "tx_3",
      type: "deposit",
      amount: 500.00,
      method: "USDT (TRC20)",
      status: "completed",
      date: "2026-05-29 18:31 UTC"
    }
  ]);

  // Trade Control Panel Inputs
  const [tradeAmount, setTradeAmount] = useState(50);
  const [tradeMinutes, setTradeMinutes] = useState(1);
  const [tradeSeconds, setTradeSeconds] = useState(0);
  const [showTimeSelector, setShowTimeSelector] = useState(false);

  // Active / History Trades with seeds for full aesthetics
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [completedTrades, setCompletedTrades] = useState<{
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
  }[]>(() => {
    return [
      {
        id: "t_seed_1",
        pair: "EUR/USD OTC",
        direction: "buy",
        amount: 100,
        payout: 0.92,
        won: true,
        profit: 92.00,
        entryPrice: 1.08412,
        exitPrice: 1.08542,
        timestamp: Date.now() - 3600000 * 2 // 2 hours ago
      },
      {
        id: "t_seed_2",
        pair: "GBP/USD OTC",
        direction: "sell",
        amount: 200,
        payout: 0.88,
        won: false,
        profit: -200.00,
        entryPrice: 1.26410,
        exitPrice: 1.26524,
        timestamp: Date.now() - 3600000 * 4 // 4 hours ago
      },
      {
        id: "t_seed_3",
        pair: "AUD/CAD OTC",
        direction: "buy",
        amount: 150,
        payout: 0.89,
        won: true,
        profit: 133.50,
        entryPrice: 0.91120,
        exitPrice: 0.91254,
        timestamp: Date.now() - 3600000 * 6 // 6 hours ago
      },
      {
        id: "t_seed_4",
        pair: "BTC/USDT OTC",
        direction: "sell",
        amount: 50,
        payout: 0.91,
        won: true,
        profit: 45.50,
        entryPrice: 68450.00,
        exitPrice: 68421.50,
        timestamp: Date.now() - 3600000 * 8 // 8 hours ago
      }
    ];
  });

  // Simulation State Variables
  const [currentPrice, setCurrentPrice] = useState(0.91254);
  const [candles, setCandles] = useState<Candle[]>([]);
  const [lastTickDirection, setLastTickDirection] = useState<"up" | "down" | "flat">("flat");
  const [showResultModal, setShowResultModal] = useState<any | null>(null);

  // Mobile trades slide-up bottom sheet
  const [showMobileTradesSheet, setShowMobileTradesSheet] = useState(false);
  const [sheetActiveTab, setSheetActiveTab] = useState<"open" | "history">("open");

  // Real-time UTC clock synchronized with standard traders room
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace("T", " ").substring(0, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Firebase Auth and State Synchronizer Hook
  useEffect(() => {
    const unsubscribe = watchAuthState(async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setEmail(user.email || "");
        localStorage.setItem("tadex_logged_in", "true");
        await loadDatabaseSync(user.uid, user.email || "");
      } else {
        setIsLoggedIn(false);
        localStorage.removeItem("tadex_logged_in");
        // Set defaults on logout
        setTraderName("QXT Funded Trader");
        setTraderID("ID: 4629104");
        setDemoBalance(10000.00);
        setLiveBalance(1452.80);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const fetchTradesFromDB = async () => {
    try {
      let uid = "guest";
      if (auth.currentUser) {
        uid = auth.currentUser.uid;
      }
      
      const dbTrades = await db.getTrades(uid);
      if (dbTrades) {
        // 1. Process active (open) trades
        const openTrades = dbTrades
          .filter((t) => t.status === "open")
          .map((t) => {
            const openTimeMs = typeof t.open_time === "number" ? t.open_time : new Date(t.open_time).getTime();
            const expiryTimeMs = typeof t.expiry_time === "number" ? t.expiry_time : new Date(t.expiry_time).getTime();
            return {
              id: t.id,
              pair: t.asset_symbol || t.pair || "EUR/USD",
              direction: (t.direction === "up" || t.direction === "buy") ? "buy" : "sell",
              amount: Number(t.amount),
              entryPrice: Number(t.open_price || t.entry_price || 1.0),
              entryTime: openTimeMs,
              expirationTime: expiryTimeMs,
              duration: Math.max(1, Math.round((expiryTimeMs - openTimeMs) / 1000)),
              payout: getAssetDetails(t.asset_symbol || t.pair || "EUR/USD").payout
            };
          });

        // 2. Process completed trades (won/lost/draw)
        const closedTrades = dbTrades
          .filter((t) => t.status !== "open")
          .map((t) => {
            const openTimeMs = typeof t.open_time === "number" ? t.open_time : new Date(t.open_time).getTime();
            return {
              id: t.id,
              pair: t.asset_symbol || t.pair || "EUR/USD",
              direction: (t.direction === "up" || t.direction === "buy") ? "buy" : "sell",
              amount: Number(t.amount),
              payout: getAssetDetails(t.asset_symbol || t.pair || "EUR/USD").payout,
              won: t.status === "won" || t.result === "won",
              profit: Number(t.pnl ?? t.profit ?? 0),
              entryPrice: Number(t.open_price || t.entry_price || 1.0),
              exitPrice: Number((t.close_price ?? t.exit_price ?? t.open_price) || 1.0),
              timestamp: openTimeMs
            };
          });

        setActiveTrades((prev) => {
          const preservedLocal = prev.filter((t) => t.isPendingDb || t.isOfflineFallback);
          const dbIds = new Set(openTrades.map((t) => t.id));
          const filteredLocal = preservedLocal.filter((t) => !dbIds.has(t.id));
          return [...filteredLocal, ...openTrades];
        });
        setCompletedTrades(closedTrades as any);
      }
    } catch (err) {
      console.error("Error fetching trades from database:", err);
    }
  };

  const loadDatabaseSync = async (uid: string, userEmail: string) => {
    try {
      // Fetch or create profile
      let profile = await db.getProfile(uid);
      if (!profile) {
        // Create new profile if not found
        profile = {
          uid: uid,
          id: uid,
          fullName: userEmail.split("@")[0].toUpperCase() || "NEW TRADER",
          email: userEmail,
          country: country || "United Arab Emirates",
          account_status: "Verified (Level 1)",
          demoBalance: 10000.0,
          liveBalance: 0.0
        };
        profile = await db.createProfile(profile);
      }

      // Sync views to local React states
      setTraderName(profile.fullName || profile.full_name || "NEW TRADER");
      setTraderID(`ID: ${profile.id.substring(0, 8)}`);
      setCountry(profile.country || "United Arab Emirates");
      setCountryCode(profile.countryCode || "AE");
      setCountryFlag(profile.countryFlag || "🇦🇪");
      setDemoBalance(profile.demoBalance ?? profile.demo_balance ?? 10000);
      setLiveBalance(profile.liveBalance ?? profile.live_balance ?? 0);

      // Fetch dynamic user records from DB streams
      await fetchTradesFromDB();

      const txs = await db.getTransactions(uid);
      if (txs && txs.length > 0) {
        const mappedTransactions = txs.map((tx) => ({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          method: tx.method,
          status: tx.status,
          date: new Date(tx.created_at).toISOString().replace("T", " ").substring(0, 16) + " UTC"
        }));
        setTransactionHistory(mappedTransactions);
      }
    } catch (e) {
      console.error("Error loading database sync structures:", e);
    }
  };

  // Poll to keep trades in sync with database (source of truth)
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const pollInterval = setInterval(async () => {
      await fetchTradesFromDB();

      // Also sync user profile balance periodically
      try {
        if (auth.currentUser) {
          const profile = await db.getProfile(auth.currentUser.uid);
          if (profile) {
            setDemoBalance(profile.demo_balance);
            setLiveBalance(profile.live_balance);
          }
        }
      } catch (err) {
        console.warn("Error polling user database profile balance:", err);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [isLoggedIn]);

  // Fetch asset details helper
  const getAssetDetails = (pairName: string) => {
    return ASSETS.find(a => a.pair === pairName) || ASSETS[0];
  };

  // Fetch real candles from Firebase database matching exact asset selection as a single source of truth
  useEffect(() => {
    let isMounted = true;
    const loadCandles = async () => {
      const asset = getAssetDetails(activePair);
      // Map asset symbol to match id in Firebase, e.g. "EUR/USD OTC" to "EUR_USD_OTC"
      const assetId = asset.pair.replace(/\//g, "_").replace(/\s+/g, "_");
      
      try {
        const rawCandles = await getHistoricalCandles(assetId, asset.basePrice);
        if (!isMounted) return;
        
        const mappedCandles: Candle[] = rawCandles.map(c => ({
          time: c.timestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close
        }));
        
        setCandles(mappedCandles);
        if (mappedCandles.length > 0) {
          setCurrentPrice(mappedCandles[mappedCandles.length - 1].close);
        } else {
          setCurrentPrice(asset.basePrice);
        }
      } catch (err) {
        console.error("Failed to load historical candles:", err);
      }
    };
    loadCandles();
    return () => {
      isMounted = false;
    };
  }, [activePair]);

  // Real-time price feed randomizer tick simulation loop with Firestore streaming synchronization
  useEffect(() => {
    const interval = setInterval(() => {
      const asset = getAssetDetails(activePair);
      const volatility = 0.00015;
      const rawChange = (Math.random() - 0.495) * (currentPrice * volatility);
      const newPrice = currentPrice + rawChange;

      if (rawChange > 0) setLastTickDirection("up");
      else if (rawChange < 0) setLastTickDirection("down");
      else setLastTickDirection("flat");

      setCurrentPrice(newPrice);

      // Submit live tick price to the Firestore collection
      const assetId = asset.pair.replace(/\//g, "_").replace(/\s+/g, "_");
      submitLiveTick(assetId, newPrice, asset.basePrice);

      // Update rightmost live candle close value
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const list = [...prev];
        const last = list[list.length - 1];
        last.close = newPrice;
        last.high = Math.max(last.high, newPrice);
        last.low = Math.min(last.low, newPrice);
        return list;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [currentPrice, activePair]);

  // Track trade countdown and auto execution expirations
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const expired: string[] = [];

      activeTrades.forEach((trade) => {
        if (now >= trade.expirationTime) {
          expired.push(trade.id);
        }
      });

      if (expired.length > 0) {
        // Resolve expired trades
        expired.forEach(async (id) => {
          const trade = activeTrades.find((t) => t.id === id);
          if (!trade) return;

          const assetDetails = getAssetDetails(trade.pair);
          const assetPrice = (trade.pair === activePair) ? currentPrice : (assetDetails ? assetDetails.basePrice : currentPrice);

          const isUp = trade.direction === "buy";
          const isDraw = assetPrice === trade.entryPrice;
          const won = !isDraw && (isUp ? assetPrice > trade.entryPrice : assetPrice < trade.entryPrice);
          const resultStatus = isDraw ? "draw" : (won ? "won" : "lost");
          const profit = resultStatus === "won" ? trade.amount * trade.payout : (resultStatus === "draw" ? 0 : -trade.amount);

          // Adjust user balance immediately
          if (auth.currentUser) {
            try {
              const uid = auth.currentUser.uid;
              // Fetch latest profile state to avoid race condition on concurrent trades
              const dbProfile = await db.getProfile(uid);
              if (dbProfile) {
                const dbBal = accountType === "demo" ? dbProfile.demo_balance : dbProfile.live_balance;
                await db.updateBalance(uid, accountType, dbBal + profit);
              }
            } catch (err) {
              console.error("Error adjusting DB user balance on expiration:", err);
            }
          } else {
            // Offline Mode balance adjustment
            if (accountType === "demo") {
              setDemoBalance((b) => {
                const updated = b + profit;
                db.updateBalance("guest", "demo", updated);
                return updated;
              });
            } else {
              setLiveBalance((b) => {
                const updated = b + profit;
                db.updateBalance("guest", "live", updated);
                return updated;
              });
            }
          }

          // Sync resolved status to Supabase (uses status: "won" / "lost" / "draw")
          try {
            await db.resolveTrade(trade.id, resultStatus, profit, assetPrice);
          } catch (rErr) {
            console.error("Error writing resolution to database:", rErr);
          }

          // Refresh source of truth from Database
          await fetchTradesFromDB();

          // Display a compact notification matching responsive requirements
          const isMobileViewport = window.innerWidth < 768;
          const outcomeText = resultStatus === "won" 
            ? `WIN +${(trade.amount * trade.payout).toFixed(2)} USD` 
            : (resultStatus === "draw" ? "DRAW 0.00 USD" : `LOSS -${trade.amount.toFixed(2)} USD`);

          if (isMobileViewport) {
            const formattedMobilePayout = (trade.amount * trade.payout) % 1 === 0 
              ? (trade.amount * trade.payout).toFixed(0) 
              : (trade.amount * trade.payout).toFixed(2);
            const formattedMobileStake = trade.amount % 1 === 0 
              ? trade.amount.toFixed(0) 
              : trade.amount.toFixed(2);

            const indicator = {
              id: Math.random().toString(),
              amountText: resultStatus === "won" ? `+${formattedMobilePayout} USD` : (resultStatus === "draw" ? "0.00 USD" : `-${formattedMobileStake} USD`),
              isWin: resultStatus === "won",
              yPrice: assetPrice,
              createdAt: Date.now()
            };
            setFloatingIndicators((prev) => [...prev, indicator]);
            setTimeout(() => {
              setFloatingIndicators((prev) => prev.filter((ind) => ind.id !== indicator.id));
            }, 2000);
          } else {
            setNotificationQueue((prev) => [...prev, { id: Math.random().toString(), msg: outcomeText, type: resultStatus === "won" ? "win" : "loss" }]);
          }
        });

        // Filter active status locally
        setActiveTrades((prev) => prev.filter((t) => !expired.includes(t.id)));
      }
    }, 100);

    return () => clearInterval(timer);
  }, [activeTrades, currentPrice, accountType, activePair]);

  const handleTabChange = (tabId: "login" | "register") => {
    setActiveTab(tabId);
    setAuthError(null);
    setAuthSuccess(null);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setAuthError(null);
    setAuthSuccess(null);

    if (activeTab === "register" && password !== confirmPassword && confirmPassword !== "") {
      setAuthError("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    // 1. Simulation Offline Path (Highly robust fallback matching exactly all rules)
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        let simUsers = JSON.parse(localStorage.getItem("tadex_sim_users") || "{}");
        // Ensure default account exists in mock container
        if (!simUsers["traderqx18@gmail.com"]) {
          simUsers["traderqx18@gmail.com"] = "password123";
        }

        const cleanedEmail = email.trim().toLowerCase();

        if (activeTab === "login") {
          const registeredPassword = simUsers[cleanedEmail];
          if (!registeredPassword) {
            setAuthError("Account not found. Please create an account first.");
            setIsLoading(false);
            return;
          }
          if (registeredPassword !== password) {
            setAuthError("Incorrect password");
            setIsLoading(false);
            return;
          }
          // Login Success
          setAuthError(null);
          setIsLoggedIn(true);
          localStorage.setItem("tadex_logged_in", "true");
        } else if (activeTab === "register") {
          if (simUsers[cleanedEmail]) {
            setAuthError("An account with this email already exists.");
            setIsLoading(false);
            return;
          }
          // Create Mock User
          simUsers[cleanedEmail] = password;
          localStorage.setItem("tadex_sim_users", JSON.stringify(simUsers));

          // Seed local profiles cache so getProfile can work offline for simulated user
          const mockProf = {
            id: "u_" + Math.random().toString(36).substr(2, 9),
            full_name: (document.getElementById("input_name") as HTMLInputElement)?.value || email.split("@")[0].toUpperCase(),
            email: email,
            country: country || "United Arab Emirates",
            account_status: "Verified (Level 1)",
            demo_balance: 10000.0,
            live_balance: 1452.80
          };
          localStorage.setItem(`tadex_prof_${mockProf.id}`, JSON.stringify(mockProf));

          setAuthSuccess("Account created successfully!");
          setAuthError(null);
          setTimeout(() => {
            setActiveTab("login");
            setAuthSuccess(null);
          }, 1500);
        }
        setIsLoading(false);
      }, 1000);
      return;
    }

    // 2. Online Mode Path
    try {
      if (activeTab === "login") {
        try {
          await loginWithEmail(email.trim(), password);
        } catch (error: any) {
          const errCode = error.code || "";
          const errMsg = error.message || "";
          if (errCode === "auth/user-not-found" || errMsg.includes("user-not-found")) {
            throw new Error("Account not found. Please create an account first.");
          } else if (errCode === "auth/wrong-password" || errCode === "auth/invalid-credential" || errMsg.includes("wrong-password") || errMsg.includes("invalid-credential")) {
            throw new Error("Incorrect password");
          } else if (errCode === "auth/network-request-failed" || errMsg.includes("network")) {
            throw new Error("Connection problem. Please try again.");
          } else {
            throw new Error("Incorrect password");
          }
        }

        // Login completed successfully
        setAuthError(null);
        setIsLoggedIn(true);
        localStorage.setItem("tadex_logged_in", "true");
        setIsLoading(false);

      } else if (activeTab === "register") {
        const nameInput = (document.getElementById("input_name") as HTMLInputElement)?.value || email.split("@")[0];

        let credential;
        try {
          credential = await signupWithEmail(email.trim(), password);
        } catch (error: any) {
          const errCode = error.code || "";
          const errMsg = error.message || "";
          if (errCode === "auth/email-already-in-use" || errMsg.includes("email-already-in-use")) {
            throw new Error("An account with this email already exists.");
          } else if (errCode === "auth/network-request-failed" || errMsg.includes("network")) {
            throw new Error("Connection problem. Please try again.");
          } else {
            throw new Error(error.message || "An error occurred during registration.");
          }
        }

        // Create Profile document for user in firestore (which automatically also sets up Wallet document in high compatibility format)
        await db.createProfile({
          uid: credential.user.uid,
          email: email.trim(),
          fullName: nameInput,
          username: email.trim().split("@")[0],
          country: country
        });

        setAuthSuccess("Account created successfully!");
        setAuthError(null);
        setIsLoading(false);
        setTimeout(() => {
          setActiveTab("login");
          setAuthSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      setIsLoading(false);
      let friendlyMsg = err.message || "";
      const errStr = friendlyMsg.toLowerCase();
      
      if (errStr.includes("invalid login credentials") || errStr.includes("invalid credentials") || errStr.includes("wrong-password") || errStr.includes("invalid-credential")) {
        friendlyMsg = "Incorrect password";
      } else if (errStr.includes("user_not_found") || errStr.includes("user not found") || errStr.includes("user-not-found")) {
        friendlyMsg = "Account not found. Please create an account first.";
      } else if (errStr.includes("email already exists") || errStr.includes("already registered") || errStr.includes("already exists") || errStr.includes("email_taken") || errStr.includes("user already exists") || errStr.includes("email-already-in-use")) {
        friendlyMsg = "An account with this email already exists.";
      } else if (errStr.includes("network_error") || errStr.includes("network") || errStr.includes("fetch") || errStr.includes("connection") || errStr.includes("failed to fetch")) {
        friendlyMsg = "Connection problem. Please try again.";
      }
      
      setAuthError(friendlyMsg);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Firebase sign out error:", err);
    }
    setIsLoggedIn(false);
    localStorage.removeItem("tadex_logged_in");
    setUnauthView("landing");
  };

  const handlePlaceTrade = async (direction: "buy" | "sell") => {
    const currentBalance = accountType === "demo" ? demoBalance : liveBalance;

    // 1. handlePlaceTrade() entry
    console.log("[TRACE DEBUG 1] handlePlaceTrade() entry:", {
      direction,
      tradeAmount,
      tradeMinutes,
      tradeSeconds,
      accountType,
      currentBalance
    });

    // 5. balance before trade
    console.log("[TRACE DEBUG 5] balance before trade:", currentBalance);

    if (tradeAmount > currentBalance) {
      showToast("Insufficient balance", "error", 2000);
      return;
    }

    const durationInSeconds = tradeMinutes * 60 + tradeSeconds;
    const asset = getAssetDetails(activePair);
    const tempId = "tr_" + Math.random().toString(36).substr(2, 9);
    const now = Date.now();

    // Create a local active trade representation to show instantly
    const localTradeObj: Trade = {
      id: tempId,
      pair: activePair,
      direction: direction === "buy" ? "buy" : "sell",
      amount: tradeAmount,
      entryPrice: currentPrice,
      entryTime: now,
      expirationTime: now + durationInSeconds * 1000,
      duration: durationInSeconds,
      payout: asset.payout,
      isPendingDb: true
    };

    // 2. trade payload
    console.log("[TRACE DEBUG 2] trade payload (localTradeObj):", localTradeObj);

    // Deduct immediate stake amount from balance
    const updatedBalance = currentBalance - tradeAmount;
    if (accountType === "demo") {
      setDemoBalance(updatedBalance);
    } else {
      setLiveBalance(updatedBalance);
    }

    // Instantly append to activeTrades of local UI (Issue #4)
    setActiveTrades((prev) => [localTradeObj, ...prev]);

    try {
      let uid = "guest";
      if (auth.currentUser) {
        uid = auth.currentUser.uid;
        
        // 3. current authenticated user id
        console.log("[TRACE DEBUG 3] current authenticated user id (uid):", uid);

        // Synchronize core balance to db
        await db.updateBalance(uid, accountType, updatedBalance);
      } else {
        console.log("[TRACE DEBUG 3] user is NOT authenticated, guest flow active");
      }

      // Write trade record
      const inserted = await db.insertTrade({
        id: tempId,
        user_id: uid,
        asset_symbol: activePair,
        direction: direction === "buy" ? "up" : "down",
        amount: tradeAmount,
        open_price: currentPrice,
        open_time: new Date(now).toISOString(),
        expiry_time: new Date(now + durationInSeconds * 1000).toISOString(),
        status: "open",
        account_type: accountType
      });

      // Update local temporary trade record key with real database UUID
      if (inserted && inserted.id) {
        setActiveTrades((prev) => {
          const alreadyHasDbId = prev.some((t) => t.id === inserted.id);
          if (alreadyHasDbId) {
            return prev.filter((t) => t.id !== tempId);
          }
          return prev.map((t) => (t.id === tempId ? { ...t, id: inserted.id, isPendingDb: false, isOfflineFallback: !!inserted.isOfflineFallback } : t));
        });
      } else {
        setActiveTrades((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, isPendingDb: false } : t))
        );
      }

      if (inserted && inserted.isOfflineFallback) {
        showToast("Local Sandbox Active:\nDatabase access offline. Trade matched safely on device.", "info");
      }

      // Refresh final states safely from database as final confirmation
      await fetchTradesFromDB();
    } catch (err: any) {
      console.error("Error syncing trade status directly to Supabase:", err);
      // Mark as fallback local-only item, do not remove it
      setActiveTrades((prev) =>
        prev.map((t) => (t.id === tempId ? { ...t, isPendingDb: false, isOfflineFallback: true } : t))
      );
      // Display diagnostic toast instead of alert
      showToast("Local Sandbox Mode Active:\nYour trade was scheduled and matched safely on client.", "info");
    }
  };

  const handleUpdateCountry = async (nextCountry: string, nextCode: string, nextFlag: string) => {
    setCountry(nextCountry);
    setCountryCode(nextCode);
    setCountryFlag(nextFlag);
    
    if (auth.currentUser) {
      try {
        await db.updateUserProfile(auth.currentUser.uid, {
          country: nextCountry,
          countryCode: nextCode,
          countryFlag: nextFlag
        });
        showToast("Profile region updated successfully!", "success");
      } catch (err) {
        console.error("Error updating user region in db:", err);
        showToast("Logged-in sync offline. Region stored locally.", "info");
      }
    } else {
      showToast("Updated local guest region context.", "success");
    }
  };

  // Adjust amount and duration controls handler
  const adjustAmount = (delta: number) => {
    setTradeAmount((prev) => Math.max(1, prev + delta));
  };

  const adjustMinutes = (delta: number) => {
    setTradeMinutes((prev) => Math.max(0, prev + delta));
  };

  const adjustSeconds = (delta: number) => {
    setTradeSeconds((prev) => {
      let finalSecs = prev + delta;
      if (finalSecs >= 60) {
        setTradeMinutes(m => m + 1);
        return 0;
      }
      if (finalSecs < 0) {
        if (tradeMinutes > 0) {
          setTradeMinutes(m => m - 1);
          return 45;
        }
        return 0;
      }
      return finalSecs;
    });
  };

  const getTimeframeSeconds = (tf: string) => {
    switch (tf) {
      case "1m": return 60;
      case "5m": return 300;
      case "15m": return 900;
      case "1H": return 3600;
      case "4H": return 14400;
      case "1D": return 86400;
      default: return 60;
    }
  };

  const tfSecs = getTimeframeSeconds(timeframe);
  const remainingSeconds = tfSecs - (Math.floor(Date.now() / 1000) % tfSecs);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const candleTimerStr = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#EAEAEA] font-sans flex flex-col justify-between selection:bg-[#00C076] selection:text-black relative overflow-x-hidden" id="main_app_wrapper">
      
      {/* Visual background atmospheric elements - simplified/premium for new theme */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#00C076]/2 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-[#00C076]/1 blur-[120px]" />
      </div>

      {/* Main Container Form Logic (If Not Logged In) */}
      {!isLoggedIn ? (
        <div className="min-h-screen w-full bg-[#0D0D0D] text-[#EAEAEA] relative z-10 flex flex-col shrink-0" id="unauth_master_root">
          {unauthView === "landing" ? (
            <div className="flex flex-col min-h-screen bg-[#070B14] overflow-x-hidden relative" id="landing_view_container">
              {/* Enhanced background layers */}
              <div className="absolute inset-0 grid-overlay opacity-50 pointer-events-none z-0" />
              <div className="absolute inset-0 hero-gradient pointer-events-none z-0" />
              <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-[#00C97A]/4 blur-[140px] pointer-events-none z-0 animate-spin-slow" style={{animationDuration:'25s'}} />
              <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#0033ff]/3 blur-[120px] pointer-events-none z-0" />

              {/* Header Navigation */}
              <header className="relative z-20 border-b border-[#1A1F2E] bg-[#070B14]/95 backdrop-blur-xl sticky top-0" id="landing_header">
                {/* Live ticker tape */}
                <div className="w-full bg-[#00C076]/5 border-b border-[#00C076]/10 py-1.5 overflow-hidden">
                  <div className="ticker-tape text-[9px] font-mono text-[#00C076]/60 tracking-widest uppercase font-bold">
                    {["EUR/USD OTC  +92%","BTC/USDT  +91%","GOLD OTC  +92%","GBP/USD  +88%","ETH/USDT  +89%","APPLE OTC  +90%","SILVER  +88%","NVIDIA  +86%","TESLA  +88%","EUR/USD OTC  +92%","BTC/USDT  +91%","GOLD OTC  +92%","GBP/USD  +88%","ETH/USDT  +89%","APPLE OTC  +90%","SILVER  +88%","NVIDIA  +86%","TESLA  +88%"].map((item, i) => (
                      <span key={i} className="mx-8 flex items-center gap-2 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-[#00C076]" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setUnauthView("landing")}>
                    <img src={tradexLogoTransparent} alt="TradeX" className="h-9 w-auto logo-glow group-hover:scale-105 transition-transform duration-200" />
                  </div>

                  {/* Desktop menu links */}
                  <nav className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wide text-gray-500">
                    <a href="#features_lbl" className="hover:text-[#00C076] transition-colors">Features</a>
                    <a href="#markets_lbl" className="hover:text-[#00C076] transition-colors">Markets</a>
                    <a href="#reviews_lbl" className="hover:text-[#00C076] transition-colors">Reviews</a>
                    <a href="#how_lbl" className="hover:text-[#00C076] transition-colors">How it Works</a>
                    <a href="#faq_lbl" className="hover:text-[#00C076] transition-colors">FAQ</a>
                  </nav>

                  <div className="flex items-center gap-3">
                    <button
                      id="btn_land_signin"
                      onClick={() => { setUnauthView("auth"); setActiveTab("login"); }}
                      className="px-5 py-2 text-xs font-bold text-gray-300 hover:text-white border border-[#22304a]/60 hover:border-[#00C076]/50 rounded-lg transition-all cursor-pointer glass"
                    >
                      Login
                    </button>
                    <button
                      id="btn_land_signup"
                      onClick={() => { setUnauthView("auth"); setActiveTab("register"); }}
                      className="px-5 py-2 text-xs font-bold bg-[#00C076] hover:bg-[#00A062] text-black rounded-lg transition-all shadow-lg shadow-[#00C076]/20 cursor-pointer btn-press"
                    >
                      Open Account
                    </button>
                  </div>
                </div>
              </header>

              {/* Hero Section - Enhanced */}
              <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-28 md:pb-32 text-center flex flex-col items-center justify-center space-y-8 hero-gradient" id="landing_hero">
                
                {/* Floating badge */}
                <div className="animate-fadeInUp opacity-0" style={{animationFillMode:'forwards'}}>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#00C076]/15 to-[#00C076]/5 text-[#00C076] border border-[#00C076]/25 rounded-full text-[10px] font-bold tracking-widest uppercase font-sans shadow-lg shadow-[#00C076]/5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
                    <Award className="w-3 h-3" />
                    Regulated Global Derivatives Broker
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00C076] animate-pulse" />
                  </div>
                </div>

                {/* Main logo hero */}
                <div className="animate-fadeInUp opacity-0 delay-100" style={{animationFillMode:'forwards'}}>
                  <img src={tradexLogoTransparent} alt="TradeX" className="h-16 sm:h-20 w-auto mx-auto logo-glow animate-float" />
                </div>

                <div className="animate-fadeInUp opacity-0 delay-200" style={{animationFillMode:'forwards'}}>
                  <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05] font-sans max-w-4xl" style={{fontFamily:'Syne, sans-serif'}}>
                    Trade Global Markets with{" "}
                    <span className="text-[#00C076]">Instant Execution</span>
                  </h1>
                </div>

                <div className="animate-fadeInUp opacity-0 delay-300" style={{animationFillMode:'forwards'}}>
                  <p className="text-sm sm:text-lg text-gray-400 font-sans leading-relaxed max-w-2xl mx-auto">
                    Experience lightning-fast option contracts on Forex, Cryptocurrencies, Stocks, and OTC Markets. Up to <strong className="text-white">95% payouts</strong> in as short as 60 seconds.
                  </p>
                </div>

                <div className="animate-fadeInUp opacity-0 delay-400 flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full sm:w-auto" style={{animationFillMode:'forwards'}}>
                  <button
                    id="btn_hero_cta_acc"
                    onClick={() => { setUnauthView("auth"); setActiveTab("register"); }}
                    className="w-full sm:w-auto px-10 py-4 text-sm font-bold bg-[#00C076] hover:bg-[#00A062] text-black rounded-xl transition-all shadow-lg shadow-[#00C076]/25 hover:shadow-[#00C076]/40 flex items-center justify-center gap-2.5 cursor-pointer animate-glow-pulse btn-press"
                  >
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    id="btn_hero_cta_login"
                    onClick={() => { setUnauthView("auth"); setActiveTab("login"); }}
                    className="w-full sm:w-auto px-10 py-4 text-sm font-bold bg-[#181828] hover:bg-[#1f1f35] text-white border border-[#2E2E4E] hover:border-[#4E4E7E] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer glass btn-press"
                  >
                    <span>Login to Platform</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Trust markers */}
                <div className="animate-fadeInUp opacity-0 delay-500 pt-8 grid grid-cols-3 gap-8 border-t border-[#1F1F2E] max-w-sm w-full mx-auto" style={{animationFillMode:'forwards'}}>
                  <div className="stat-card text-center">
                    <span className="block text-2xl sm:text-3xl font-black text-white" style={{fontFamily:'Syne,sans-serif'}}>$10k</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold block mt-0.5">Demo Capital</span>
                  </div>
                  <div className="stat-card text-center delay-100">
                    <span className="block text-2xl sm:text-3xl font-black text-[#00C076]" style={{fontFamily:'Syne,sans-serif'}}>95%</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold block mt-0.5">Max Payout</span>
                  </div>
                  <div className="stat-card text-center delay-200">
                    <span className="block text-2xl sm:text-3xl font-black text-white" style={{fontFamily:'Syne,sans-serif'}}>24/7</span>
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold block mt-0.5">Live Systems</span>
                  </div>
                </div>
              </section>

              {/* Trust Section */}
              <section className="relative z-10 py-12 bg-[#121212]/30 border-t border-b border-[#1F1F1F]" id="landing_trust">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="space-y-1">
                      <p className="text-2xl sm:text-4xl font-extrabold text-white">48.2M+</p>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Active Global Traders</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl sm:text-4xl font-extrabold text-[#00C076]">$1.8B+</p>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Monthly Executed Volume</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl sm:text-4xl font-extrabold text-white">65+</p>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Instruments Supported</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl sm:text-4xl font-extrabold text-white">99.98%</p>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Server Node Uptime</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features section */}
              <section className="relative z-10 py-16 md:py-24" id="features_lbl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
                  <div className="space-y-3 max-w-2xl mx-auto">
                    <span className="text-[#00C97A] text-xs font-bold font-mono uppercase tracking-widest block">ENGINEERED FOR SCALE</span>
                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                      Next-Generation Infrastructure for Serious Option Traders
                    </h2>
                    <p className="text-sm text-gray-400">
                      TRADEX provides high-payout direct options execution without the bloated, slow interfaces of legacy systems.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
                    {[
                      {
                        title: "Fast Execution",
                        desc: "Sub-millisecond option contract entry. Secure zero-slippage pricing models designed for precise execution speed.",
                        icon: Zap
                      },
                      {
                        title: "Multiple Assets",
                        desc: "Trade across high-yield global channels, including Forex pairs, Cryptocurrencies, indices and major Stocks.",
                        icon: Globe
                      },
                      {
                        title: "Instant Deposits",
                        desc: "Fund your options balance instantly. Secure institutional pathways provide instant account crediting.",
                        icon: DollarSign
                      },
                      {
                        title: "Fast Withdrawals",
                        desc: "Withdraw your profits directly. Clearing nodes operate automated payout processes for rapid ledger clearance.",
                        icon: Wallet
                      },
                      {
                        title: "Real Time Market Data",
                        desc: "Continuous dynamic live rates sourced from institutional data partners to maintain precise client charts.",
                        icon: TrendingUp
                      },
                      {
                        title: "Secure Accounts",
                        desc: "All client files, records, and options balances are fully safeguarded using standard encryption and isolated accounts.",
                        icon: Shield
                      },
                      {
                        title: "24/7 Support",
                        desc: "Rely on friendly, professional, round-the-clock support professionals ready to keep your trading smooth.",
                        icon: HelpCircle
                      }
                    ].map((feature, idx) => {
                      const IconComp = feature.icon;
                      return (
                        <div key={idx} className="p-6 bg-[#0c1020] border border-[#1A2440] rounded-2xl space-y-4 card-hover">
                          <div className="h-10 w-10 rounded-xl bg-[#00C076]/10 border border-[#00C076]/20 flex items-center justify-center text-[#00C076]">
                            <IconComp className="w-5 h-5" />
                          </div>
                          <h3 className="text-base font-bold text-white font-sans">{feature.title}</h3>
                          <p className="text-xs text-gray-400 leading-relaxed font-sans">{feature.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Markets section */}
              <section className="relative z-10 py-16 bg-[#121212]/10 border-t border-b border-[#1F1F1F]" id="markets_lbl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
                  <div className="space-y-3 max-w-2xl mx-auto">
                    <span className="text-[#00C076] text-xs font-bold font-mono uppercase tracking-widest block">ASSETS MATRIX</span>
                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                      Liquidity Channels Across Key Markets
                    </h2>
                    <p className="text-xs text-gray-400">
                      Access active options on weekends and holidays using verified OTC rates models.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {[
                      { name: "Forex", desc: "EUR, USD, GBP, JPY", yield: "Up to 92%" },
                      { name: "Crypto", desc: "Bitcoin, Ethereum, Solana", yield: "Up to 88%" },
                      { name: "Stocks", desc: "Apple, Tesla, NVIDIA", yield: "Up to 90%" },
                      { name: "Indices", desc: "S&P 500, Nasdaq 100", yield: "Up to 85%" },
                      { name: "OTC Markets", desc: "Special Weekends Assets", yield: "Up to 95%" }
                    ].map((market, idx) => (
                      <div key={idx} className="p-5 bg-[#121212] border border-[#1F1F1F] rounded-xl text-center space-y-2.5">
                        <h4 className="text-xs font-bold text-white font-sans uppercase tracking-wide">{market.name}</h4>
                        <p className="text-[10px] text-gray-500 font-sans">{market.desc}</p>
                        <div className="inline-block px-2.5 py-0.5 bg-[#00C076]/10 text-[#00C076] text-[10px] font-bold rounded-full font-mono">
                          {market.yield}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Reviews section (Testimonials) */}
              <section className="relative z-10 py-16 md:py-24" id="reviews_lbl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
                  <div className="space-y-3 max-w-2xl mx-auto">
                    <span className="text-[#00C076] text-xs font-bold font-mono uppercase tracking-widest block">CLIENT VERIFICATION</span>
                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                      Feedback From Active Traders
                    </h2>
                    <button className="hidden" onClick={() => setActiveReviewIdx((v) => (v + 1) % 4)} />
                  </div>

                  {/* Horizontal snapping grid/slider layout */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto" id="reviews_grid_box">
                    {[
                      {
                        name: "Marcus K. (Verified)",
                        title: "Frankfurt, Germany",
                        rating: 5,
                        text: "TRADEX has completely replaced my standard platform. Contract execution is precise and payouts clear onto the blockchain in minutes."
                      },
                      {
                        name: "Sophia L. (Verified)",
                        title: "Vanguard Option Planner, UK",
                        rating: 5,
                        text: "Excellent yielding rates. The interface is clean, minimal, and respects user focus without throwing unrequested alert telemetry."
                      },
                      {
                        name: "Elena R. (Verified)",
                        title: "Senior Option Strategist",
                        rating: 5,
                        text: "Having cryptocurrency OTC options during weekends at high payout is a masterpiece. Simple layout, extremely responsive."
                      }
                    ].map((review, idx) => (
                      <div key={idx} className="p-6 bg-[#0c1020] border border-[#1A2440] rounded-2xl space-y-4 card-hover">
                        <div className="flex items-center gap-1 text-[#00C076]">
                          {[...Array(review.rating)].map((_, i) => (
                            <Sparkles key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-gray-305 leading-relaxed font-sans font-medium">"{review.text}"</p>
                        <div className="pt-2 border-t border-[#1F1F1F] flex items-center justify-between">
                          <div>
                            <span className="block text-xs font-bold text-white font-sans">{review.name}</span>
                            <span className="block text-[10px] text-gray-500 font-sans">{review.title}</span>
                          </div>
                          <span className="text-[9px] font-mono text-gray-500 bg-[#1C1C1C] px-2 py-0.5 rounded uppercase font-semibold">Verified User</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* How it works */}
              <section className="relative z-10 py-16 bg-[#121212]/10 border-t border-b border-[#1F1F1F]" id="how_lbl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
                  <div className="space-y-3 max-w-2xl mx-auto">
                    <span className="text-[#00C076] text-xs font-bold font-mono uppercase tracking-widest block">STEPS</span>
                    <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
                      Start Trading in Four Simple Steps
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                    {[
                      { step: "01", name: "Create Account", desc: "Open a secure cabinet in seconds using email and password." },
                      { step: "02", name: "Deposit Funds", desc: "Fund your account immediately using crypto with secure validation nodes." },
                      { step: "03", name: "Trade Markets", desc: "Select assets, configure durations, and execute with STP speed." },
                      { step: "04", name: "Withdraw Profits", desc: "Instant automated batch approvals. Money arrives safely in minutes." }
                    ].map((item, idx) => (
                      <div key={idx} className="p-6 bg-[#121212] border border-[#1F1F1F] rounded-2xl relative overflow-hidden group">
                        <span className="absolute top-2 right-4 text-4xl sm:text-5xl font-black font-sans text-[#1F1F1F] group-hover:text-[#00C076]/5 transition-colors">{item.step}</span>
                        <div className="space-y-2 mt-4 relative z-10">
                          <h4 className="text-sm font-bold text-white font-sans uppercase tracking-wider">{item.name}</h4>
                          <p className="text-[11.5px] text-gray-400 leading-relaxed font-sans">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="relative z-10 py-16 md:py-24" id="faq_lbl">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                  <div className="text-center space-y-3">
                    <span className="text-[#00C076] text-xs font-bold font-mono uppercase tracking-widest block">SUPPORT</span>
                    <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white font-sans">
                      Frequently Asked Questions
                    </h2>
                  </div>

                  <div className="space-y-4 font-sans">
                    {[
                      {
                        q: "How is transaction security handled?",
                        a: "We utilize end-to-end socket handshakes and cold multi-signature wallets to isolate funds and secure client portfolios."
                      },
                      {
                        q: "What is the minimum deposit?",
                        a: "Accounts can be initialized with as little as $10 or equivalent cryptocurrency values, making options trading highly accessible."
                      },
                      {
                        q: "Are demo funds real?",
                        a: "Demo funds are fully simulation-capable and let you test live execution paths with 100% risk isolation. No deposits required."
                      },
                      {
                        q: "How fast are payout withdrawals processed?",
                        a: "Our finance clearing desk operates automated verification batches. Standard blockchain requests are resolved within 5-45 minutes."
                      }
                    ].map((faq, idx) => {
                      const expanded = activeNotification?.id === `faq_${idx}`;
                      return (
                        <div key={idx} className="bg-[#121212] border border-[#1F1F1F] rounded-2xl overflow-hidden transition-all duration-300">
                          <button
                            type="button"
                            onClick={() => {
                              if (expanded) {
                                setActiveNotification(null);
                              } else {
                                setActiveNotification({ id: `faq_${idx}`, msg: "", type: "win" });
                              }
                            }}
                            className="w-full flex items-center justify-between p-5 text-left font-bold text-white hover:bg-[#181818] transition-all cursor-pointer text-xs sm:text-sm uppercase tracking-wide"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                          </button>
                          {expanded && (
                            <div className="p-5 pt-1 text-xs text-gray-400 border-t border-[#1F1F1F] leading-relaxed font-sans bg-[#141414]">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* Final CTA section */}
              <section className="relative z-10 py-16 md:py-24 bg-[#0D0D0D] border-t border-[#1F1F1F]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <div className="bg-[#121212] border border-[#1F1F1F] rounded-2xl p-8 sm:p-12 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#00C97A]/4 blur-[60px]" />
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white font-sans tracking-tight">
                      Open Your Trading Account
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
                      Register with TRADEX instantly. Start with a $10,000 demo account, and switch to a real funded account whenever you are ready.
                    </p>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <button
                        onClick={() => { setUnauthView("auth"); setActiveTab("register"); }}
                        className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-wider bg-[#00C97A] hover:bg-[#00a664] text-black rounded-xl transition-all shadow-md cursor-pointer"
                      >
                        Create Your Trading Account
                      </button>
                      <button
                        onClick={() => { setUnauthView("auth"); setActiveTab("login"); }}
                        className="w-full sm:w-auto px-8 py-3.5 text-xs font-bold uppercase tracking-wider bg-[#1C1C1C] hover:bg-[#222] text-white rounded-xl border border-[#2E2E2E] transition-all cursor-pointer"
                      >
                        Login to Platform
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <footer className="relative z-10 border-t border-[#1A1F2E] bg-[#050810] py-10 text-xs text-gray-500 font-sans" id="landing_footer">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-3 text-left">
                    <div className="flex items-center gap-2">
                      <img src={tradexLogoTransparent} alt="TradeX" className="h-8 w-auto logo-glow" />
                    </div>
                    <p className="max-w-md text-[11px] text-gray-600 leading-relaxed">
                      Derivative option products carry critical levels of risk. Transactions in digital options are subject to fast fluctuations. Verify your strategies with a risk-free demo account.
                    </p>
                  </div>
                  <div className="md:text-right space-y-2">
                    <p>© 2026 TRADEX Broker Ltd. All institutional rights reserved.</p>
                    <div className="flex md:justify-end gap-4 font-mono text-[9px]">
                      <span className="text-[#00C076]/50">SECURE HANDSHAKE NODE ONLINE</span>
                      <span>VERSION 8.4.110</span>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          ) : (
            /* Auth View - Premium Split Layout */
            <div className="min-h-screen grid grid-cols-1 md:grid-cols-12 bg-[#070B14] font-sans w-full" id="split_auth_layout">
              {/* Left Panel: Live Market Intelligence Preview */}
              <div className="hidden md:flex md:col-span-5 border-r border-[#1A2440] flex-col justify-between p-8 relative overflow-hidden" style={{background:'linear-gradient(135deg, #070B14 0%, #0b1329 50%, #080d20 100%)'}} id="auth_left_panel">
                {/* Animated glow overlays */}
                <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full bg-[#00C97A]/5 blur-[100px] pointer-events-none animate-float" />
                <div className="absolute top-1/3 right-0 w-48 h-48 rounded-full bg-blue-600/4 blur-[80px] pointer-events-none" />
                <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />

                <div className="space-y-3 text-left relative z-10">
                  <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setUnauthView("landing")}>
                    <img src={tradexLogoTransparent} alt="TradeX" className="h-10 w-auto logo-glow group-hover:scale-105 transition-transform" />
                  </div>
                </div>

                {/* Live Chart visual representing "Option Quotes" */}
                <div className="my-auto space-y-6">
                  <div className="bg-[#121212] border border-[#1F1F1F] rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#00C076] animate-pulse" />
                        <span className="text-[10px] uppercase font-mono tracking-widest text-[#00C076] font-bold">Live Option Rates</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500">Latency: 0.8ms</span>
                    </div>

                    {/* Styled candlestick diagram layout using flat CSS */}
                    <div className="space-y-2">
                      <div className="h-28 flex items-end justify-between px-2 pt-4 border-b border-[#1F1F1F] border-l border-[#1F1F1F] relative">
                        {/* Candles */}
                        <div className="flex-1 flex flex-col items-center justify-center group h-2/3">
                          <div className="w-[1px] h-8 bg-[#00C076]" />
                          <div className="w-2.5 h-10 bg-[#00C076] rounded" />
                          <div className="w-[1px] h-4 bg-[#00C076]" />
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center h-4/5">
                          <div className="w-[1px] h-4 bg-[#00C076]" />
                          <div className="w-2.5 h-14 bg-[#00C076] rounded" />
                          <div className="w-[1px] h-6 bg-[#00C076]" />
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center h-1/2">
                          <div className="w-[1px] h-10 bg-red-500" />
                          <div className="w-2.5 h-8 bg-red-500 rounded" />
                          <div className="w-[1px] h-4 bg-red-500" />
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center h-2/3">
                          <div className="w-[1px] h-6 bg-[#00C076]" />
                          <div className="w-2.5 h-12 bg-[#00C076] rounded" />
                          <div className="w-[1px] h-2 bg-[#00C076]" />
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center group h-5/6">
                          <div className="w-[1px] h-4 bg-[#00C076]" />
                          <div className="w-2.5 h-20 bg-[#00C076] rounded" />
                          <div className="w-[1px] h-10 bg-[#00C076]" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>STP Order Routing</span>
                      <span className="text-[#00C97A] font-bold">100% CLEARANCE</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-left">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Market Intelligence, Simplified</h3>
                    <p className="text-xs text-gray-500 leading-relaxed font-sans">
                      Verify contract price movements instantly. TRADEX offers secure execution systems with fully protected deposits.
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 font-mono text-left space-y-1">
                  <p>SYSTEM ACCESS STATUS: ONLINE</p>
                  <p>PLATFORM SECURITY TYPE: PROTECTED</p>
                </div>
              </div>

               {/* Right Panel: Authentication Forms */}
              <div className="md:col-span-7 flex flex-col justify-between p-6 sm:p-12 relative bg-[#0D0D0D]" id="auth_forms_right_panel">
                {/* Back to landing link */}
                <div className="flex justify-between items-center pb-4 sm:pb-0">
                  <button
                    onClick={() => { setUnauthView("landing"); }}
                    className="text-xs text-gray-400 hover:text-white transition-all flex items-center gap-1 cursor-pointer font-bold font-sans uppercase tracking-wider bg-[#121212] px-3.5 py-2 rounded-xl border border-[#222]"
                  >
                    ← Back to Landing Page
                  </button>
                  <span className="text-[10px] font-mono text-gray-500 uppercase">Secure Profile Access</span>
                </div>

                {/* Form Card */}
                <div className="w-full max-w-md mx-auto space-y-6 py-6 animate-fadeIn" id="unauth_form_hub">
                  <div className="text-left space-y-1">
                    <h2 className="text-xl font-bold tracking-tight text-white uppercase font-sans">
                      {activeTab === "login" ? "Welcome Back" : "Open Your Trading Account"}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {activeTab === "login" ? "Sign in to access options workspace" : "Quick registration under 60 seconds"}
                    </p>
                  </div>

                  {/* Authentication Switcher Tabs */}
                  <div className="flex bg-[#121212] rounded-xl p-1 border border-[#1F1F1F]" id="auth_form_tab_switchers">
                    {["login", "register"].map((tabId) => (
                      <button
                        key={tabId}
                        onClick={() => handleTabChange(tabId as any)}
                        className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all duration-155 ${
                          activeTab === tabId
                            ? "bg-[#00C076] text-black font-extrabold shadow-sm"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {tabId === "login" ? "Sign In" : "Register"}
                      </button>
                    ))}
                  </div>

                  {/* Elegant loader indicator bar when isLoading is true */}
                  {isLoading && (
                    <div className="w-full bg-[#121212] h-1 rounded-full overflow-hidden relative">
                      <div className="bg-[#00C076] h-full animate-pulse rounded-full" style={{ width: "70%" }} />
                    </div>
                  )}

                  {authError && (
                    <div className="bg-[#1C1215] border border-[#ff4a4a]/20 text-[#ff4a4a] text-xs p-3.5 rounded-xl space-y-2 animate-fadeIn" id="auth_error_banner">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-[#ff4a4a] shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold leading-normal">{authError}</p>
                          
                          {/* Direct Link/Button Actions for specific errors matching the prompt */}
                          {authError.includes("Account not found") && (
                            <button
                              type="button"
                              onClick={() => {
                                handleTabChange("register");
                              }}
                              className="mt-1.5 flex items-center gap-1 text-[#00C076] hover:underline font-bold cursor-pointer"
                            >
                              <span>Create a new account now</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}

                          {authError.includes("already exists") && (
                            <button
                              type="button"
                              onClick={() => {
                                handleTabChange("login");
                              }}
                              className="mt-1.5 flex items-center gap-1 text-[#00C076] hover:underline font-bold cursor-pointer"
                            >
                              <span>Go to Login</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {authSuccess && (
                    <div className="bg-[#0e2417] border border-[#00C076]/20 text-[#00C076] text-xs p-3.5 rounded-xl flex items-start gap-2.5 animate-fadeIn" id="auth_success_banner">
                      <ShieldCheck className="w-4 h-4 text-[#00C076] shrink-0 mt-0.5" />
                      <span className="font-semibold leading-normal">{authSuccess}</span>
                    </div>
                  )}

                   {/* Credentials Forms for Email/Password */}
                   <form onSubmit={handleAuthSubmit} className="space-y-4" id="credentials_form_stream">
                        {activeTab === "register" && (
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                              Account Nickname
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                <User className="w-4 h-4" />
                              </div>
                              <input
                                id="input_name"
                                type="text"
                                required
                                placeholder="e.g. Trader QXT"
                                className="block w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00C076] focus:ring-1 focus:ring-[#00C076] transition-all font-mono"
                              />
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Email address
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                              <Mail className="w-4 h-4" />
                            </div>
                            <input
                              id="input_email"
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="trader@tadex.net"
                              className="block w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00C076] focus:ring-1 focus:ring-[#00C076] transition-all font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                            Account Password
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                              <Lock className="w-4 h-4" />
                            </div>
                            <input
                              id="input_password"
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="••••••••••••"
                              className="block w-full pl-10 pr-10 py-2.5 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00C076] focus:ring-1 focus:ring-[#00C076] transition-all font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {activeTab === "register" && (
                          <>
                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Confirm Password
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                  <Lock className="w-4 h-4" />
                                </div>
                                <input
                                  id="input_confirm_password"
                                  type={showPassword ? "text" : "password"}
                                  required
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  placeholder="••••••••••••"
                                  className="block w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00C076] focus:ring-1 focus:ring-[#00C076] transition-all font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                                Country of Residence
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                                  <Globe className="w-4 h-4" />
                                </div>
                                <select
                                  id="input_country"
                                  value={country}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const mapped = COUNTRY_CODELIST[val] || { code: "AE", flag: "🇦🇪" };
                                    setCountry(val);
                                    setCountryCode(mapped.code);
                                    setCountryFlag(mapped.flag);
                                  }}
                                  className="block w-full pl-10 pr-4 py-2.5 bg-[#121212] border border-[#1F1F1F] rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00C076] focus:ring-1 focus:ring-[#00C076] transition-all"
                                >
                                  {COUNTRIES.map((c) => (
                                    <option key={c} value={c}>
                                      {c}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </>
                        )}

                        {/* Remember me & Forgot Password Row */}
                        {activeTab === "login" && (
                          <div className="flex items-center justify-between text-xs select-none pt-0.5 font-sans">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white">
                              <input
                                type="checkbox"
                                defaultChecked
                                className="w-3.5 h-3.5 bg-[#121212] border border-[#1F1F1F] accent-[#00C076] rounded"
                              />
                              <span>Remember me</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                showToast(`Reset Token Dispatched:\nCheck inbox/spam of ${email || "registered email"}.`, "info");
                              }}
                              className="text-[#00C076] hover:underline font-bold"
                            >
                              Forgot Password?
                            </button>
                          </div>
                        )}

                        <div className="flex items-start gap-2.5 pt-1.5 text-xs text-gray-400 select-none">
                          <input
                            id="checkbox_terms"
                            type="checkbox"
                            required
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="mt-0.5 w-4 h-4 bg-[#121212] border border-[#1F1F1F] accent-[#00C076] rounded"
                          />
                          <label htmlFor="checkbox_terms" className="leading-relaxed">
                            I accept the <a href="#" className="text-[#00C076] hover:underline font-bold">Client Agreement</a>, <a href="#" className="text-[#00C076] hover:underline font-bold">Privacy Policy</a> and confirm that option contracts involve risk exposure.
                          </label>
                        </div>

                        <button
                          id="btn_auth_submit"
                          type="submit"
                          disabled={!agreeTerms || isLoading}
                          className="w-full mt-2 py-3 px-4 bg-[#00C076] hover:bg-[#00A062] disabled:bg-gray-800 disabled:text-gray-500 text-black text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 duration-75 cursor-pointer flex items-center justify-center gap-2"
                        >
                          <span>
                            {isLoading 
                              ? (activeTab === "login" ? "Signing In..." : "Creating Account...") 
                              : (activeTab === "login" ? "Access Workspace" : "Create Account")
                            }
                          </span>
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-black" />
                          ) : (
                            <ArrowRight className="w-4 h-4" />
                          )}
                        </button>
                      </form>

                      {/* Google OAuth Alternative Buttons */}
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                          <div className="h-[1px] bg-[#1F1F1F] flex-1" />
                          <span>OR CONTINUE WITH</span>
                          <div className="h-[1px] bg-[#1F1F1F] flex-1" />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setIsLoading(true);
                            setTimeout(() => {
                              setEmail("google-trader@gmail.com");
                              setIsLoggedIn(true);
                              localStorage.setItem("tadex_logged_in", "true");
                              setIsLoading(false);
                            }, 1200);
                          }}
                          className="w-full py-2.5 px-4 bg-transparent border border-[#1F1F1F] hover:bg-[#121212] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {/* Simplified Google Icon */}
                          <svg className="w-4 h-4 mr-1 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155 1.903 15.427 1 12.24 1c-6.075 0-11 4.925-11 11s4.925 11 11 11c6.34 0 10.564-4.437 10.564-10.74 0-.726-.08-1.282-.175-1.985H12.24z"/>
                          </svg>
                          Google {activeTab === "login" ? "Sign In" : "Sign Up"}
                        </button>
                      </div>

                    </div>

                    {/* Footer section inside authenticator layout */}
                    <div className="text-center md:text-left text-[11px] text-gray-500 font-sans tracking-wide pt-4" id="auth_footer_noted">
                      <p>© 2026 TRADEX Broker Systems. All trading data is securely protected.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
        /* ==================== HIGH-FIDELITY MAIN TRADING APPLICATION WINDOW ==================== */
        <div className="flex-1 flex flex-col justify-between h-screen max-h-screen overflow-hidden" id="dashboard_terminal">
          
          {/* Header Dashboard Area */}
          <header className="relative z-20 w-full bg-[#080d1a] border-b border-[#1a2440] px-4 py-2.5 flex items-center justify-between shadow-xl" id="dashboard_header">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <img src={tradexLogoTransparent} alt="TradeX" className="h-8 w-auto logo-glow" />
              </div>

              {/* Status and telemetry indicator lamps */}
            </div>

            {/* Mid-sized general telemetry dashboard (UTC Time for traders room synced) */}
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{currentTime}</span>
            </div>

            {/* Top Interactive Area Account cabinet switchers */}
            <div className="relative shrink-0" id="dropdown_wrapper_cabinet">
              <button
                id="btn_account_selector"
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-[#14213d] hover:bg-[#1a2b4f] border border-[#22304a] rounded-xl hover:border-gray-500 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className={`h-6 w-6 rounded-full flex items-center justify-center ${accountType === "demo" ? "bg-[#F0B90B]/20 border border-[#F0B90B]/40" : "bg-[#00C076]/20 border border-[#00C076]/40"}`}>
                  <User className={`w-3.5 h-3.5 ${accountType === "demo" ? "text-[#F0B90B]" : "text-[#00C076]"}`} />
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-semibold block leading-none tracking-wider ${accountType === "demo" ? "text-[#F0B90B]" : "text-[#00C076]"}`}>
                    {accountType === "demo" ? "Demo" : "Live"}
                  </span>
                  <span className="text-sm font-bold text-white font-mono">
                    {accountType === "demo" 
                      ? formatCurrency(demoBalance) 
                      : formatCurrency(liveBalance)
                    }
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showAccountDropdown ? "rotate-180" : ""}`} />
              </button>

              {/* Edit Demo Balance Modal */}
              {showEditDemoBalance && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowEditDemoBalance(false)}>
                  <div className="bg-[#0f172a] border border-[#F0B90B]/30 rounded-2xl p-6 w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-[#F0B90B]" />
                        Edit Demo Balance
                      </h3>
                      <button onClick={() => setShowEditDemoBalance(false)} className="text-gray-400 hover:text-white cursor-pointer text-xs">✕</button>
                    </div>
                    <p className="text-[10px] text-gray-400 mb-4">Set your demo balance (maximum $10,000)</p>
                    <div className="relative mb-4">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono">$</span>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={editDemoInput}
                        onChange={(e) => setEditDemoInput(e.target.value)}
                        className="w-full bg-[#030712] border border-[#F0B90B]/40 text-white font-mono font-bold text-base rounded-xl py-3 pl-8 pr-4 focus:outline-none focus:border-[#F0B90B]"
                        autoFocus
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[1000, 2500, 5000, 10000].map((amt) => (
                        <button key={amt} onClick={() => setEditDemoInput(String(amt))}
                          className="py-1.5 text-[10px] font-bold rounded-lg bg-[#F0B90B]/10 text-[#F0B90B] hover:bg-[#F0B90B]/20 cursor-pointer transition-all border border-[#F0B90B]/20">
                          ${amt >= 1000 ? `${amt/1000}k` : amt}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const val = parseFloat(editDemoInput);
                        if (!isNaN(val) && val > 0) {
                          setDemoBalance(Math.min(10000, val));
                        }
                        setShowEditDemoBalance(false);
                      }}
                      className="w-full py-3 bg-[#F0B90B] text-black font-black text-sm rounded-xl hover:bg-yellow-400 transition-all cursor-pointer"
                    >
                      Update Demo Balance
                    </button>
                  </div>
                </div>
              )}

              {/* Interactive dropdown options matching the prompt */}
              {showAccountDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0f172a] border border-[#22304a] rounded-xl shadow-2xl p-4 z-50 text-sm space-y-3.5 animate-fadeIn" id="account_menu_card">
                  
                  {/* Trader Information Identity Block */}
                  <div className="flex items-center gap-3 pb-3 border-b border-[#22304a]">
                    <div className="h-10 w-10 rounded-full bg-blue-600/10 border border-blue-500/25 flex items-center justify-center text-blue-500 uppercase font-black text-sm">
                      {traderName.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold leading-tight flex items-center gap-1.5">
                        {traderName}
                        <span className="text-sm leading-none" title={`${country} flag`}>{countryFlag}</span>
                      </h4>
                      <p className="text-[11px] text-gray-400">{email}</p>
                      <span className="text-[9px] font-mono text-blue-400 mt-1 block uppercase">{traderID}</span>
                    </div>
                  </div>

                  {/* Account Selector Interactive Entries */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">AVAILABLE BALANCES</span>

                    {/* Demo row item card click targets */}
                    <div className={`w-full p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                      accountType === "demo"
                        ? "bg-[#F0B90B]/10 border-[#F0B90B]/40"
                        : "bg-transparent border-[#22304a]"
                    }`}>
                      <button
                        id="opt_select_demo"
                        onClick={() => { setAccountType("demo"); setShowAccountDropdown(false); }}
                        className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                      >
                        <div className="h-2 w-2 rounded-full bg-[#F0B90B]" />
                        <div>
                          <span className="text-xs text-gray-300 font-semibold block">Demo Account</span>
                          <span className="text-[10px] text-gray-500 lowercase leading-normal">Risk-free trial balance</span>
                        </div>
                      </button>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#F0B90B] font-mono">{formatCurrency(demoBalance)}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditDemoInput(demoBalance.toFixed(2)); setShowEditDemoBalance(true); }}
                          className="p-1 rounded-md bg-[#F0B90B]/10 hover:bg-[#F0B90B]/20 text-[#F0B90B] transition-all cursor-pointer"
                          title="Edit demo balance"
                        >
                          <Pencil className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Live row item card click targets */}
                    <button
                      id="opt_select_live"
                      onClick={() => {
                        setAccountType("live");
                        setShowAccountDropdown(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between ${
                        accountType === "live"
                          ? "bg-[#00C076]/10 border-[#00C076]/40"
                          : "bg-transparent border-[#22304a] hover:bg-[#1e293b]/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-[#00C076]" />
                        <div>
                          <span className="text-xs text-gray-300 font-semibold block">Live Account</span>
                          <span className="text-[10px] text-gray-400 lowercase leading-normal">Real trading markets</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#00C076] font-mono">{formatCurrency(liveBalance)}</span>
                    </button>
                  </div>

                  {/* Currency Selection Dropper Widget */}
                  <div className="pt-2.5 border-t border-[#22304a] space-y-1.5 text-left">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider block">CHOOSE CURRENCY</span>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full bg-[#111827] border border-[#22304a]/70 text-xs text-white rounded-lg p-2 focus:outline-none focus:border-[#00C076] cursor-pointer font-sans"
                    >
                      {Object.keys(CURRENCY_RATES).map((curr) => (
                        <option key={curr} value={curr}>
                          {curr} ({CURRENCY_RATES[curr].symbol.trim()})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Settings and Logouts button triggers */}
                  <div className="pt-2.5 border-t border-[#22304a] flex items-center justify-between">
                    <button 
                      onClick={() => {
                        setDemoBalance(10000.00);
                        setShowAccountDropdown(false);
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 cursor-pointer underline font-medium"
                    >
                      Reset Demo Capital
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 text-xs text-[#ff4d4f] hover:text-red-400 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          </header>
          {/* Top Panel Trading layout view grids */}
          <div className="flex-1 flex flex-row overflow-hidden relative" id="tadex_main_terminal_body">
            
            {/* DESKTOP VERTICAL SIDEBAR */}
            <aside className="hidden md:flex flex-col w-[80px] bg-[#0b1329] border-r border-[#22304a] shrink-0 justify-between py-4 select-none" id="desktop_vertical_sidebar">
               <div className="flex flex-col gap-2.5 w-full items-center">
                 {[
                   { id: "chart", label: "Chart", icon: TrendingUp },
                   { id: "support", label: "Support", icon: HelpCircle },
                   { id: "profile", label: "Profile", icon: User },
                   { id: "tournament", label: "Tournament", icon: Trophy },
                   { id: "more", label: "More", icon: Grid },
                 ].map((tab) => {
                    const IconComp = tab.icon;
                    const isActive = currentScreen === tab.id || (tab.id === "more" && ["analytics", "leaderboard", "deposit", "withdrawal", "transactions", "trades_history", "settings"].includes(currentScreen));
                    return (
                      <button
                        id={`sidebar_tab_${tab.id}`}
                        key={tab.id}
                        onClick={() => setCurrentScreen(tab.id as any)}
                        className={`w-full flex flex-col items-center justify-center py-3 px-1 transition-all relative border-l-2 cursor-pointer ${
                          isActive 
                            ? "border-blue-500 text-blue-400 bg-blue-500/5 font-bold" 
                            : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-slate-900/40"
                        }`}
                      >
                        {isActive && <div className="absolute left-0 w-[2px] h-[70%] bg-blue-500 rounded-r-md" />}
                        <IconComp className="w-5 h-5 mb-1" />
                        <span className="text-[10px] font-medium tracking-wide uppercase leading-none font-sans">{tab.label}</span>
                      </button>
                    );
                 })}
               </div>

               <button
                 onClick={handleLogout}
                 className="flex flex-col items-center justify-center text-rose-500/60 hover:text-red-400 py-3.5 transition-all text-[10px] tracking-wide uppercase font-sans font-medium gap-1 cursor-pointer w-full"
               >
                 <LogOut className="w-5 h-5" />
                 <span>Log Out</span>
               </button>
            </aside>

            {/* ROUTING OF ACTIVE CORE PANES */}
            <main className="flex-1 flex flex-col overflow-hidden relative" id="tadex_cabinet_pages_routing_pane">
              
              {currentScreen === "chart" && (
                <div className="flex-1 flex flex-col md:flex-row relative z-10 overflow-hidden" id="dashboard_body_matrix">
            
            {/* Left side Core Chart Area pane - Stretches dynamically to fill available height */}
            <div className="flex-1 flex flex-col border-b md:border-b-0 border-[#22304a] bg-[#0c101d] relative z-20 overflow-hidden" id="chart_outer_container">
              
              {/* Native Broker Style Chart Header Bar */}
              <div className="bg-[#0b1329] border-b border-[#22304a] px-2 md:px-3 py-1.5 md:py-2 flex items-center justify-between z-30" id="chart_header_bar">
                <div className="flex items-center gap-1 md:gap-2 flex-wrap sm:flex-nowrap">
                  
                  {/* Pair dropdown inline selector */}
                  <div className="relative">
                    <button
                      id="btn_pair_selector"
                      onClick={() => {
                        setShowPairDropdown(!showPairDropdown);
                        setShowIndicatorsPanel(false);
                      }}
                      className="flex items-center gap-1 px-1.5 py-1 md:px-2.5 md:py-1.5 bg-[#14213d] text-white border border-[#22304a] hover:border-gray-500 rounded-lg hover:bg-[#1a2b4f] active:scale-[0.98] transition-all cursor-pointer shadow"
                    >
                      <span className="text-[10px] md:text-sm font-mono font-bold tracking-wider">{activePair}</span>
                      <span className="text-[8px] md:text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded leading-none">
                        +{getAssetDetails(activePair).payout * 100}%
                      </span>
                      <ChevronDown className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-400" />
                    </button>

                     {showPairDropdown && (
                      <div className="fixed inset-0 bg-[#05070fc0] backdrop-blur-md z-50 flex items-center justify-center p-4" id="pairs_full_screen_selector">
                        <div className="w-full max-w-3xl bg-[#0b1329] border border-[#22304a] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-fadeIn">
                          
                          {/* Modal Header */}
                          <div className="p-4 md:p-5 border-b border-[#22304a] flex items-center justify-between bg-[#0e172e]">
                            <div>
                              <h3 className="text-sm md:text-base font-bold text-white font-sans tracking-wide">Professional OTC Asset Market</h3>
                              <p className="text-[10px] text-gray-400 mt-0.5">Select a real-time OTC trading instrument to continue</p>
                            </div>
                            <button
                              onClick={() => {
                                setShowPairDropdown(false);
                                setAssetSearchQuery("");
                                setSelectedAssetCategory("All");
                              }}
                              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-gray-400 hover:text-white text-xs font-bold font-mono transition-all cursor-pointer border border-[#212f4d]"
                            >
                              ESC [X]
                            </button>
                          </div>

                          {/* Modal Search & Filters */}
                          <div className="p-4 bg-[#0a0f1d] border-b border-[#22304a] space-y-3">
                            <input
                              type="text"
                              value={assetSearchQuery}
                              onChange={(e) => setAssetSearchQuery(e.target.value)}
                              placeholder="Search assets by symbol name or code (e.g. BTC, EUR, Gold)..."
                              className="w-full bg-[#14213d] border border-[#22304a] rounded-xl px-4 py-2.5 text-white placeholder-gray-400 text-xs focus:outline-none focus:border-blue-500 transition-all font-mono"
                            />

                            {/* Category selector Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                              {["All", "Forex OTC", "Crypto OTC", "Commodities OTC", "Stocks OTC"].map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => setSelectedAssetCategory(cat)}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer ${
                                    selectedAssetCategory === cat
                                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/15"
                                      : "bg-[#14213d]/60 text-gray-400 hover:text-white border border-[#22304a]"
                                  }`}
                                >
                                  {cat === "All" && "All Markets"}
                                  {cat === "Forex OTC" && "Forex"}
                                  {cat === "Crypto OTC" && "Crypto"}
                                  {cat === "Commodities OTC" && "Commodities"}
                                  {cat === "Stocks OTC" && "Stocks"}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Modal Asset List (Scrollable) */}
                          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-[#080d19]">
                            {ASSETS.filter((asset) => {
                              const matchesCategory = selectedAssetCategory === "All" || asset.category === selectedAssetCategory;
                              const matchesSearch = asset.pair.toLowerCase().includes(assetSearchQuery.toLowerCase()) || 
                                                    asset.category.toLowerCase().includes(assetSearchQuery.toLowerCase());
                              return matchesCategory && matchesSearch;
                            }).map((asset) => {
                              const isCurrent = activePair === asset.pair;
                              const isForex = asset.category === "Forex OTC";
                              const isCrypto = asset.category === "Crypto OTC";
                              const isCommodity = asset.category === "Commodities OTC";
                              
                              return (
                                <div
                                  key={asset.pair}
                                  onClick={() => {
                                    setActivePair(asset.pair);
                                    setShowPairDropdown(false);
                                    setAssetSearchQuery("");
                                    setSelectedAssetCategory("All");
                                  }}
                                  className={`p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                                    isCurrent
                                      ? "bg-blue-600/10 border-blue-500 text-white"
                                      : "bg-[#0f172a]/60 hover:bg-[#15203c]/90 border-[#1e293b] hover:border-[#2b3c66]"
                                  }`}
                                >
                                  {/* Left: Indicator Icon and Asset Symbol info */}
                                  <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg shrink-0 ${
                                      isForex 
                                        ? "bg-emerald-500/10 text-emerald-400" 
                                        : isCrypto 
                                          ? "bg-amber-500/10 text-amber-400" 
                                          : isCommodity 
                                            ? "bg-amber-600/15 text-orange-400" 
                                            : "bg-blue-500/10 text-blue-400"
                                    }`}>
                                      {isForex && <Globe className="w-4 h-4" />}
                                      {isCrypto && <Zap className="w-4 h-4" />}
                                      {isCommodity && <Sparkles className="w-4 h-4" />}
                                      {!isForex && !isCrypto && !isCommodity && <Activity className="w-4 h-4" />}
                                    </div>
                                    <div>
                                      <div className="font-mono text-xs md:text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                                        {/* Flag/icon based on pair */}
                                        {asset.pair.includes("EUR/USD") && <span className="text-sm">🇪🇺🇺🇸</span>}
                                        {asset.pair.includes("GBP/USD") && <span className="text-sm">🇬🇧🇺🇸</span>}
                                        {asset.pair.includes("AUD/CAD") && <span className="text-sm">🇦🇺🇨🇦</span>}
                                        {asset.pair.includes("USD/JPY") && <span className="text-sm">🇺🇸🇯🇵</span>}
                                        {asset.pair.includes("USD/CAD") && <span className="text-sm">🇺🇸🇨🇦</span>}
                                        {asset.pair.includes("EUR/GBP") && <span className="text-sm">🇪🇺🇬🇧</span>}
                                        {asset.pair.includes("NZD/USD") && <span className="text-sm">🇳🇿🇺🇸</span>}
                                        {asset.pair.includes("AUD/USD") && <span className="text-sm">🇦🇺🇺🇸</span>}
                                        {asset.pair.includes("USD/PKR") && <span className="text-sm">🇺🇸🇵🇰</span>}
                                        {asset.pair.includes("USD/INR") && <span className="text-sm">🇺🇸🇮🇳</span>}
                                        {asset.pair.includes("BTC") && <span className="text-sm font-bold text-amber-400">₿</span>}
                                        {asset.pair.includes("ETH") && <span className="text-sm">⟠</span>}
                                        {asset.pair.includes("BNB") && <span className="text-sm text-amber-400">◆</span>}
                                        {asset.pair.includes("SOL") && <span className="text-sm text-purple-400">◎</span>}
                                        {asset.pair.includes("XRP") && <span className="text-sm text-blue-400">✦</span>}
                                        {asset.pair.includes("DOGE") && <span className="text-sm">🐕</span>}
                                        {asset.pair.includes("Gold") && <span className="text-sm text-yellow-400">●</span>}
                                        {asset.pair.includes("Silver") && <span className="text-sm text-gray-300">●</span>}
                                        {asset.pair.includes("Crude Oil") && <span className="text-sm">🛢</span>}
                                        {asset.pair.includes("Natural Gas") && <span className="text-sm">🔥</span>}
                                        {asset.pair.includes("Apple") && <span className="text-sm">🍎</span>}
                                        {asset.pair.includes("Microsoft") && <span className="text-sm">🪟</span>}
                                        {asset.pair.includes("Amazon") && <span className="text-sm">📦</span>}
                                        {asset.pair.includes("Tesla") && <span className="text-sm">⚡</span>}
                                        {asset.pair.includes("Google") && <span className="text-sm">🔍</span>}
                                        {asset.pair.includes("Meta") && <span className="text-sm">∞</span>}
                                        {asset.pair.includes("Nvidia") && <span className="text-sm">🎮</span>}
                                        {asset.pair.includes("Boeing") && <span className="text-sm">✈</span>}
                                        {asset.pair}
                                        {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>}
                                      </div>
                                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{asset.category}</div>
                                    </div>
                                  </div>

                                  {/* Right: Payout tags */}
                                  <div className="text-right">
                                    <div className="text-[11px] md:text-xs font-mono text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-1 rounded-lg inline-block border border-emerald-500/10 tracking-widest leading-none">
                                      +{asset.payout * 100}% PAYOUT
                                    </div>
                                    <div className="text-[8.5px] text-gray-500 mt-0.5 tracking-tight font-medium">Standard OTC Settlement</div>
                                  </div>
                                </div>
                              );
                            })}

                            {ASSETS.filter((asset) => {
                              const matchesCategory = selectedAssetCategory === "All" || asset.category === selectedAssetCategory;
                              const matchesSearch = asset.pair.toLowerCase().includes(assetSearchQuery.toLowerCase());
                              return matchesCategory && matchesSearch;
                            }).length === 0 && (
                              <div className="p-8 text-center" id="search_no_results">
                                <p className="text-xs text-gray-500 font-mono">No matching OTC instruments found representing "{assetSearchQuery}"</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Modal Footer info */}
                          <div className="p-3 bg-[#0d1529] border-t border-[#22304a] text-center text-[9px] text-gray-500 font-mono tracking-tight flex items-center justify-between px-5">
                            <span>Active Source: Tadex Live OTC Database</span>
                            <span>Secure SSL Encrypted Trading</span>
                          </div>

                        </div>
                      </div>
                    )}
                  </div>

                  {/* Indicators / Options triggers */}
                  <div className="relative">
                    <button
                      id="btn_chart_options"
                      onClick={() => {
                        setShowIndicatorsPanel(!showIndicatorsPanel);
                        setShowPairDropdown(false);
                        setShowDrawingToolsPanel(false);
                      }}
                      className="p-1 px-1.5 md:px-2.5 bg-[#14213d] text-gray-300 hover:text-white border border-[#22304a] hover:border-gray-500 rounded-lg hover:bg-[#1a2b4f] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer shadow text-[10px] md:text-xs font-semibold gap-1"
                      title="Indicators & Layout Options"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Indicators</span>
                    </button>
                    {showIndicatorsPanel && (
                      <div className="absolute left-0 mt-2 w-52 md:w-56 bg-[#0f172a] border border-[#22304a] rounded-xl shadow-2xl z-40 p-2.5 md:p-3 font-sans space-y-3.5 text-xs animate-fadeIn font-sans" id="indicators_dropdown">
                        
                        {/* Indicators Toggles */}
                        <div>
                          <span className="text-[9px] font-mono text-blue-400 block mb-1.5 uppercase tracking-wider font-bold">Technical Indicators</span>
                          <div className="space-y-1.5">
                            <label className="flex items-center justify-between cursor-pointer text-gray-300">
                              <span>Moving Average (MA 14)</span>
                              <input
                                type="checkbox"
                                checked={indicators.ma}
                                onChange={(e) => setIndicators(prev => ({ ...prev, ma: e.target.checked }))}
                                className="w-3.5 h-3.5 border-[#22304a] rounded text-blue-600 focus:ring-blue-500"
                              />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer text-gray-300">
                              <span>Bollinger Bands (BB)</span>
                              <input
                                type="checkbox"
                                checked={indicators.bb}
                                onChange={(e) => setIndicators(prev => ({ ...prev, bb: e.target.checked }))}
                                className="w-3.5 h-3.5 border-[#22304a] rounded text-blue-600 focus:ring-blue-500"
                              />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer text-gray-300">
                              <span>RSI Indicator (RSI)</span>
                              <input
                                type="checkbox"
                                checked={indicators.rsi}
                                onChange={(e) => setIndicators(prev => ({ ...prev, rsi: e.target.checked }))}
                                className="w-3.5 h-3.5 border-[#22304a] rounded text-blue-600 focus:ring-blue-500"
                              />
                            </label>
                          </div>
                        </div>

                        {/* Chart Styles in Dropdown for compliance */}
                        <div className="pt-2.5 border-t border-[#22304a]">
                          <span className="text-[9px] font-mono text-violet-400 block mb-1.5 uppercase tracking-wider font-bold">Chart Styles</span>
                          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-0.5 rounded-md">
                            <button
                              onClick={() => setChartType("candles")}
                              className={`py-1 text-[10px] rounded ${chartType === "candles" ? "bg-slate-800 text-white font-bold" : "text-gray-400 hover:text-white"}`}
                            >
                              Candles
                            </button>
                            <button
                              onClick={() => setChartType("area")}
                              className={`py-1 text-[10px] rounded ${chartType === "area" ? "bg-slate-800 text-white font-bold" : "text-gray-400 hover:text-white"}`}
                            >
                              Area
                            </button>
                          </div>
                        </div>

                        {/* Quick Timeframes Selectors */}
                        <div className="pt-2.5 border-t border-[#22304a]">
                          <span className="text-[9px] font-mono text-emerald-400 block mb-1.5 uppercase tracking-wider font-bold">Timeframe</span>
                          <div className="grid grid-cols-3 gap-1">
                            {(["1m", "5m", "15m", "1H", "4H", "1D"] as const).map((t) => (
                              <button
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`py-0.5 rounded font-mono text-[9px] font-bold ${
                                  timeframe === t
                                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                    : "bg-[#111827] text-gray-400 hover:text-gray-200"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Dedicated Candles / Chart Style direct switch button matching MOBILE TOP BAR FIX */}
                  <div className="relative">
                    <button
                      id="btn_chart_candles_toggle"
                      onClick={() => {
                        setChartType(chartType === "candles" ? "area" : "candles");
                        setShowIndicatorsPanel(false);
                        setShowPairDropdown(false);
                        setShowDrawingToolsPanel(false);
                      }}
                      className={`p-1 px-1.5 md:px-2.5 border rounded-lg text-[10px] md:text-xs flex items-center justify-center gap-1 transition-all font-semibold cursor-pointer shadow ${
                        chartType === "candles"
                          ? "bg-emerald-500/15 border-emerald-500/30 text-[#00C076] font-bold"
                          : "bg-[#14213d] border-[#22304a] text-gray-300 hover:text-white hover:border-gray-500"
                      }`}
                      title="Switch Chart Style (Candles / Area)"
                    >
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      <span>{chartType === "candles" ? "Candles" : "Area"}</span>
                    </button>
                  </div>

                  {/* Candle Timer Indicator badge */}
                  <div className="flex items-center gap-1 px-1.5 py-1 md:px-2.5 md:py-1.5 bg-slate-950/60 border border-[#22304a]/75 rounded-lg text-[9px] md:text-[10px] font-mono font-medium text-slate-300">
                    <span className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-[#f59e0b] animate-ping" />
                    <span className="hidden xs:inline text-gray-500 uppercase text-[8px] tracking-wide font-sans font-bold">Candle:</span>
                    <span className="text-[#f59e0b] font-bold">{candleTimerStr}</span>
                  </div>

                  {/* Drawing Tools Selector button */}
                  <div className="relative">
                    <button
                      id="btn_drawing_tools"
                      onClick={() => {
                        setShowDrawingToolsPanel(!showDrawingToolsPanel);
                        setShowIndicatorsPanel(false);
                        setShowPairDropdown(false);
                      }}
                      className={`p-1 px-1.5 md:px-2.5 ${showDrawingToolsPanel ? "bg-amber-600 text-white border-amber-500" : "bg-[#14213d] text-gray-300 hover:text-white border-[#22304a] hover:border-gray-500"} rounded-lg active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer shadow text-[10px] md:text-xs font-semibold gap-1`}
                      title="Drawing Tools (Lines, Rectangles)"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Drawing Tools</span>
                      <span className="sm:hidden">Draw</span>
                      {activeDrawingTool && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </button>

                    {showDrawingToolsPanel && (
                      <div className="absolute left-0 mt-2 w-56 bg-[#0f172a] border border-[#22304a] rounded-xl shadow-2xl z-40 p-3 font-sans space-y-3 text-xs animate-fadeIn font-sans" id="drawing_tools_dropdown">
                        <div>
                          <span className="text-[9px] font-mono text-cyan-400 block mb-1.5 uppercase tracking-wider font-bold">Draw On Chart</span>
                          
                          <div className="space-y-1.5">
                            <button
                              onClick={() => {
                                setActiveDrawingTool("horizontal");
                                setShowDrawingToolsPanel(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left border ${
                                activeDrawingTool === "horizontal"
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold"
                                  : "bg-[#111827] border-[#22304a] text-gray-300 hover:text-white"
                              }`}
                            >
                              <span>Horizontal Line</span>
                              <span className="text-[9px] font-mono opacity-60">Price level</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveDrawingTool("trend");
                                setShowDrawingToolsPanel(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left border ${
                                activeDrawingTool === "trend"
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold"
                                  : "bg-[#111827] border-[#22304a] text-gray-300 hover:text-white"
                              }`}
                            >
                              <span>Trend Line</span>
                              <span className="text-[9px] font-mono opacity-60">2 clicks</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveDrawingTool("rectangle");
                                setShowDrawingToolsPanel(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left border ${
                                activeDrawingTool === "rectangle"
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold"
                                  : "bg-[#111827] border-[#22304a] text-gray-300 hover:text-white"
                              }`}
                            >
                              <span>Rectangle Shape</span>
                              <span className="text-[9px] font-mono opacity-60">2 clicks</span>
                            </button>
                          </div>
                        </div>

                        {activeDrawingTool && (
                          <div className="bg-[#1e1b4b] border border-[#a21caf]/30 rounded-lg p-2 text-[10px] text-purple-200 font-mono">
                            <span className="font-bold block text-amber-400 font-sans">DRAW MODE ACTIVE</span>
                            <span>Click on chart to place your {activeDrawingTool} drawing</span>
                          </div>
                        )}

                        {drawings.length > 0 && (
                          <button
                            onClick={() => {
                              setDrawings([]);
                              setShowDrawingToolsPanel(false);
                            }}
                            className="w-full text-center py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/40 text-rose-300 hover:text-white rounded-lg transition-all text-[10px] font-semibold cursor-pointer font-sans"
                          >
                            Clear Drawings ({drawings.length})
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Trades Button */}
                  <div className="relative">
                    <button
                      id="btn_open_trades_drawer"
                      onClick={() => setShowMobileTradesSheet(true)}
                      className="w-8 h-8 bg-[#14213d] text-gray-300 hover:text-white border border-[#22304a] hover:border-blue-500 rounded-lg hover:bg-[#1a2b4f] active:scale-[0.98] transition-all flex items-center justify-center cursor-pointer shadow text-xs relative"
                      title="Open Trades Panel & History"
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      {activeTrades.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white shadow-xl border border-[#0c101d]">
                          {activeTrades.length}
                        </span>
                      )}
                    </button>
                  </div>

                </div>

              </div>



              {/* Full high-fidelity HTML5 Canvas Chart wrapper */}
              <div className="flex-1 w-full relative overflow-hidden chart-canvas-wrapper" id="trading_canvas_outer_box">
                <Chart
                  pair={activePair}
                  timeframe={timeframe}
                  chartType={chartType}
                  indicators={indicators}
                  currentPrice={currentPrice}
                  historicalCandles={candles}
                  activeTrades={activeTrades}
                  zoomLevel={zoomLevel}
                  candleTimerStr={candleTimerStr}
                  activeDrawingTool={activeDrawingTool}
                  setActiveDrawingTool={setActiveDrawingTool}
                  drawings={drawings}
                  setDrawings={setDrawings}
                  floatingIndicators={floatingIndicators}
                  gridLinesEnabled={gridLinesEnabled}
                  gridDensity={gridDensity}
                  customBackground={customBackground}
                />

                {/* Compact desktop broker notification on bottom-left corner of the chart */}
                {activeNotification && (
                  <div
                    key={activeNotification.id}
                    className={`absolute left-4 bottom-4 z-50 bg-[#0c1324]/95 border rounded-xl p-3.5 shadow-2xl flex items-center gap-3 font-mono text-xs font-bold min-w-[220px] max-w-[340px] pointer-events-auto select-none animate-slideInLeft ${
                      activeNotification.type === "win" || activeNotification.type === "success"
                        ? "border-emerald-500/85 text-emerald-300 bg-emerald-950/45"
                        : activeNotification.type === "loss" || activeNotification.type === "error"
                        ? "border-rose-500/85 text-rose-300 bg-rose-950/45"
                        : "border-sky-500/85 text-sky-200 bg-sky-950/45"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${
                      activeNotification.type === "win" || activeNotification.type === "success"
                        ? "bg-emerald-400"
                        : activeNotification.type === "loss" || activeNotification.type === "error"
                        ? "bg-rose-400"
                        : "bg-sky-400"
                    }`} />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] text-gray-400 font-sans tracking-widest uppercase font-black">
                        {activeNotification.type === "win" || activeNotification.type === "loss" ? "Contract Settled" : "System Notification"}
                      </span>
                      <span className="tracking-wide text-xs font-semibold whitespace-pre-line leading-relaxed text-gray-200">{activeNotification.msg}</span>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Right side Compact Trade Control Panel and list of Active Trades - Height fits content on mobile */}
            <div className="shrink-0 h-auto md:h-full w-full md:w-80 bg-[#0b1329] pt-1 pb-1.5 px-2.5 md:p-3 flex flex-col justify-start gap-2 md:gap-4 border-t md:border-t-0 border-[#22304a] overflow-visible z-40 relative" id="trade_panel_sidebar">
              
              <div className="space-y-1 md:space-y-3" id="controls_interior_root_v2">
                


                {/* Duration and Stake inputs side-by-side on mobile, stacked on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3" id="controls_side_by_side_container">
                  {/* Compact Duration fields settings */}
                  <div className="space-y-0.5 md:space-y-1 relative" id="time_field_widget">
                    <div className="flex items-center justify-between text-[9.5px] md:text-[10.5px] font-medium text-gray-400 uppercase tracking-wide">
                      <span>Expiration Time</span>
                      <span className="hidden md:inline font-mono text-gray-500 font-bold">Contract</span>
                    </div>
                    <button
                      id="btn_time_selector_trigger"
                      onClick={() => setShowTimeSelector(!showTimeSelector)}
                      className="w-full flex items-center bg-[#111827] border border-[#22304a]/75 hover:border-gray-500 rounded-xl py-1.5 px-2.5 md:p-2.5 transition-all text-center justify-between cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="flex-1 text-center text-xs md:text-sm font-bold font-mono text-white">
                        {tradeMinutes > 0 
                          ? `${tradeMinutes}m ${tradeSeconds > 0 ? `${tradeSeconds}s` : ""}`
                          : `${tradeSeconds}s`
                        }
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {showTimeSelector && (
                      <div className="absolute right-0 bottom-full mb-2 md:bottom-auto md:mb-0 md:top-full md:mt-2 w-full bg-[#0f172a] border border-[#22304a] rounded-xl shadow-2xl z-50 p-2 text-sm grid grid-cols-2 gap-1 font-mono animate-fadeIn" id="time_selector_modal">
                        {[
                          { label: "5s", min: 0, sec: 5 },
                          { label: "10s", min: 0, sec: 10 },
                          { label: "15s", min: 0, sec: 15 },
                          { label: "30s", min: 0, sec: 30 },
                          { label: "1m", min: 1, sec: 0 },
                          { label: "2m", min: 2, sec: 0 },
                          { label: "5m", min: 5, sec: 0 },
                        ].map((opt) => (
                          <button
                            key={opt.label}
                            onClick={() => {
                              setTradeMinutes(opt.min);
                              setTradeSeconds(opt.sec);
                              setShowTimeSelector(false);
                            }}
                            className={`py-2 px-2.5 rounded-lg text-xs font-mono font-bold transition-all text-center cursor-pointer ${
                              (tradeMinutes === opt.min && tradeSeconds === opt.sec)
                                ? "bg-blue-600 text-white shadow-md border border-blue-500"
                                : "bg-[#111827] text-gray-400 hover:text-white hover:bg-slate-800"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Compact Amount Stake settings fields */}
                  <div className="space-y-0.5 md:space-y-1" id="amount_field_widget">
                    <div className="flex items-center justify-between text-[9.5px] md:text-[10.5px] font-medium text-gray-400 uppercase tracking-wide">
                      <span>Investment Amount</span>
                      <span className="hidden md:inline font-mono text-emerald-400 font-bold uppercase">+{getAssetDetails(activePair).payout * 100}%</span>
                    </div>
                    <div className="flex items-center bg-[#111827] border border-[#22304a]/75 rounded-xl p-0.5 md:p-1" id="amount_input_matrix">
                      <button
                        id="btn_amount_dec"
                        onClick={() => adjustAmount(-10)}
                        className="p-1 px-1.5 md:px-2 bg-[#1f2937] text-gray-300 hover:text-white rounded-lg hover:bg-[#2e3b4e] active:scale-[0.9] transition-all flex items-center justify-center cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1 text-center py-0.5 px-1">
                        <input
                          type="number"
                          min="1"
                          value={tradeAmount}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            setTradeAmount(Math.max(1, val));
                          }}
                          className="w-full text-center text-xs md:text-sm font-bold font-mono text-white leading-none bg-transparent focus:outline-none"
                          style={{ appearance: 'textfield' }}
                        />
                      </div>
                      <button
                        id="btn_amount_inc"
                        onClick={() => adjustAmount(10)}
                        className="p-1 px-1.5 md:px-2 bg-[#1f2937] text-gray-355 hover:text-white rounded-lg hover:bg-[#2e3b4e] active:scale-[0.9] transition-all flex items-center justify-center cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Compact Estimated Return row - completely hidden on mobile trading screen */}
                <div className="hidden md:flex items-center justify-between px-3 py-1.5 md:py-2 bg-[#111827]/40 border border-[#22304a]/75 rounded-xl text-xs font-mono">
                  <span className="text-gray-400 text-[10.5px]">Payout Profit ({getAssetDetails(activePair).payout * 100}%):</span>
                  <span className="font-bold text-emerald-400">+${(tradeAmount * getAssetDetails(activePair).payout).toFixed(2)}</span>
                </div>

                {/* Active Call / Put buttons - FULL WIDTH, BOLD, SIMPLE */}
                <div className="flex flex-col gap-2 pt-0.5 md:pt-1" id="order_actions_root">
                  
                  {/* BUY / UP button - full width */}
                  <button
                    id="btn_order_buy"
                    onClick={() => handlePlaceTrade("buy")}
                    className="w-full bg-[#22c55e] hover:bg-emerald-500 active:bg-emerald-600 text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer font-black font-sans shadow-lg shadow-emerald-500/20 flex items-center justify-center h-[56px] md:h-[64px] text-lg md:text-xl tracking-wider"
                  >
                    ▲ UP
                  </button>

                  {/* SELL / DOWN button - full width */}
                  <button
                    id="btn_order_sell"
                    onClick={() => handlePlaceTrade("sell")}
                    className="w-full bg-[#ef4444] hover:bg-rose-500 active:bg-rose-600 text-white rounded-xl active:scale-[0.98] transition-all cursor-pointer font-black font-sans shadow-lg shadow-rose-500/20 flex items-center justify-center h-[56px] md:h-[64px] text-lg md:text-xl tracking-wider"
                  >
                    ▼ DOWN
                  </button>
                </div>

              </div>

              {/* Live list of Active Trades and Order Feed below buttons - Hidden completely on mobile */}
              <div className="hidden md:flex flex-col mt-2 flex-1 min-h-0" id="active_orders_scroll_area">
                <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block mb-2 pb-1 border-b border-[#22304a]">
                  OPEN TRADES ({activeTrades.length})
                </span>

                {activeTrades.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-4 bg-[#111827]/10 rounded-xl border border-[#22304a]/40" id="no_trades_indicator">
                    <Briefcase className="w-4 h-4 text-gray-600 mb-1.5" />
                    <span className="text-[10px] text-gray-500 font-semibold block uppercase">NO LIVE POSITIONS</span>
                    <span className="text-[9px] text-gray-600 leading-normal lowercase mt-0.5 max-w-[180px]">
                      Place an UP/DOWN trade order immediately using the call/put controls.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-0 max-h-[360px] lg:max-h-[calc(100vh-280px)]" id="live_positions_list">
                    {activeTrades.map((trade) => {
                      const isUp = trade.direction === "buy";
                      const isWinning = isUp ? currentPrice > trade.entryPrice : currentPrice < trade.entryPrice;
                      const profitLoss = isWinning ? `+${(trade.amount * trade.payout).toFixed(2)}` : `-${trade.amount.toFixed(2)}`;
                      const secsLeft = Math.max(0, Math.ceil((trade.expirationTime - Date.now()) / 1000));

                      return (
                        <div
                          key={trade.id}
                          className={`p-3 bg-[#0f172a] border rounded-xl flex flex-col gap-1.5 transition-all relative overflow-hidden ${
                            isWinning ? "border-emerald-500/30 bg-emerald-950/5" : "border-rose-500/30 bg-rose-955/5"
                          }`}
                        >
                          <div className={`absolute top-0 left-0 w-[3px] h-full ${isWinning ? "bg-emerald-400" : "bg-rose-400"}`} />

                          <div className="flex justify-between items-center pl-1.5">
                            <span className="text-xs font-mono font-bold text-white">{trade.pair}</span>
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded leading-none ${
                              isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-455"
                            }`}>
                              {isUp ? "CALL ▲" : "PUT ▼"}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono pl-1.5">
                            <div>Stake: <span className="text-white">${trade.amount}</span></div>
                            <div>Entry: <span className="text-white">{trade.entryPrice.toFixed(5)}</span></div>
                          </div>

                          <div className="flex justify-between items-center pt-1.5 border-t border-[#22304a]/75 mt-0.5 pl-1.5">
                            <div className="flex items-center gap-1.5 font-mono text-[10.5px]">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-white font-medium">{secsLeft}s left</span>
                            </div>
                            <span className={`text-xs font-mono font-black ${isWinning ? "text-emerald-400" : "text-rose-405"}`}>
                              {profitLoss} USD
                            </span>
                          </div>

                          <div className="absolute bottom-0 left-0 h-[2px] bg-blue-500" style={{ width: `${Math.min(100, Math.max(0, (secsLeft / trade.duration) * 100))}%` }} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
              )}

              {/* ROUTER SUBPAGES */}
              {currentScreen === "support" && (
                <SupportPage onNavigate={setCurrentScreen} themeHighlight={themeHighlight} />
              )}

              {currentScreen === "profile" && (
                <ProfilePage 
                  traderName={traderName} 
                  email={email} 
                  traderID={traderID} 
                  themeHighlight={themeHighlight}
                  country={country}
                  countryCode={countryCode}
                  countryFlag={countryFlag}
                  onUpdateCountry={handleUpdateCountry}
                />
              )}

              {currentScreen === "tournament" && (
                <TournamentPage themeHighlight={themeHighlight} />
              )}

              {currentScreen === "more" && (
                <MorePage onNavigate={setCurrentScreen} themeHighlight={themeHighlight} />
              )}

              {currentScreen === "analytics" && (
                <AnalyticsPage completedTrades={completedTrades} onNavigate={setCurrentScreen} themeHighlight={themeHighlight} />
              )}

              {currentScreen === "leaderboard" && (
                <LeaderboardPage completedTrades={completedTrades} onNavigate={setCurrentScreen} themeHighlight={themeHighlight} />
              )}

              {currentScreen === "deposit" && (
                <DepositPage liveBalance={liveBalance} setLiveBalance={setLiveBalance} onNavigate={setCurrentScreen} themeHighlight={themeHighlight} />
              )}

              {currentScreen === "withdrawal" && (
                <WithdrawalPage 
                  demoBalance={demoBalance} 
                  liveBalance={liveBalance} 
                  setDemoBalance={setDemoBalance} 
                  setLiveBalance={setLiveBalance} 
                  accountType={accountType} 
                  setAccountType={setAccountType}
                  onNavigate={setCurrentScreen} 
                  themeHighlight={themeHighlight} 
                />
              )}

              {currentScreen === "transactions" && (
                <TransactionsPage transactionHistory={transactionHistory} onNavigate={setCurrentScreen} themeHighlight={themeHighlight} />
              )}

              {currentScreen === "trades_history" && (
                <TradesHistoryPage completedTrades={completedTrades} onNavigate={setCurrentScreen} themeHighlight={themeHighlight} />
              )}

              {currentScreen === "settings" && (
                <SettingsPage 
                  gridLinesEnabled={gridLinesEnabled}
                  setGridLinesEnabled={setGridLinesEnabled}
                  gridDensity={gridDensity}
                  setGridDensity={setGridDensity}
                  customBackground={customBackground}
                  setCustomBackground={setCustomBackground}
                  themeHighlight={themeHighlight}
                  setThemeHighlight={setThemeHighlight}
                  onNavigate={setCurrentScreen}
                />
              )}

            </main>
          </div>

          {/* MOBILE BOTTOM FLOWING NAVIGATION BAR */}
          <nav className="relative h-11 shrink-0 bg-[#0b1329] border-t border-[#22304a] flex items-center justify-around z-50 md:hidden select-none" id="mobile_bottom_nav_bar">
            {[
              { id: "chart", label: "Chart", icon: TrendingUp },
              { id: "support", label: "Support", icon: HelpCircle },
              { id: "profile", label: "Profile", icon: User },
              { id: "tournament", label: "Tournament", icon: Trophy },
              { id: "more", label: "More", icon: Grid },
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = currentScreen === tab.id || (tab.id === "more" && ["analytics", "leaderboard", "deposit", "withdrawal", "transactions", "trades_history", "settings"].includes(currentScreen));
              return (
                <button
                  id={`mobile_tab_${tab.id}`}
                  key={tab.id}
                  onClick={() => setCurrentScreen(tab.id as any)}
                  className={`flex flex-col items-center justify-center flex-1 h-full py-0.5 cursor-pointer transition-colors ${
                    isActive ? "text-blue-400 font-bold font-sans" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <IconComp className="w-4 h-4 mb-0.5" />
                  <span className="text-[8px] uppercase tracking-wide leading-none font-semibold font-sans">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {showMobileTradesSheet && (
            <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end md:justify-center md:items-center" id="mobile_positions_sheet">
              <div className="absolute inset-0 z-10" onClick={() => setShowMobileTradesSheet(false)} />
              
              <div className="relative z-20 w-full max-h-[82vh] md:max-w-md md:rounded-3xl bg-[#0c101d] border-t border-[#22304a] md:border rounded-t-3xl flex flex-col shadow-2xl overflow-hidden animate-slideUp" id="sheet_inner">
                
                <div className="w-full flex justify-center py-3 border-b border-[#22304a]/60 relative">
                  <div className="w-12 h-1 bg-gray-700 rounded-full cursor-pointer" onClick={() => setShowMobileTradesSheet(false)} />
                  <button 
                    onClick={() => setShowMobileTradesSheet(false)}
                    className="absolute right-4 top-2 text-gray-400 hover:text-white font-bold text-xs bg-gray-800/40 px-2.5 py-1 rounded-full cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-4 flex-1 overflow-y-auto space-y-5" id="sheet_content">
                  
                  <div className="flex bg-[#030712] rounded-xl p-1 border border-[#1e293b]" id="sheet_tabs">
                    <button
                      onClick={() => setSheetActiveTab("open")}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                        sheetActiveTab === "open"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Open Trades ({activeTrades.length})
                    </button>
                    <button
                      onClick={() => setSheetActiveTab("history")}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                        sheetActiveTab === "history"
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      Trade History ({completedTrades.length})
                    </button>
                  </div>

                  {sheetActiveTab === "open" ? (
                    <div className="space-y-2.5" id="sheet_open_trades">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block pb-1 border-b border-[#22304a]">
                        Live Positions ({activeTrades.length})
                      </span>
                      {activeTrades.length === 0 ? (
                        <div className="text-center p-8 py-12 bg-[#111827]/30 border border-[#22304a]/30 rounded-2xl flex flex-col items-center justify-center">
                          <Briefcase className="w-6 h-6 text-gray-500 mb-2" />
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">No Active Option Contracts</span>
                          <span className="text-[10px] text-gray-550 mt-1 max-w-[200px] leading-normal">
                            You don't have any open trades right now. Quick-execute is ready at the desk.
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2" id="sheet_active_list">
                          {activeTrades.map((trade) => {
                            const isUp = trade.direction === "buy";
                            const isWinning = isUp ? currentPrice > trade.entryPrice : currentPrice < trade.entryPrice;
                            const profitLoss = isWinning ? `+${(trade.amount * trade.payout).toFixed(2)}` : `-${trade.amount.toFixed(2)}`;
                            const secsLeft = Math.max(0, Math.ceil((trade.expirationTime - Date.now()) / 1000));

                            return (
                              <div
                                key={trade.id}
                                className={`p-3.5 bg-[#111827]/40 border rounded-xl flex flex-col gap-2 relative overflow-hidden ${
                                  isWinning ? "border-emerald-500/30 bg-emerald-950/5" : "border-rose-500/30 bg-rose-955/5"
                                }`}
                              >
                                <div className={`absolute top-0 left-0 w-[4px] h-full ${isWinning ? "bg-emerald-400" : "bg-rose-400"}`} />
                                
                                <div className="flex justify-between items-center pl-1.5">
                                  <span className="text-xs font-mono font-bold text-white">{trade.pair}</span>
                                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded leading-none ${
                                    isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-455"
                                  }`}>
                                    {isUp ? "CALL ▲" : "PUT ▼"}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-[10.5px] text-gray-400 font-mono pl-1.5">
                                  <div>Stake Contract: <span className="text-white font-bold">${trade.amount}</span></div>
                                  <div>Entry Price: <span className="text-white font-bold">{trade.entryPrice.toFixed(5)}</span></div>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t border-[#22304a]/75 mt-0.5 pl-1.5">
                                  <div className="flex items-center gap-1.5 font-mono text-xs">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-white font-semibold">{secsLeft}s left</span>
                                  </div>
                                  <span className={`text-xs font-mono font-black ${isWinning ? "text-emerald-400" : "text-rose-455"}`}>
                                    {profitLoss} USD
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2.5" id="sheet_history_trades">
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block pb-1 border-b border-[#22304a]">
                        Settled Contracts ({completedTrades.length})
                      </span>
                      {completedTrades.length === 0 ? (
                        <div className="text-center p-8 py-12 bg-[#111827]/30 border border-[#22304a]/30 rounded-2xl flex flex-col items-center justify-center">
                          <Activity className="w-6 h-6 text-gray-500 mb-2" />
                          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">No History Found</span>
                          <span className="text-[10px] text-gray-500 mt-1">
                            Once your option contracts expire, results will instantly settle here.
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1" id="sheet_history_list">
                          {completedTrades.map((item) => (
                            <div
                              key={item.id}
                              className={`p-3 bg-[#111827]/30 border rounded-xl flex items-center justify-between ${
                                item.won ? "border-emerald-500/20" : "border-rose-500/20"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${item.won ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                                  <Award className="w-4 h-4" />
                                </div>
                                <div>
                                  <span className="text-xs font-mono font-bold text-white block">{item.pair}</span>
                                  <span className="text-[9px] text-gray-500 uppercase font-mono block">
                                    {item.direction === "buy" ? "Call ▲" : "Put ▼"} • Entry: {item.entryPrice.toFixed(5)}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs font-mono font-bold block ${item.won ? "text-emerald-400" : "text-rose-400"}`}>
                                  {item.won ? `+$${item.profit.toFixed(2)}` : `-$${item.amount.toFixed(2)}`}
                                </span>
                                <span className="text-[9px] text-gray-500 font-mono">Exit: {item.exitPrice.toFixed(5)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
                
                <div className="p-4 bg-[#0a0d16] border-t border-[#22304a]/70">
                  <button
                    onClick={() => setShowMobileTradesSheet(false)}
                    className="w-full py-3 bg-[#1e293b] hover:bg-slate-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer active:scale-[0.98] transition-all"
                  >
                    Dismiss Desk View
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Interactive Broker Toast Shelf removed for new bottom-left Desktop and on-chart Mobile notifications */}



        </div>
      )}

    </div>
  );
}
