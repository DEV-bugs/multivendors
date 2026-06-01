import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { DynamicAreaChart } from '../components/Charts';
import { RulesAuditDashboard } from '../components/RulesAuditDashboard';
import { 
  DollarSign, Percent, Store, Users, CheckCircle, XCircle, AlertCircle, 
  Search, SlidersHorizontal, Eye 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EM_LIST = ['⚙️', '🛡️', '📊', '🌐', '🚀', '🔮', '💡', '💎', '🎨', '👑'];
export const VEN_EM_LIST = ['🏬', '⛺', '☀️', '👜', '👕', '🍔', '🍕', '⚙️', '💎', '🎮'];
export const COLOR_LIST = [
  { name: 'indigo' as const, hex: '#6366f1', label: 'Indigo' },
  { name: 'blue' as const, hex: '#3b82f6', label: 'Blue' },
  { name: 'rose' as const, hex: '#f43f5e', label: 'Rose' },
  { name: 'emerald' as const, hex: '#10b981', label: 'Emerald' },
  { name: 'amber' as const, hex: '#f59e0b', label: 'Amber' },
  { name: 'purple' as const, hex: '#a855f7', label: 'Purple' },
  { name: 'slate' as const, hex: '#64748b', label: 'Slate' },
  { name: 'orange' as const, hex: '#f97316', label: 'Orange' }
];

export const getColorClasses = (color: string) => {
  switch (color) {
    case 'blue': return {
      text: 'text-blue-600',
      bg: 'bg-blue-50/70',
      border: 'border-blue-200',
      bgGradient: 'from-blue-600 to-cyan-700',
      btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      badge: 'bg-blue-50 text-blue-700 border-blue-200'
    };
    case 'rose': return {
      text: 'text-rose-600',
      bg: 'bg-rose-50/70',
      border: 'border-rose-200',
      bgGradient: 'from-rose-600 to-pink-700',
      btn: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
      badge: 'bg-rose-50 text-rose-700 border-rose-200'
    };
    case 'emerald': return {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50/70',
      border: 'border-emerald-200',
      bgGradient: 'from-emerald-600 to-teal-700',
      btn: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    case 'amber': return {
      text: 'text-amber-600',
      bg: 'bg-amber-50/70',
      border: 'border-amber-200',
      bgGradient: 'from-amber-500 to-orange-600',
      btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200'
    };
    case 'purple': return {
      text: 'text-purple-600',
      bg: 'bg-purple-50/70',
      border: 'border-purple-200',
      bgGradient: 'from-purple-600 to-fuchsia-700',
      btn: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500',
      badge: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    case 'slate': return {
      text: 'text-slate-700',
      bg: 'bg-slate-100',
      border: 'border-slate-200',
      bgGradient: 'from-slate-700 to-slate-900',
      btn: 'bg-slate-705 hover:bg-slate-800 focus:ring-slate-500',
      badge: 'bg-slate-100 text-slate-800 border-slate-200'
    };
    case 'orange': return {
      text: 'text-orange-600',
      bg: 'bg-orange-50/70',
      border: 'border-orange-200',
      bgGradient: 'from-orange-500 to-red-650',
      btn: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-505',
      badge: 'bg-orange-50 text-orange-750 border-orange-200'
    };
    case 'indigo':
    default: return {
      text: 'text-indigo-600',
      bg: 'bg-indigo-50/70',
      border: 'border-indigo-200',
      bgGradient: 'from-indigo-600 to-violet-700',
      btn: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
  }
};

export const AdminPortal: React.FC = () => {
  const { 
    vendors, applications, orders, products,
    approveApplication, rejectApplication, setSelectedVendorId, setRole,
    portalSettings, updatePortalSettings, loginLogs, clearLoginLogs
  } = useApp();

  const { t, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'verified' | 'kyc' | 'rules' | 'settings'>('overview');
  const [kycRejectId, setKycRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Customization State Form
  const [adminTitle, setAdminTitle] = useState(portalSettings.adminTitle);
  const [adminLogo, setAdminLogo] = useState(portalSettings.adminLogo);
  const [adminColor, setAdminColor] = useState(portalSettings.adminColor);
  const [vendorTitle, setVendorTitle] = useState(portalSettings.vendorTitle);
  const [vendorLogo, setVendorLogo] = useState(portalSettings.vendorLogo);
  const [vendorColor, setVendorColor] = useState(portalSettings.vendorColor);
  const [logSearch, setLogSearch] = useState('');
  const [logRoleFilter, setLogRoleFilter] = useState('All');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [confirmClearLogs, setConfirmClearLogs] = useState(false);

  // Table search & filters
  const [leaderboardSearch, setLeaderboardSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Compute metrics in real-time based on orders list
  const totalGmv = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);
  const totalCommission = orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.commission : sum, 0);
  const totalUniqueCustomersCount = new Set(orders.map(o => o.customerEmail)).size + 14; // baseline + simulation offset
  const pendingOnboardCount = applications.filter(a => a.status === 'Pending').length;

  // Render dummy ledger trends
  const chartData = [
    { label: 'Jan', value: 24000, secondaryValue: 2400 },
    { label: 'Feb', value: 31000, secondaryValue: 3100 },
    { label: 'Mar', value: 28500, secondaryValue: 2850 },
    { label: 'Apr', value: 42000, secondaryValue: 4200 },
    { label: 'May', value: totalGmv, secondaryValue: totalCommission }
  ];

  // Store lists summary
  const merchantCategories = Array.from(new Set(vendors.map(v => v.category)));

  // Filter Catalog - translated categories map helper
  const translateCategory = (cat: string) => {
    switch (cat) {
      case 'All': return t('allCategories');
      case 'Wearables & Electronics': return isRTL ? 'الأجهزة القابلة للارتداء والإلكترونيات' : cat;
      case 'Athletics & Footwear': return isRTL ? 'الرياضة والأحذية الرياضية' : cat;
      case 'Acoustics & Sound': return isRTL ? 'الصوتيات والأنظمة الصوتية' : cat;
      case 'Smart Home & Lights': return isRTL ? 'المنزل الذكي والإضاءة' : cat;
      case 'Camp & Outdoors': return isRTL ? 'التخييم والأنشطة الخارجية' : cat;
      default: return cat;
    }
  };

  const filteredStoreLeaderboard = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(leaderboardSearch.toLowerCase()) || 
                          v.ownerEmail.toLowerCase().includes(leaderboardSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const colors = getColorClasses(portalSettings.adminColor);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Upper Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2">
            <span className="text-3xl filter drop-shadow-sm">{portalSettings.adminLogo}</span>
            <span>{portalSettings.adminTitle || t('operationsLedgerTitle')}</span>
          </h1>
          <p className="text-sm text-slate-450 mt-1">
            {t('descAdminPortal')}
          </p>
        </div>

        {/* Top bar quick tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-200/60 p-1 rounded-lg border border-slate-200 text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-650 hover:text-slate-900'
            }`}
          >
            {t('analyticsTab')}
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              activeTab === 'verified' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-650 hover:text-slate-900'
            }`}
          >
            {t('activeSellers')} ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('kyc')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all relative ${
              activeTab === 'kyc' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-650 hover:text-slate-900'
            }`}
          >
            {t('onboardingApps')}
            {pendingOnboardCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-650 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold shadow-xs">
                {pendingOnboardCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              activeTab === 'rules' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-650 hover:text-slate-900'
            }`}
          >
            {t('rulesAuditTab')}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
              activeTab === 'settings' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-650 hover:text-slate-900'
            }`}
          >
            {isRTL ? "الإعدادات والسجلات ⚙️" : "Settings & Logs ⚙️"}
          </button>
        </div>
      </div>

      {/* Primary Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-extrabold text-slate-450 font-display tracking-wider block">
              {t('totalMarketGmv')}
            </span>
            <div className="text-2xl font-bold font-display text-slate-900">
              ${totalGmv.toLocaleString()}
            </div>
            <span className="text-[11px] font-mono text-emerald-600 flex items-center gap-1 font-semibold">
              <span>▲</span> +18.4% this quarter
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-extrabold text-slate-450 font-display tracking-wider block">
              {t('platformCut')} (10%)
            </span>
            <div className="text-2xl font-bold font-display text-slate-900">
              ${totalCommission.toLocaleString()}
            </div>
            <span className="text-[11px] font-mono text-emerald-650 flex items-center gap-1">
              <span>▲</span> Net earnings update real-time
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Percent className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-extrabold text-slate-450 font-display tracking-wider block">
              {t('activeSellers')}
            </span>
            <div className="text-2xl font-bold font-display text-slate-900">
              {vendors.length}
            </div>
            <span className="text-[11px] font-mono text-slate-500 block">
              {pendingOnboardCount} KYC queues open
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Store className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-start justify-between">
          <div className="space-y-1.5">
            <span className="text-xs uppercase font-extrabold text-slate-450 font-display tracking-wider block">
              {t('buyerCount')}
            </span>
            <div className="text-2xl font-bold font-display text-slate-900">
              {totalUniqueCustomersCount}
            </div>
            <span className="text-[11px] font-mono text-slate-500 block">
              Active shopping cart telemetry
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Tab Context Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn"
          >
            {/* Left Big Area Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold font-display text-slate-800">Gross Marketplace Growth</h3>
                  <p className="text-xs text-slate-400">Comparing total item sales and subsequent platform commissions captured over time.</p>
                </div>
              </div>
              <DynamicAreaChart data={chartData} color="#2563EB" secondaryColor="#10B981" showToggle={true} />
            </div>

            {/* Right: Quick Task Ledger Status list */}
            <div className="space-y-4 col-span-1">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold font-display text-slate-800">Direct Actions Matrix</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 text-red-900 border border-red-100 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{t('onboardingApps')}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-red-750">
                      There are {pendingOnboardCount} merchants awaiting registration verify steps to start publishing list products.
                    </p>
                    <button
                      onClick={() => setActiveTab('kyc')}
                      className="text-xs font-bold text-red-900 underline mt-1.5 block hover:text-red-950 cursor-pointer"
                    >
                      Process Moderation Now →
                    </button>
                  </div>

                  <div className="p-3 bg-blue-50 text-blue-900 border border-blue-100 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>Live Ledger Sync</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-blue-800">
                      Our system captures 10% on every checkout instantly. Customer checkouts are reflected seamlessly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick List: Storefront Inventory Audit */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold font-display text-xs uppercase text-slate-400 tracking-wider">Registered Items</h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Active catalog items</span>
                    <span className="font-mono font-semibold text-slate-950">{products.length} Products</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Pending shipments</span>
                    <span className="font-mono font-semibold text-slate-950">
                      {orders.filter(o => o.status === 'Pending').length} Orders
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Delivered count</span>
                    <span className="font-mono font-semibold text-slate-950">
                      {orders.filter(o => o.status === 'Delivered').length} Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'verified' && (
          <motion.div
            key="merchants-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn space-y-4 p-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-bold font-display text-slate-800 text-lg">Merchant Ledger Register</h3>
                <p className="text-xs text-slate-500">Live search database of verified sellers, tier categories, and financial logs.</p>
              </div>

              {/* Table Filter Operations */}
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center pointer-events-none text-slate-400`}>
                    🛡️
                  </span>
                  <input
                    type="text"
                    placeholder="Search merchant name..."
                    value={leaderboardSearch}
                    onChange={(e) => setLeaderboardSearch(e.target.value)}
                    className={`py-1.5 w-48 text-xs bg-slate-50 border border-slate-250 rounded-lg text-slate-705 outline-none focus:border-slate-350 focus:bg-white transition-all ${isRTL ? 'pr-8 pl-3' : 'pl-8 pr-3'}`}
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 focus:bg-white focus:outline-none"
                  >
                    <option value="All">All Tiers</option>
                    {merchantCategories.map((c, i) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wide bg-slate-50">
                    <th className="p-3 pl-4">Merchant Name</th>
                    <th className="p-3">Category Cluster</th>
                    <th className="p-3">Email Access</th>
                    <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>Cumulative Sales</th>
                    <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>Total Net Fee (10%)</th>
                    <th className="p-3 text-center font-mono">Identity Cert</th>
                    <th className="p-3 text-center">Status</th>
                    <th className={`p-3 ${isRTL ? 'text-left pl-4' : 'text-right pr-4'}`}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStoreLeaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                        No active sellers matching current parameters.
                      </td>
                    </tr>
                  ) : (
                    filteredStoreLeaderboard.map(v => {
                      const merchantOrders = orders.filter(o => o.vendorId === v.id);
                      const computedRevenue = merchantOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                      const computedCommission = merchantOrders.reduce((sum, o) => sum + o.commission, 0);

                      return (
                        <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 pl-4 font-semibold text-slate-900 flex items-center gap-2">
                            <span className="text-lg">{v.logo}</span>
                            <span>{v.name}</span>
                          </td>
                          <td className="p-3 text-slate-500 font-mono text-[11px]">{translateCategory(v.category)}</td>
                          <td className="p-3 text-slate-500 font-mono">{v.ownerEmail}</td>
                          <td className={`p-3 font-mono font-medium text-slate-800 ${isRTL ? 'text-left' : 'text-right'}`}>
                            ${(v.revenue + computedRevenue).toLocaleString()}
                          </td>
                          <td className={`p-3 font-mono text-emerald-600 font-semibold ${isRTL ? 'text-left' : 'text-right'}`}>
                            ${(v.revenue * 0.1 + computedCommission).toLocaleString()}
                          </td>
                          <td className="p-3 text-center">
                            <span className="bg-slate-100 text-slate-600 font-mono tracking-tighter px-2 py-0.5 rounded text-[10px] border border-slate-200">
                              {v.idDocumentUrl || 'verified_cert.pdf'}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-1px px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                              v.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : v.status === 'Suspended'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${v.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="ml-1">{v.status}</span>
                            </span>
                          </td>
                          <td className={`p-3 ${isRTL ? 'text-left pl-4' : 'text-right pr-4'}`}>
                            <button
                              onClick={() => {
                                setSelectedVendorId(v.id);
                                setRole('Vendor');
                              }}
                              className="text-amber-600 hover:text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1 justify-end ml-auto"
                            >
                              <span>View Ops</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'kyc' && (
          <motion.div
            key="kyc-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6 animate-fadeIn"
          >
            {/* Pending applications roster */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
              <div>
                <h3 className="font-bold font-display text-slate-800 text-lg">{t('onboardingApps')}</h3>
                <p className="text-xs text-slate-500">
                  Inspect incoming vendor applications, identity certifications, and industry tier compliance before store provisioning.
                </p>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                {applications.filter(a => a.status === 'Pending').length === 0 ? (
                  <div className="py-12 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200 text-slate-400 font-mono text-xs">
                    No pending registration queue documents at this moment. Everything is reviewed.
                  </div>
                ) : (
                  applications.filter(a => a.status === 'Pending').map(app => (
                    <div key={app.id} className="pt-4 first:pt-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-fadeIn">
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-950 font-display text-sm">{app.vendorName}</h4>
                          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] uppercase font-bold rounded-full font-mono tracking-wide">
                            {translateCategory(app.category)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono">
                          Owner Contact: <span className="text-slate-850 font-bold">{app.ownerEmail}</span> | Applied Date: <span className="text-slate-900">{app.appliedDate}</span>
                        </p>
                        
                        {/* Fake verification PDF preview details */}
                        <div className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-100 rounded-lg text-xs font-mono text-slate-600">
                          <span className="text-emerald-500 font-bold">✔</span>
                          <span>Identity Doc Verified: <span className="text-indigo-600 font-bold underline cursor-pointer">{app.documentUrl}</span></span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-400 text-[10px]">ECC Sign Safe Match</span>
                        </div>
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center gap-2 lg:self-center">
                        {kycRejectId === app.id ? (
                          <div className="flex items-center gap-2 w-full max-w-sm">
                            <input
                              type="text"
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Reason for dismissal..."
                              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 focus:outline-none focus:border-slate-300 w-44"
                            />
                            <button
                              onClick={() => {
                                if (!rejectReason) return alert('Provide reject reason');
                                rejectApplication(app.id, rejectReason);
                                setKycRejectId(null);
                                setRejectReason('');
                              }}
                              className="bg-red-650 text-white font-bold p-1.5 rounded-md hover:bg-red-700 cursor-pointer text-xs"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setKycRejectId(null)}
                              className="text-slate-500 bg-slate-100 p-1.5 rounded-md hover:bg-slate-200 font-medium cursor-pointer text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => approveApplication(app.id)}
                              className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <span className="text-[14px]">✔</span>
                              <span>{t('onboardApprove')}</span>
                            </button>
                            <button
                              onClick={() => setKycRejectId(app.id)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <span>✗</span>
                              <span>Dismiss</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Application history register log */}
            <div className="bg-slate-900 border border-slate-800 text-slate-200 p-5 rounded-2xl shadow-lg space-y-3.5 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-450">{t('auditTrailTitle')}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Live Session Logging</span>
              </div>

              <div className="space-y-2 text-xs scrollbar-thin">
                {applications.filter(a => a.status !== 'Pending').length === 0 ? (
                  <div className="text-slate-500 text-[11px]">No verification operations filed globally.</div>
                ) : (
                  applications.filter(a => a.status !== 'Pending').map(app => (
                    <div key={app.id} className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-sky-400">[{app.status}]</span>{' '}
                        <span className="text-slate-300 font-bold">{app.vendorName}</span>
                        <span className="text-slate-500"> ({translateCategory(app.category)})</span>
                        {app.status === 'Rejected' && (
                          <div className="text-red-400 text-[10px] ml-4 mt-0.5">↳ Reason: {app.reason}</div>
                        )}
                      </div>
                      <span className="text-slate-500 text-[10px] shrink-0 font-bold">UTC: OK</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </motion.div>
        )}
        {activeTab === 'rules' && (
          <motion.div
            key="rules-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="animate-fadeIn"
          >
            <RulesAuditDashboard />
          </motion.div>
        )}
        {activeTab === 'settings' && (
          <motion.div
            key="settings-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* Branding Settings Form */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-lg font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
                <span className="p-1 rounded bg-slate-100 text-slate-800">🎨</span>
                <span>{isRTL ? 'إعدادات هوية ومظهر لوحات التحكم' : 'Dashboard Branding & Identity Customizations'}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Dashboard Personalization */}
                <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-200/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <span className="p-1 rounded bg-indigo-50 text-indigo-650 text-xs">👤</span>
                      {isRTL ? 'لوحة تحكم المدير (الآدمن)' : 'Admin Dashboard Customization'}
                    </h3>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">Admin Portal</span>
                  </div>

                  {/* Title Customizer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">
                      {isRTL ? 'عنوان لوحة تحكم المدير:' : 'Admin Dashboard Title:'}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-indigo-500"
                      value={adminTitle}
                      onChange={(e) => setAdminTitle(e.target.value)}
                      placeholder="e.g. Operations Ledger Suite"
                    />
                  </div>

                  {/* Icon Emoji Customizer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">
                      {isRTL ? 'شعار المدير (إيموجي):' : 'Admin Header Logo (Emoji):'}
                    </label>
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="text"
                        maxLength={4}
                        className="w-12 text-center px-1 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-hidden"
                        value={adminLogo}
                        onChange={(e) => setAdminLogo(e.target.value)}
                      />
                      <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                        {EM_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setAdminLogo(emoji)}
                            className={`w-7 h-7 rounded-md text-xs flex items-center justify-center transition-all cursor-pointer ${
                              adminLogo === emoji ? 'bg-indigo-600 text-white scale-110 shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Theme Color Customizer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">
                      {isRTL ? 'اللون الرئيسي لمظهر المدير:' : 'Admin Accent Color Theme:'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_LIST.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setAdminColor(color.name)}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            adminColor === color.name ? 'border-indigo-650 bg-indigo-50 text-indigo-750 font-extrabold shadow-sm' : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: color.hex }} />
                          <span className="truncate">{color.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vendor Dashboard Personalization */}
                <div className="p-5 bg-slate-50/50 rounded-xl border border-slate-200/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                      <span className="p-1 rounded bg-amber-50 text-amber-650 text-xs">🏬</span>
                      {isRTL ? 'لوحة تحكم البائع (التاجر)' : 'Vendor Dashboard Customization'}
                    </h3>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-mono font-bold">Vendor Portal</span>
                  </div>

                  {/* Title Customizer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">
                      {isRTL ? 'عنوان لوحة البائع:' : 'Vendor Dashboard Title:'}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-amber-500"
                      value={vendorTitle}
                      onChange={(e) => setVendorTitle(e.target.value)}
                      placeholder="e.g. Vendor Storefront Suite"
                    />
                  </div>

                  {/* Icon Emoji Customizer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">
                      {isRTL ? 'شعار البائع (إيموجي):' : 'Vendor Header Logo (Emoji):'}
                    </label>
                    <div className="flex flex-wrap gap-2 items-center">
                      <input
                        type="text"
                        maxLength={4}
                        className="w-12 text-center px-1 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-hidden"
                        value={vendorLogo}
                        onChange={(e) => setVendorLogo(e.target.value)}
                      />
                      <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none">
                        {VEN_EM_LIST.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setVendorLogo(emoji)}
                            className={`w-7 h-7 rounded-md text-xs flex items-center justify-center transition-all cursor-pointer ${
                              vendorLogo === emoji ? 'bg-amber-600 text-white scale-110 shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Theme Color Customizer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 block">
                      {isRTL ? 'اللون الرئيسي لمظهر البائع:' : 'Vendor Accent Color Theme:'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {COLOR_LIST.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setVendorColor(color.name)}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            vendorColor === color.name ? 'border-amber-600 bg-amber-50 text-amber-750 font-extrabold shadow-sm' : 'border-slate-200 bg-white text-slate-650 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: color.hex }} />
                          <span className="truncate">{color.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save & Confirm Feedbacks */}
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <p className="text-xs text-slate-500">
                  {isRTL ? 'تطبق التغييرات محلياً فوراً بمجرد الحفظ.' : 'Branding guidelines update across the entire app configuration instantly.'}
                </p>

                <div className="flex items-center gap-3">
                  {saveSuccess && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 animate-pulse">
                      <span>✓</span>
                      {isRTL ? 'تم حفظ التعديلات بنجاح وتطبيق المظهر!' : 'Custom portal styles initialized perfectly!'}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      updatePortalSettings({
                        adminTitle,
                        adminLogo,
                        adminColor,
                        vendorTitle,
                        vendorLogo,
                        vendorColor
                      });
                      setSaveSuccess(true);
                      setTimeout(() => setSaveSuccess(false), 2500);
                    }}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer ${colors.btn}`}
                  >
                    {isRTL ? 'حفظ وتحديث هوية المنصة' : 'Apply Brand Theme'}
                  </button>
                </div>
              </div>
            </div>

            {/* Authentications Audit Log */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold font-display text-slate-900 flex items-center gap-2">
                    <span className="p-1 rounded bg-rose-50 text-rose-600 text-sm">🔒</span>
                    <span>{isRTL ? 'سجل رقابة عمليات تسجيل الدخول' : 'Security Access & Login Logs'}</span>
                  </h2>
                  <p className="text-xs text-slate-450 mt-1">
                    {isRTL ? 'سجل أمني فوري يراقب عمليات تسجيل الدخول لضمان موثوقية العمليات وضبط الهوية.' : 'Real-time security log tracking authentication keys, roles, and status.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {confirmClearLogs ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-rose-600 font-bold">{isRTL ? 'تأكيد الحذف؟' : 'Ready to clear?'}</span>
                      <button
                        onClick={() => {
                          clearLoginLogs();
                          setConfirmClearLogs(false);
                        }}
                        className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                      >
                        {isRTL ? 'نعم، مسح' : 'Yes, wipe'}
                      </button>
                      <button
                        onClick={() => setConfirmClearLogs(false)}
                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold cursor-pointer"
                      >
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmClearLogs(true)}
                      disabled={loginLogs.length === 0}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold disabled:opacity-40 transition-all cursor-pointer"
                    >
                      {isRTL ? 'تفريغ السجل الأمني' : 'Wipe Audit Trail'}
                    </button>
                  )}
                </div>
              </div>

              {/* Logs Search Filter Panel */}
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-450 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder={isRTL ? 'البحث بالبريد الإلكتروني للتاجر او الاسم...' : 'Query by email, display name, profile...'}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:border-slate-300"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium shrink-0">{isRTL ? 'تصفية بالرتبة:' : 'Role:'}</span>
                  <select
                    value={logRoleFilter}
                    onChange={(e) => setLogRoleFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden"
                  >
                    <option value="All">{isRTL ? 'الكل' : 'All Roles'}</option>
                    <option value="Admin">{isRTL ? 'مدير منصة (Admin)' : 'Admin'}</option>
                    <option value="Vendor">{isRTL ? 'شريك بيع (Vendor)' : 'Vendor'}</option>
                    <option value="Customer">{isRTL ? 'عميل تسوق (Customer)' : 'Customer'}</option>
                  </select>
                </div>
              </div>

              {/* Logs Table Area */}
              <div className="overflow-x-auto">
                <table className={`w-full whitespace-nowrap text-xs text-slate-650 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-450 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">{isRTL ? 'التوقيت اليومي' : 'Timestamp'}</th>
                      <th className="px-6 py-3">{isRTL ? 'الملف الشخصي للحساب' : 'Account profile'}</th>
                      <th className="px-6 py-3">{isRTL ? 'رتبة المستخدم الرقمي' : 'Assigned Role'}</th>
                      <th className="px-6 py-3">{isRTL ? 'قناة المصادقة' : 'Provider Channel'}</th>
                      <th className="px-6 py-3">{isRTL ? 'حالة الدخول' : 'Access Status'}</th>
                      <th className="px-6 py-3">{isRTL ? 'عنوان IP للمصادقة' : 'Secure IP Address'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(() => {
                      const filtered = loginLogs.filter(log => {
                        const emailMatches = log.email.toLowerCase().includes(logSearch.toLowerCase());
                        const nameMatches = log.displayName.toLowerCase().includes(logSearch.toLowerCase());
                        const matchesSearch = emailMatches || nameMatches;
                        const matchesRole = logRoleFilter === 'All' || log.role === logRoleFilter;
                        return matchesSearch && matchesRole;
                      });

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                              {isRTL ? 'لم يتم العثور على سجلات تطابق البحث.' : 'No audit entries logged for this specific query.'}
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map(log => {
                        let statusColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                        if (log.status === 'Failed') {
                          statusColor = 'text-rose-700 bg-rose-50 border-rose-200';
                        }
                        
                        let roleColor = 'bg-slate-100 text-slate-800';
                        if (log.role === 'Admin') roleColor = 'bg-indigo-50 text-indigo-700 border border-indigo-150';
                        if (log.role === 'Vendor') roleColor = 'bg-amber-50 text-amber-705 border border-amber-150';

                        return (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            {/* Timestamp */}
                            <td className="px-6 py-3.5 font-mono text-slate-500 text-[11px]">
                              {new Date(log.timestamp).toLocaleString(isRTL ? 'ar-EG' : 'en-US')}
                            </td>
                            {/* User Profile */}
                            <td className="px-6 py-3.5">
                              <div className="font-semibold text-slate-800">{log.displayName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{log.email}</div>
                            </td>
                            {/* Role badge */}
                            <td className="px-6 py-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleColor}`}>
                                {log.role}
                              </span>
                            </td>
                            {/* Method */}
                            <td className="px-6 py-3.5 font-semibold text-slate-700">
                              <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                {log.method}
                              </span>
                            </td>
                            {/* Status badge */}
                            <td className="px-6 py-3.5">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColor}`}>
                                {log.status}
                              </span>
                            </td>
                            {/* Secure IP Address */}
                            <td className="px-6 py-3.5 font-mono text-[11px] text-slate-450">
                              {log.ipAddress}
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
