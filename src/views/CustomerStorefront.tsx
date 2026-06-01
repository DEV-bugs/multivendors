import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Product } from '../types';
import { 
  ShoppingBag, Search, Star, MessageSquare, ChevronRight, ChevronLeft, Sparkles, 
  ArrowLeft, ArrowRight, ShoppingCart, ShieldCheck, CreditCard, Truck, Trash2, 
  Plus, Minus, ArrowLeftRight, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CustomerStorefront: React.FC = () => {
  const {
    products, vendors, cart, currentView, setCurrentView,
    selectedProductId, setSelectedProductId,
    addToCart, removeFromCart, updateCartQuantity, checkout,
    lastPlacedOrderId
  } = useApp();

  const { t, isRTL } = useLanguage();

  // Search and Category filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Product Selection Details Local states
  const [detailColor, setDetailColor] = useState('Midnight Black');
  const [detailSize, setDetailSize] = useState('Standard Size');
  const [detailQty, setDetailQty] = useState(1);

  // Checkout Fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

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

  const categoriesList = ['All', 'Wearables & Electronics', 'Athletics & Footwear', 'Acoustics & Sound', 'Smart Home & Lights', 'Camp & Outdoors'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Cart Value Helpers
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const discountAmount = discountApplied ? cartSubtotal * 0.15 : 0; // 15% discount code
  const shippingCharge = cartSubtotal > 150 ? 0 : 15;
  const cartTotalVal = cartSubtotal - discountAmount + shippingCharge;

  // Sync details options when activeProduct shifts
  React.useEffect(() => {
    if (activeProduct) {
      if (activeProduct.colors && activeProduct.colors.length > 0) {
        setDetailColor(activeProduct.colors[0]);
      }
      if (activeProduct.sizes && activeProduct.sizes.length > 0) {
        setDetailSize(activeProduct.sizes[0]);
      }
    }
    setDetailQty(1);
  }, [selectedProductId, activeProduct]);

  return (
    <div className="space-y-6">
      
      {/* Dynamic Render Tree depending on Storefront views */}
      <AnimatePresence mode="wait">
        
        {currentView === 'home' && (
          <motion.div
            key="home-subview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 animate-fadeIn"
          >
            {/* Immersive Modern Tech Hero Banner */}
            <div className="relative bg-slate-900 text-white rounded-3xl overflow-hidden p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-850 shadow-lg">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_50%)] pointer-events-none" />
              
              <div className="space-y-4 max-w-lg relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apex Labs Ecosystem Summer Release</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight tracking-tight">
                  {t('heroTitle')}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-sans">
                  {t('heroSubtitle')}
                </p>
                <button
                  onClick={() => {
                    const sampleId = products.find(p => p.sku === 'APX-QT-X1')?.id || 'p1';
                    setSelectedProductId(sampleId);
                    setCurrentView('product-detail');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <span>{t('heroAction')}</span>
                  {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              {/* Glowing watch icon panel preview */}
              <div className="relative flex justify-center items-center shrink-0 w-full md:w-auto h-40 md:h-52 z-10">
                <div className="absolute w-44 h-44 rounded-full bg-blue-500/5 blur-3xl animate-pulse" />
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600"
                  alt="Quantum X1 Premium"
                  className="w-32 h-32 md:w-40 md:h-40 object-contain rounded-2xl drop-shadow-[0_10px_20px_rgba(59,130,246,0.3)] hover:scale-105 transition-transform"
                />
              </div>
            </div>

            {/* Categories and Filters Slider Row */}
            <div className="space-y-3.5 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold font-display text-slate-800 tracking-tight">{t('exploreVault')}</h3>
                
                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-slate-400 pointer-events-none`}>
                    <Search className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className={`w-full py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-100 transition-all text-slate-800 ${isRTL ? 'pr-9 pl-4' : 'pl-9 pr-4'}`}
                  />
                </div>
              </div>

              {/* Tiny category slider */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 select-none scrollbar-none">
                {categoriesList.map((cat, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all border ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-250/90'
                    }`}
                  >
                    {translateCategory(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 text-xs font-mono bg-white rounded-2xl border border-dashed border-slate-200">
                  {t('noProductsMatch')}
                </div>
              ) : (
                filteredProducts.map(p => {
                  const seller = vendors.find(v => v.id === p.vendorId) || { name: t('vendorPartner'), logo: '🏬' };
                  return (
                    <motion.div
                      key={p.id}
                      layoutId={`product-card-${p.id}`}
                      className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-shadow group flex flex-col h-full"
                    >
                      {/* Product Visual Container */}
                      <div className="relative aspect-video bg-slate-50 overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1`}>
                          <span>{seller.logo}</span>
                          <span className="truncate max-w-[80px]">{seller.name}</span>
                        </div>
                        {p.stock === 0 && (
                          <div className="absolute inset-0 bg-white/85 flex items-center justify-center text-xs font-bold text-slate-700">
                            {t('outOfStock')}
                          </div>
                        )}
                        {p.isFeatured && (
                          <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs`}>
                            {t('featuredBadge')}
                          </div>
                        )}
                      </div>

                      {/* Content Panel */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                              {p.name}
                            </h4>
                            <span className="font-mono text-xs font-extrabold text-slate-900 shrink-0">
                              ${p.price}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-2">
                            {p.description}
                          </p>
                        </div>

                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs font-semibold">
                          <div className="flex items-center gap-1 text-slate-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{p.rating}</span>
                          </div>
                          
                          <button
                            id={`view-details-${p.id}`}
                            onClick={() => {
                              setSelectedProductId(p.id);
                              setCurrentView('product-detail');
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <span>{t('inspectSpecs')}</span>
                            {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {currentView === 'product-detail' && (
          <motion.div
            key="product-subview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm animate-fadeIn space-y-8"
          >
            {/* Upper Action details */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-all"
              >
                {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{t('backToCatalog')}</span>
              </button>
              
              {/* Shopping cart indicator badge */}
              <button
                onClick={() => setCurrentView('cart')}
                className="relative p-2 text-slate-700 bg-slate-50 border border-slate-200 hover:text-slate-950 rounded-xl cursor-pointer"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Split specifications layouts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Product Media Layout */}
              <div className="space-y-4">
                <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                  <img
                    src={activeProduct.image}
                    alt={activeProduct.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                {/* Micro Guarantee checklist */}
                <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider text-center">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <ShieldCheck className="w-4 h-4 text-blue-500 mx-auto" />
                    <span>2-Yr Warranty</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <Truck className="w-4 h-4 text-blue-500 mx-auto" />
                    <span>Secure Delivery</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                    <ArrowLeftRight className="w-4 h-4 text-blue-500 mx-auto" />
                    <span>Split Escrow</span>
                  </div>
                </div>
              </div>

              {/* Configuration panel details */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="bg-slate-100 text-slate-650 px-2.5 py-1 text-[10px] font-mono rounded-md border border-slate-200 block w-max">
                    {t('sku')}: {activeProduct.sku}
                  </span>
                  
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 leading-tight">
                    {activeProduct.name}
                  </h1>

                  {/* Rating summary */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400" />
                      <Star className="w-4 h-4 fill-amber-400 opacity-60" />
                    </div>
                    <span>{activeProduct.rating} / 5.0 Rating</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5">
                      <MessageSquare className="w-3.5 h-3.5 inline" /> 24 Reviews
                    </span>
                  </div>

                  <div className="text-2xl font-black font-display text-blue-600">
                    ${activeProduct.price}
                  </div>

                  <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                    {activeProduct.description}
                  </p>
                </div>

                {/* Configuration Options */}
                <div className="space-y-4 border-t border-b border-slate-100 py-5">
                  {/* Colors block */}
                  {activeProduct.colors && activeProduct.colors.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{t('selectColor')}</label>
                      <div className="flex flex-wrap gap-2">
                        {activeProduct.colors.map((c, i) => (
                           <button
                             key={i}
                             onClick={() => setDetailColor(c)}
                             className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                               detailColor === c 
                                 ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                                 : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-700'
                             }`}
                           >
                             {c}
                           </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes block */}
                  {activeProduct.sizes && activeProduct.sizes.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{t('selectSize')}</label>
                      <div className="flex flex-wrap gap-2">
                        {activeProduct.sizes.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => setDetailSize(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                              detailSize === s 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                                : 'bg-white border-slate-250 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity Block */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">{t('quantity')}</label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-250 rounded-xl overflow-hidden bg-slate-50">
                        <button
                          onClick={() => setDetailQty(prev => Math.max(1, prev - 1))}
                          className="px-3 py-2 hover:bg-slate-100 text-slate-500 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-xs font-bold font-mono text-slate-900">{detailQty}</span>
                        <button
                          onClick={() => setDetailQty(prev => prev + 1)}
                          className="px-3 py-2 hover:bg-slate-100 text-slate-500 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Stock Warning details */}
                      <span className="text-xs font-sans text-slate-400 font-medium">
                        {activeProduct.stock === 0 ? (
                          <span className="text-red-500 font-bold">{t('outOfStock')}</span>
                        ) : activeProduct.stock <= 5 ? (
                          <span className="text-amber-650 font-bold">
                            {t('onlyUnitsLeft', { count: activeProduct.stock })}
                          </span>
                        ) : (
                          <span>{t('stockQty')}: {activeProduct.stock}</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main checkout trigger */}
                <button
                  id="add-to-cart-btn"
                  onClick={() => {
                    if (activeProduct.stock <= 0) {
                      alert(t('outOfStock'));
                      return;
                    }
                    addToCart(activeProduct, detailQty, detailColor, detailSize);
                  }}
                  disabled={activeProduct.stock <= 0}
                  className={`w-full font-bold text-sm text-center py-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    activeProduct.stock <= 0 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  }`}
                >
                  <ShoppingCart className="w-4.5 h-4.5" />
                  <span>{t('addToCartBtn')}</span>
                </button>
              </div>

            </div>

            {/* In-depth Hardware Specifications Matrix */}
            <div className="mt-8 space-y-4">
              <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider font-display border-b border-slate-100 pb-2">
                {t('specificationMatrix')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <table className="w-full text-xs border-collapse">
                  <tbody className="divide-y divide-slate-100">
                    {Object.entries(activeProduct.specs).map(([lbl, val], idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className={`py-2.5 font-bold text-slate-500 w-1/3 ${isRTL ? 'text-right pl-2' : 'text-left pr-2'}`}>{lbl}</td>
                        <td className={`py-2.5 text-slate-800 font-mono font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Additional simulated technical review blurb */}
                <div className="p-5 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                      ECC Shield Checked
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">Verify signature matches APX-TLS-90</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-500">
                    {t('footerDesc')}
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        )}

        {currentView === 'cart' && (
          <motion.div
            key="cart-subview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-fadeIn space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold font-display tracking-tight text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span>{t('yourCartLedger')}</span>
              </h2>
              <button
                onClick={() => setCurrentView('home')}
                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                {t('returnVault')}
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-350">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-850 text-sm">{t('cartEmpty')}</h3>
                  <p className="text-slate-400 text-xs mt-1">{t('cartDesc')}</p>
                </div>
                <button
                  onClick={() => setCurrentView('home')}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold px-4 py-2 cursor-pointer"
                >
                  {t('returnVault')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                {/* Cart list table */}
                <div className="lg:col-span-2 space-y-3.5">
                  {cart.map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 hover:bg-slate-50 transition-colors rounded-xl border border-slate-100 items-start">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md border border-slate-200 shrink-0"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-950">{item.product.name}</h4>
                          <span className="font-mono text-xs font-bold text-slate-950">${item.product.price}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono">
                          <span>{t('options')}: <span className="font-semibold text-slate-600">{item.selectedColor || 'N/A'}, {item.selectedSize || 'N/A'}</span></span>
                        </div>

                        {/* Increment Control triggers */}
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white text-[10px]">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1.5 hover:bg-slate-50 text-slate-400 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 font-mono font-bold text-slate-900">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1.5 hover:bg-slate-50 text-slate-400 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-450 hover:text-red-650 font-bold cursor-pointer transition-colors"
                            title={t('remove')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout ledger sum panel */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <h3 className="font-bold font-display text-slate-800 text-xs uppercase tracking-wider">
                    {t('summaryTitle')}
                  </h3>

                  <div className="space-y-2 text-xs border-b border-slate-250 pb-3">
                    <div className="flex justify-between text-slate-600">
                      <span>{t('subtotal')}</span>
                      <span className="font-mono">${cartSubtotal.toLocaleString()}</span>
                    </div>
                    
                    {discountApplied && (
                      <div className="flex justify-between text-emerald-600">
                        <span>{t('voucherCredit')}</span>
                        <span className="font-mono">-${discountAmount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-slate-600">
                      <span>{t('shipping')}</span>
                      <span className="font-mono">
                        {shippingCharge === 0 ? t('shippingFree') : `$${shippingCharge}`}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Coupon Module form bar */}
                  <div className="space-y-1">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Voucher: MARKEYS15"
                        disabled={discountApplied}
                        className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-slate-100 flex-1 uppercase outline-none"
                      />
                      <button
                        onClick={() => {
                          if (couponCode.toUpperCase() === 'MARKEYS15') {
                            setDiscountApplied(true);
                          } else {
                            alert('Voucher not found. Code "MARKEYS15" for 15% testing discount');
                          }
                        }}
                        disabled={discountApplied}
                        className={`text-slate-100 font-bold text-[11px] px-3 py-1.5 rounded-lg cursor-pointer ${
                          discountApplied ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'
                        }`}
                      >
                        {discountApplied ? t('approved') : t('applyBtn')}
                      </button>
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono block">Hint: MARKEYS15 (15% Off)</span>
                  </div>

                  <div className="flex justify-between items-center text-sm font-semibold text-slate-900 border-b border-slate-200 pb-3">
                    <span>{t('totalAmount')}</span>
                    <span className="font-mono text-lg font-bold text-blue-600">${cartTotalVal.toLocaleString()}</span>
                  </div>

                  <button
                    id="checkout-wizard-btn"
                    onClick={() => setCurrentView('checkout')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-center rounded-xl transition-all cursor-pointer text-xs uppercase tracking-wide flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>{t('proceedCheck')}</span>
                    <CreditCard className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )}
          </motion.div>
        )}

        {currentView === 'checkout' && (
          <motion.div
            key="checkout-subview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="bg-white p-5 sm:p-8 rounded-3xl border border-slate-200 shadow-sm animate-fadeIn space-y-6"
          >
            <div>
              <h2 className="text-xl font-bold font-display text-slate-800">{t('escrowPaymentLine')}</h2>
              <p className="text-xs text-slate-500">{t('escrowSub')}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Form elements input wizard */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customerName || !customerEmail || !address || !cardNumber) {
                    alert('Fill required checkout parameters safely.');
                    return;
                  }
                  checkout(customerName, customerEmail, address);
                }}
                className="space-y-4 text-xs"
              >
                <div className="space-y-3.5">
                  <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">
                    {t('customerDetailsSection')}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 block">{t('fullName')} *</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Sarah Jenkins"
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 block">{t('emailAddr')} *</label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="s.jenkins@gmail.com"
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-3">
                  <label className="font-bold text-slate-500 block">{t('shippingAddr')} *</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="422 Pine Crest Blvd, Portland, OR 97205"
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:bg-white"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Verified shipping courier: YES</span>
                </div>

                <div className="space-y-3.5 border-t border-slate-100 pt-3">
                  <h3 className="font-extrabold uppercase text-[10px] text-slate-400 tracking-wider">
                    {t('paymentSettlementSection')}
                  </h3>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-500 block">{t('optCardNum')} *</label>
                    <div className="relative">
                      <span className={`absolute inset-y-0 ${isRTL ? 'right-3' : 'left-3'} flex items-center text-slate-400 pointer-events-none`}>
                        <CreditCard className="w-4.5 h-4.5" />
                      </span>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        placeholder="4211 •••• •••• ••••"
                        required
                        className={`w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:bg-white ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 block">{t('optExpiry')} *</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM / YY"
                        maxLength={5}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-500 block">{t('optCvc')} *</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="•••"
                        maxLength={3}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentView('cart')}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    id="submit-checkout-btn"
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-lg cursor-pointer flex-1 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>{t('submitOrderBtn')}</span>
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>

              {/* Order summary review items lists */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="font-bold font-display text-xs uppercase text-slate-400 tracking-wider">
                  {t('summaryTitle')}
                </h3>

                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {cart.map((item, i) => (
                    <div key={i} className="flex gap-2.5 items-center text-xs">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-10 h-10 object-cover rounded-md border border-slate-150 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-900 truncate">{item.product.name}</div>
                        <div className={`text-[9px] text-slate-400 font-mono ${isRTL ? 'text-right' : 'text-left'}`}>
                          {t('quantity')}: {item.quantity} | {item.selectedColor || 'N/A'}
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-slate-950">${item.product.price}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-550">
                    <span>{t('subtotal')}</span>
                    <span className="font-mono">${cartSubtotal}</span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-emerald-650 font-medium">
                      <span>{t('voucherCredit')}</span>
                      <span className="font-mono">-${discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-550">
                    <span>{t('shipping')}</span>
                    <span className="font-mono">
                      {shippingCharge === 0 ? t('shippingFree') : `$${shippingCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-950 text-sm border-t border-slate-150 pt-2.5">
                    <span>{t('totalAmount')}</span>
                    <span className="font-mono text-indigo-650">${cartTotalVal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {currentView === 'order-success' && (
          <motion.div
            key="success-subview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-lg mx-auto text-center space-y-6 animate-fadeIn"
          >
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2.5">
              <h2 className="text-2xl font-extrabold font-display text-slate-900">{t('orderPlacedTitle')}</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('orderPlacedSub')}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2.5 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">{t('orderIdText')}</span>
                <span className="font-mono font-bold text-slate-950 uppercase">{lastPlacedOrderId}</span>
              </div>
              
              <div className="border-t border-slate-150 pt-2.5 leading-relaxed text-slate-400 text-[10px] font-mono">
                💡 <span className="font-bold text-slate-600">PREVIEW SIMULATION TRACE:</span> Click on the top <span className="text-amber-600 bg-amber-50 px-1 border rounded">Vendor Core</span> switcher or the <span className="text-rose-700 bg-rose-50 px-1 border rounded">Admin Control</span> switcher to immediately audit how this sale, stock decrease, and margin commission update their respective performance ledger metrics!
              </div>
            </div>

            <button
              onClick={() => setCurrentView('home')}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl cursor-pointer text-xs uppercase transition-all shadow-md"
            >
              {t('continueShopping')}
            </button>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
