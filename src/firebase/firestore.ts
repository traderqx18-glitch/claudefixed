import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  getDocFromServer
} from "firebase/firestore";
import { db, auth } from "./firebase";

// Connect validation logic
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Error Handling Helpers matching Skill spec
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Interfaces matching structural blueprints (Phase 4)
export interface UserDocument {
  uid: string;
  traderId: string;
  email: string;
  fullName: string;
  username: string;
  createdAt: string;
  country?: string;
  countryCode?: string;
  countryFlag?: string;
}

export const COUNTRY_CODELIST: Record<string, { code: string; flag: string }> = {
  "Pakistan": { code: "PK", flag: "🇵🇰" },
  "India": { code: "IN", flag: "🇮🇳" },
  "Bangladesh": { code: "BD", flag: "🇧🇩" },
  "UAE": { code: "AE", flag: "🇦🇪" },
  "Saudi Arabia": { code: "SA", flag: "🇸🇦" },
  "Qatar": { code: "QA", flag: "🇶🇦" },
  "Bahrain": { code: "BH", flag: "🇧🇭" },
  "Oman": { code: "OM", flag: "🇴🇲" },
  "Kuwait": { code: "KW", flag: "🇰🇼" },
  "UK": { code: "GB", flag: "🇬🇧" },
  "USA": { code: "US", flag: "🇺🇸" },
  "Canada": { code: "CA", flag: "🇨🇦" },
  "Australia": { code: "AU", flag: "🇦🇺" },
  "Germany": { code: "DE", flag: "🇩🇪" },
  "France": { code: "FR", flag: "🇫🇷" },
  "Italy": { code: "IT", flag: "🇮🇹" },
  "Spain": { code: "ES", flag: "🇪🇸" },
  "Netherlands": { code: "NL", flag: "🇳🇱" },
  "Singapore": { code: "SG", flag: "🇸🇬" },
  "Malaysia": { code: "MY", flag: "🇲🇾" },
  "Indonesia": { code: "ID", flag: "🇮🇩" },
  "United Arab Emirates": { code: "AE", flag: "🇦🇪" },
};

export interface WalletDocument {
  uid: string;
  demoBalance: number;
  liveBalance: number;
  currency: string;
  updatedAt: string;
}

export interface TradeDocument {
  id: string;
  uid: string;
  asset: string;
  direction: "buy" | "sell" | "up" | "down" | "CALL" | "PUT";
  amount: number;
  entryPrice: number;
  expirySeconds: number;
  status: "open" | "won" | "lost" | "draw";
  openedAt: string;
  closedAt: string | null;
  result: "won" | "lost" | "draw" | null;
  payout?: number;
  account_type?: string;
}

export interface TransactionDocument {
  id: string;
  userId?: string;
  uid: string;
  type: "deposit" | "withdrawal" | string;
  amount: number;
  method?: string;
  status: "completed" | "pending" | "failed" | "rejected" | "cancelled" | string;
  createdAt: string;
  referenceId?: string;
}

// Dual Compatibility return wrappers for smooth frontend interaction (Issue resolution helper)
export interface ExtendedUserProfile extends UserDocument, WalletDocument {
  id: string;
  full_name: string;
  country: string;
  account_status: string;
  demo_balance: number;
  live_balance: number;
}

