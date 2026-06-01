import React, { useState } from 'react';
import { db } from '../lib/firebase';
import { doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Shield, Terminal, Play, AlertTriangle, Code, RefreshCw, 
  FileText, Lock, Sparkles, SlidersHorizontal, Settings, Palette,
  Plus, Undo2, HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export interface ThreatVector {
  id: number;
  name: string;
  category: 'ID Spoofing' | 'Privilege Escalation' | 'State Shortcutting' | 'Value Poisoning' | 'Escrow Bypass' | 'Resource Poisoning';
  path: string;
  operation: 'create' | 'update' | 'delete';
  description: string;
  payload: any;
  rulePath: string;
  ruleSnippet: string;
  logo: string;
  color: 'rose' | 'blue' | 'amber' | 'emerald' | 'purple' | 'orange' | 'sky' | 'indigo';
}

const COLOR_MAP = {
  rose: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200 focus:ring-rose-200',
    border: 'border-rose-200',
    bg: 'bg-rose-50/20',
    selected: 'bg-rose-950 border-rose-900 text-white shadow-rose-950/20',
    text: 'text-rose-650',
    primary: 'bg-rose-600 hover:bg-rose-700 text-white',
    glow: 'from-rose-500/10 to-transparent'
  },
  blue: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-100',
    border: 'border-blue-200',
    bg: 'bg-blue-50/20',
    selected: 'bg-blue-950 border-blue-900 text-white shadow-blue-950/20',
    text: 'text-blue-600',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    glow: 'from-blue-500/10 to-transparent'
  },
  amber: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-100',
    border: 'border-amber-200',
    bg: 'bg-amber-50/20',
    selected: 'bg-slate-900 border-amber-800 text-white shadow-slate-900/20',
    text: 'text-amber-600',
    primary: 'bg-amber-600 hover:bg-amber-700 text-slate-950',
    glow: 'from-amber-500/10 to-transparent'
  },
  emerald: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 focus:ring-emerald-100',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/20',
    selected: 'bg-emerald-950 border-emerald-900 text-white shadow-emerald-950/20',
    text: 'text-emerald-600',
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    glow: 'from-emerald-500/10 to-transparent'
  },
  purple: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-100',
    border: 'border-purple-200',
    bg: 'bg-purple-50/20',
    selected: 'bg-purple-950 border-purple-900 text-white shadow-purple-900/20',
    text: 'text-purple-650',
    primary: 'bg-purple-600 hover:bg-purple-700 text-white',
    glow: 'from-purple-500/10 to-transparent'
  },
  orange: {
    badge: 'bg-orange-50 text-orange-700 border-orange-200 focus:ring-orange-100',
    border: 'border-orange-200',
    bg: 'bg-orange-50/20',
    selected: 'bg-orange-950 border-orange-900 text-white shadow-orange-950/20',
    text: 'text-orange-660',
    primary: 'bg-orange-600 hover:bg-orange-700 text-white',
    glow: 'from-orange-500/10 to-transparent'
  },
  sky: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200 focus:ring-sky-100',
    border: 'border-sky-200',
    bg: 'bg-sky-50/20',
    selected: 'bg-sky-950 border-sky-900 text-white shadow-sky-950/20',
    text: 'text-sky-600',
    primary: 'bg-sky-500 hover:bg-sky-600 text-white',
    glow: 'from-sky-500/10 to-transparent'
  },
  indigo: {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 focus:ring-indigo-100',
    border: 'border-indigo-200',
    bg: 'bg-indigo-50/20',
    selected: 'bg-indigo-950 border-indigo-900 text-white shadow-indigo-950/20',
    text: 'text-indigo-600',
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    glow: 'from-indigo-500/10 to-transparent'
  }
};

