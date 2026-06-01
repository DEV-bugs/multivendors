import { Product, Vendor, VendorApplication, Order } from './types';

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'v1',
    name: 'Apex Labs',
    logo: '⚡',
    category: 'Wearables & Electronics',
    rating: 4.9,
    joinedDate: '2025-01-15',
    status: 'Active',
    revenue: 42800,
    salesCount: 172,
    ownerEmail: 'contact@apexlabs.cc',
    idDocumentUrl: 'pass_apex_verify.pdf'
  },
  {
    id: 'v2',
    name: 'CloudRunner Co',
    logo: '👟',
    category: 'Athletics & Footwear',
    rating: 4.8,
    joinedDate: '2025-02-10',
    status: 'Active',
    revenue: 35100,
    salesCount: 195,
    ownerEmail: 'orders@cloudrunner.co',
    idDocumentUrl: 'biz_license_cr.pdf'
  },
  {
    id: 'v3',
    name: 'Acoustix Audio',
    logo: '🎧',
    category: 'Acoustics & Sound',
    rating: 4.7,
    joinedDate: '2025-03-01',
    status: 'Active',
    revenue: 29400,
    salesCount: 147,
    ownerEmail: 'legal@acoustix.audio',
    idDocumentUrl: 'acoustix_llc_proof.pdf'
  },
  {
    id: 'v4',
    name: 'Prism Light Co',
    logo: '🔮',
    category: 'Smart Home & Lights',
    rating: 4.6,
    joinedDate: '2025-04-18',
    status: 'Active',
    revenue: 12500,
    salesCount: 250,
    ownerEmail: 'hello@prismlights.io',
    idDocumentUrl: 'prism_ein_doc.png'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Apex Quantum X1 Smartwatch',
    description: 'The definitive smart companion for adventure, telemetry, and high-precision biometric mapping. Features a beautiful micro- OLED display, dual-frequency GPS mapping, aerospace-grade titanium frame, and 14-day battery life under deep active tracking modes.',
    price: 349,
    sku: 'APX-QT-X1',
    stock: 24,
    category: 'Wearables & Electronics',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600',
    specs: {
      'Frame Material': 'Aerospace Titanium (Grade 5)',
      'Battery Life': 'Up to 14 days',
      'Water Resistance': '100m (10 ATM)',
      'Display': '1.43" Always-On AMOLED',
      'Telemetry Sensors': 'GPS/GLONASS, Dynamic Heart Rate, PulseOx, Altitude Barometer'
    },
    vendorId: 'v1',
    isFeatured: true,
    colors: ['Titanium Grey', 'Slate Black', 'Nordic Silver'],
    sizes: ['42mm', '46mm']
  },
  {
    id: 'p2',
    name: 'CloudRunner Ultra X Runner',
    description: 'Designed to propel your step on high-altitude trails, city sprints, and marathon intervals. Engineered with CloudRunner proprietary carbon-plate rebound grids and an ultra-breathable engineered mesh upper for absolute heat control.',
    price: 180,
    sku: 'CR-UL-X',
    stock: 45,
    category: 'Athletics & Footwear',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600',
    specs: {
      'Cushioning': 'SuperFoam Max Energy Rebound',
      'Drop': '8mm gradient',
      'Weight': '210g (Size 9)',
      'Outsole': 'High-grip HydroTraction rubber',
      'Safety': '360° reflective micro-filaments'
    },
    vendorId: 'v2',
    isFeatured: true,
    colors: ['Neon Coral', 'Stealth Teal', 'Charcoal White'],
    sizes: ['8', '9', '10', '11']
  },
  {
    id: 'p3',
    name: 'Acoustix Pro ANC Headphones',
    description: 'Indulge in studio-grade acoustics anywhere. Featuring ultra-advanced Hybrid Active Noise Cancellation, custom-tuned 40mm beryllium diaphragm drivers, responsive touch navigation, and premium sheepskin memory-foam ear cushions.',
    price: 299,
    sku: 'AC-PRO-ANC',
    stock: 18,
    category: 'Acoustics & Sound',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600',
    specs: {
      'DAC Driver': '40mm Custom Beryllium Diaphragm',
      'ANC Rating': 'Up to -42dB Adaptive Cancellation',
      'Bluetooth': 'v5.3 with LDAC & aptX Adaptive',
      'Battery Capacity': '42 hours continuous play',
      'Charge Time': 'VeloCharge 10-min for 5 hours'
    },
    vendorId: 'v3',
    isFeatured: true,
    colors: ['Obsidian Black', 'Chalk Ivory'],
    sizes: ['Standard Over-Ear']
  },
  {
    id: 'p4',
    name: 'Prism Aura RGB Lightbar',
    description: 'Transform your monitor context with ambient, glare-free, workspace illumination. Dynamically synced via USB-C with desktop application mapping to reflect on-screen palettes, enhance focus, and eliminate optical stress.',
    price: 89,
    sku: 'PR-AURA-RGB',
    stock: 75,
    category: 'Smart Home & Lights',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600',
    specs: {
      'Mount Type': 'Weighted pivot monitor clip',
      'Color Temp': '2700K - 6500K dynamic tuning',
      'RGB Channels': '16.8 million color backend diffuser',
      'CRI Index': 'Ra > 95 accurate skin color',
      'Power Connection': 'USB-C bus-powered (5V, 2A)'
    },
    vendorId: 'v4',
    isFeatured: false,
    colors: ['Matte Black', 'Ice Silver'],
    sizes: ['18" Wide', '24" Curved Wide']
  },
  {
    id: 'p5',
    name: 'Apex Horizon Pro Chest Strap',
    description: 'High-frequency ECG monitoring chest band, precision-engineered to pair with the Quantum series. Broadcasts synchronized metrics across multiple devices simultaneously for athletic performance tracking.',
    price: 79,
    sku: 'APX-HZ-ECG',
    stock: 50,
    category: 'Wearables & Electronics',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=600',
    specs: {
      'Precision Accuracy': 'Micro-ECG ±1 bpm',
      'Battery': 'CR2032 replaceable (400 hours)',
      'Connectivity': 'ANT+, BLE v5.1 dual channels',
      'Band Size': 'Adjustable: 26" to 54"'
    },
    vendorId: 'v1',
    isFeatured: false,
    colors: ['Sienna Black'],
    sizes: ['Polyester Comfort Elastic']
  }
];

