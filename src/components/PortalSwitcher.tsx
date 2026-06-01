import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Store, ShoppingBag, RotateCcw, ChevronDown, Check, LogIn, LogOut, Globe, AlertTriangle, X, ExternalLink } from 'lucide-react';

export const PortalSwitcher: React.FC = () => {
  const { 
    role, setRole, selectedVendorId, setSelectedVendorId, vendors, resetToDefault,
    user, signInWithGoogle, signOutUser, authError, setAuthError, signInWithDemo
  } = useApp();
  const { locale, setLocale, t, isRTL } = useLanguage();
  const [showVendorDropdown, setShowVendorDropdown] = React.useState(false);

  // In RTL, we might want to adjust positions of absolute dropdowns or chevron sides.
  const activeVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  return (
    <div className="bg-slate-900 text-slate-200 border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs md:text-sm">
        
        {/* Dynamic Logo and Role Badge */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold text-lg tracking-wider font-display">MarketSaaS</span>
            <span className="bg-slate-800 text-slate-400 font-mono tracking-tighter px-2 py-0.5 rounded text-[10px] border border-slate-700">
              {t('prototypeBadge')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">|</span>
            <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-medium">
              {role === 'Customer' && <ShoppingBag className="w-3.5 h-3.5" />}
              {role === 'Vendor' && <Store className="w-3.5 h-3.5" />}
              {role === 'Admin' && <Shield className="w-3.5 h-3.5" />}
              <span>
                {role === 'Customer' ? t('customerView') : role === 'Vendor' ? t('vendorCore') : t('adminControl')}
              </span>
            </div>
          </div>
        </div>

        {/* Workspace Switched Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {user && <span className="text-slate-500 mr-1 hidden lg:inline">{t('simulationWorkspace')}</span>}
          
          {user && role === 'Customer' && (
            <button
              id="role-customer-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-blue-600 text-white shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('customerView')}</span>
            </button>
          )}

          {user && role === 'Vendor' && (
            <div className="relative">
              <button
                id="role-vendor-btn"
                onClick={() => setShowVendorDropdown(prev => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-amber-600 text-white shadow-sm cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t('vendorCore')}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showVendorDropdown && (
                <div className={`absolute top-10 ${isRTL ? 'left-0' : 'right-0'} w-52 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 py-1.5 animate-fadeIn`}>
                  <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {t('portalSelectSeller')}
                  </div>
                  {vendors.map(v => {
                    const email = user?.email?.toLowerCase() || '';
                    const isAuthorized = 
                      email === v.ownerEmail?.toLowerCase() || 
                      user?.uid?.startsWith('demo_vendor_uid_') || 
                      v.ownerEmail === 'contact@apexlabs.cc'; // Fallback for standard demo
                    if (!isAuthorized) return null;

                    return (
                      <button
                        key={v.id}
                        onClick={() => {
                          setSelectedVendorId(v.id);
                          setShowVendorDropdown(false);
                        }}
                        className="w-full text-right px-3 py-2 hover:bg-slate-700 flex items-center justify-between text-slate-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{v.logo}</span>
                          <span className="font-medium truncate max-w-[130px]">{v.name}</span>
                        </div>
                        {selectedVendorId === v.id && (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {user && role === 'Admin' && (
            <button
              id="role-admin-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium bg-rose-700 text-white shadow-sm"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t('adminControl')}</span>
            </button>
          )}

          <span className="text-slate-700 mx-1 hidden md:inline">|</span>

          {/* Core Language Switching Toggle Button */}
          <button
            id="lang-switch-btn"
            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-850 hover:bg-slate-750 text-slate-300 hover:text-white rounded-md text-xs font-semibold cursor-pointer border border-slate-700/60 transition-all"
            title={locale === 'en' ? 'تحويل للغة العربية' : 'Switch to English'}
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{locale === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <span className="text-slate-700 mx-0.5 hidden md:inline">|</span>

          {/* Firebase Authentication Portal UI controller */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-850 border border-slate-700 px-2 py-1 rounded-md max-w-[160px] truncate">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'user'} className="w-4 h-4 rounded-full border border-blue-400 shrink-0" />
              ) : (
                <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-extrabold font-mono shrink-0">
                  U
                </span>
              )}
              <span className="text-[10px] text-slate-300 truncate hidden xl:inline" title={user.email || ''}>
                {user.displayName || user.email}
              </span>
              <button 
                onClick={signOutUser} 
                className="text-rose-400 hover:text-rose-300 cursor-pointer p-0.5"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/90 hover:bg-blue-600 text-white rounded-md text-xs font-bold transition-all cursor-pointer"
              title="Google Authentication login"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Firebase Auth</span>
            </button>
          )}

          <span className="text-slate-700 mx-0.5 hidden md:inline">|</span>

          <button
            id="reset-demo-btn"
            onClick={async () => {
              if (window.confirm(t('resetConfirm'))) {
                await resetToDefault();
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-800 hover:text-white rounded-md text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title={t('resetLedger')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('resetLedger')}</span>
          </button>
        </div>

      </div>

      {authError && (
        <div className="bg-slate-950 border-t border-slate-850 px-4 py-2.5 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-sans">
            <div className="flex items-start md:items-center gap-2.5">
              <span className="w-6 h-6 rounded bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/25 text-xs font-bold">
                ⚠️
              </span>
              <div className="space-y-0.5 text-xs">
                <p className="font-bold text-amber-400">Google Popup Blocked or Closed</p>
                <p className="text-slate-400">
                  Inside the sandboxed preview iframe, browsers block popups and third-party cookies by default. For instant access, either click <span className="text-blue-400 hover:underline font-semibold">"Open in new tab"</span> at top right to bypass sandbox restrictions, or click <span className="text-emerald-400 font-semibold font-mono">⚡ Use Demo Account</span> to evaluate immediately!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-auto text-xs">
              <button
                onClick={signInWithDemo}
                className="bg-emerald-650 hover:bg-emerald-700 text-white font-bold py-1 px-2.5 rounded transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>⚡</span>
                <span>Use Demo Account</span>
              </button>
              <button
                onClick={() => setAuthError(null)}
                className="text-slate-500 hover:text-slate-350 bg-slate-800 hover:bg-slate-750 p-1 rounded cursor-pointer"
                aria-label="Dismiss error notification"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
