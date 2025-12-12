/**
 * Product-related TypeScript types
 * Centralized type definitions for products, categories, and tags
 */

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  categoryId?: string | null;
  categoryName?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  condition?: string | null;
  price: string | number;
  quantity: number;
  lowStockAt?: number | null;
  supplierId?: string | null;
  supplierName?: string | null;
  imageUrl?: string | null;
  warrantyMonths?: number | null;
  location?: string | null;
  specs?: string | null;
  compatibility?: string | null;
  notes?: string | null;
  userId: string;
  createdAt: string;
  tags?: Tag[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductFormData {
  name: string;
  categoryId: string;
  manufacturer: string;
  model: string;
  sku: string;
  barcode: string;
  quantity: string;
  lowStockAt: string;
  condition: string;
  location: string;
  price: string;
  specs: string;
  compatibility: string;
  supplierId: string;
  warrantyMonths: string;
  notes: string;
  imageUrl: string;
  tagIds: string[];
}

export interface InitialFilters {
  search?: string;
  category?: string;
  manufacturer?: string;
  condition?: string;
  lowStock?: boolean;
  page?: number;
  pageSize?: number;
}

export interface InventoryFilters extends InitialFilters {
  searchTerm: string;
  categoryFilter: string;
  manufacturerFilter: string;
  conditionFilter: string;
  lowStockFilter: boolean;
}
