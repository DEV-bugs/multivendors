import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  deleteDoc, 
  getDocs,
  getDocFromServer
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from '../lib/firebase';
import { Product, Vendor, VendorApplication, Order, CartItem } from '../types';
import { INITIAL_PRODUCTS, INITIAL_VENDORS, INITIAL_APPLICATIONS, INITIAL_ORDERS } from '../mockData';

type Role = 'Admin' | 'Vendor' | 'Customer';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  selectedVendorId: string;
  setSelectedVendorId: (id: string) => void;
  
  // Data lists
  products: Product[];
  vendors: Vendor[];
  applications: VendorApplication[];
  orders: Order[];
  cart: CartItem[];
  
  // Operations
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  approveApplication: (appId: string) => Promise<void>;
  rejectApplication: (appId: string, reason: string) => Promise<void>;
  
  addToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, q: number) => void;
  clearCart: () => void;
  checkout: (customerName: string, customerEmail: string, shippingAddress: string) => Promise<void>;
  
  // Navigation helper within customer storefront
  currentView: 'home' | 'product-detail' | 'cart' | 'checkout' | 'order-success';
  setCurrentView: (view: 'home' | 'product-detail' | 'cart' | 'checkout' | 'order-success') => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  
  // Success state helper for order confirmation
  lastPlacedOrderId: string;
  
  // Restart state helper
  resetToDefault: () => Promise<void>;

  // Authentication properties
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  dbReady: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  signInWithDemo: (selectedRole?: Role, customVendorId?: string) => void;
  googleAccessToken: string | null;
  setGoogleAccessToken: (token: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(() => {
    const saved = localStorage.getItem('marketsaas_role');
    return (saved as Role) || 'Customer';
  });
  
  const [selectedVendorId, setSelectedVendorId] = useState<string>(() => {
    const saved = localStorage.getItem('marketsaas_sel_vendor');
    return saved || 'v1';
  });

  // Client local cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('marketsaas_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Firestore lists
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Page tracking states
  const [currentView, setCurrentView] = useState<'home' | 'product-detail' | 'cart' | 'checkout' | 'order-success'>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('p1');
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState<string>('');

  // Auth User track state
  const [user, setUser] = useState<User | null>(null);
  const [dbReady, setDbReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('marketsaas_google_token') || null;
  });

  // Auto role assignment based on user registration / login
  useEffect(() => {
    if (!user) {
      return;
    }
    const email = user.email ? user.email.toLowerCase() : '';
    
    // 1. Admin auto-detect
    if (
      email === 'dzsayto@gmail.com' || 
      email === 'admin@marketsaas.com' || 
      user.displayName === 'MarketSaaS Administrator' || 
      user.uid === 'demo_admin_uid_dzsayto'
    ) {
      setRole('Admin');
    }
    // 2. Vendor auto-detect
    else {
      const matchedVendor = vendors.find(v => v.ownerEmail.toLowerCase() === email);
      if (matchedVendor) {
        setRole('Vendor');
        setSelectedVendorId(matchedVendor.id);
      } else if (
        user.displayName?.includes('Vendor') || 
        email.includes('vendor') || 
        user.uid?.startsWith('demo_vendor_uid_')
      ) {
        setRole('Vendor');
        if (user.uid?.startsWith('demo_vendor_uid_')) {
          const vId = user.uid.replace('demo_vendor_uid_', '');
          const isVIdValid = vendors.some(v => v.id === vId);
          if (isVIdValid) {
            setSelectedVendorId(vId);
          }
        }
      } else {
        // 3. Customer role (Default)
        setRole('Customer');
      }
    }
  }, [user, vendors]);

  // 1. Connection check
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        setDbReady(true);
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.warn("Firestore status: Local offline/cached mode is active.");
        }
        setDbReady(true); // Treat as ready for local fallback / rules integration
      }
    }
    testConnection();
  }, []);

  // 2. Auth state Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  // 3. Database Bootstrap and Live Realtime Sync
  useEffect(() => {
    let unsubs: (() => void)[] = [];

    const syncCollection = async () => {
      try {
        // Bootstrap database with initial collection records if empty
        const prodSnap = await getDocs(collection(db, 'products'));
        if (prodSnap.empty) {
          for (const item of INITIAL_PRODUCTS) {
            await setDoc(doc(db, 'products', item.id), item);
          }
        }
        const vendorSnap = await getDocs(collection(db, 'vendors'));
        if (vendorSnap.empty) {
          for (const item of INITIAL_VENDORS) {
            await setDoc(doc(db, 'vendors', item.id), item);
          }
        }
        const appSnap = await getDocs(collection(db, 'applications'));
        if (appSnap.empty) {
          for (const item of INITIAL_APPLICATIONS) {
            await setDoc(doc(db, 'applications', item.id), item);
          }
        }
        const orderSnap = await getDocs(collection(db, 'orders'));
        if (orderSnap.empty) {
          for (const item of INITIAL_ORDERS) {
            await setDoc(doc(db, 'orders', item.id), item);
          }
        }
      } catch (err) {
        console.warn("Bootstrap write bypassed or rejected. Proceeding using remaining Firestore capabilities:", err);
      }

      // Attach onSnapshot real-time listeners for instant synchronization
      const pUnsub = onSnapshot(collection(db, 'products'), (snap) => {
        const list: Product[] = [];
        snap.forEach(d => list.push(d.data() as Product));
        setProducts(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'products');
      });

      const vUnsub = onSnapshot(collection(db, 'vendors'), (snap) => {
        const list: Vendor[] = [];
        snap.forEach(d => list.push(d.data() as Vendor));
        setVendors(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'vendors');
      });

      const aUnsub = onSnapshot(collection(db, 'applications'), (snap) => {
        const list: VendorApplication[] = [];
        snap.forEach(d => list.push(d.data() as VendorApplication));
        setApplications(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'applications');
      });

      const oUnsub = onSnapshot(collection(db, 'orders'), (snap) => {
        const list: Order[] = [];
        snap.forEach(d => list.push(d.data() as Order));
        // Sort orders descending by date or custom key
        list.sort((a, b) => b.id.localeCompare(a.id));
        setOrders(list);
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'orders');
      });

      unsubs.push(pUnsub, vUnsub, aUnsub, oUnsub);
    };

    syncCollection();

    return () => {
      unsubs.forEach(fn => fn());
    };
  }, []);

  // 4. Persistence of local simple views/selections
  useEffect(() => {
    localStorage.setItem('marketsaas_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('marketsaas_sel_vendor', selectedVendorId);
  }, [selectedVendorId]);

  useEffect(() => {
    localStorage.setItem('marketsaas_cart', JSON.stringify(cart));
  }, [cart]);

  // Firebase auth helpers
  const signInWithGoogle = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/drive.file');
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGoogleAccessToken(credential.accessToken);
        localStorage.setItem('marketsaas_google_token', credential.accessToken);
      }
    } catch (err: any) {
      console.error("Google sign in failure:", err);
      let errMsg = err?.message || String(err);
      if (err?.code === 'auth/popup-closed-by-user') {
        errMsg = 'The sign-in popup was closed before completion. Inside the sandboxed preview iframe, browsers block third-party cookies by default, which can cause Google popup authentication to fail.';
      } else if (err?.code === 'auth/cancelled-popup-request') {
        errMsg = 'The sign-in popup request was cancelled.';
      } else if (err?.code === 'auth/network-request-failed') {
        errMsg = 'A firewalled or offline network status was detected.';
      }
      setAuthError(errMsg);
    }
  };

  const signInWithDemo = (selectedRole: Role = 'Customer', customVendorId?: string) => {
    setAuthError(null);
    let simulatedUser: any;
    
    if (selectedRole === 'Admin') {
      simulatedUser = {
        uid: 'demo_admin_uid_dzsayto',
        email: 'dzsayto@gmail.com',
        displayName: 'MarketSaaS Administrator',
        photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
        emailVerified: true
      };
    } else if (selectedRole === 'Vendor') {
      const vId = customVendorId || 'v1';
      const targetVendor = vendors.find(v => v.id === vId) || INITIAL_VENDORS[0];
      simulatedUser = {
        uid: `demo_vendor_uid_${vId}`,
        email: targetVendor.ownerEmail,
        displayName: `${targetVendor.name} Vendor`,
        photoURL: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=100',
        emailVerified: true
      };
    } else {
      simulatedUser = {
        uid: 'demo_customer_uid_dzsayto',
        email: 'customer@marketsaas.com',
        displayName: 'Demo Customer Account',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100',
        emailVerified: true
      };
    }
    setUser(simulatedUser);
  };

  const signOutUser = async () => {
    setAuthError(null);
    try {
      setGoogleAccessToken(null);
      localStorage.removeItem('marketsaas_google_token');
      if (user?.uid?.startsWith('demo_')) {
        setUser(null);
      } else {
        await signOut(auth);
      }
    } catch (err) {
      console.error("Sign out failure:", err);
    }
  };

  // Product CRUD
  const addProduct = async (newProd: Omit<Product, 'id'>) => {
    const id = 'p_' + Date.now();
    const prod: Product = { ...newProd, id };
    try {
      await setDoc(doc(db, 'products', id), prod);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `products/${id}`);
    }
  };

  const updateProduct = async (updatedProd: Product) => {
    try {
      await setDoc(doc(db, 'products', updatedProd.id), updatedProd);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${updatedProd.id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  // Vendor Onboarding Moderation (Admin actions)
  const approveApplication = async (appId: string) => {
    const application = applications.find(a => a.id === appId);
    if (!application) return;

    try {
      // Approve application status
      await setDoc(doc(db, 'applications', appId), { ...application, status: 'Approved' });

      // Provision new vendor profile
      const newVendorId = 'v_' + Date.now();
      const newVendor: Vendor = {
        id: newVendorId,
        name: application.vendorName,
        logo: application.category.includes('Solar') ? '☀️' : '⛺',
        category: application.category,
        rating: 5.0,
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'Active',
        revenue: 0,
        salesCount: 0,
        ownerEmail: application.ownerEmail,
        idDocumentUrl: application.documentUrl
      };

      await setDoc(doc(db, 'vendors', newVendorId), newVendor);
      setSelectedVendorId(newVendorId);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `applications/${appId}`);
    }
  };

  const rejectApplication = async (appId: string, reason: string) => {
    const application = applications.find(a => a.id === appId);
    if (!application) return;
    try {
      await setDoc(doc(db, 'applications', appId), { ...application, status: 'Rejected', reason });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `applications/${appId}`);
    }
  };

  // Cart operations (Client side)
  const addToCart = (product: Product, quantity: number, color?: string, size?: string) => {
    const cartItemId = `${product.id}-${color || ''}-${size || ''}`;
    setCart(prev => {
      const idx = prev.findIndex(item => item.id === cartItemId);
      if (idx > -1) {
        const next = [...prev];
        next[idx].quantity += quantity;
        return next;
      }
      return [...prev, {
        id: cartItemId,
        productId: product.id,
        product,
        quantity,
        selectedColor: color,
        selectedSize: size
      }];
    });
    setCurrentView('cart');
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, q: number) => {
    if (q <= 0) {
      removeFromCart(cartItemId);
    } else {
      setCart(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity: q } : item));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // Checkout process - writes to Firestore
  const checkout = async (customerName: string, customerEmail: string, shippingAddress: string) => {
    if (cart.length === 0) return;

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 89)}`;

    // Group items by vendorId
    const itemsByVendor: Record<string, CartItem[]> = {};
    cart.forEach(item => {
      const vId = item.product.vendorId;
      if (!itemsByVendor[vId]) itemsByVendor[vId] = [];
      itemsByVendor[vId].push(item);
    });

    try {
      for (const [vendorId, items] of Object.entries(itemsByVendor)) {
        const subTotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        const commissionFee = subTotal * 0.1;

        const order: Order = {
          id: `${orderId}-${vendorId}`,
          productNames: items.map(item => `${item.product.name} (x${item.quantity})`),
          customerName,
          customerEmail,
          shippingAddress,
          totalAmount: subTotal,
          commission: commissionFee,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0],
          vendorId
        };
        
        // Write order receipt
        await setDoc(doc(db, 'orders', order.id), order);

        // Update Vendor ledger balance
        const vRef = doc(db, 'vendors', vendorId);
        const currentVendor = vendors.find(v => v.id === vendorId);
        if (currentVendor) {
          await setDoc(vRef, {
            ...currentVendor,
            revenue: currentVendor.revenue + subTotal,
            salesCount: currentVendor.salesCount + items.reduce((sum, i) => sum + i.quantity, 0)
          });
        }

        // Decrement stock in Firestore
        for (const item of items) {
          const pRef = doc(db, 'products', item.productId);
          const currentProd = products.find(p => p.id === item.productId);
          if (currentProd) {
            await setDoc(pRef, {
              ...currentProd,
              stock: Math.max(0, currentProd.stock - item.quantity)
            });
          }
        }
      }

      setLastPlacedOrderId(orderId);
      clearCart();
      setCurrentView('order-success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'checkout/ledger');
    }
  };

  const resetToDefault = async () => {
    try {
      // Delete all products
      for (const p of products) {
        await deleteDoc(doc(db, 'products', p.id));
      }
      // Delete all vendors
      for (const v of vendors) {
        await deleteDoc(doc(db, 'vendors', v.id));
      }
      // Delete all applications
      for (const a of applications) {
        await deleteDoc(doc(db, 'applications', a.id));
      }
      // Delete all orders
      for (const o of orders) {
        await deleteDoc(doc(db, 'orders', o.id));
      }

      // Re-seed with default entries
      for (const item of INITIAL_PRODUCTS) {
        await setDoc(doc(db, 'products', item.id), item);
      }
      for (const item of INITIAL_VENDORS) {
        await setDoc(doc(db, 'vendors', item.id), item);
      }
      for (const item of INITIAL_APPLICATIONS) {
        await setDoc(doc(db, 'applications', item.id), item);
      }
      for (const item of INITIAL_ORDERS) {
        await setDoc(doc(db, 'orders', item.id), item);
      }
    } catch (err) {
      console.error("Re-seeding error:", err);
    }

    setCart([]);
    setRole('Customer');
    setSelectedVendorId('v1');
    setCurrentView('home');
    setSelectedProductId('p1');
  };

  return (
    <AppContext.Provider value={{
      role, setRole,
      selectedVendorId, setSelectedVendorId,
      products, vendors, applications, orders, cart,
      addProduct, updateProduct, deleteProduct,
      approveApplication, rejectApplication,
      addToCart, removeFromCart, updateCartQuantity, clearCart, checkout,
      currentView, setCurrentView,
      selectedProductId, setSelectedProductId,
      lastPlacedOrderId,
      resetToDefault,
      user, signInWithGoogle, signOutUser, dbReady,
      authError, setAuthError, signInWithDemo,
      googleAccessToken, setGoogleAccessToken
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
