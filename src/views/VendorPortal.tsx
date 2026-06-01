import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Product, Order } from '../types';
import { DynamicBarChart } from '../components/Charts';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Package, DollarSign, ListOrdered, TrendingUp, Plus, Edit2, Trash2, 
  Tag, Folder, AlertTriangle, CheckCircle, Truck, RefreshCcw, X,
  Upload, Image as ImageIcon, Loader2, Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VendorPortal: React.FC = () => {
  const { 
    selectedVendorId, vendors, products, orders,
    addProduct, updateProduct, deleteProduct,
    googleAccessToken
  } = useApp();

  const { t, isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<'analytics' | 'catalog' | 'orders'>('analytics');

  // Google Drive upload states
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');

  const handleFileUploadToDrive = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    setUploadStatus(isRTL ? 'جاري التحضير...' : 'Preparing file...');

    // Simulate upload delay and visual progress if demo developer is selected
    if (!googleAccessToken) {
      try {
        const steps = [
          isRTL ? 'جاري الاتصال بـ Google Drive...' : 'Connecting to Google Drive Sandbox...',
          isRTL ? 'جاري محاكاة رفع صورة الهاردوير...' : 'Initiating simulated hardware upload...',
          isRTL ? 'جاري الرفع لـ Drive: 25%...' : 'Uploading resource to Drive: 25%...',
          isRTL ? 'جاري الرفع لـ Drive: 70%...' : 'Uploading resource to Drive: 70%...',
          isRTL ? 'جاري الرفع لـ Drive: 100%...' : 'Uploading resource to Drive: 100%...',
          isRTL ? 'جاري تعيين الصلاحيات المتاحة للعرض...' : 'Configuring resource visibility guidelines...',
          isRTL ? 'تم الرفع والمزامنة بنجاح!' : 'File sync succeeded!'
        ];

        for (let i = 0; i < steps.length; i++) {
          setUploadStatus(steps[i]);
          await new Promise((resolve) => setTimeout(resolve, 600));
        }

        let dummyImg = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600';
        if (category === 'Wearables & Electronics') {
          dummyImg = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600';
        } else if (category === 'Athletics & Footwear') {
          dummyImg = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=605';
        } else if (category === 'Acoustics & Sound') {
          dummyImg = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=605';
        } else if (category === 'Smart Home & Lights') {
          dummyImg = 'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=605';
        } else if (category === 'Camp & Outdoors') {
          dummyImg = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=605';
        }

        setImageUrl(dummyImg);
        setUploading(false);
      } catch (err: any) {
        setUploadError(String(err));
        setUploading(false);
      }
      return;
    }

    try {
      setUploadStatus(isRTL ? 'الاتصال بـ Google Drive...' : 'Contacting Drive core host...');
      
      const metadata = {
        name: `MarketSaaS_Asset_${Date.now()}_${file.name}`,
        mimeType: file.type,
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(isRTL ? 'فشل رفع الملف لـ Google Drive' : 'Host write rejection from Google Drive API.');
      }

      const fileData = await response.json();
      const fileId = fileData.id;

      if (!fileId) {
        throw new Error('No File ID obtained.');
      }

      setUploadStatus(isRTL ? 'تعديل الصلاحيات الفنية للتنزيل...' : 'Updating file permissions to public readers...');

      const permResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      });

      if (!permResponse.ok) {
        console.warn('Unable to expose file reading to anyone.');
      }

      const publicUrl = `https://docs.google.com/uc?export=view&id=${fileId}`;
      setImageUrl(publicUrl);
      setUploadStatus(isRTL ? 'تم الرفع بنجاح!' : 'Finished sync successfully!');
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || String(err));
    } finally {
      setUploading(false);
    }
  };
  
  // Modals operations
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('Wearables & Electronics');
  const [imageUrl, setImageUrl] = useState('');
  const [frameMaterial, setFrameMaterial] = useState('');
  const [batteryLife, setBatteryLife] = useState('');

  // Find active seller context
  const activeVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  // Vendor-specific statistics
  const vendorProducts = products.filter(p => p.vendorId === activeVendor.id);
  const vendorOrders = orders.filter(o => o.vendorId === activeVendor.id);

  const totalSalesRevenue = vendorOrders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.totalAmount : sum, 0);

  // Sync state helpers
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice(120);
    setSku('APX-' + Math.floor(100 + Math.random() * 899));
    setStock(15);
    setCategory(activeVendor.category);
    setImageUrl('https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600');
    setFrameMaterial('Alloy Premium');
    setBatteryLife('7 days');
    setProductModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setSku(p.sku);
    setStock(p.stock);
    setCategory(p.category);
    setImageUrl(p.image);
    setFrameMaterial(p.specs['Material Core'] || p.specs['Frame Material'] || p.specs['Cushioning'] || 'Alloy Premium');
    setBatteryLife(p.specs['Performance Spec'] || p.specs['Battery Life'] || p.specs['Drop'] || '7 days');
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || price <= 0) {
      alert('Fill in required catalog fields');
      return;
    }

    const payload: Product = {
      id: editingProduct ? editingProduct.id : '',
      name,
      description,
      price: Number(price),
      sku,
      stock: Number(stock),
      category,
      rating: editingProduct ? editingProduct.rating : 4.8,
      image: imageUrl,
      specs: {
        'Material Core': frameMaterial,
        'Performance Spec': batteryLife
      },
      vendorId: activeVendor.id,
      colors: editingProduct ? editingProduct.colors : ['Midnight Black', 'Slate Blue'],
      sizes: editingProduct ? editingProduct.sizes : ['Standard Size']
    };

    if (editingProduct) {
      await updateProduct(payload);
    } else {
      await addProduct(payload);
    }
    setProductModalOpen(false);
  };

  // Vendor Inventory Chart representation
  const barChartData = vendorProducts.map(p => ({
    label: p.name.length > 12 ? p.name.substring(0, 11) + '..' : p.name,
    value: p.stock
  }));

  // Render Order Actions - Toggles pending shipments to 'Shipped' directly in Firestore
  const handleShipOrder = async (orderId: string) => {
    const o = orders.find(ord => ord.id === orderId);
    if (!o) return;
    try {
      await setDoc(doc(db, 'orders', orderId), {
        ...o,
        status: 'Shipped'
      });
    } catch (error) {
      console.error("Failed to update shipment status:", error);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Merchant Title bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center border border-slate-700 shadow-sm shrink-0">
            {activeVendor.logo}
          </span>
          <div>
            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
              <h1 className="text-2xl font-bold font-display tracking-tight text-slate-900">
                {activeVendor.name} {t('opsCenter')}
              </h1>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold rounded border border-slate-200 font-mono">
                {t('sellerId')}: {activeVendor.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {t('sectorHub')}: <span className="text-slate-650 font-semibold">{activeVendor.category}</span> | {t('memberSince')} {activeVendor.joinedDate}
            </p>
          </div>
        </div>

        {/* Action button bar */}
        <div className="flex gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'analytics' 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-white text-slate-650 border-slate-250 hover:bg-slate-50'
            }`}
          >
            {t('analyticsTab')}
          </button>
          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'catalog' 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-white text-slate-650 border-slate-250 hover:bg-slate-50'
            }`}
          >
            {t('catalogTab')} ({vendorProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer relative ${
              activeTab === 'orders' 
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                : 'bg-white text-slate-650 border-slate-250 hover:bg-slate-50'
            }`}
          >
            {t('ordersTab')} ({vendorOrders.length})
            {vendorOrders.some(o => o.status === 'Pending') && (
              <span className={`absolute -top-1 ${isRTL ? 'left-0' : 'right-0'} bg-amber-500 w-2.5 h-2.5 rounded-full ring-2 ring-white animate-pulse`} />
            )}
          </button>
        </div>
      </div>

      {/* Dynamic Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 uppercase font-extrabold text-[10px] tracking-wider block">{t('grossRevenue')}</span>
          <div className="text-2xl font-bold text-slate-900 font-display mt-1">
            ${(activeVendor.revenue + totalSalesRevenue).toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-500 font-mono italic block mt-1">
            Before 10% platform fee
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-slate-400 uppercase font-extrabold text-[10px] tracking-wider block">{t('netRevenue')}</span>
          <div className="text-2xl font-bold text-emerald-600 font-display">
            ${((activeVendor.revenue + totalSalesRevenue) * 0.9).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-mono">
            <span>✔</span> Automated split capture safe
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 uppercase font-extrabold text-[10px] tracking-wider block">{t('unfilledOrders')}</span>
          <div className="text-2xl font-bold text-slate-900 font-display mt-0.5 font-mono">
            {vendorOrders.filter(o => o.status === 'Pending').length}
          </div>
          <span className="text-[10px] text-rose-500 font-medium block mt-1 font-mono">
            {vendorOrders.filter(o => o.status === 'Pending').length} units outstanding
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 uppercase font-extrabold text-[10px] tracking-wider block">Conversion Frequency</span>
          <div className="text-2xl font-bold text-slate-900 font-display mt-0.5">
            4.2%
          </div>
          <span className="text-[10px] text-slate-500 font-mono block mt-1">
            Average sector median is 2.8%
          </span>
        </div>

      </div>

      {/* Tabs */}
      <AnimatePresence mode="wait">
        {activeTab === 'analytics' && (
          <motion.div
            key="analysis-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn"
          >
            {/* Left Stock Allocation graph */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 lg:col-span-2 space-y-4 shadow-sm">
              <div>
                <h3 className="font-bold font-display text-slate-800 text-sm">{t('inventoryDepth')}</h3>
                <p className="text-xs text-slate-400 mt-1">Sellers monitoring replenishment indicators. Keep stocks above 10 units.</p>
              </div>
              <div className="pt-2">
                {barChartData.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs font-mono">No products listed in catalog.</div>
                ) : (
                  <DynamicBarChart data={barChartData} color="#D97706" />
                )}
              </div>
            </div>

            {/* Quick Warning Panels */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3.5">
                <h3 className="font-bold text-slate-900 text-xs uppercase text-slate-400 tracking-wider">Fulfillment Alerts</h3>
                <div className="space-y-2">
                  {vendorProducts.some(p => p.stock <= 5) ? (
                    <div className="p-2.5 bg-amber-50 text-amber-900 border border-amber-100 rounded-lg text-xs leading-relaxed flex gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Critical Out of Stock Warning:</span> Some of your listing catalog items are below safety parameters.
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-lg text-xs flex gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-550 shrink-0" />
                      <div>
                        Catalog inventory healthy. All SKU lines have stable supply allocations.
                      </div>
                    </div>
                  )}

                  {vendorOrders.some(o => o.status === 'Pending') && (
                    <div className="p-2.5 bg-blue-50 text-blue-905 border border-blue-100 rounded-lg text-xs flex gap-2">
                      <Truck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Unresolved Dispatch labels:</span> Select the Orders tab to assign logistics carriers & dispatch labels.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor Guidelines Card */}
              <div className="bg-gradient-to-br from-slate-850 to-slate-900 text-white rounded-xl p-5 border border-slate-800 space-y-1">
                <h3 className="font-bold text-xs uppercase text-amber-400 font-display">Compliance Guidelines</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Sellers are required to submit labels within 48h of checkout matching customer credentials to preserve stable rating statuses.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'catalog' && (
          <motion.div
            key="catalog-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 animate-fadeIn"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg font-display">{t('catalogTab')}</h3>
                <p className="text-xs text-slate-400">Instantly populate, configure pricing tiers, and sync digital stock counters with high-fidelity web storefront layouts.</p>
              </div>
              <button
                id="add-catalog-item-btn"
                onClick={handleOpenAddModal}
                className="bg-amber-650 hover:bg-amber-700 text-white rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('addNewItem')}</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase bg-slate-50/80">
                      <th className={`p-3 pl-4 ${isRTL ? 'text-right' : 'text-left'}`}>Item Details</th>
                      <th className="p-3">SKU Tracker</th>
                      <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>Pricing Tier</th>
                      <th className="p-3 text-center">Stock status</th>
                      <th className="p-3">Dynamic Attributes</th>
                      <th className={`p-3 ${isRTL ? 'text-left pl-4' : 'text-right pr-4'}`}>Catalog Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vendorProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-slate-400 font-mono">
                          {t('emptyCatalog')}
                        </td>
                      </tr>
                    ) : (
                      vendorProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 pl-4 flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="w-11 h-11 object-cover rounded-md border border-slate-100 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 truncate max-w-[250px]">
                                {p.description}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-500 font-medium">{p.sku}</td>
                          <td className={`p-3 font-bold text-slate-950 font-mono ${isRTL ? 'text-left' : 'text-right'}`}>${p.price.toLocaleString()}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              p.stock === 0 
                                ? 'bg-red-50 text-red-700' 
                                : p.stock <= 5 
                                  ? 'bg-amber-50 text-amber-700' 
                                  : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {p.stock === 0 ? 'Out of Stock' : `${p.stock} units left`}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(p.specs).slice(0, 2).map(([k, v], i) => (
                                <span key={i} className="bg-slate-50 border border-slate-150 px-1.5 py-0.5 text-[9px] font-mono rounded text-slate-500">
                                  {k}: {v}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className={`p-3 space-x-1.5 ${isRTL ? 'text-left pl-4' : 'text-right pr-4'}`}>
                            <button
                              id={`edit-item-${p.id}`}
                              onClick={() => handleOpenEditModal(p)}
                              className="text-slate-400 hover:text-slate-900 border border-slate-200 p-1.5 rounded-md inline-block hover:border-slate-300 cursor-pointer"
                              title={t('editItem')}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              id={`delete-item-${p.id}`}
                              onClick={() => {
                                if (window.confirm(`Permanently dismiss listing "${p.name}"?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="text-slate-400 hover:text-rose-600 border border-slate-200 p-1.5 rounded-md inline-block hover:border-slate-300 cursor-pointer"
                              title={t('deleteItem')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            key="orders-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 animate-fadeIn"
          >
            <div>
              <h3 className="font-bold text-slate-800 text-lg font-display">{t('ordersTab')}</h3>
              <p className="text-xs text-slate-400">Validate real-time shipping addresses, print logistics bar slips, and verify merchant margin commissions.</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase bg-slate-50">
                      <th className={`p-3 pl-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t('orderId')} & Date</th>
                      <th className="p-3">{t('customer')}</th>
                      <th className="p-3">{t('items')}</th>
                      <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t('grossTotal')}</th>
                      <th className={`p-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t('commissionFee')}</th>
                      <th className="p-3">Logistics Status</th>
                      <th className={`p-3 ${isRTL ? 'text-left pl-4' : 'text-right pr-4'}`}>Marshall Operations</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vendorOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-400 font-mono">
                          {t('noOrdersYet')}
                        </td>
                      </tr>
                    ) : (
                      vendorOrders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3 pl-4">
                            <div className="font-bold text-slate-900 font-mono">{o.id}</div>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">{o.date}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{o.customerName}</div>
                            <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]" title={o.shippingAddress}>
                              {o.shippingAddress}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5">
                              {o.productNames.map((name, i) => (
                                <div key={i} className="text-slate-700 text-[11px] font-medium">• {name}</div>
                              ))}
                            </div>
                          </td>
                          <td className={`p-3 font-bold text-slate-900 font-mono ${isRTL ? 'text-left' : 'text-right'}`}>${o.totalAmount.toLocaleString()}</td>
                          <td className={`p-3 font-semibold font-mono text-rose-650 ${isRTL ? 'text-left' : 'text-right'}`}>-${o.commission.toLocaleString()}</td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              o.status === 'Pending' 
                                ? 'bg-amber-100 text-amber-800' 
                                : o.status === 'Shipped' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-emerald-50 text-emerald-800'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className={`p-3 ${isRTL ? 'text-left pl-4' : 'text-right pr-4'}`}>
                            {o.status === 'Pending' ? (
                              <button
                                onClick={() => handleShipOrder(o.id)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] cursor-pointer inline-flex items-center gap-1 whitespace-nowrap transition-colors shadow-xs"
                              >
                                <Truck className="w-3 h-3" />
                                <span>{t('actionsShipBtn')}</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-semibold italic flex items-center justify-end gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Fulfillment Active</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Catalog Manager Product Modal */}
      <AnimatePresence>
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setProductModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] border border-slate-100"
            >
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold font-display text-slate-900 text-base">
                  {editingProduct ? 'Configure Product Parameters' : t('addNewItem')}
                </h3>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="p-1 px-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide block">{t('productTitleName')} *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ascent Peak Pro Backpack"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-350 focus:bg-white text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide block">SKU Code *</label>
                    <input
                      type="text"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="APX-880-HZ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:border-slate-350 focus:bg-white text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide block">{t('primaryCategory')} *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white text-xs"
                    >
                      <option value="Wearables & Electronics">Wearables & Electronics</option>
                      <option value="Athletics & Footwear">Athletics & Footwear</option>
                      <option value="Acoustics & Sound">Acoustics & Sound</option>
                      <option value="Smart Home & Lights">Smart Home & Lights</option>
                      <option value="Eco Hardware & Solar">Eco Hardware & Solar</option>
                      <option value="Camp & Outdoors">Camp & Outdoors</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide block">{t('priceUsd')} *</label>
                    <input
                      type="number"
                      value={price || ''}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="299"
                      min="1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide block">{t('stockQty')} *</label>
                    <input
                      type="number"
                      value={stock || ''}
                      onChange={(e) => setStock(Number(e.target.value))}
                      placeholder="15"
                      min="0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-600 uppercase tracking-wide block text-xs">
                      {isRTL ? 'صورة المنتج واللوجستيات' : 'Product Display Image & Logistics'} *
                    </label>
                    <span className="bg-blue-50 text-blue-700 font-mono text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                      <Cloud className="w-2.5 h-2.5" />
                      <span>Google Drive SSO</span>
                    </span>
                  </div>

                  {/* Drag and Drop style selector */}
                  <div className="relative border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white rounded-lg p-4 transition-colors flex flex-col items-center justify-center text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUploadToDrive}
                      disabled={uploading}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    
                    {uploading ? (
                      <div className="space-y-2">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                        <p className="text-xs font-bold text-slate-700">{uploadStatus}</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-slate-800">
                          {isRTL ? 'انقر لتحديد ملف أو السحب هنا للرفع' : 'Click to choose image or drag resource here'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {googleAccessToken 
                            ? (isRTL ? 'سيتم الرفع لحساب جوجل درايف الخاص بك' : 'Will upload directly to your Google Drive slot') 
                            : (isRTL ? 'تجريبي: يرفع لصندوق جوجل درايف الافتراضي' : 'Demo Mode: upload to simulated Google Drive storage')}
                        </p>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="bg-red-50 text-red-700 border border-red-200 text-[10px] p-2 flex items-start gap-1 p-2">
                      <span className="font-bold shrink-0">⚠️ Error:</span>
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {imageUrl && (
                    <div className="flex items-center gap-3 bg-white p-2 border border-slate-150 rounded-lg">
                      <img src={imageUrl} alt="upload-preview" className="w-12 h-12 rounded object-cover border border-slate-100 shrink-0" referrerPolicy="no-referrer" />
                      <div className="min-w-0 flex-1 space-y-1 text-left">
                        <p className="text-[11px] font-bold text-slate-700 truncate">{imageUrl}</p>
                        <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5">
                          <CheckCircle className="w-3 h-3" />
                          <span>{isRTL ? 'جاهز لمزامنة مواصفات الصنف' : 'Ready to bind as asset spec'}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold text-slate-450 uppercase tracking-wider text-[9px] block text-left">
                      {isRTL ? 'أو أدخل رابط ويب بديل يدويًا' : 'Or input manual web link destination'}
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-mono text-[10px] focus:outline-none text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-500 uppercase tracking-wide block">{t('descriptionText')}</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide pristine insights, hardware specs, or active telemetry data parameters..."
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide block">{t('primaryMaterialSpec')}</label>
                    <input
                      type="text"
                      value={frameMaterial}
                      onChange={(e) => setFrameMaterial(e.target.value)}
                      placeholder="e.g. Aerospace Titanium"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-500 uppercase tracking-wide block">{t('batteryCapacitySpec')}</label>
                    <input
                      type="text"
                      value={batteryLife}
                      onChange={(e) => setBatteryLife(e.target.value)}
                      placeholder="e.g. 14 Days Telemetry"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-2 justify-end border-t border-slate-100 text-xs">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    {t('saveAsset')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