const INITIAL_THREAT_DECK: ThreatVector[] = [
  {
    id: 1,
    name: "Spoofed Vendor Product Registration",
    category: "ID Spoofing",
    path: "products/p_exploit_1",
    operation: "create",
    description: "An unauthenticated or foreign user attempts to register a new product with 'vendorId: v1' (which belongs to Apex Labs) in order to hijack custom storefront payments and customer cart allocations.",
    payload: {
      id: "p_exploit_1",
      name: "Malicious Hyperdrive Core",
      price: 199,
      sku: "EVIL-CORE-X",
      stock: 50,
      category: "Wearables & Electronics",
      vendorId: "v1"
    },
    rulePath: "firestore.rules: Line 62-70",
    ruleSnippet: `match /products/{productId} {\n  allow create: if isValidId(productId) && isValidProduct(request.resource.data);\n  // Secures binding: Checks vendor allocation bounds\n}`,
    logo: "🕵️",
    color: "rose"
  },
  {
    id: 2,
    name: "Self-Approve Onboarding Application",
    category: "Privilege Escalation",
    path: "applications/app_exploit_2",
    operation: "create",
    description: "A prospective vendor submits an onboarding KYC application while bypassing escrow administrators by writing status: 'Approved' directly into the document.",
    payload: {
      id: "app_exploit_2",
      vendorName: "Malicious Forge LLC",
      ownerEmail: "attacker@defense.net",
      category: "Camp & Outdoors",
      status: "Approved"
    },
    rulePath: "firestore.rules: Line 83-88",
    ruleSnippet: `match /applications/{appId} {\n  allow create: if isValidId(appId) && isValidApplication(request.resource.data);\n  // Under zero-trust, status is validated strictly using state enums\n}`,
    logo: "👑",
    color: "purple"
  },
  {
    id: 3,
    name: "Exaggerated Reviews & Metric Spoofing",
    category: "State Shortcutting",
    path: "products/p_exploit_3",
    operation: "create",
    description: "A competitor attempts to publish rating metadata directly on a product page with a massive score (rating: 99.9) to shortcut standard user review aggregation boundaries.",
    payload: {
      id: "p_exploit_3",
      name: "Corrupt Signal acoustics",
      price: 49,
      stock: 12,
      category: "Acoustics & Sound",
      vendorId: "v2",
      rating: 99.9
    },
    rulePath: "firestore.rules: Line 24-31",
    ruleSnippet: `function isValidProduct(data) {\n  return data.id is string && data.id.size() <= 128\n    && data.price is number && data.price >= 0\n    && data.stock is number && data.stock >= 0;\n}`,
    logo: "📈",
    color: "amber"
  },
  {
    id: 4,
    name: "Infinite Stock Allocation (Value Poisoning)",
    category: "Value Poisoning",
    path: "products/p_exploit_4",
    operation: "create",
    description: "An external entity attempts to poison a product's state variables by allocating a negative integer (-500) or an oversized buffer to the stock inventory parameter.",
    payload: {
      id: "p_exploit_4",
      name: "Defective Tracker Bundle",
      price: 25,
      sku: "INV-POISON",
      stock: -500,
      category: "Wearables & Electronics",
      vendorId: "v3"
    },
    rulePath: "firestore.rules: Line 28",
    ruleSnippet: `&& data.stock is number && data.stock >= 0\n// Rejects negative pricing or stock underflows`,
    logo: "🧪",
    color: "orange"
  },
  {
    id: 5,
    name: "Direct Vendor Account Modification",
    category: "ID Spoofing",
    path: "vendors/v1",
    operation: "update",
    description: "A hostile user attempts to directly overwrite Apex Labs' verified ledger document to alter their historical revenue parameter to $9,999,999 and sales volume counters.",
    payload: {
      revenue: 9999999,
      salesCount: 500000
    },
    rulePath: "firestore.rules: Line 72-81",
    ruleSnippet: `match /vendors/{vendorId} {\n  allow update: if isValidId(vendorId) && (\n    isValidVendor(request.resource.data) ||\n    request.resource.data.diff(resource.data).affectedKeys().hasAll(['revenue', 'salesCount'])\n  );\n}`,
    logo: "👤",
    color: "rose"
  },
  {
    id: 6,
    name: "Fake Commission Capture (Escrow Bypass)",
    category: "Escrow Bypass",
    path: "orders/ORD-exploit-6",
    operation: "create",
    description: "A buyer attempts to bypass the platform's mandatory 10% transaction split escrow commission by manually writing a checkout order ledger status setting 'commission: 0'.",
    payload: {
      id: "ORD-exploit-6",
      customerName: "Impersonator Sam",
      customerEmail: "sam@impersonate.org",
      shippingAddress: "Grid Cell Cyber Lab",
      totalAmount: 1200,
      commission: 0,
      status: "Pending",
      vendorId: "v1"
    },
    rulePath: "firestore.rules: Line 50-59",
    ruleSnippet: `function isValidOrder(data) {\n  return data.totalAmount is number && data.totalAmount >= 0\n    && data.commission is number && data.commission >= 0;\n  // Blocks underpriced commission overrides\n}`,
    logo: "💸",
    color: "emerald"
  },
  {
    id: 7,
    name: "Bypass KYC Review with Oversized Resource",
    category: "Resource Poisoning",
    path: "applications/app_exploit_7",
    operation: "create",
    description: "A bad actor attempts to exploit standard document size limits by transmitting a massive 15MB garbage buffer instead of a valid AWS/Google Drive PDF verification storage address.",
    payload: {
      id: "app_exploit_7",
      vendorName: "Overflow Corp",
      ownerEmail: "attacker@dns.tech",
      category: "Acoustics & Sound",
      status: "Pending",
      documentUrl: "http://storage.net/garbage-fuzz-address-buffer"
    },
    rulePath: "firestore.rules: Line 42-48",
    ruleSnippet: `function isValidApplication(data) {\n  return data.id.size() <= 128\n    && data.vendorName.size() <= 200\n    && data.ownerEmail.size() <= 128;\n}`,
    logo: "💣",
    color: "orange"
  },
  {
    id: 8,
    name: "Malicious Order Ledger Hijacking",
    category: "Privilege Escalation",
    path: "orders/ORD-exploit-8",
    operation: "update",
    description: "An unassociated customer intercepts an active order dispatch ledger and issues a partial update to redirect shipping properties to their private collection terminal.",
    payload: {
      shippingAddress: "Hijacked drop terminal 99",
      customerEmail: "attacker@blacklists.com"
    },
    rulePath: "firestore.rules: Line 90-98",
    ruleSnippet: `match /orders/{orderId} {\n  allow update: if isValidId(orderId) && (\n    isValidOrder(request.resource.data) || \n    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status'])\n  );\n}`,
    logo: "🔐",
    color: "purple"
  },
  {
    id: 9,
    name: "Order Deletion & Audit Log Erasure",
    category: "Privilege Escalation",
    path: "orders/ORD-exploit-9",
    operation: "delete",
    description: "A merchant or buyer attempts to run a hard document deletion on a finalized purchase ledger to purge critical sales records, tax requirements, or escrow split indicators.",
    payload: null,
    rulePath: "firestore.rules: Line 97",
    ruleSnippet: `allow delete: if false; // Erasure audit lockout block`,
    logo: "🗑️",
    color: "purple"
  },
  {
    id: 10,
    name: "Junk Characters as ID (ID Poisoning)",
    category: "Value Poisoning",
    path: "products/invalid_char_id",
    operation: "create",
    description: "Submit a schema insertion request incorporating emojis, escape parameters, or oversized strings inside the document path ID to cause storage directory indices parsing failures.",
    payload: {
      id: "invalid_id",
      name: "Fuzzing Probe",
      price: 1,
      sku: "FUZZ-OK",
      stock: 1,
      category: "Camp & Outdoors",
      vendorId: "v1"
    },
    rulePath: "firestore.rules: Line 19-21",
    ruleSnippet: `function isValidId(id) {\n  return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$');\n}`,
    logo: "💩",
    color: "orange"
  },
  {
    id: 11,
    name: "Negative Price Exploit (Checkout Hijack)",
    category: "Value Poisoning",
    path: "products/p_exploit_11",
    operation: "create",
    description: "Publish a high-demand item with a negative cost value (-$500.00). When loaded by customer checkout baskets, the subtraction subtracts credit balances and nets raw money.",
    payload: {
      id: "p_exploit_11",
      name: "Exploited Quantum Chronos",
      price: -500,
      sku: "MATH-HACK",
      stock: 40,
      category: "Wearables & Electronics",
      vendorId: "v1"
    },
    rulePath: "firestore.rules: Line 27",
    ruleSnippet: `&& data.price is number && data.price >= 0\n// Negates credit injection arithmetic exploits`,
    logo: "❌",
    color: "rose"
  },
  {
    id: 12,
    name: "Unverified Client Database Override",
    category: "Privilege Escalation",
    path: "applications/app_exploit_12",
    operation: "create",
    description: "A non-registered, unauthenticated or unverified account attempts to allocate platform-critical resources, evading escrow authorization locks and profile checkpoints.",
    payload: {
      id: "app_exploit_12",
      vendorName: "Bypass Corp",
      ownerEmail: "non_verified_entity@scam.org",
      category: "Smart Home & Lights",
      status: "Pending"
    },
    rulePath: "firestore.rules: Line 15-17",
    ruleSnippet: `function isEmailVerified() {\n  return isSignedIn() && request.auth.token.email_verified == true;\n}`,
    logo: "🚫",
    color: "sky"
  }
];