export const INITIAL_APPLICATIONS: VendorApplication[] = [
  {
    id: 'app1',
    vendorName: 'SolarEdge Energy Solutions',
    ownerEmail: 'onboarding@solaredge.net',
    category: 'Eco Hardware & Solar',
    documentUrl: 'solaredge_gcp_license.pdf',
    appliedDate: '2025-05-28',
    status: 'Pending'
  },
  {
    id: 'app2',
    vendorName: 'Horizon Outdoor Outfitters',
    ownerEmail: 'partner@horizonoutdoor.com',
    category: 'Camp & Outdoors',
    documentUrl: 'horizon_corp_id.png',
    appliedDate: '2025-05-30',
    status: 'Pending'
  },
  {
    id: 'app3',
    vendorName: 'Matrix Labs (Wearables)',
    ownerEmail: 'matrix_wear@proton.me',
    category: 'Wearables & Electronics',
    documentUrl: 'matrix_inc_kyc.pdf',
    appliedDate: '2025-05-25',
    status: 'Rejected',
    reason: 'Insufficient corporate business address certification.'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8942-01',
    productNames: ['Apex Quantum X1 Smartwatch'],
    customerName: 'Sarah Jenkins',
    customerEmail: 's.jenkins@gmail.com',
    shippingAddress: '422 Pine Crest Blvd, Portland, OR 97205',
    totalAmount: 349,
    commission: 34.9, // 10% standard fee
    status: 'Pending',
    date: '2025-05-31',
    vendorId: 'v1'
  },
  {
    id: 'ORD-7740-02',
    productNames: ['CloudRunner Ultra X Runner', 'CloudRunner Ultra X Runner'],
    customerName: 'Michael Chen',
    customerEmail: 'mchen.dev@outlook.com',
    shippingAddress: '1590 Shoreline Parkway, Mountain View, CA 94043',
    totalAmount: 360,
    commission: 36.0,
    status: 'Shipped',
    date: '2025-05-30',
    vendorId: 'v2'
  },
  {
    id: 'ORD-6510-03',
    productNames: ['Acoustix Pro ANC Headphones'],
    customerName: 'Eleanor Vance',
    customerEmail: 'eleanor.v@vancecorp.com',
    shippingAddress: '10 Hudson Yards, Suite 44B, New York, NY 10001',
    totalAmount: 299,
    commission: 29.9,
    status: 'Delivered',
    date: '2025-05-29',
    vendorId: 'v3'
  },
  {
    id: 'ORD-5412-04',
    productNames: ['Prism Aura RGB Lightbar'],
    customerName: 'Derrick Powell',
    customerEmail: 'derrick.powell@yahoo.com',
    shippingAddress: '883 Oaktree Ln, Austin, TX 78701',
    totalAmount: 89,
    commission: 8.9,
    status: 'Delivered',
    date: '2025-05-28',
    vendorId: 'v4'
  }
];