// Local cache backup utilities for robust offline operation
const localBackup = {
  getUser: (uid: string): any | null => {
    try {
      const raw = localStorage.getItem(`tadex_firebase_user_${uid}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  saveUser: (user: any) => {
    try {
      localStorage.setItem(`tadex_firebase_user_${user.uid || user.id}`, JSON.stringify(user));
    } catch (e) {
      console.warn("Local storage user save error", e);
    }
  },
  getWallet: (uid: string): any | null => {
    try {
      const raw = localStorage.getItem(`tadex_firebase_wallet_${uid}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  saveWallet: (wallet: any) => {
    try {
      localStorage.setItem(`tadex_firebase_wallet_${wallet.uid}`, JSON.stringify(wallet));
    } catch (e) {
      console.warn("Local storage wallet save error", e);
    }
  },
  getTrades: (uid: string): any[] => {
    try {
      const raw = localStorage.getItem(`tadex_firebase_trades_${uid}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveTrade: (uid: string, trade: any) => {
    try {
      const list = localBackup.getTrades(uid);
      const idx = list.findIndex(t => t.id === trade.id);
      if (idx !== -1) {
        list[idx] = trade;
      } else {
        list.unshift(trade);
      }
      localStorage.setItem(`tadex_firebase_trades_${uid}`, JSON.stringify(list));
    } catch (e) {
      console.warn("Local storage trade save error", e);
    }
  },
  getTransactions: (uid: string): any[] => {
    try {
      const raw = localStorage.getItem(`tadex_firebase_txs_${uid}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  saveTransaction: (uid: string, tx: any) => {
    try {
      const list = localBackup.getTransactions(uid);
      if (!list.some(t => t.id === tx.id)) {
        list.unshift(tx);
        localStorage.setItem(`tadex_firebase_txs_${uid}`, JSON.stringify(list));
      }
    } catch (e) {
      console.warn("Local storage transaction save error", e);
    }
  }
};

// Database queries & mutations with automatic legacy-to-modern translation maps
export async function getProfile(uid: string): Promise<any | null> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, "users", uid);
    const walletRef = doc(db, "wallets", uid);
    
    const [userSnap, walletSnap] = await Promise.all([
      getDoc(userRef),
      getDoc(walletRef)
    ]);

    if (userSnap.exists()) {
      const userData = userSnap.data() as UserDocument;
      let walletData: WalletDocument;

      if (walletSnap.exists()) {
        walletData = walletSnap.data() as WalletDocument;
      } else {
        walletData = {
          uid,
          demoBalance: 10000,
          liveBalance: 0,
          currency: "USD",
          updatedAt: new Date().toISOString()
        };
        await setDoc(walletRef, walletData);
      }

      // Merge into high compatibility dual-aspect model
      const mergedProfile = {
        uid: userData.uid,
        id: userData.uid,
        traderId: userData.traderId || "",
        email: userData.email,
        fullName: userData.fullName,
        full_name: userData.fullName,
        username: userData.username,
        createdAt: userData.createdAt,
        country: userData.country || "United Arab Emirates",
        countryCode: userData.countryCode || "AE",
        countryFlag: userData.countryFlag || "🇦🇪",
        account_status: "Verified (Level 1)",
        demoBalance: walletData.demoBalance,
        demo_balance: walletData.demoBalance,
        liveBalance: walletData.liveBalance,
        live_balance: walletData.liveBalance,
        currency: walletData.currency,
        updatedAt: walletDocMap(walletData).updatedAt
      };
      
      localBackup.saveUser(mergedProfile);
      return mergedProfile;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return localBackup.getUser(uid);
}

function walletDocMap(w: any): WalletDocument {
  return {
    uid: w.uid,
    demoBalance: typeof w.demoBalance === "number" ? w.demoBalance : (typeof w.demo_balance === "number" ? w.demo_balance : 10000),
    liveBalance: typeof w.liveBalance === "number" ? w.liveBalance : (typeof w.live_balance === "number" ? w.live_balance : 0),
    currency: w.currency || "USD",
    updatedAt: w.updatedAt || w.updated_at || new Date().toISOString()
  };
}

export async function createProfile(profileInput: any): Promise<any> {
  const uid = profileInput.uid || profileInput.id;
  const path = `users/${uid}`;
  try {
    // Generate unique trader ID (e.g. TR_9X2K7B)
    const traderId = profileInput.traderId || "TR_" + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const selectedCountry = profileInput.country || "United Arab Emirates";
    const mappedCountry = COUNTRY_CODELIST[selectedCountry] || { code: "AE", flag: "🇦🇪" };

    // 1. Prepare modern UserDocument
    const userDoc: UserDocument = {
      uid: uid,
      traderId: traderId,
      email: profileInput.email || "",
      fullName: profileInput.fullName || profileInput.full_name || profileInput.email?.split("@")[0].toUpperCase() || "NEW TRADER",
      username: profileInput.username || profileInput.email?.split("@")[0].toLowerCase() || "trader",
      createdAt: profileInput.createdAt || profileInput.created_at || new Date().toISOString(),
      country: selectedCountry,
      countryCode: mappedCountry.code,
      countryFlag: mappedCountry.flag
    };

    // 2. Prepare modern WalletDocument
    const walletDoc: WalletDocument = {
      uid: uid,
      demoBalance: typeof profileInput.demoBalance === "number" ? profileInput.demoBalance : (typeof profileInput.demo_balance === "number" ? profileInput.demo_balance : 10000),
      liveBalance: typeof profileInput.liveBalance === "number" ? profileInput.liveBalance : (typeof profileInput.live_balance === "number" ? profileInput.live_balance : 0),
      currency: profileInput.currency || "USD",
      updatedAt: new Date().toISOString()
    };

    // Write both documents to Firestore under their designated collections
    await Promise.all([
      setDoc(doc(db, "users", uid), userDoc),
      setDoc(doc(db, "wallets", uid), walletDoc)
    ]);

    // Construct unified return object
    const merged = {
      ...userDoc,
      ...walletDoc,
      id: uid,
      full_name: userDoc.fullName,
      country: userDoc.country,
      countryCode: userDoc.countryCode,
      countryFlag: userDoc.countryFlag,
      account_status: profileInput.account_status || "Verified (Level 1)",
      demo_balance: walletDoc.demoBalance,
      live_balance: walletDoc.liveBalance
    };

    localBackup.saveUser(merged);
    return merged;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
  localBackup.saveUser(profileInput);
  return profileInput;
}

export async function updateUserProfile(uid: string, fields: Partial<UserDocument>): Promise<boolean> {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, fields);
    
    // Refresh local cache representation
    const profile = await getProfile(uid);
    if (profile) {
      localBackup.saveUser(profile);
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
  return false;
}

export async function getWallet(uid: string): Promise<any | null> {
  const path = `wallets/${uid}`;
  try {
    const docRef = doc(db, "wallets", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const mapped = {
        ...data,
        demoBalance: data.demoBalance,
        liveBalance: data.liveBalance,
        demo_balance: data.demoBalance,
        live_balance: data.liveBalance,
        uid: data.uid,
        currency: data.currency || "USD"
      };
      localBackup.saveWallet(mapped);
      return mapped;
    } else {
      const defaultWallet: WalletDocument = {
        uid,
        demoBalance: 10000,
        liveBalance: 0,
        currency: "USD",
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, defaultWallet);
      const mapped = {
        ...defaultWallet,
        demo_balance: defaultWallet.demoBalance,
        live_balance: defaultWallet.liveBalance
      };
      localBackup.saveWallet(mapped);
      return mapped;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
  return localBackup.getWallet(uid);
}

export async function updateWallet(wallet: any): Promise<any> {
  const uid = wallet.uid;
  const path = `wallets/${uid}`;
  try {
    const docRef = doc(db, "wallets", uid);
    const cleanWallet: WalletDocument = {
      uid: uid,
      demoBalance: typeof wallet.demoBalance === "number" ? wallet.demoBalance : (typeof wallet.demo_balance === "number" ? wallet.demo_balance : 10000),
      liveBalance: typeof wallet.liveBalance === "number" ? wallet.liveBalance : (typeof wallet.live_balance === "number" ? wallet.live_balance : 0),
      currency: wallet.currency || "USD",
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, cleanWallet);
    const mapped = {
      ...cleanWallet,
      demo_balance: cleanWallet.demoBalance,
      live_balance: cleanWallet.liveBalance
    };
    localBackup.saveWallet(mapped);
    return mapped;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
  localBackup.saveWallet(wallet);
  return wallet;
}

export async function updateBalance(uid: string, accountType: "demo" | "live", newBalance: number): Promise<boolean> {
  const safeBalance = Math.max(0, Number(newBalance || 0));
  let currentWallet = await getWallet(uid);
  if (!currentWallet) {
    currentWallet = {
      uid,
      demoBalance: accountType === "demo" ? safeBalance : 10000,
      liveBalance: accountType === "live" ? safeBalance : 0,
      currency: "USD",
      updatedAt: new Date().toISOString()
    };
  } else {
    if (accountType === "demo") {
      currentWallet.demoBalance = safeBalance;
      currentWallet.demo_balance = safeBalance;
    } else {
      currentWallet.liveBalance = safeBalance;
      currentWallet.live_balance = safeBalance;
    }
    currentWallet.updatedAt = new Date().toISOString();
  }
  await updateWallet(currentWallet);
  return true;
}

export async function getTrades(uid: string): Promise<any[]> {
  const path = "trades";
  try {
    const q = query(
      collection(db, "trades"), 
      where("uid", "==", uid),
      orderBy("openedAt", "desc")
    );
    const snap = await getDocs(q);
    const results: any[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      results.push(mapTradeDocToLegacy(docSnap.id, data));
    });
    results.forEach((t) => localBackup.saveTrade(uid, t));
    return results;
  } catch (error) {
    try {
      const qFallback = query(collection(db, "trades"), where("uid", "==", uid));
      const snap = await getDocs(qFallback);
      const results: any[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        results.push(mapTradeDocToLegacy(docSnap.id, data));
      });
      results.sort((a, b) => new Date(b.openedAt || b.open_time).getTime() - new Date(a.openedAt || a.open_time).getTime());
      results.forEach((t) => localBackup.saveTrade(uid, t));
      return results;
    } catch (fallbackErr) {
      handleFirestoreError(fallbackErr, OperationType.LIST, path);
    }
  }
  return localBackup.getTrades(uid);
}

function mapTradeDocToLegacy(id: string, t: any): any {
  const openTimeStr = t.openedAt || t.open_time || new Date().toISOString();
  const closeTimeStr = t.closedAt || t.expiry_time || null;
  return {
    id: id,
    uid: t.uid || t.user_id,
    user_id: t.uid || t.user_id,
    asset_symbol: t.asset || t.asset_symbol || "EUR/USD",
    asset: t.asset || t.asset_symbol || "EUR/USD",
    pair: t.asset || t.asset_symbol || "EUR/USD",
    direction: t.direction,
    amount: Number(t.amount || 0),
    entryPrice: Number(t.entryPrice || t.open_price || 1.0),
    open_price: Number(t.entryPrice || t.open_price || 1.0),
    exitPrice: Number(t.exitPrice || t.close_price || 1.0),
    close_price: Number(t.exitPrice || t.close_price || 1.0),
    open_time: openTimeStr,
    openedAt: openTimeStr,
    expiry_time: closeTimeStr,
    closedAt: closeTimeStr,
    expiresAt: t.expiresAt || closeTimeStr,
    expirySeconds: t.expirySeconds || 60,
    status: t.status || "open",
    result: t.result || null,
    payout: t.payout || 0.85,
    account_type: t.account_type || "demo",
    pnl: t.pnl ?? t.profit ?? 0,
    profit: t.pnl ?? t.profit ?? 0
  };
}

export async function insertTrade(trade: any): Promise<any> {
  const path = "trades";
  try {
    const docId = trade.id || trade.tradeId || doc(collection(db, "trades")).id;
    const docRef = doc(db, "trades", docId);
    
    let durationSeconds = 60;
    if (trade.expirySeconds) {
      durationSeconds = trade.expirySeconds;
    } else if (trade.open_time && trade.expiry_time) {
      durationSeconds = Math.max(1, Math.round((new Date(trade.expiry_time).getTime() - new Date(trade.open_time).getTime()) / 1000));
    }

    const uid = trade.uid || trade.user_id || "guest";
    let traderId = "TR_UNKNOWN";
    if (uid !== "guest") {
      const profile = await getProfile(uid);
      if (profile && profile.traderId) {
        traderId = profile.traderId;
      }
    }

    const openedAt = trade.openedAt || trade.open_time || new Date().toISOString();
    const expiresAt = new Date(new Date(openedAt).getTime() + durationSeconds * 1000).toISOString();

    const cleanTrade: any = {
      id: docRef.id,
      uid: uid,
      traderId: traderId,
      asset: trade.asset || trade.asset_symbol || "EUR/USD",
      direction: trade.direction || "buy",
      amount: Number(trade.amount),
      entryPrice: Number(trade.entryPrice || trade.open_price || 1.0),
      expirySeconds: durationSeconds,
      status: trade.status || "open",
      openedAt: openedAt,
      expiresAt: expiresAt,
      closedAt: trade.closedAt || trade.expiry_time || null,
      result: trade.result || null,
      payout: trade.payout || 0.85,
      account_type: trade.account_type || "demo",
      pnl: trade.pnl ?? trade.profit ?? 0
    };

    await setDoc(docRef, cleanTrade);
    console.log(`[Trade Created] Trade ID: ${docRef.id}, User ID: ${cleanTrade.uid}, Trader ID: ${cleanTrade.traderId}, Symbol: ${cleanTrade.asset}, Direction: ${cleanTrade.direction}, Stake: ${cleanTrade.amount}, Entry Price: ${cleanTrade.entryPrice}, Expiry Seconds: ${cleanTrade.expirySeconds}, Expires At: ${cleanTrade.expiresAt}`);
    
    const legacyReady = mapTradeDocToLegacy(docRef.id, cleanTrade);
    localBackup.saveTrade(cleanTrade.uid, legacyReady);
    return legacyReady;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
  localBackup.saveTrade(trade.uid || trade.user_id, trade);
  return trade;
}

export async function updateTrade(tradeId: string, updateData: any): Promise<boolean> {
  const path = `trades/${tradeId}`;
  try {
    const docRef = doc(db, "trades", tradeId);
    
    // Map any incoming update fields to clean modern schema
    const cleanUpdate: any = {};
    if (updateData.status) cleanUpdate.status = updateData.status;
    if (updateData.result) cleanUpdate.result = updateData.result;
    if (updateData.closedAt || updateData.expiry_time) {
      cleanUpdate.closedAt = updateData.closedAt || updateData.expiry_time;
    }
    if (updateData.entryPrice !== undefined || updateData.open_price !== undefined) {
      cleanUpdate.entryPrice = updateData.entryPrice !== undefined ? updateData.entryPrice : updateData.open_price;
    }

    await updateDoc(docRef, cleanUpdate);
    
    // Find uid of the updated trade for local persistence
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const full = snap.data();
      const legacyReady = mapTradeDocToLegacy(tradeId, full);
      localBackup.saveTrade(legacyReady.uid, legacyReady);
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
  return false;
}

// Update user's daily leaderboard entry on live trade resolution
export async function updateDailyLeaderboard(uid: string, profit: number, isWon: boolean) {
  const todayStr = new Date().toISOString().substring(0, 10);
  const docId = `${uid}_${todayStr}`;
  const leadRef = doc(db, "leaderboard", docId);
  
  try {
    const profile = await getProfile(uid);
    if (!profile) return;
    
    const leadSnap = await getDoc(leadRef);
    let currentProfit = 0;
    let totalTrades = 0;
    let wonTrades = 0;
    
    if (leadSnap.exists()) {
      const data = leadSnap.data();
      currentProfit = Number(data.profit || 0);
      totalTrades = Number(data.totalTrades || 0);
      wonTrades = Number(data.wonTrades || 0);
    }
    
    const newProfit = currentProfit + profit;
    const newTotalTrades = totalTrades + 1;
    const newWonTrades = wonTrades + (isWon ? 1 : 0);
    const winRate = newTotalTrades > 0 ? `${Math.round((newWonTrades / newTotalTrades) * 100)}%` : "0%";
    
    await setDoc(leadRef, {
      uid,
      traderName: profile.fullName || profile.full_name || "Anonymous Trader",
      country: profile.country || "United Arab Emirates",
      countryCode: profile.countryCode || "AE",
      countryFlag: profile.countryFlag || "🇦🇪",
      profit: parseFloat(newProfit.toFixed(2)),
      totalTrades: newTotalTrades,
      wonTrades: newWonTrades,
      accuracy: winRate,
      date: todayStr,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    console.log(`[Leaderboard Updated] User ID: ${uid}, newDailyProfit: ${newProfit}, winRate: ${winRate}`);
  } catch (error) {
    console.error("Error setting daily leaderboard:", error);
  }
}

export async function resolveTrade(tradeId: string, won: boolean | "won" | "lost" | "draw", profit: number, exitPrice: number): Promise<boolean> {
  const path = `trades/${tradeId}`;
  try {
    const docRef = doc(db, "trades", tradeId);
    let snap = await getDoc(docRef);
    let attempts = 0;
    while (!snap.exists() && attempts < 3) {
      await new Promise((r) => setTimeout(r, 600));
      snap = await getDoc(docRef);
      attempts++;
    }
    
    if (!snap.exists()) {
      // Create resolved record direct fallback to ensure data persistence is unbroken
      const fallbackUid = auth.currentUser ? auth.currentUser.uid : "guest";
      const fallbackAccountType = "demo"; // default fallback - will be overridden if user is active

      const resolvedTradeDoc: any = {
        id: tradeId,
        uid: fallbackUid,
        traderId: "TR_UNKNOWN",
        asset: "EUR/USD",
        direction: "buy",
        amount: Math.abs(profit),
        entryPrice: exitPrice,
        expirySeconds: 60,
        status: typeof won === "string" ? won : (won ? "won" : "lost"),
        openedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        closedAt: new Date().toISOString(),
        result: typeof won === "string" ? won : (won ? "won" : "lost"),
        payout: 0.85,
        account_type: fallbackAccountType,
        pnl: Number(profit)
      };

      if (fallbackUid !== "guest") {
        const profile = await getProfile(fallbackUid);
        if (profile) {
          resolvedTradeDoc.traderId = profile.traderId || "TR_UNKNOWN";
        }
      }

      await setDoc(docRef, resolvedTradeDoc);
      console.warn(`[Fallback Auto-Creation] Trade ID ${tradeId} was not found on resolveTrade, successfully created placeholder.`);
      snap = await getDoc(docRef);
    }
    const tradeData = snap.data();
    const statusStr = typeof won === "string" ? won : (won ? "won" : "lost");
    const uid = tradeData.uid || "guest";
    const accountType = tradeData.account_type || "demo";

    // Prepare updates
    const cleanUpdate: any = {
      status: statusStr,
      result: statusStr,
      closedAt: new Date().toISOString(),
      exitPrice: exitPrice,
      pnl: Number(profit)
    };

    await updateDoc(docRef, cleanUpdate);
    console.log(`[Trade Resolved] Trade ID: ${tradeId}, status: ${statusStr}, pnl: ${profit}, exitPrice: ${exitPrice}`);

    // Update wallet balance in Firestore if user is logged in
    if (uid !== "guest") {
      const profile = await getProfile(uid);
      if (profile) {
        const currentBal = accountType === "demo" ? profile.demoBalance : profile.liveBalance;
        const newBal = Number((currentBal + profit).toFixed(2));
        await updateBalance(uid, accountType, newBal);
        console.log(`[Wallet Updated] User ID: ${uid}, accountType: ${accountType}, updated balance: ${newBal}`);
        
        // Update leaderboard if live account
        if (accountType === "live") {
          await updateDailyLeaderboard(uid, profit, statusStr === "won");
        }
      }
    }

    // Update local cache
    const updatedSnap = await getDoc(docRef);
    if (updatedSnap.exists()) {
      const full = updatedSnap.data();
      const legacyReady = mapTradeDocToLegacy(tradeId, full);
      localBackup.saveTrade(legacyReady.uid, legacyReady);
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
  return false;
}

export async function getTransactions(uid: string): Promise<any[]> {
  const path = "transactions";
  try {
    const q = query(
      collection(db, "transactions"), 
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const results: any[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      results.push({
        id: docSnap.id,
        userId: data.userId || data.uid || uid,
        uid: data.userId || data.uid || uid,
        user_id: data.userId || data.uid || uid,
        type: data.type,
        amount: Number(data.amount),
        method: data.method || "crypto",
        status: data.status || "completed",
        createdAt: data.createdAt,
        created_at: data.createdAt,
        referenceId: data.referenceId || ""
      });
    });
    results.forEach((tx) => localBackup.saveTransaction(uid, tx));
    return results;
  } catch (error) {
    try {
      const qFallback = query(collection(db, "transactions"), where("uid", "==", uid));
      const snap = await getDocs(qFallback);
      const results: any[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          id: docSnap.id,
          userId: data.userId || data.uid || uid,
          uid: data.userId || data.uid || uid,
          user_id: data.userId || data.uid || uid,
          type: data.type,
          amount: Number(data.amount),
          method: data.method || "crypto",
          status: data.status || "completed",
          createdAt: data.createdAt,
          created_at: data.createdAt,
          referenceId: data.referenceId || ""
        });
      });
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      results.forEach((tx) => localBackup.saveTransaction(uid, tx));
      return results;
    } catch (fallbackErr) {
      console.warn("Transactions read fallback error: returning empty list", fallbackErr);
    }
  }
  return localBackup.getTransactions(uid);
}

export async function insertTransaction(tx: any): Promise<any> {
  const path = "transactions";
  try {
    const docRef = doc(collection(db, "transactions"));
    const uid = tx.userId || tx.uid || tx.user_id || "guest";
    
    const cleanTx: TransactionDocument = {
      id: docRef.id,
      userId: uid,
      uid: uid,
      type: tx.type || "deposit",
      amount: Number(tx.amount),
      method: tx.method || "crypto",
      status: tx.status || "completed",
      createdAt: tx.createdAt || tx.created_at || new Date().toISOString(),
      referenceId: tx.referenceId || ""
    };

    await setDoc(docRef, cleanTx);
    
    const responseMapped = {
      ...cleanTx,
      user_id: cleanTx.uid,
      created_at: cleanTx.createdAt
    };
    localBackup.saveTransaction(cleanTx.uid, responseMapped);
    return responseMapped;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
  localBackup.saveTransaction(tx.userId || tx.uid || tx.user_id, tx);
  return tx;
}

export async function getLeaderboard(): Promise<any[]> {
  try {
    const profilesSnap = await getDocs(collection(db, "users"));
    const list: any[] = [];
    
    for (const pDoc of profilesSnap.docs) {
      const p = pDoc.data();
      const uid = pDoc.id;
      
      const tradesQuery = query(
        collection(db, "trades"),
        where("user_id", "==", uid),
        where("account_type", "==", "live")
      );
      
      const tradesSnap = await getDocs(tradesQuery);
      let totalProfit = 0;
      let wonCount = 0;
      let totalCount = 0;
      
      tradesSnap.forEach((tDoc) => {
        const t = tDoc.data();
        if (t.status !== "open") {
          totalCount++;
          const pnl = Number(t.pnl ?? t.profit ?? 0);
          totalProfit += pnl;
          if (t.status === "won" || t.result === "won") {
            wonCount++;
          }
        }
      });
      
      const accuracy = totalCount > 0 ? `${Math.round((wonCount / totalCount) * 100)}%` : "0%";
      
      if (totalCount > 0) {
        list.push({
          uid,
          traderName: p.fullName || p.username || p.email?.split("@")[0] || "Trader",
          country: p.country || "United Arab Emirates",
          countryCode: p.countryCode || "AE",
          countryFlag: p.countryFlag || "🇦🇪",
          profit: totalProfit,
          accuracy
        });
      }
    }
    
    if (list.length > 0) {
      list.sort((a, b) => b.profit - a.profit);
      return list.slice(0, 10).map((val, idx) => ({
        ...val,
        rank: idx + 1
      }));
    }
  } catch (error) {
    console.warn("Error computing real-time live trading leaderboard, loading baseline:", error);
  }

  // Pre-configured polished baseline leaderboard if empty or offline
  return [
    { rank: 1, country: "United States", countryCode: "US", countryFlag: "🇺🇸", traderName: "fx_whale_99", profit: 14821.50, accuracy: "88%" },
    { rank: 2, country: "United Kingdom", countryCode: "GB", countryFlag: "🇬🇧", traderName: "tadex_ninja", profit: 12422.10, accuracy: "84%" },
    { rank: 3, country: "Germany", countryCode: "DE", countryFlag: "🇩🇪", traderName: "alpha_trader", profit: 9550.00, accuracy: "79%" },
    { rank: 4, country: "Japan", countryCode: "JP", countryFlag: "🇯🇵", traderName: "kobe_fx", profit: 7120.40, accuracy: "76%" },
    { rank: 5, country: "Brazil", countryCode: "BR", countryFlag: "🇧🇷", traderName: "rio_pip", profit: -180.20, accuracy: "73%" },
    { rank: 6, country: "Canada", countryCode: "CA", countryFlag: "🇨🇦", traderName: "maple_bull", profit: 4500.00, accuracy: "71%" },
    { rank: 7, country: "Australia", countryCode: "AU", countryFlag: "🇦🇺", traderName: "sydney_options", profit: 3200.00, accuracy: "68%" },
    { rank: 8, country: "France", countryCode: "FR", countryFlag: "🇫🇷", traderName: "bull_market", profit: -310.40, accuracy: "65%" },
    { rank: 9, country: "South Africa", countryCode: "ZA", countryFlag: "🇿🇦", traderName: "trade_hunter", profit: 1821.50, accuracy: "63%" },
    { rank: 10, country: "Singapore", countryCode: "SG", countryFlag: "🇸🇬", traderName: "option_pioneer", profit: -94.10, accuracy: "60%" }
  ];
}

// Unified export mapper to fully align with standard DB naming from existing widgets
export const firestoreDb = {
  getProfile,
  createProfile,
  updateUserProfile,
  getWallet,
  updateWallet,
  updateBalance,
  getTrades,
  insertTrade,
  updateTrade,
  resolveTrade,
  getTransactions,
  insertTransaction,
  getLeaderboard
};

// --- SPECIALIST MILESTONE IMPLEMENTATIONS: DEPOSITS & WITHDRAWALS & PROMO CODES ---

export interface PromoCodeDocument {
  code: string;
  bonusPercent: number;
  active: boolean;
}

export interface DepositDocument {
  id: string;
  userId: string;
  uid: string;
  username: string;
  country: string;
  method: string;
  paymentMethod: string;
  amount: number;
  promoCode: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface WithdrawalDocument {
  id: string;
  userId: string;
  uid: string;
  username: string;
  country: string;
  method: string;
  amount: number;
  walletAddress?: string;
  destination: string;
  network?: string;
  accountNumber?: string;
  accountName?: string;
  status: "pending" | "processing" | "completed" | "rejected" | "cancelled" | "approved";
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

// Check and seed promo codes in Firestore
export async function seedPromoCodes(): Promise<void> {
  try {
    const promoCodes = ["WELCOME10", "TRADEX20", "VIP25"];
    const bonusMap: Record<string, number> = {
      WELCOME10: 10,
      TRADEX20: 20,
      VIP25: 25
    };

    for (const code of promoCodes) {
      const codeRef = doc(db, "promo_codes", code);
      const snap = await getDoc(codeRef);
      if (!snap.exists()) {
        await setDoc(codeRef, {
          code,
          bonusPercent: bonusMap[code],
          active: true
        });
        console.log(`[Promo Codes Seeder] Seeded ${code} promo code into Firestore.`);
      }
    }
  } catch (error) {
    console.warn("Skipped seeding promo codes or offline fallback applied: ", error);
  }
}

// Validate promo code direct from Firestore
export async function validatePromoCode(inputCode: string): Promise<PromoCodeDocument | null> {
  try {
    const codeRef = doc(db, "promo_codes", inputCode.trim().toUpperCase());
    const snap = await getDoc(codeRef);
    if (snap.exists()) {
      const data = snap.data() as PromoCodeDocument;
      if (data.active) {
        return data;
      }
    }
  } catch (error) {
    console.error("Firestore Promo Code Validation FAILED: ", error);
  }
  
  // Clean constant fallback so matching offline capabilities works
  const fallbackCodes: Record<string, number> = {
    WELCOME10: 10,
    TRADEX20: 20,
    VIP25: 25
  };
  const upperInput = inputCode.trim().toUpperCase();
  if (fallbackCodes[upperInput] !== undefined) {
    return {
      code: upperInput,
      bonusPercent: fallbackCodes[upperInput],
      active: true
    };
  }
  return null;
}

// Get deposits for user
export async function getDeposits(uid: string): Promise<DepositDocument[]> {
  const path = "deposits";
  try {
    const q1 = query(
      collection(db, "deposits"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q1);
    const results: DepositDocument[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const actualUid = d.userId || d.uid || uid;
      results.push({
        id: docSnap.id,
        userId: actualUid,
        uid: actualUid,
        username: d.username || "trader",
        country: d.country || "United States",
        method: d.method || d.paymentMethod || "USDT TRC20",
        paymentMethod: d.method || d.paymentMethod || "USDT TRC20",
        amount: Number(d.amount),
        promoCode: d.promoCode || "",
        status: d.status || "pending",
        createdAt: d.createdAt,
        approvedAt: d.approvedAt || "",
        approvedBy: d.approvedBy || ""
      });
    });
    return results;
  } catch (error) {
    try {
      const qFallback = query(collection(db, "deposits"), where("uid", "==", uid));
      const snap = await getDocs(qFallback);
      const results: DepositDocument[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        const actualUid = d.userId || d.uid || uid;
        results.push({
          id: docSnap.id,
          userId: actualUid,
          uid: actualUid,
          username: d.username || "trader",
          country: d.country || "United States",
          method: d.method || d.paymentMethod || "USDT TRC20",
          paymentMethod: d.method || d.paymentMethod || "USDT TRC20",
          amount: Number(d.amount),
          promoCode: d.promoCode || "",
          status: d.status || "pending",
          createdAt: d.createdAt,
          approvedAt: d.approvedAt || "",
          approvedBy: d.approvedBy || ""
        });
      });
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return results;
    } catch (fallbackErr) {
      console.warn("Deposits read error: returning empty", fallbackErr);
      return [];
    }
  }
}

// Create deposit request
export async function createDeposit(depositData: any): Promise<any> {
  const path = "deposits";
  try {
    const docRef = doc(collection(db, "deposits"));
    const uid = depositData.userId || depositData.uid || "guest";
    const profile = await getProfile(uid);
    const username = profile?.username || profile?.fullName || "trader";
    const country = profile?.country || "United States";

    const newDeposit: DepositDocument = {
      id: docRef.id,
      userId: uid,
      uid,
      username,
      country,
      method: depositData.method || depositData.paymentMethod || "USDT TRC20",
      paymentMethod: depositData.method || depositData.paymentMethod || "USDT TRC20",
      amount: Number(depositData.amount),
      promoCode: depositData.promoCode || "",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, newDeposit);
    return newDeposit;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
  throw new Error("Deposit creation failed");
}

// Helper to record ledger transaction matching standard app style
async function recordTransaction(uid: string, type: "deposit" | "withdrawal" | "trade_win" | "trade_loss" | "bonus" | "adjustment", amount: number, method: string, status: string, referenceId: string = "") {
  try {
    await insertTransaction({
      userId: uid,
      uid,
      type,
      amount,
      method,
      status: (status === "approved" || status === "completed" || status === "success") ? "completed" : (status === "rejected" || status === "cancelled" || status === "failed") ? "failed" : "pending",
      createdAt: new Date().toISOString(),
      referenceId
    });
  } catch (e) {
    console.error("Error inserting ledger transaction: ", e);
  }
}

// Update deposit status directly in Firestore with manual approval workflow
export async function updateDepositStatus(depositId: string, status: "pending" | "approved" | "rejected", approvedBy: string = "Admin"): Promise<boolean> {
  const path = `deposits/${depositId}`;
  try {
    const docRef = doc(db, "deposits", depositId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    const dep = snap.data();

    const timestamp = new Date().toISOString();
    await updateDoc(docRef, { 
      status,
      approvedAt: timestamp,
      approvedBy
    });

    const uid = dep.userId || dep.uid;

    if (status === "approved") {
      let balanceAddition = Number(dep.amount);
      
      if (dep.promoCode) {
        const bonusObj = await validatePromoCode(dep.promoCode);
        if (bonusObj && bonusObj.active) {
          const extra = (Number(dep.amount) * Number(bonusObj.bonusPercent)) / 100;
          balanceAddition += extra;
          console.log(`[Promo Code Applied] Added ${bonusObj.bonusPercent}% bonus!`);
          
          await recordTransaction(uid, "bonus", extra, dep.method || dep.paymentMethod || "USDT TRC20", "completed", depositId);
        }
      }

      const profile = await getProfile(uid);
      if (profile) {
        const currentBal = Number(profile.liveBalance || 0);
        await updateBalance(uid, "live", currentBal + balanceAddition);
        await recordTransaction(uid, "deposit", Number(dep.amount), dep.method || dep.paymentMethod || "USDT TRC20", "completed", depositId);
      }
    } else if (status === "rejected") {
      await recordTransaction(uid, "deposit", Number(dep.amount), dep.method || dep.paymentMethod || "USDT TRC20", "rejected", depositId);
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
  return false;
}

// Get withdrawals for user
export async function getWithdrawals(uid: string): Promise<WithdrawalDocument[]> {
  const path = "withdrawals";
  try {
    const q = query(
      collection(db, "withdrawals"),
      where("userId", "==", uid),
      orderBy("createdAt", "desc")
    );
    const snap = await getDocs(q);
    const results: WithdrawalDocument[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const actualUid = d.userId || d.uid || uid;
      results.push({
        id: docSnap.id,
        userId: actualUid,
        uid: actualUid,
        username: d.username || "trader",
        country: d.country || "United States",
        method: d.method || "USDT TRC20",
        amount: Number(d.amount),
        walletAddress: d.walletAddress || d.destination || "",
        destination: d.walletAddress || d.destination || "",
        network: d.network || "TRC20",
        accountNumber: d.accountNumber || "",
        accountName: d.accountName || "",
        status: d.status || "pending",
        createdAt: d.createdAt,
        processedAt: d.processedAt || "",
        processedBy: d.processedBy || ""
      });
    });
    return results;
  } catch (error) {
    try {
      const qFallback = query(collection(db, "withdrawals"), where("uid", "==", uid));
      const snap = await getDocs(qFallback);
      const results: WithdrawalDocument[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data();
        const actualUid = d.userId || d.uid || uid;
        results.push({
          id: docSnap.id,
          userId: actualUid,
          uid: actualUid,
          username: d.username || "trader",
          country: d.country || "United States",
          method: d.method || "USDT TRC20",
          amount: Number(d.amount),
          walletAddress: d.walletAddress || d.destination || "",
          destination: d.walletAddress || d.destination || "",
          network: d.network || "TRC20",
          accountNumber: d.accountNumber || "",
          accountName: d.accountName || "",
          status: d.status || "pending",
          createdAt: d.createdAt,
          processedAt: d.processedAt || "",
          processedBy: d.processedBy || ""
        });
      });
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return results;
    } catch (fallbackErr) {
      console.warn("Withdrawals read error: returning empty", fallbackErr);
      return [];
    }
  }
}

// Create withdrawal request
export async function createWithdrawal(wData: any): Promise<any> {
  const path = "withdrawals";
  try {
    const docRef = doc(collection(db, "withdrawals"));
    const uid = wData.userId || wData.uid || "guest";
    const profile = await getProfile(uid);
    const username = profile?.username || profile?.fullName || "trader";
    const country = profile?.country || "United States";

    let network = wData.network || "";
    if (!network && wData.method) {
      if (wData.method.includes("TRC20")) network = "TRC20";
      else if (wData.method.includes("ERC20")) network = "ERC20";
      else if (wData.method.includes("BEP20")) network = "BEP20";
    }

    const newWithdrawal: WithdrawalDocument = {
      id: docRef.id,
      userId: uid,
      uid,
      username,
      country,
      method: wData.method,
      amount: Number(wData.amount),
      walletAddress: wData.walletAddress || wData.destination || "",
      destination: wData.walletAddress || wData.destination || "",
      network,
      accountNumber: wData.accountNumber || "",
      accountName: wData.accountName || "",
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    await setDoc(docRef, newWithdrawal);
    await recordTransaction(uid, "withdrawal", newWithdrawal.amount, newWithdrawal.method, "pending", docRef.id);
    return newWithdrawal;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
  throw new Error("Withdrawal creation failed");
}

// Update withdrawal status with full state machine logic
export async function updateWithdrawalStatus(
  withdrawalId: string, 
  status: "pending" | "processing" | "completed" | "rejected" | "cancelled" | "approved",
  processedBy: string = "Admin"
): Promise<boolean> {
  const path = `withdrawals/${withdrawalId}`;
  try {
    const docRef = doc(db, "withdrawals", withdrawalId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return false;
    const w = snap.data();

    if (status === "cancelled" && w.status !== "pending") {
      console.warn("Cannot cancel a withdrawal that is already in process or completed");
      return false;
    }

    const timestamp = new Date().toISOString();
    await updateDoc(docRef, { 
      status,
      processedAt: timestamp,
      processedBy
    });

    const uid = w.userId || w.uid;
    const profile = await getProfile(uid);
    if (profile) {
      const currentBal = Number(profile.liveBalance || 0);

      if (status === "cancelled") {
        await updateBalance(uid, "live", currentBal + Number(w.amount));
        await recordTransaction(uid, "withdrawal", Number(w.amount), w.method, "cancelled", withdrawalId);
      } 
      else if (status === "rejected") {
        await updateBalance(uid, "live", currentBal + Number(w.amount));
        await recordTransaction(uid, "withdrawal", Number(w.amount), w.method, "rejected", withdrawalId);
      }
      else if (status === "completed" || status === "approved") {
        await recordTransaction(uid, "withdrawal", Number(w.amount), w.method, "completed", withdrawalId);
      }
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
  return false;
}

// --- CHARTS & ASSETS ENGINE SEEDING & FETCHING CONSTRAINTS ---

export interface AssetDocument {
  id: string; // e.g. "EUR_USD_OTC"
  symbol: string; // e.g. "EUR/USD OTC"
  displayName: string;
  category: string; // e.g. "Forex OTC", "Crypto OTC", "Commodities OTC", "Stocks OTC"
  isActive: boolean;
  payoutPercent: number;
  sortOrder: number;
  basePrice: number;
  scale?: number;
}

export interface CandleDocument {
  assetId: string;
  timestamp: number; // millisecond timestamp of bar start
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  updatedAt?: number;
}

export const ASSETS_FALLBACK: AssetDocument[] = [
  // Forex OTC
  { id: "EUR_USD_OTC", symbol: "EUR/USD OTC", displayName: "EUR/USD OTC", category: "Forex OTC", isActive: true, payoutPercent: 92, sortOrder: 1, basePrice: 1.08542, scale: 5 },
  { id: "GBP_USD_OTC", symbol: "GBP/USD OTC", displayName: "GBP/USD OTC", category: "Forex OTC", isActive: true, payoutPercent: 88, sortOrder: 2, basePrice: 1.26384, scale: 5 },
  { id: "AUD_CAD_OTC", symbol: "AUD/CAD OTC", displayName: "AUD/CAD OTC", category: "Forex OTC", isActive: true, payoutPercent: 89, sortOrder: 3, basePrice: 0.91254, scale: 5 },
  { id: "USD_JPY_OTC", symbol: "USD/JPY OTC", displayName: "USD/JPY OTC", category: "Forex OTC", isActive: true, payoutPercent: 86, sortOrder: 4, basePrice: 156.421, scale: 3 },
  { id: "USD_CAD_OTC", symbol: "USD/CAD OTC", displayName: "USD/CAD OTC", category: "Forex OTC", isActive: true, payoutPercent: 87, sortOrder: 5, basePrice: 1.36540, scale: 5 },
  { id: "EUR_GBP_OTC", symbol: "EUR/GBP OTC", displayName: "EUR/GBP OTC", category: "Forex OTC", isActive: true, payoutPercent: 86, sortOrder: 6, basePrice: 0.85420, scale: 5 },
  { id: "NZD_USD_OTC", symbol: "NZD/USD OTC", displayName: "NZD/USD OTC", category: "Forex OTC", isActive: true, payoutPercent: 85, sortOrder: 7, basePrice: 0.61240, scale: 5 },
  { id: "AUD_USD_OTC", symbol: "AUD/USD OTC", displayName: "AUD/USD OTC", category: "Forex OTC", isActive: true, payoutPercent: 85, sortOrder: 8, basePrice: 0.66520, scale: 5 },

  // Crypto OTC
  { id: "BTC_USDT_OTC", symbol: "BTC/USDT OTC", displayName: "BTC/USDT OTC", category: "Crypto OTC", isActive: true, payoutPercent: 91, sortOrder: 9, basePrice: 68421.50, scale: 2 },
  { id: "ETH_USDT_OTC", symbol: "ETH/USDT OTC", displayName: "ETH/USDT OTC", category: "Crypto OTC", isActive: true, payoutPercent: 89, sortOrder: 10, basePrice: 3812.40, scale: 2 },
  { id: "BNB_USDT_OTC", symbol: "BNB/USDT OTC", displayName: "BNB/USDT OTC", category: "Crypto OTC", isActive: true, payoutPercent: 85, sortOrder: 11, basePrice: 595.40, scale: 2 },
  { id: "SOL_USDT_OTC", symbol: "SOL/USDT OTC", displayName: "SOL/USDT OTC", category: "Crypto OTC", isActive: true, payoutPercent: 85, sortOrder: 12, basePrice: 164.20, scale: 2 },
  { id: "XRP_USDT_OTC", symbol: "XRP/USDT OTC", displayName: "XRP/USDT OTC", category: "Crypto OTC", isActive: true, payoutPercent: 82, sortOrder: 13, basePrice: 0.5140, scale: 4 },
  { id: "DOGE_USDT_OTC", symbol: "DOGE/USDT OTC", displayName: "DOGE/USDT OTC", category: "Crypto OTC", isActive: true, payoutPercent: 80, sortOrder: 14, basePrice: 0.1425, scale: 4 },

  // Commodities OTC
  { id: "Gold_OTC", symbol: "Gold OTC", displayName: "Gold OTC", category: "Commodities OTC", isActive: true, payoutPercent: 92, sortOrder: 15, basePrice: 2342.50, scale: 2 },
  { id: "Silver_OTC", symbol: "Silver OTC", displayName: "Silver OTC", category: "Commodities OTC", isActive: true, payoutPercent: 88, sortOrder: 16, basePrice: 30.45, scale: 2 },
  { id: "Crude_Oil_OTC", symbol: "Crude Oil OTC", displayName: "Crude Oil OTC", category: "Commodities OTC", isActive: true, payoutPercent: 85, sortOrder: 17, basePrice: 82.30, scale: 2 },
  { id: "Natural_Gas_OTC", symbol: "Natural Gas OTC", displayName: "Natural Gas OTC", category: "Commodities OTC", isActive: true, payoutPercent: 82, sortOrder: 18, basePrice: 2.65, scale: 3 },

  // Stocks OTC
  { id: "Apple_OTC", symbol: "Apple OTC", displayName: "Apple OTC", category: "Stocks OTC", isActive: true, payoutPercent: 90, sortOrder: 19, basePrice: 189.84, scale: 2 },
  { id: "Microsoft_OTC", symbol: "Microsoft OTC", displayName: "Microsoft OTC", category: "Stocks OTC", isActive: true, payoutPercent: 89, sortOrder: 20, basePrice: 421.90, scale: 2 },
  { id: "Amazon_OTC", symbol: "Amazon OTC", displayName: "Amazon OTC", category: "Stocks OTC", isActive: true, payoutPercent: 88, sortOrder: 21, basePrice: 180.50, scale: 2 },
  { id: "Tesla_OTC", symbol: "Tesla OTC", displayName: "Tesla OTC", category: "Stocks OTC", isActive: true, payoutPercent: 88, sortOrder: 22, basePrice: 174.60, scale: 2 },
  { id: "Google_OTC", symbol: "Google OTC", displayName: "Google OTC", category: "Stocks OTC", isActive: true, payoutPercent: 87, sortOrder: 23, basePrice: 173.50, scale: 2 },
  { id: "Meta_OTC", symbol: "Meta OTC", displayName: "Meta OTC", category: "Stocks OTC", isActive: true, payoutPercent: 87, sortOrder: 24, basePrice: 475.20, scale: 2 },
  { id: "Nvidia_OTC", symbol: "Nvidia OTC", displayName: "Nvidia OTC", category: "Stocks OTC", isActive: true, payoutPercent: 86, sortOrder: 25, basePrice: 1064.20, scale: 2 },
  { id: "Boeing_OTC", symbol: "Boeing OTC", displayName: "Boeing OTC", category: "Stocks OTC", isActive: true, payoutPercent: 84, sortOrder: 26, basePrice: 178.40, scale: 2 },
];

export async function seedAssets(): Promise<void> {
  try {
    for (const asset of ASSETS_FALLBACK) {
      const assetRef = doc(db, "assets", asset.id);
      await setDoc(assetRef, asset, { merge: true });
    }
  } catch (err) {
    console.warn("[Assets Seeder] Failed or skipped: ", err);
  }
}

export async function getAssets(): Promise<AssetDocument[]> {
  try {
    const colSnap = await getDocs(collection(db, "assets"));
    if (colSnap.empty) {
      await seedAssets();
      return ASSETS_FALLBACK;
    }
    const results: AssetDocument[] = [];
    colSnap.forEach((docSnap) => {
      results.push(docSnap.data() as AssetDocument);
    });
    results.sort((a, b) => a.sortOrder - b.sortOrder);
    return results;
  } catch (err) {
    console.warn("getAssets read issue: using offline dataset", err);
    return ASSETS_FALLBACK;
  }
}

export async function seedCandlesIfEmpty(assetId: string, basePrice: number): Promise<void> {
  try {
    const q = query(
      collection(db, "candles"),
      where("assetId", "==", assetId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return; // Already initialized!
    }

    console.log(`[Candles Seeder] Initializing 150 historical candles for ${assetId}...`);
    let curVal = basePrice;
    let curTime = Date.now() - 150 * 60 * 1000;

    for (let i = 0; i < 150; i++) {
      const change = (Math.random() - 0.495) * (curVal * 0.001);
      const open = curVal;
      const close = curVal + change;
      const high = Math.max(open, close) + Math.random() * (curVal * 0.0004);
      const low = Math.min(open, close) - Math.random() * (curVal * 0.0004);

      const candleDoc: CandleDocument = {
        assetId,
        timestamp: curTime,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 500) + 50,
        updatedAt: Date.now()
      };

      const docId = `${assetId}_${curTime}`;
      await setDoc(doc(db, "candles", docId), candleDoc);
      curVal = close;
      curTime += 60000;
    }
    console.log(`[Candles Seeder] Successfully seeded ${assetId} chart.`);
  } catch (err) {
    console.warn("[Candles Seeder] Failed or offline mode: ", err);
  }
}

export async function getHistoricalCandles(assetId: string, basePrice: number): Promise<CandleDocument[]> {
  try {
    await seedCandlesIfEmpty(assetId, basePrice);
    const q = query(
      collection(db, "candles"),
      where("assetId", "==", assetId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    const candles: CandleDocument[] = [];
    snap.forEach((docSnap) => {
      candles.push(docSnap.data() as CandleDocument);
    });
    if (candles.length === 0) {
      return generateOfflineFallbackCandles(basePrice);
    }
    return candles.reverse(); // Standard ordering oldest to newest
  } catch (err) {
    console.warn("getHistoricalCandles query failed: returning offline generated dataset", err);
    return generateOfflineFallbackCandles(basePrice);
  }
}

function generateOfflineFallbackCandles(basePrice: number): CandleDocument[] {
  let curVal = basePrice;
  let curTime = Date.now() - 150 * 60 * 1000;
  const history: CandleDocument[] = [];
  for (let i = 0; i < 150; i++) {
    const change = (Math.random() - 0.495) * (curVal * 0.001);
    const open = curVal;
    const close = curVal + change;
    const high = Math.max(open, close) + Math.random() * (curVal * 0.0004);
    const low = Math.min(open, close) - Math.random() * (curVal * 0.0004);
    history.push({
      assetId: "offline",
      timestamp: curTime,
      open,
      high,
      low,
      close,
      volume: 100
    });
    curVal = close;
    curTime += 60000;
  }
  return history;
}

export async function submitLiveTick(assetId: string, nextPrice: number, basePrice: number): Promise<void> {
  try {
    const minuteBoundary = Math.floor(Date.now() / 60000) * 60000;
    const candleId = `${assetId}_${minuteBoundary}`;
    const candleRef = doc(db, "candles", candleId);

    const cSnap = await getDoc(candleRef);
    if (!cSnap.exists()) {
      const newCandle: CandleDocument = {
        assetId,
        timestamp: minuteBoundary,
        open: nextPrice,
        high: nextPrice,
        low: nextPrice,
        close: nextPrice,
        volume: 1,
        updatedAt: Date.now()
      };
      await setDoc(candleRef, newCandle);
    } else {
      const data = cSnap.data() as CandleDocument;
      await setDoc(candleRef, {
        close: nextPrice,
        high: Math.max(data.high, nextPrice),
        low: Math.min(data.low, nextPrice),
        updatedAt: Date.now()
      }, { merge: true });
    }
  } catch (err) {
    // Fail silently
  }
}