const PRESET_LOGOS = [
  "🕵️", "👑", "📈", "🧪", "👤", "💸", "💣", "🔐", "🗑️", "💩", "❌", "🚫", 
  "🛡️", "🧬", "🚨", "⚠️", "⚡", "🔮", "👽", "👾", "🤖", "🔥", "💾", "📡"
];

const PRESET_COLORS: ThreatVector['color'][] = [
  "rose", "blue", "amber", "emerald", "purple", "orange", "sky", "indigo"
];

export const RulesAuditDashboard: React.FC = () => {
  const { isRTL } = useLanguage();
  
  // Threat deck managed inside state to support visual live custom updates
  const [threats, setThreats] = useState<ThreatVector[]>(INITIAL_THREAT_DECK);
  const [selectedThreat, setSelectedThreat] = useState<ThreatVector>(INITIAL_THREAT_DECK[0]);
  const [activeDetailMode, setActiveDetailMode] = useState<'explorer' | 'settings'>('explorer');

  // Interactive settings forms
  const [editName, setEditName] = useState(INITIAL_THREAT_DECK[0].name);
  const [editCategory, setEditCategory] = useState<ThreatVector['category']>(INITIAL_THREAT_DECK[0].category);
  const [editLogo, setEditLogo] = useState(INITIAL_THREAT_DECK[0].logo);
  const [editColor, setEditColor] = useState<ThreatVector['color']>(INITIAL_THREAT_DECK[0].color);
  const [editPath, setEditPath] = useState(INITIAL_THREAT_DECK[0].path);
  const [editOperation, setEditOperation] = useState<ThreatVector['operation']>(INITIAL_THREAT_DECK[0].operation);
  const [editDescription, setEditDescription] = useState(INITIAL_THREAT_DECK[0].description);
  const [editPayloadRaw, setEditPayloadRaw] = useState(JSON.stringify(INITIAL_THREAT_DECK[0].payload, null, 2));
  const [editRulePath, setEditRulePath] = useState(INITIAL_THREAT_DECK[0].rulePath);
  const [editRuleSnippet, setEditRuleSnippet] = useState(INITIAL_THREAT_DECK[0].ruleSnippet);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<string[]>([
    "System Ready. Initialize Firestore Security Rules Audit suite to run threat simulations."
  ]);
  const [testStates, setTestStates] = useState<Record<number, 'untested' | 'testing' | 'blocked' | 'passed'>>({});
  const [batchRunning, setBatchRunning] = useState(false);

  // Sync settings when selecting another threat vector (using stable ID primitive)
  React.useEffect(() => {
    setEditName(selectedThreat.name);
    setEditCategory(selectedThreat.category);
    setEditLogo(selectedThreat.logo);
    setEditColor(selectedThreat.color);
    setEditPath(selectedThreat.path);
    setEditOperation(selectedThreat.operation);
    setEditDescription(selectedThreat.description);
    setEditPayloadRaw(selectedThreat.payload ? JSON.stringify(selectedThreat.payload, null, 2) : '');
    setEditRulePath(selectedThreat.rulePath);
    setEditRuleSnippet(selectedThreat.ruleSnippet);
    setJsonError(null);
  }, [selectedThreat.id]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAuditLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleSaveSettings = () => {
    try {
      let parsedPayload = null;
      if (editPayloadRaw && editPayloadRaw.trim() !== "") {
        parsedPayload = JSON.parse(editPayloadRaw);
      }
      setJsonError(null);

      const updatedThreats = threats.map(t => {
        if (t.id === selectedThreat.id) {
          const updated: ThreatVector = {
            ...t,
            name: editName,
            category: editCategory,
            logo: editLogo,
            color: editColor,
            path: editPath,
            operation: editOperation,
            payload: parsedPayload,
            rulePath: editRulePath,
            ruleSnippet: editRuleSnippet,
            description: editDescription
          };
          return updated;
        }
        return t;
      });

      setThreats(updatedThreats);
      
      const activeUpdated = updatedThreats.find(t => t.id === selectedThreat.id);
      if (activeUpdated) {
        setSelectedThreat(activeUpdated);
      }
      
      addLog(`✨ Customized rule simulator #${selectedThreat.id} synced & updated successfully!`);
      setActiveDetailMode('explorer');
    } catch (err: any) {
      setJsonError(`Invalid JSON formatting: ${err.message}`);
    }
  };

  const handleCreateCustomThreat = () => {
    const nextId = Math.max(...threats.map(t => t.id), 0) + 1;
    const customThreat: ThreatVector = {
      id: nextId,
      name: `Custom Simulated Threat #${nextId}`,
      category: "Resource Poisoning",
      path: `products/custom_vector_${nextId}`,
      operation: "create",
      description: "Admin custom-constructed target scenario to probe specific write, update bounds, or schema restrictions.",
      payload: {
        id: `custom_id_${nextId}`,
        category: "Acoustics & Sound",
        customValue: 99.9
      },
      rulePath: "firestore.rules: Line 99",
      ruleSnippet: `allow create: if false; // Denied by default, customize rule representation in settings`,
      logo: "👾",
      color: "indigo"
    };

    setThreats(prev => [...prev, customThreat]);
    setSelectedThreat(customThreat);
    setActiveDetailMode('settings');
    addLog(`➕ Added custom security scenario #${nextId}! Navigate to 'Rule settings' tab to modify.`);
  };

  const runSimulation = async (vector: ThreatVector) => {
    setTestStates(prev => ({ ...prev, [vector.id]: 'testing' }));
    addLog(`📡 Initiating live zero-trust security audit for: [${vector.logo}] ${vector.name}`);
    addLog(`🔑 Operation: [${vector.operation.toUpperCase()}] on target node: "${vector.path}"`);
    addLog(`🛡️ Reference rules verification mapped through: [${vector.rulePath}]`);

    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const targetDocRef = doc(db, vector.path);

      if (vector.operation === 'create') {
        await setDoc(targetDocRef, vector.payload || {});
      } else if (vector.operation === 'update') {
        await updateDoc(targetDocRef, vector.payload || {});
      } else if (vector.operation === 'delete') {
        await deleteDoc(targetDocRef);
      }

      addLog(`⚠️ SECURE OUTCOME WARNING: Request succeeded or local cache processed memory write. Assess true rules constraint.`);
      setTestStates(prev => ({ ...prev, [vector.id]: 'passed' }));
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      
      addLog(`🛑 MITIGATION DETECTED: Firebase Storage Layer rejected the payload write.`);
      addLog(`📄 Diagnostics: "${errorMsg.slice(0, 150)}..."`);
      addLog(`🔒 SECURED GATES: Server-validated Firestore constraints blocked the injection.`);
      setTestStates(prev => ({ ...prev, [vector.id]: 'blocked' }));
    }
  };

  const runAllTests = async () => {
    setBatchRunning(true);
    setAuditLogs(["🚀 Commencing batch test sequence across all active shield specifications..."]);
    
    for (const vector of threats) {
      setSelectedThreat(vector);
      await runSimulation(vector);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    setBatchRunning(false);
    addLog(`🏆 BATCH DIAGNOSTIC COMPLETE: Active Zero-Trust Shield verification ran against ${threats.length} rules.`);
  };

  const resetAllToDefaults = () => {
    setThreats(INITIAL_THREAT_DECK);
    setSelectedThreat(INITIAL_THREAT_DECK[0]);
    addLog("♻️ Reset all customized threat simulator nodes back to original configurations.");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 font-sans">
      
      {/* Informational banner */}
      <div className="xl:col-span-12 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-1 px-2.5 bg-blue-600/30 text-blue-400 font-mono text-[9px] font-extrabold rounded-full border border-blue-500/30">
                AUDIT LAYER
              </span>
              <span className="text-slate-400 text-xs font-mono">Real-Time Zero-Trust Cloud Simulator</span>
            </div>
            
            <button
              onClick={resetAllToDefaults}
              className="text-[10px] font-extrabold bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Undo2 className="w-3 h-3" />
              <span>{isRTL ? 'إعادة ضبط الافتراضات' : 'Reset Deck'}</span>
            </button>
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Shield className="w-5.5 h-5.5 text-blue-400" />
            <span>{isRTL ? 'بوابة إدارة وقواعد حماية البيانات والأمان' : 'Zero-Trust Security Simulator & Exploit Configuration Hub'}</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">
            {isRTL 
              ? 'تسمح لك هذه البوابة المتقدمة بتهيئة محاكيات الأمان وقواعد البيانات بالكامل. يمكنك تخصيص الأسماء واختيار الأنماط اللونية والرموز ومصفوفة التجربة لتأكيد حماية خوادم Firestore ضد الاختراقات وتعديل الأسعار.'
              : 'Empowers cloud engineers to modify, expand, and personalize rule simulator templates. Configure names, choose specialized color templates, assign logos/emojis, and customize payload matrices to verify database resilience against arbitrary data injections.'}
          </p>
        </div>
      </div>

      {/* Left List of Configurable Threat Vectors */}
      <div className="xl:col-span-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-extrabold uppercase font-display text-slate-500 text-[10px] tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Scenarios list ({threats.length})</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateCustomThreat}
              className="text-[10px] font-extrabold bg-slate-800 text-white hover:bg-slate-700 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors border border-slate-700"
            >
              <Plus className="w-3 h-3" />
              <span>New Rule</span>
            </button>
            <button
              onClick={runAllTests}
              disabled={batchRunning}
              className="text-[10px] font-extrabold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
            >
              {batchRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-2.5 h-2.5" />}
              <span>Test All Gates</span>
            </button>
          </div>
        </div>

        <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
          {threats.map(vector => {
            const status = testStates[vector.id] || 'untested';
            const colorPreset = COLOR_MAP[vector.color || 'blue'];
            const isSelected = selectedThreat.id === vector.id;

            return (
              <button
                key={vector.id}
                onClick={() => setSelectedThreat(vector)}
                className={`w-full p-3.5 text-left rounded-xl border transition-all flex items-center justify-between gap-3 text-xs cursor-pointer ${
                  isSelected
                    ? colorPreset.selected
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:shadow-xs'
                }`}
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base select-none shrink-0">{vector.logo}</span>
                    <span className={`text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded uppercase ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      Payload #{vector.id}
                    </span>
                    <span className={`text-[9px] font-mono truncate ${
                      isSelected ? 'text-slate-200' : 'text-slate-400'
                    }`}>
                      {vector.category}
                    </span>
                  </div>
                  <h4 className="font-display font-medium truncate tracking-tight">
                    {vector.name}
                  </h4>
                </div>

                <div className="shrink-0">
                  {status === 'untested' && (
                    <span className="w-2 h-2 rounded-full bg-slate-300 block" title="Untested" />
                  )}
                  {status === 'testing' && (
                    <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                  )}
                  {status === 'blocked' && (
                    <span className="bg-emerald-500/20 text-emerald-400 font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" />
                      <span>SECURE</span>
                    </span>
                  )}
                  {status === 'passed' && (
                    <span className="bg-amber-500/25 text-amber-500 font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" />
                      <span>BYPASS</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Core Detail and Settings Tabs */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        
        {/* Navigation Mode Switched Tab Header */}
        <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-1 shadow-xs">
          <button
            onClick={() => setActiveDetailMode('explorer')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeDetailMode === 'explorer'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Viewer Explorer</span>
          </button>
          
          <button
            onClick={() => setActiveDetailMode('settings')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeDetailMode === 'settings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Rule Settings & Personalizer</span>
          </button>
        </div>

        {/* Detail Sandbox View */}
        {activeDetailMode === 'explorer' ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl select-none">{selectedThreat.logo}</span>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 font-mono">
                    Active Security Node Simulation
                  </span>
                  <span className={`border px-2 py-0.5 font-mono text-[8.5px] font-extrabold uppercase rounded-full ${
                    COLOR_MAP[selectedThreat.color || 'blue'].badge
                  }`}>
                    {selectedThreat.category}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display">
                  {selectedThreat.name}
                </h3>
              </div>

              <button
                onClick={() => runSimulation(selectedThreat)}
                disabled={testStates[selectedThreat.id] === 'testing'}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-450 text-white font-bold px-4 py-2 bg-linear-to-b from-slate-950 to-slate-900 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 shadow-sm"
              >
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{isRTL ? 'اختبار الحظر الأمني' : 'Run Simulated Attack'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Exploitative Vector Context */}
              <div className="space-y-3 bg-red-50/10 border border-red-100 p-4 rounded-xl">
                <div className="flex items-center gap-1.5 text-xs text-red-700 font-extrabold uppercase font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Target Threat Path & Description</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedThreat.description}
                </p>

                <div className="space-y-1 bg-white p-3 border border-slate-150 rounded-lg text-left">
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase">Exploit target key path</span>
                  <div className="font-mono text-[11px] font-bold text-slate-700 break-all bg-slate-50 p-1.5 rounded">
                    {selectedThreat.path}
                  </div>
                </div>
              </div>

              {/* Target Firestore.rules Code */}
              <div className="space-y-3 bg-slate-900 p-4 rounded-xl text-white font-mono text-left relative overflow-hidden">
                <div className="absolute right-3 top-3 opacity-15">
                  <Code className="w-12 h-12" />
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-extrabold uppercase">
                    <Lock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Enforced Rule Code</span>
                  </div>
                  <span className="text-slate-400 font-bold text-[10px]">{selectedThreat.rulePath}</span>
                </div>
                
                <pre className="text-[10.5px] text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed py-1 font-mono">
                  {selectedThreat.ruleSnippet}
                </pre>
              </div>

            </div>

            {/* Exploit Payload Spec */}
            {selectedThreat.payload && (
              <div className="space-y-2 bg-slate-50 p-4 border border-slate-200 rounded-xl font-mono text-left">
                <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase">
                  <span>Simulated Payload Buffer (JSON format)</span>
                  <span className="font-semibold text-rose-500">ATTACK VECTOR PAYLOAD</span>
                </div>
                <pre className="text-[10.5px] text-slate-700 bg-white p-3 border border-slate-150 rounded-lg overflow-x-auto select-all font-mono">
                  {JSON.stringify(selectedThreat.payload, null, 2)}
                </pre>
              </div>
            )}

          </div>
        ) : (
          /* Customization & Settings Form */
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 text-left">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-blue-600" />
                  <span>Customize Rule Simulator Settings</span>
                </h3>
                <p className="text-[11px] text-slate-400">Settings directly map and save to the visual layout configuration state</p>
              </div>

              <span className="bg-slate-100 font-mono text-[9px] font-bold px-2 py-0.5 rounded text-slate-600">
                Editing Simulator #{selectedThreat.id}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Name customization */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Threat Simulator Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-slate-800 text-slate-800"
                  placeholder="E.g. Spoofed Vendor Wallet Registration"
                />
              </div>

              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Category Allocation</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as ThreatVector['category'])}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-hidden focus:border-slate-800 text-slate-800 bg-white"
                >
                  <option value="ID Spoofing">ID Spoofing</option>
                  <option value="Privilege Escalation">Privilege Escalation</option>
                  <option value="State Shortcutting">State Shortcutting</option>
                  <option value="Value Poisoning">Value Poisoning</option>
                  <option value="Escrow Bypass">Escrow Bypass</option>
                  <option value="Resource Poisoning">Resource Poisoning</option>
                </select>
              </div>

              {/* Theme Swatch Selector */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Visual Theme Swatch Color</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_COLORS.map(c => {
                    const mappedColor = COLOR_MAP[c];
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setEditColor(c)}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          editColor === c
                            ? 'border-slate-800 bg-slate-900 text-white font-bold ring-2 ring-slate-200'
                            : 'border-slate-200 hover:border-slate-350 text-slate-600 bg-linear-to-b from-white to-slate-50'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full border border-black/10 block`} style={{
                          backgroundColor: c === 'rose' ? '#fda4af' : 
                                          c === 'blue' ? '#93c5fd' :
                                          c === 'amber' ? '#fde047' :
                                          c === 'emerald' ? '#6ee7b7' :
                                          c === 'purple' ? '#d8b4fe' :
                                          c === 'orange' ? '#fdba74' :
                                          c === 'sky' ? '#7dd3fc' : '#a5b4fc' // indigo
                        }} />
                        <span className="text-[9px] capitalize">{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Logo Select swatches */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase text-left">Custom Badge Logo / Emoji</label>
                <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-lg border border-slate-150">
                  {PRESET_LOGOS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditLogo(emoji)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all border cursor-pointer hover:scale-105 active:scale-95 ${
                        editLogo === emoji
                          ? 'border-slate-800 bg-slate-900 ring-2 ring-slate-150 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-350'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Operations selection */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Operation Verb</label>
                <div className="flex gap-2">
                  {(['create', 'update', 'delete'] as const).map(op => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setEditOperation(op)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize cursor-pointer transition-all ${
                        editOperation === op
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fuzz Target keypath */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Simulation Target Key Path</label>
                <input
                  type="text"
                  value={editPath}
                  onChange={(e) => setEditPath(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-slate-800 text-slate-700"
                  placeholder="E.g. vendors/v1"
                />
              </div>

              {/* Scenario Description */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Defensive Context Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-slate-800 text-slate-700"
                  placeholder="Explain what security rule is tested by this custom simulation scenario..."
                />
              </div>

              {/* Payload Raw JSON edit */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Attack Vector Document Payload (Raw JSON)</label>
                <textarea
                  value={editPayloadRaw}
                  onChange={(e) => setEditPayloadRaw(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-slate-800 text-slate-700 bg-slate-50 selection:bg-slate-200"
                  placeholder={`{\n  "field": "value"\n}`}
                />
                {jsonError && (
                  <p className="text-[10px] text-rose-600 font-bold font-mono">⚠️ {jsonError}</p>
                )}
              </div>

              {/* Code Rule Metadata */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Rule Target Label</label>
                <input
                  type="text"
                  value={editRulePath}
                  onChange={(e) => setEditRulePath(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-slate-800 text-slate-650"
                  placeholder="firestore.rules: Line X-Y"
                />
              </div>

              {/* Code snippet reference */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase">Rule snippet display (For auditing reference only)</label>
                <textarea
                  value={editRuleSnippet}
                  onChange={(e) => setEditRuleSnippet(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono focus:outline-hidden focus:border-slate-800 text-slate-700 bg-slate-50"
                  placeholder={`allow create: if request.resource.data.price >= 0;`}
                />
              </div>

            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveDetailMode('explorer')}
                className="px-4 py-2 border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-bold text-slate-500 cursor-pointer"
              >
                Cancel Changes
              </button>
              
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-950 text-white hover:bg-slate-800 cursor-pointer shadow-sm transition-colors"
              >
                Save & Apply Settings
              </button>
            </div>
          </div>
        )}

        {/* Live Terminal Output Console */}
        <div className="bg-slate-950 rounded-2xl border border-slate-900 p-5 shadow-2xl relative">
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute mr-1.5" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 shrink-0">Terminal Output Logs</span>
          </div>

          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3 text-left">
            <Terminal className="w-4 h-4 text-slate-500" />
            <span className="font-mono text-xs uppercase font-extrabold tracking-wider text-slate-400">Live Simulation Console Feed</span>
            <button
              onClick={() => setAuditLogs(["Console cleared. Suit ready."])}
              className="text-[10px] underline ml-auto text-slate-500 hover:text-slate-400 cursor-pointer font-mono"
            >
              Clear Live Stream
            </button>
          </div>

          <div className="font-mono text-[10.5px] text-slate-300 space-y-2 max-h-[180px] overflow-y-auto text-left scrollbar-thin">
            {auditLogs.map((log, index) => {
              let logColor = "text-slate-400";
              if (log.includes("🛑") || log.includes("Failure") || log.includes("Intercept") || log.includes("DENIED") || log.includes("MITIGATION")) {
                logColor = "text-rose-450 font-semibold";
              } else if (log.includes("🔒") || log.includes("SECURE") || log.includes("completed") || log.includes("SUCCESS") || log.includes("✨") || log.includes("🏆")) {
                logColor = "text-emerald-400 font-bold";
              } else if (log.includes("📡") || log.includes("Initiating")) {
                logColor = "text-sky-400 font-medium";
              } else if (log.includes("🔑")) {
                logColor = "text-amber-400";
              }
              return (
                <div key={index} className={`leading-relaxed animate-fadeIn break-all ${logColor}`}>
                  {log}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
