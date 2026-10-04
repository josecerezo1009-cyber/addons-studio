import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  SEOConnectedStore, 
  SEOCatalogScanResult, 
  SEOStoreProduct, 
  SEOChangeHistoryItem 
} from '../types/seo';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE_PATH = path.resolve(__dirname, '../data/seo-pro-db.json');

interface SEODatabaseStructure {
  stores: SEOConnectedStore[];
  analyses: Record<string, SEOCatalogScanResult>;
  products: Record<string, SEOStoreProduct[]>;
  history: SEOChangeHistoryItem[];
}

let inMemoryCache: SEODatabaseStructure | null = null;

// Ensure database file exists
function loadDatabase(): SEODatabaseStructure {
  if (inMemoryCache) {
    return inMemoryCache;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      inMemoryCache = JSON.parse(raw);
    } else {
      inMemoryCache = {
        stores: [],
        analyses: {},
        products: {},
        history: []
      };
      saveDatabase(inMemoryCache);
    }
  } catch (err) {
    console.error('Failed to read SEO Database from disk, using clean state:', err);
    inMemoryCache = {
      stores: [],
      analyses: {},
      products: {},
      history: []
    };
  }

  return inMemoryCache!;
}

function saveDatabase(data: SEODatabaseStructure) {
  inMemoryCache = data;
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write SEO Database to disk:', err);
  }
}

export const seoDatabase = {
  // STORES
  getStores(): SEOConnectedStore[] {
    const db = loadDatabase();
    return db.stores || [];
  },

  getStore(id: string): SEOConnectedStore | undefined {
    const db = loadDatabase();
    return db.stores.find(s => s.id === id);
  },

  saveStore(store: SEOConnectedStore): SEOConnectedStore {
    const db = loadDatabase();
    const existingIndex = db.stores.findIndex(s => s.id === store.id || (s.url && s.url === store.url));
    if (existingIndex >= 0) {
      db.stores[existingIndex] = { ...db.stores[existingIndex], ...store };
    } else {
      db.stores.push(store);
    }
    saveDatabase(db);
    return store;
  },

  deleteStore(id: string): boolean {
    const db = loadDatabase();
    db.stores = db.stores.filter(s => s.id !== id);
    delete db.analyses[id];
    delete db.products[id];
    db.history = db.history.filter(h => h.storeId !== id);
    saveDatabase(db);
    return true;
  },

  // ANALYSES
  getScanResult(storeId: string): SEOCatalogScanResult | null {
    const db = loadDatabase();
    return db.analyses[storeId] || null;
  },

  saveScanResult(storeId: string, result: SEOCatalogScanResult): void {
    const db = loadDatabase();
    db.analyses[storeId] = result;
    saveDatabase(db);
  },

  // PRODUCTS
  getProducts(storeId: string): SEOStoreProduct[] {
    const db = loadDatabase();
    return db.products[storeId] || [];
  },

  saveProducts(storeId: string, products: SEOStoreProduct[]): void {
    const db = loadDatabase();
    db.products[storeId] = products;
    saveDatabase(db);
  },

  updateProduct(storeId: string, productId: string, updates: Partial<SEOStoreProduct>): SEOStoreProduct | null {
    const db = loadDatabase();
    const list = db.products[storeId] || [];
    const index = list.findIndex(p => p.id === productId);
    if (index >= 0) {
      list[index] = { ...list[index], ...updates };
      db.products[storeId] = list;
      
      // Also update scanResult product list if present
      if (db.analyses[storeId]) {
        const scanIdx = db.analyses[storeId].products.findIndex(p => p.id === productId);
        if (scanIdx >= 0) {
          db.analyses[storeId].products[scanIdx] = list[index];
        }
      }

      saveDatabase(db);
      return list[index];
    }
    return null;
  },

  // HISTORY
  getHistory(storeId?: string): SEOChangeHistoryItem[] {
    const db = loadDatabase();
    if (storeId) {
      return db.history.filter(h => h.storeId === storeId);
    }
    return db.history || [];
  },

  addHistoryItem(item: SEOChangeHistoryItem): void {
    const db = loadDatabase();
    db.history.unshift(item);
    saveDatabase(db);
  }
};
