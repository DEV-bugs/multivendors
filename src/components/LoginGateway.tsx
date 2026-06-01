import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Store, ShoppingBag, LogIn } from 'lucide-react';

export const LoginGateway: React.FC = () => {
  const { signInWithGoogle, signInWithDemo } = useApp();
  const { t, isRTL } = useLanguage();

  return (
    <div className={`max-w-md w-full mx-auto bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden mt-8 md:mt-16 font-sans ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white text-center relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-blue-500/10 rounded-full blur-xl" />
        <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-xl" />

        <div className="relative z-10 space-y-2">
          <span className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto shadow-md mb-3">
            <Shield className="w-6 h-6 animate-pulse" />
          </span>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight font-display leading-tight">
            {t('loginRequiredTitle')}
          </h2>
          <p className="text-[11px] text-slate-300 max-w-sm mx-auto leading-relaxed mt-1">
            {t('loginRequiredSub')}
          </p>
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Google sign-in */}
        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm hover:shadow"
        >
          <LogIn className="w-4 h-4 shrink-0" />
          <span>{t('loginWithGoogleBtn')}</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative px-3 bg-white text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
            {t('orDividerText')}
          </span>
        </div>

        {/* Demo options */}
        <div className="space-y-3">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block text-center mb-1">
            {t('loginWithDemoBtn')}
          </p>

          {/* Admin Demo Button */}
          <button
            onClick={() => signInWithDemo('Admin')}
            className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:border-rose-300 bg-slate-50 hover:bg-rose-50/20 text-slate-700 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform shrink-0">
                <Shield className="w-4 h-4" />
              </span>
              <div className={`text-slate-800 flex flex-col ${isRTL ? 'items-start' : 'items-start'}`}>
                <span className="font-bold text-xs text-slate-900">{t('demoAdminBtn')}</span>
                <span className="text-[9px] text-slate-400 font-mono">admin@marketsaas.com</span>
              </div>
            </div>
            <span className="bg-rose-50 text-rose-700 font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0">
              {t('adminBadge')}
            </span>
          </button>

          {/* Vendor Demo Button */}
          <button
            onClick={() => signInWithDemo('Vendor')}
            className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:border-amber-300 bg-slate-50 hover:bg-amber-50/20 text-slate-700 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform shrink-0">
                <Store className="w-4 h-4" />
              </span>
              <div className={`text-slate-800 flex flex-col ${isRTL ? 'items-start' : 'items-start'}`}>
                <span className="font-bold text-xs text-slate-900">{t('demoVendorBtn')}</span>
                <span className="text-[9px] text-slate-400 font-mono">contact@apexlabs.cc</span>
              </div>
            </div>
            <span className="bg-amber-50 text-amber-700 font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0">
              {t('vendorBadge')}
            </span>
          </button>

          {/* Customer Demo Button */}
          <button
            onClick={() => signInWithDemo('Customer')}
            className="w-full flex items-center justify-between p-3.5 border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50/20 text-slate-700 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </span>
              <div className={`text-slate-800 flex flex-col ${isRTL ? 'items-start' : 'items-start'}`}>
                <span className="font-bold text-xs text-slate-900">{t('demoCustomerBtn')}</span>
                <span className="text-[9px] text-slate-400 font-mono">customer@marketsaas.com</span>
              </div>
            </div>
            <span className="bg-blue-50 text-blue-700 font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase shrink-0">
              {t('customerBadge')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
