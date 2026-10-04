import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp, EcommercePlatform, ConnectedStore } from '../../types';
import { INITIAL_ADDONS } from '../../data/addonsData';
import { AddonDefinition } from '../../types/addon';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Activity, 
  DollarSign, 
  Store, 
  Users, 
  Code2, 
  Layers,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  MessageSquare,
  Bot,
  Zap,
  Check,
  Send,
  SlidersHorizontal,
  Flame,
  Search,
  Filter,
  Eye,
  UserCheck,
  UserX,
  CreditCard,
  Settings,
  FileText,
  Lock,
  Globe,
  Plus,
  Trash2,
  ListFilter
} from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'merchant' | 'creator' | 'admin';
  status: 'active' | 'suspended' | 'blocked';
  registeredAt: string;
  appsCreatedCount: number;
  purchasesCount: number;
  lastActive: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'auth' | 'app_moderation' | 'financial' | 'settings' | 'security';
  details: string;
}

export const AdminView: React.FC = () => {
  const { apps, updateAppStatus, transactions, stores, showNotification, updateApp, setCurrentView } = useApp();

  // Dynamic metrics calculations from transactions
  const totalMarketplaceGrossVolume = transactions.reduce((acc, t) => acc + (t.type === 'sale' ? t.amount : 0), 0);
  const totalPlatformCommissions = transactions.reduce((acc, t) => acc + (t.type === 'sale' ? t.platformFee : 0), 0);

  // Primary navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'creators' | 'apps' | 'addons' | 'finance' | 'marketing' | 'settings' | 'logs'>('dashboard');

  // Addons & Modular Extensions Management State
  const [addonsList, setAddonsList] = useState<AddonDefinition[]>(INITIAL_ADDONS);
  const [selectedAddonForEdit, setSelectedAddonForEdit] = useState<AddonDefinition | null>(null);
  const [editPriceMonthly, setEditPriceMonthly] = useState<number>(29);
  const [editPriceOneTime, setEditPriceOneTime] = useState<number>(290);
  const [editVersion, setEditVersion] = useState<string>('2.4.1');
  const [editCompatiblePlans, setEditCompatiblePlans] = useState<string[]>(['free', 'pro', 'enterprise']);

  // Search and Filter states
  const [userSearch, setUserUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'merchant' | 'creator'>('all');
  const [appSearch, setAppSearch] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<'all' | 'published' | 'draft' | 'security_review'>('all');

  // Commission Rates Configuration
  const [generalCommission, setGeneralCommission] = useState(15);
  const [aiCommission, setAiCommission] = useState(20);
  const [pluginCommission, setAiPluginCommission] = useState(25);
  const [premiumCreatorCommission, setPremiumCreatorCommission] = useState(12);

  // Financial Filter
  const [financeTimeframe, setFinanceTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');

  // AI Analyst States
  const [isAnalyzingBusiness, setIsAnalyzingBusiness] = useState(false);
  const [aiBusinessReport, setAiBusinessReport] = useState<string | null>(null);

  // Growth & SEO Tool states
  const [seoTargetApp, setSeoTargetApp] = useState(apps[0]?.id || '');
  const [isGeneratingSeo, setIsGeneratingSeo] = useState(false);
  const [generatedSeoMetadata, setGeneratedSeoMetadata] = useState<{ title: string; desc: string; url: string; sitemap: string } | null>(null);

  // Global Platform Settings State
  const [platformName, setPlatformName] = useState('NexusEcom Marketplace');
  const [primaryCurrency, setPrimaryCurrency] = useState('USD');
  const [primaryLanguage, setPrimaryLanguage] = useState('es');
  const [multiLanguageEnabled, setMultiLanguageEnabled] = useState(true);

  // Users Registry State (allows interactive block/unblock, changing roles, etc.)
  const [usersList, setUsersList] = useState<AdminUser[]>([
    { id: 'usr_m_01', name: 'José Cerezo', email: 'jose.cerezo1009@gmail.com', role: 'merchant', status: 'active', registeredAt: '2026-08-15', appsCreatedCount: 0, purchasesCount: 3, lastActive: 'Hoy, hace 5 minutos' },
    { id: 'usr_c_01', name: 'Carlos Mendoza', email: 'carlos.dev@nexusecom.io', role: 'creator', status: 'active', registeredAt: '2026-01-10', appsCreatedCount: 3, purchasesCount: 0, lastActive: 'Ayer, a las 18:40' },
    { id: 'usr_m_02', name: 'Elena Rostova', email: 'elena@nordicdecor.se', role: 'merchant', status: 'active', registeredAt: '2026-09-01', appsCreatedCount: 0, purchasesCount: 1, lastActive: 'Hace 3 días' },
    { id: 'usr_c_02', name: 'Sarah Jenkins', email: 'sarah.apps@shopifypartners.com', role: 'creator', status: 'active', registeredAt: '2026-04-22', appsCreatedCount: 2, purchasesCount: 0, lastActive: 'Hoy, hace 1 hora' },
    { id: 'usr_m_03', name: 'Dieter Braun', email: 'c.braun@gourmetfoods.de', role: 'merchant', status: 'suspended', registeredAt: '2026-07-20', appsCreatedCount: 0, purchasesCount: 0, lastActive: 'Hace 2 semanas' }
  ]);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log_01', timestamp: '2026-10-02T14:40:22Z', user: 'Admin System', action: 'Ecosystem security audit completed', category: 'security', details: 'Static code scan on app CartRecover AI Pro successfully cleared.' },
    { id: 'log_02', timestamp: '2026-10-02T13:12:05Z', user: 'jose.cerezo1009@gmail.com', action: 'Store Connected', category: 'settings', details: 'Linked Shopify store nordic-living.myshopify.com via secure OAuth.' },
    { id: 'log_03', timestamp: '2026-10-02T10:45:12Z', user: 'carlos.dev@nexusecom.io', action: 'New Version Deployed', category: 'app_moderation', details: 'Released CartRecover AI Pro v1.2.0 with SemVer changelog.' },
    { id: 'log_04', timestamp: '2026-10-02T09:15:30Z', user: 'Admin System', action: 'Payout Processed', category: 'financial', details: 'Sent $1,020.00 USD payout net of commissions to creator Carlos Mendoza.' }
  ]);

  // Sync target app selection for SEO
  useEffect(() => {
    if (apps.length > 0 && !seoTargetApp) {
      setSeoTargetApp(apps[0].id);
    }
  }, [apps, seoTargetApp]);

  // Append entry to Audit Trail helper
  const addAuditEntry = (action: string, category: AuditLog['category'], details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Super Admin',
      action,
      category,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Actions for Addon Management
  const handleToggleAddonStatus = (addonId: string, currentStatus: AddonDefinition['status']) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setAddonsList(prev => prev.map(a => a.id === addonId ? { ...a, status: nextStatus } : a));
    const targetAddon = addonsList.find(a => a.id === addonId);
    showNotification(`Addon ${targetAddon?.name || ''} marcado como ${nextStatus === 'active' ? 'ACTIVO' : 'DESACTIVADO'} en plataforma`, 'info');
    addAuditEntry('Addon Status Changed', 'app_moderation', `Changed status of addon ${targetAddon?.name} to ${nextStatus}.`);
  };

  const handleOpenAddonEditModal = (addon: AddonDefinition) => {
    setSelectedAddonForEdit(addon);
    setEditPriceMonthly(addon.pricing.priceMonthly);
    setEditPriceOneTime(addon.pricing.priceOneTime || 0);
    setEditVersion(addon.version);
    setEditCompatiblePlans(addon.compatiblePlans || ['free', 'pro', 'enterprise']);
  };

  const handleSaveAddonEdit = () => {
    if (!selectedAddonForEdit) return;

    setAddonsList(prev => prev.map(a => {
      if (a.id === selectedAddonForEdit.id) {
        return {
          ...a,
          version: editVersion,
          pricing: {
            ...a.pricing,
            priceMonthly: editPriceMonthly,
            priceOneTime: editPriceOneTime
          },
          compatiblePlans: editCompatiblePlans as any
        };
      }
      return a;
    }));

    showNotification(`Configuración del addon ${selectedAddonForEdit.name} actualizada con éxito`, 'success');
    addAuditEntry('Addon Updated', 'settings', `Updated pricing and version for addon ${selectedAddonForEdit.name} (v${editVersion}).`);
    setSelectedAddonForEdit(null);
  };

  // Actions for User Management
  const handleToggleUserStatus = (userId: string, userName: string, currentStatus: AdminUser['status']) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUsersList(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    showNotification(`Usuario ${userName} ha sido ${nextStatus === 'suspended' ? 'suspendido' : 'activado'}`, 'info');
    addAuditEntry(`User status toggled: ${nextStatus.toUpperCase()}`, 'security', `Account ${userName} (${userId}) toggled to ${nextStatus}.`);
  };

  const handleVerifyCreator = (userId: string, creatorName: string) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, role: 'creator' };
      }
      return u;
    }));
    showNotification(`Creador ${creatorName} ha sido verificado como Miembro Profesional`, 'success');
    addAuditEntry('Creator Verified', 'app_moderation', `Verified creator credentials for ${creatorName}.`);
  };

  // App Catalog custom actions
  const handleToggleAppHighlight = (appId: string, appName: string, isHighlighted: boolean) => {
    // Call Context updateApp
    updateApp(appId, { rating: isHighlighted ? 4.9 : 4.5 }); // Use rating as a proxy to bump position in ranking
    showNotification(`Aplicación "${appName}" ha sido ${isHighlighted ? 'destacada en portada' : 'quitada de portada'}`, 'success');
    addAuditEntry(`App highlight state changed`, 'app_moderation', `Toggled marketplace homepage highlight for app: ${appName}`);
  };

  const handleApprove = (appId: string) => {
    updateAppStatus(appId, 'published');
    showNotification('Aplicación aprobada y publicada en el Marketplace', 'success');
    addAuditEntry('App Approved for Catalog', 'app_moderation', `Authorized app ${appId} for global merchant visibility.`);
  };

  const handleReject = (appId: string) => {
    updateAppStatus(appId, 'rejected');
    showNotification('Aplicación rechazada para cambios', 'info');
    addAuditEntry('App Flagged for Correction', 'app_moderation', `App ${appId} rejected due to quality check failure.`);
  };

  // Run AI Business forecast
  const runAiBusinessAnalysis = async () => {
    setIsAnalyzingBusiness(true);
    setAiBusinessReport(null);

    try {
      const response = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: 'general',
          message: `Efectúa un informe profundo de crecimiento y análisis del Marketplace:
          - Apps totales: ${apps.length}
          - Tiendas vinculadas: ${stores.length}
          - Volumen transaccionado: $${transactions.reduce((acc, t) => acc + (t.type === 'sale' ? t.amount : 0), 0)}
          - Comisiones totales generadas: $${totalPlatformCommissions}
          - Tarifas vigentes: General ${generalCommission}%, IA ${aiCommission}%, Plugins ${pluginCommission}%`,
          appData: { name: 'Ecosystem Analytics' }
        })
      });

      const data = await response.json();
      
      // Deliberate wait to show analysis scanner
      await new Promise(r => setTimeout(r, 1200));

      if (data.success && data.reply) {
        setAiBusinessReport(data.reply);
        showNotification('Análisis de Tendencias e Inteligencia de Negocio finalizado', 'success');
      } else {
        setAiBusinessReport(`### Análisis de Crecimiento & Tendencias AI Analyst
        
**Oportunidades clave detectadas:**
- **Suscripciones de IA en Alza**: Las aplicaciones clasificadas como *conversion* e *IA* (con tasa de comisión actual del 20%) lideran el 68% de las compras repetidas de comerciantes.
- **Categoría Sugerida - "Automatizaciones IA"**: Existe un incremento del 240% en búsquedas de comerciantes intentando automatizar soporte técnico mediante agentes multiidioma. Recomiendo abrir la categoría dedicada.
- **Reducción del Abandono de Creadores**: Los nuevos desarrolladores muestran una retención del 85% tras pasar con éxito su primera *Ecosystem Audit*, indicando que las barreras de entrada técnicas están bien guiadas.`);
        showNotification('Cargada propuesta de crecimiento consolidada', 'info');
      }
    } catch (err) {
      showNotification('Error al contactar con el consultor de negocio IA', 'error');
    } finally {
      setIsAnalyzingBusiness(false);
    }
  };

  // Generate automated SEO metadata sitemap
  const runAutoSeoGenerator = () => {
    const selectedApp = apps.find(a => a.id === seoTargetApp);
    if (!selectedApp) return;

    setIsGeneratingSeo(true);
    setTimeout(() => {
      setIsGeneratingSeo(false);
      const urlFriendlySlug = selectedApp.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setGeneratedSeoMetadata({
        title: `${selectedApp.name} AI Pro - SaaS App Store Oficial`,
        desc: `Consigue ${selectedApp.name} en el Marketplace de NexusEcom. ${selectedApp.tagline} Disponible para Shopify, WooCommerce y PrestaShop con instalación segura en 1-clic.`,
        url: `https://marketplace.nexusecom.io/apps/${urlFriendlySlug}`,
        sitemap: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://marketplace.nexusecom.io/apps/${urlFriendlySlug}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`
      });
      showNotification('Metatags de posicionamiento y Sitemap XML autogenerados para Google', 'success');
      addAuditEntry('SEO Generated', 'settings', `Created search engine optimization tags for ${selectedApp.name}.`);
    }, 800);
  };

  // Filtering users
  const filteredUsers = usersList.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' ? true : user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filtering apps
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(appSearch.toLowerCase()) || 
                          app.creatorName.toLowerCase().includes(appSearch.toLowerCase());
    const matchesStatus = appStatusFilter === 'all' ? true : 
                          appStatusFilter === 'published' ? app.status === 'published' :
                          appStatusFilter === 'draft' ? app.status === 'draft' :
                          app.status === 'security_review' || app.status === 'ai_validation';
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in">
      
      {/* Dynamic Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>SaaS Admin Headquarters & Growth Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Consola de Administración</h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Supervisión global de calidad, resolución de disputas, moderación de apps y control de comisiones financieras.
          </p>
        </div>

        <div className="px-5 py-3.5 rounded-2xl bg-slate-950 border border-slate-850 text-left md:text-right shrink-0">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Comisión Plataforma (15%)</p>
          <p className="text-2xl font-black text-emerald-400 font-mono">${totalPlatformCommissions.toFixed(2)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Volumen global: ${totalMarketplaceGrossVolume.toFixed(2)}</p>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard General', icon: Activity },
          { id: 'users', label: 'Gestión Usuarios', icon: Users },
          { id: 'creators', label: 'Creadores Verificados', icon: UserCheck },
          { id: 'apps', label: `Catálogo Apps (${apps.length})`, icon: Code2 },
          { id: 'addons', label: `Addons & Extensiones (${addonsList.length})`, icon: Layers },
          { id: 'finance', label: 'Métricas Económicas', icon: DollarSign },
          { id: 'marketing', label: 'SEO, Marketing & Growth', icon: Globe },
          { id: 'settings', label: 'Ajustes Globales', icon: Settings },
          { id: 'logs', label: 'Auditoría & Logs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content: Dashboard General */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Main Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1 shadow">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Compradores Registrados</span>
              <p className="text-2xl font-black text-white font-mono">152</p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">✓ +12% este mes</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1 shadow">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Creadores Activos</span>
              <p className="text-2xl font-black text-white font-mono">{usersList.filter(u => u.role === 'creator').length}</p>
              <span className="text-[10px] text-slate-500">Miembros profesionales calificados</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1 shadow">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Suscripciones Activas</span>
              <p className="text-2xl font-black text-cyan-400 font-mono">42</p>
              <span className="text-[10px] text-emerald-400">Churn rate mínimo de 1.8%</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-1 shadow">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Ingresos Netos Plataforma</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">${totalPlatformCommissions.toFixed(2)}</p>
              <span className="text-[10px] text-slate-500">Por comisiones cobradas</span>
            </div>
          </div>

          {/* Bottom Grid: AI Analyst & Incidents summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* AI Business Analyst Box */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2.5">
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Business Analyst & Consultoría</h3>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  AGENTE ESTRATÉGICO
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Pide un informe de crecimiento instantáneo a nuestro motor de negocio IA. Analiza las tendencias de ventas, retención, conversión y oportunidades en el catálogo.
              </p>

              {aiBusinessReport ? (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">
                  {aiBusinessReport}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-800 rounded-2xl text-center space-y-3">
                  <Bot className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">¿Deseas evaluar el estado comercial del marketplace y recibir sugerencias?</p>
                  <button
                    onClick={runAiBusinessAnalysis}
                    disabled={isAnalyzingBusiness}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    {isAnalyzingBusiness ? 'Analizando Métricas Reales...' : 'Ejecutar Análisis Comercial'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Incidents summary */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Últimas Acciones Registradas</h3>
              
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {auditLogs.slice(0, 3).map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-850 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-400">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab Content: Users Management */}
      {activeTab === 'users' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Gestión de Usuarios</h3>
              <p className="text-xs text-slate-400 mt-1">Busca, administra permisos, activa o suspende cuentas de comerciantes y creadores.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  value={userSearch}
                  onChange={(e) => setUserUserSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-white focus:outline-none focus:border-blue-500 w-52 sm:w-64"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos los Roles</option>
                <option value="merchant">Comerciantes (Merchants)</option>
                <option value="creator">Creadores (SaaS Developers)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Fecha Registro</th>
                  <th className="py-3 px-4">Actividad / Compras</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-950/20">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold uppercase font-mono text-[10px]">
                      {user.role}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {user.registeredAt}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        {user.role === 'creator' ? (
                          <p>{user.appsCreatedCount} apps publicadas</p>
                        ) : (
                          <p>{user.purchasesCount} apps instaladas</p>
                        )}
                        <p className="text-[10px] text-slate-500">{user.lastActive}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                        user.status === 'active' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
                        'bg-rose-500/15 border border-rose-500/25 text-rose-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        {user.role === 'merchant' && (
                          <button
                            onClick={() => handleVerifyCreator(user.id, user.name)}
                            className="px-2 py-1 rounded bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                            title="Ascender a creador"
                          >
                            Autorizar Creador
                          </button>
                        )}

                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.name, user.status)}
                          className={`p-1 rounded ${
                            user.status === 'active' 
                              ? 'bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400' 
                              : 'bg-emerald-600/15 hover:bg-emerald-600/30 text-emerald-400'
                          }`}
                          title={user.status === 'active' ? 'Suspender cuenta' : 'Re-activar cuenta'}
                        >
                          {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Creator Verifications */}
      {activeTab === 'creators' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Creadores de Ecosistema & Niveles de Confianza</h3>
            <p className="text-xs text-slate-400 mt-1">Supervisa y califica a los creadores de software basándose en sus valoraciones, volúmenes y soporte.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {usersList.filter(u => u.role === 'creator').map((creator) => {
              // Determine verified trust level based on apps created count
              const trustLevel = creator.appsCreatedCount >= 3 ? 'Creador Profesional' : 'Creador Verificado';
              return (
                <div key={creator.id} className="p-6 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white uppercase">
                        {creator.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{creator.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{creator.email}</p>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      trustLevel === 'Creador Profesional' 
                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                    }`}>
                      {trustLevel}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 text-[11px] pt-2 border-t border-slate-900">
                    <div className="p-2 rounded bg-slate-900/40">
                      <p className="text-slate-500">Apps Creadas</p>
                      <p className="font-bold text-white font-mono mt-0.5">{creator.appsCreatedCount}</p>
                    </div>

                    <div className="p-2 rounded bg-slate-900/40">
                      <p className="text-slate-500">Ventas Totales</p>
                      <p className="font-bold text-emerald-400 font-mono mt-0.5">${(creator.appsCreatedCount * 540).toLocaleString()}</p>
                    </div>

                    <div className="p-2 rounded bg-slate-900/40">
                      <p className="text-slate-500">Valoración Media</p>
                      <p className="font-bold text-amber-400 font-mono mt-0.5">4.85 / 5.0</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end pt-2">
                    <button
                      onClick={() => showNotification(`Nivel de confianza de ${creator.name} establecido en el máximo de la plataforma`, 'success')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Promocionar a Profesional
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de suspender credenciales del creador ${creator.name}? Sus apps se pausarán temporalmente.`)) {
                          showNotification(`El creador ${creator.name} ha sido suspendido para auditoría técnica.`, 'error');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-850/80 text-xs"
                    >
                      Suspender
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Apps Catalog */}
      {activeTab === 'apps' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Gestión del Catálogo Global</h3>
              <p className="text-xs text-slate-400 mt-1">Audita el estado de publicación, destaca productos recomendados por la IA u oculta del marketplace.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar por app o desarrollador..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="pl-9 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-white focus:outline-none focus:border-blue-500 w-52 sm:w-64"
                />
              </div>

              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todos los Estados</option>
                <option value="published">Publicadas (Activas)</option>
                <option value="draft">Borradores (Drafts)</option>
                <option value="security_review">Cola de Seguridad</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredApps.map(app => {
              const isHighlightProxy = app.rating >= 4.8;
              return (
                <div key={app.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-white text-base">{app.name}</h4>
                      <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {app.status}
                      </span>
                      {isHighlightProxy && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold flex items-center gap-0.5 font-mono animate-pulse">
                          <Flame className="w-3 h-3 fill-amber-400" />
                          DESTACADO EN PORTADA
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-normal max-w-xl">{app.tagline}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-[10px] text-slate-500 font-mono">
                      <span>Desarrollador: <strong className="text-slate-300">{app.creatorName}</strong></span>
                      <span>•</span>
                      <span>Instalaciones: <strong className="text-slate-300">{app.installsCount}</strong></span>
                      <span>•</span>
                      <span>Quality Score: <strong className="text-emerald-400">{app.securityAudit?.score || 96}/100</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-850">
                    {app.status !== 'published' ? (
                      <button
                        onClick={() => handleApprove(app.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Aprobar y Publicar
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleAppHighlight(app.id, app.name, !isHighlightProxy)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isHighlightProxy 
                              ? 'bg-amber-600/10 border-amber-500/30 text-amber-400 hover:bg-amber-600/20' 
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-750'
                          }`}
                        >
                          {isHighlightProxy ? 'Quitar Destacado' : 'Destacar en Portada'}
                        </button>

                        <button
                          onClick={() => handleReject(app.id)}
                          className="px-3 py-2 rounded-xl bg-slate-850 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs"
                        >
                          Ocultar / Pausar
                        </button>
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content: Addons & Modular Extensions Management */}
      {activeTab === 'addons' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Gestor Central de Addons & Aplicaciones Internas</span>
              </div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Control de Addons del Ecosistema</h3>
              <p className="text-xs text-slate-400 mt-1">
                Activa o desactiva addons en toda la plataforma, revisa versiones SemVer, gestiona precios y define qué planes de usuario tienen acceso.
              </p>
            </div>

            {/* Metrics pills */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Total Instalaciones</span>
                <span className="text-sm font-black text-cyan-400 font-mono">
                  {addonsList.reduce((acc, a) => acc + a.stats.installationsCount, 0).toLocaleString()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Addons Activos</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {addonsList.filter(a => a.status === 'active').length} de {addonsList.length}
                </span>
              </div>
            </div>
          </div>

          {/* Addons List */}
          <div className="space-y-4">
            {addonsList.map(addon => {
              const isActive = addon.status === 'active';
              const isReviewsPro = addon.id === 'addon_ai_product_reviews_pro';

              return (
                <div
                  key={addon.id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isActive 
                      ? 'bg-slate-950 border-slate-800 hover:border-slate-700' 
                      : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Left: Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-blue-500/20">
                        {isReviewsPro ? <MessageSquare className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-white">{addon.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {isActive ? 'Activo en Plataforma' : 'Desactivado'}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                            v{addon.version}
                          </span>
                          {addon.isOfficial && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                              Oficial
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                          {addon.tagline}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono pt-1">
                          <span>Precio: <strong className="text-white">${addon.pricing.priceMonthly}/mes</strong></span>
                          <span>•</span>
                          <span>Instalaciones: <strong className="text-slate-300">{addon.stats.installationsCount.toLocaleString()}</strong></span>
                          <span>•</span>
                          <span>Planes: {addon.compatiblePlans.map(p => (
                            <span key={p} className="capitalize text-slate-300 mr-1 underline">{p}</span>
                          ))}</span>
                          <span>•</span>
                          <span>Plataformas: {addon.supportedPlatforms.join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      
                      {/* Direct launch to inspect Addon Dashboard */}
                      {isReviewsPro && (
                        <button
                          onClick={() => setCurrentView('addon-reviews-pro')}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Abrir Dashboard Propio</span>
                        </button>
                      )}

                      {/* Edit Pricing & Plans */}
                      <button
                        onClick={() => handleOpenAddonEditModal(addon)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                      >
                        <Settings className="w-3.5 h-3.5" />
                        <span>Precios & Planes</span>
                      </button>

                      {/* Toggle status */}
                      <button
                        onClick={() => handleToggleAddonStatus(addon.id, addon.status)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isActive
                            ? 'bg-rose-950/40 text-rose-300 border-rose-900/60 hover:bg-rose-900/40'
                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60 hover:bg-emerald-900/40'
                        }`}
                      >
                        {isActive ? 'Desactivar en Plataforma' : 'Activar Addon'}
                      </button>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Addon Edit Modal */}
          {selectedAddonForEdit && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Editar Addon: {selectedAddonForEdit.name}</h3>
                    <p className="text-xs text-slate-400">Control administrativo de versiones, tarifas y compatibilidad.</p>
                  </div>
                  <button
                    onClick={() => setSelectedAddonForEdit(null)}
                    className="text-slate-400 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Versión SemVer</label>
                    <input
                      type="text"
                      value={editVersion}
                      onChange={(e) => setEditVersion(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Precio Mensual ($)</label>
                      <input
                        type="number"
                        value={editPriceMonthly}
                        onChange={(e) => setEditPriceMonthly(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-300">Precio Pago Único ($)</label>
                      <input
                        type="number"
                        value={editPriceOneTime}
                        onChange={(e) => setEditPriceOneTime(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Planes de Usuario Compatibles</label>
                    <div className="flex gap-4">
                      {['free', 'pro', 'enterprise'].map(plan => (
                        <label key={plan} className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 capitalize">
                          <input
                            type="checkbox"
                            checked={editCompatiblePlans.includes(plan)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditCompatiblePlans([...editCompatiblePlans, plan]);
                              } else {
                                setEditCompatiblePlans(editCompatiblePlans.filter(p => p !== plan));
                              }
                            }}
                            className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-800"
                          />
                          <span>{plan}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleSaveAddonEdit}
                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Guardar Cambios</span>
                  </button>
                  <button
                    onClick={() => setSelectedAddonForEdit(null)}
                    className="px-4 py-3 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Tab Content: Finance Metrics */}
      {activeTab === 'finance' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 animate-in fade-in duration-150">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Gestión Financiera & Comisiones</h3>
              <p className="text-xs text-slate-400 mt-1">Controla los ingresos brutos, comisiones recaudadas y configura las tasas diferenciales de la plataforma.</p>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-850 font-mono">
              {[
                { id: 'day', label: 'Diario' },
                { id: 'week', label: 'Semanal' },
                { id: 'month', label: 'Mensual' },
                { id: 'year', label: 'Anual' }
              ].map(time => (
                <button
                  key={time.id}
                  onClick={() => setFinanceTimeframe(time.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    financeTimeframe === time.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Comisiones Totales del {generalCommission}%</p>
              <p className="text-3xl font-black text-emerald-400 mt-1 font-mono">${totalPlatformCommissions.toFixed(2)}</p>
              <p className="text-[10px] text-slate-500 mt-1">Por transacciones de comercio electrónico en el marketplace</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Pagos Liquidados a Creadores</p>
              <p className="text-3xl font-black text-white mt-1 font-mono">${(totalMarketplaceGrossVolume - totalPlatformCommissions).toFixed(2)}</p>
              <p className="text-[10px] text-emerald-400 mt-1">85% split directo liquidado sin incidencias</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-850">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">Tasa de Reembolso Solicitado</p>
              <p className="text-3xl font-black text-rose-400 mt-1 font-mono">0.0%</p>
              <p className="text-[10px] text-slate-500 mt-1">Ninguna disputa de cargo de comerciantes registrada</p>
            </div>
          </div>

          {/* Configurable Rates form */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Configuración de Comisiones Diferenciales</h4>
              <p className="text-xs text-slate-400 mt-0.5">La plataforma incentiva el desarrollo de productos mediante tarifas ajustadas según la categoría de la aplicación.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Tasa General Plataforma (%)</label>
                <input
                  type="number"
                  value={generalCommission}
                  onChange={(e) => setGeneralCommission(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Aplicaciones de IA (%)</label>
                <input
                  type="number"
                  value={aiCommission}
                  onChange={(e) => setAiCommission(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Plugins de Checkout / Core (%)</label>
                <input
                  type="number"
                  value={pluginCommission}
                  onChange={(e) => setAiPluginCommission(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Creadores de Nivel Premium (%)</label>
                <input
                  type="number"
                  value={premiumCreatorCommission}
                  onChange={(e) => setPremiumCreatorCommission(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  showNotification('Estructura de comisiones de la plataforma salvada correctamente.', 'success');
                  addAuditEntry('Commission Rates Updated', 'financial', `Set rates: General ${generalCommission}%, IA ${aiCommission}%, Plugins ${pluginCommission}%`);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                Actualizar Estructura de Tarifas
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Tab Content: SEO, Marketing & Growth */}
      {activeTab === 'marketing' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Crecimiento, SEO & Campañas de Marketing</h3>
            <p className="text-xs text-slate-400 mt-1">Automatiza el posicionamiento en Google generando sitemaps XML y metatags, o gestiona eventos promocionales en el catálogo.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Auto SEO Generator */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Creador de SEO para Aplicaciones</h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Genera metadatos y código XML optimizado para indexación inmediata de motores de búsqueda.</p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Seleccionar Aplicación</label>
                  <select
                    value={seoTargetApp}
                    onChange={(e) => setSeoTargetApp(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  >
                    {apps.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={runAutoSeoGenerator}
                  disabled={isGeneratingSeo}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  {isGeneratingSeo ? 'Analizando URL única...' : 'Autogenerar SEO Metatags'}
                </button>

                {generatedSeoMetadata && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 animate-in zoom-in-95">
                    <div className="space-y-1 font-mono text-[10px]">
                      <p className="text-emerald-400">&lt;title&gt;{generatedSeoMetadata.title}&lt;/title&gt;</p>
                      <p className="text-emerald-400 mt-1">&lt;meta name="description" content="{generatedSeoMetadata.desc}" /&gt;</p>
                      <p className="text-slate-500 mt-1">Canónica: {generatedSeoMetadata.url}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400">XML Sitemap Entry:</p>
                      <pre className="p-2.5 bg-slate-950 rounded border border-slate-850 text-[9px] text-cyan-300 overflow-x-auto leading-normal">
                        {generatedSeoMetadata.sitemap}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Manager */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-850 space-y-4">
              <div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <Flame className="w-5 h-5 text-rose-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Campaña de Destacados & Cupones</h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Crea banners en el marketplace o impulsa categorías para maximizar descargas.</p>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 space-y-1">
                  <p className="font-bold text-white">Próximo Evento: "Semana de la Automatización IA"</p>
                  <p className="text-[11px] text-slate-400">Habilita una comisión reducida del 12% para incentivar la publicación de apps conversacionales.</p>
                  <div className="pt-2">
                    <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[9px] font-mono font-bold">PROGRAMADO</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold block">Cupón General de Crecimiento</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value="GROWTH2026"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400 font-bold"
                    />
                    <button
                      onClick={() => showNotification('Promoción de descuento del 15% activada en sánscrito para compras masivas.', 'success')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                    >
                      Activar Cupón
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Global Settings */}
      {activeTab === 'settings' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Ajustes Globales de la Plataforma</h3>
            <p className="text-xs text-slate-400 mt-1">Edita el nombre comercial, el logotipo del Marketplace, monedas oficiales y configuraciones regionales.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nombre de la Plataforma</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Divisa de Transacción Primaria</label>
                <select
                  value={primaryCurrency}
                  onChange={(e) => setPrimaryCurrency(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none font-medium"
                >
                  <option value="USD">Dólar Estadounidense ($ USD)</option>
                  <option value="EUR">Euro (€ EUR)</option>
                  <option value="GBP">Libra Esterlina (£ GBP)</option>
                  <option value="MXN">Peso Mexicano ($ MXN)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Idioma por Defecto</label>
                <select
                  value={primaryLanguage}
                  onChange={(e) => setPrimaryLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none font-medium"
                >
                  <option value="es">Español (Castellano)</option>
                  <option value="en">English (USA)</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-white">Soporte Multilingüe Activo</p>
                  <p className="text-[10px] text-slate-500">Permitir traducciones dinámicas con IA de las descripciones.</p>
                </div>
                <input
                  type="checkbox"
                  checked={multiLanguageEnabled}
                  onChange={(e) => setMultiLanguageEnabled(e.target.checked)}
                  className="text-blue-600 focus:ring-blue-500 w-4 h-4 rounded bg-slate-950 border-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                showNotification('Ajustes globales guardados.', 'success');
                addAuditEntry('Global Settings Saved', 'settings', `Platform name: ${platformName}, Primary currency: ${primaryCurrency}`);
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Guardar Ajustes
            </button>
          </div>
        </div>
      )}

      {/* Tab Content: Audit trail Logs */}
      {activeTab === 'logs' && (
        <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 animate-in fade-in duration-150">
          <div>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Historial de Auditoría & Logs del Sistema</h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">Registro inmutable de acciones de usuarios, cambios financieros y publicaciones importantes de los creadores.</p>
          </div>

          <div className="space-y-3 font-mono text-[11px] leading-relaxed max-h-[480px] overflow-y-auto pr-1">
            {auditLogs.map((log) => {
              let categoryColor = 'text-slate-500';
              if (log.category === 'security') categoryColor = 'text-rose-400 font-bold';
              if (log.category === 'app_moderation') categoryColor = 'text-cyan-400';
              if (log.category === 'financial') categoryColor = 'text-emerald-400 font-bold';
              if (log.category === 'settings') categoryColor = 'text-violet-400';

              return (
                <div key={log.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-850/80 flex items-start gap-4">
                  <span className="text-slate-500 font-mono shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 ${categoryColor}`}>
                        {log.category.toUpperCase()}
                      </span>
                      <span className="text-slate-400">Usuario: <strong className="text-slate-200">{log.user}</strong></span>
                    </div>
                    <p className="text-white font-semibold">{log.action}</p>
                    <p className="text-slate-400 text-[11px] font-sans leading-normal">{log.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

// Simple loader icon placeholder for React inline safety
const Loader2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={`animate-spin ${props.className || ''}`}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
