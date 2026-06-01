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

export const AdminPortal: React.FC = () => {
  const { 
    vendors, applications, orders, products,
    approveApplication, rejectApplication, setSelectedVendorId, setRole
  } = useApp();

  const { t, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'verified' | 'kyc' | 'rules'>('overview');
  const [kycRejectId, setKycRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
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

  return (
    <div className="space-y-6">
      
      {/* Dynamic Upper Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight text-slate-900">
            {t('operationsLedgerTitle')}
          </h1>
          <p className="text-sm text-slate-450 mt-1">
            {t('descAdminPortal')}
          </p>
        </div>

        {/* Top bar quick tabs */}
        <div className="flex gap-1.5 bg-slate-200/60 p-1 rounded-lg border border-slate-200 text-xs font-semibold self-start md:self-auto">
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
              <span className={`absolute -top-1.5 ${isRTL ? '-left-1' : '-right-1'} bg-rose-600 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold`}>
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
      </AnimatePresence>

    </div>
  );
};
