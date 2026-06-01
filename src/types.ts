/**
 * MarketSaaS Shared Typings
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  category: string;
  rating: number;
  image: string;
  specs: Record<string, string>;
  vendorId: string;
  isFeatured?: boolean;
  colors?: string[];
  sizes?: string[];
}

export interface Vendor {
  id: string;
  name: string;
  logo: string;
  category: string;
  rating: number;
  joinedDate: string;
  status: 'Active' | 'Pending' | 'Suspended';
  revenue: number;
  salesCount: number;
  ownerEmail: string;
  idDocumentUrl?: string;
}

export interface VendorApplication {
  id: string;
  vendorName: string;
  ownerEmail: string;
  category: string;
  documentUrl: string;
  appliedDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason?: string;
}

export interface Order {
  id: string;
  productNames: string[];
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  totalAmount: number;
  commission: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  vendorId: string;
}

export interface CartItem {
  id: string; // combination of product ID and options
  productId: string;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface MarketMetrics {
  totalGmv: number;
  totalCommission: number;
  vendorCount: number;
  customerCount: number;
  salesCount: number;
}
