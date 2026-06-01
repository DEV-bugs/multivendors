import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { PortalSwitcher } from './components/PortalSwitcher';
import { LoginGateway } from './components/LoginGateway';
import { AdminPortal } from './views/AdminPortal';
import { VendorPortal } from './views/VendorPortal';
import { CustomerStorefront } from './views/CustomerStorefront';
import { 
  ShoppingBag, Shield, Store, RefreshCcw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Unified Inner Layout Core
const MainLayout: React.FC = () => {
  const { role, currentView, setCurrentView, cart, resetToDefault, user } = useApp();
  const { t, isRTL } = useLanguage();

  // If unauthenticated, hide all portals and display the login gateway only
  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-250 ${isRTL ? 'text-right' : 'text-left'}`}>
        <PortalSwitcher />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex items-center justify-center">
          <LoginGateway />
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 transition-colors duration-250 ${isRTL ? 'text-right' : 'text-left'}`}>
      
      {/* Sticky Top Portal impersonation simulator */}
      <PortalSwitcher />

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200/90 py-3.5 px-4 sticky top-[48px] sm:top-[60px] z-40 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs">
              {role === 'Customer' && <ShoppingBag className="w-4.5 h-4.5" />}
              {role === 'Vendor' && <Store className="w-4.5 h-4.5 text-amber-300" />}
              {role === 'Admin' && <Shield className="w-4.5 h-4.5 text-rose-300" />}
            </span>
            <div>
              <div className="font-bold text-sm tracking-tight text-slate-950 font-display flex items-center gap-1.5 leading-none">
                <span>
                  {role === 'Customer' 
                    ? t('titleCustomerStorefront') 
                    : role === 'Vendor' 
                      ? t('titleVendorPortal') 
                      : t('titleAdminPortal')}
                </span>
                {role === 'Customer' && (
                  <span className="bg-emerald-50 text-emerald-700 font-mono text-[9px] font-extrabold tracking-tighter px-1.5 py-0.5 rounded border border-emerald-150">
                    {t('safeguardBadge')}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-450 mt-1">
                {role === 'Customer' 
                  ? t('descCustomerStorefront')
                  : role === 'Vendor' 
                    ? t('descVendorPortal') 
                    : t('descAdminPortal')}
              </p>
            </div>
          </div>

          {/* Quick Header buttons */}
          <div className="flex items-center gap-3">
            {role === 'Customer' && (
              <button
                id="header-basket-btn"
                onClick={() => setCurrentView('cart')}
                className="relative px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>{t('cartLedger')}</span>
                <span className="bg-slate-250 text-slate-800 font-mono font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border border-slate-300">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </button>
            )}

            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
              <span>{t('simulationStatus')}</span>
              <span className="text-emerald-500 font-mono font-bold uppercase">{t('ready')}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Core Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
          >
            {role === 'Customer' && <CustomerStorefront />}
            {role === 'Vendor' && <VendorPortal />}
            {role === 'Admin' && <AdminPortal />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer System Indicator Blocks */}
      <footer className="border-t border-slate-200/90 bg-white py-6 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="font-extrabold text-slate-850 font-display tracking-tight uppercase text-[10px]">
              {t('esrowText')}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-md">
              {t('footerDesc')}
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={async () => {
                if (window.confirm(t('resetConfirm'))) {
                  await resetToDefault();
                }
              }}
              className="hover:text-slate-700 underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>{t('diagnosticReset')}</span>
            </button>
            <span>|</span>
            <span className="font-mono text-[10px]">{t('tlsSafe')}</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </LanguageProvider>
  );
}
