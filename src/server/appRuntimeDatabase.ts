import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUNTIME_DB_PATH = path.resolve(__dirname, '../data/app-runtime-db.json');

export interface AppRuntimeEvent {
  id: string;
  installationId: string;
  appId: string;
  storeId: string;
  storeName: string;
  eventType: string;
  aiFunctionUsed?: 'analysis' | 'generation' | 'classification' | 'recommendation' | 'automation';
  creditsConsumed: number;
  status: 'completed' | 'processing' | 'error';
  summary: string;
  details?: any;
  timestamp: string;
}

export interface AppRuntimeSettings {
  installationId: string;
  appId: string;
  enabled: boolean;
  settings: Record<string, any>;
  lastUpdated: string;
}

export interface AppAIUsageRecord {
  userId: string;
  installationId: string;
  appId: string;
  tokensUsed: number;
  creditsDeducted: number;
  model: string;
  feature: string;
  timestamp: string;
}

interface RuntimeDatabaseStructure {
  settings: Record<string, AppRuntimeSettings>;
  events: Record<string, AppRuntimeEvent[]>;
  aiUsage: Record<string, AppAIUsageRecord[]>;
}

let inMemoryRuntimeCache: RuntimeDatabaseStructure | null = null;

function loadRuntimeDatabase(): RuntimeDatabaseStructure {
  if (inMemoryRuntimeCache) {
    return inMemoryRuntimeCache;
  }

  try {
    if (fs.existsSync(RUNTIME_DB_PATH)) {
      const raw = fs.readFileSync(RUNTIME_DB_PATH, 'utf-8');
      inMemoryRuntimeCache = JSON.parse(raw);
    } else {
      inMemoryRuntimeCache = {
        settings: {},
        events: {},
        aiUsage: {}
      };
      saveRuntimeDatabase(inMemoryRuntimeCache);
    }
  } catch (err) {
    console.error('Failed to read App Runtime Database, using clean state:', err);
    inMemoryRuntimeCache = {
      settings: {},
      events: {},
      aiUsage: {}
    };
  }

  return inMemoryRuntimeCache!;
}

function saveRuntimeDatabase(data: RuntimeDatabaseStructure) {
  inMemoryRuntimeCache = data;
  try {
    const dir = path.dirname(RUNTIME_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(RUNTIME_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write App Runtime Database:', err);
  }
}

export const appRuntimeDatabase = {
  getSettings(installationId: string): AppRuntimeSettings | null {
    const db = loadRuntimeDatabase();
    return db.settings[installationId] || null;
  },

  saveSettings(installationId: string, appId: string, settings: Record<string, any>, enabled = true): AppRuntimeSettings {
    const db = loadRuntimeDatabase();
    const entry: AppRuntimeSettings = {
      installationId,
      appId,
      enabled,
      settings,
      lastUpdated: new Date().toISOString()
    };
    db.settings[installationId] = entry;
    saveRuntimeDatabase(db);
    return entry;
  },

  getEvents(installationId: string): AppRuntimeEvent[] {
    const db = loadRuntimeDatabase();
    return db.events[installationId] || [];
  },

  addEvent(event: AppRuntimeEvent): void {
    const db = loadRuntimeDatabase();
    if (!db.events[event.installationId]) {
      db.events[event.installationId] = [];
    }
    db.events[event.installationId].unshift(event);
    saveRuntimeDatabase(db);
  },

  recordAIUsage(record: AppAIUsageRecord): void {
    const db = loadRuntimeDatabase();
    if (!db.aiUsage[record.installationId]) {
      db.aiUsage[record.installationId] = [];
    }
    db.aiUsage[record.installationId].unshift(record);
    saveRuntimeDatabase(db);
  },

  getAIUsage(installationId: string): AppAIUsageRecord[] {
    const db = loadRuntimeDatabase();
    return db.aiUsage[installationId] || [];
  }
};
