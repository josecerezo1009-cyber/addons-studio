import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp, AppPublicationStatus, AppInstallation, Transaction } from '../../types';
import { PublishChecklistModal } from './PublishChecklistModal';
import { VersionManagerModal } from './VersionManagerModal';
import { AICopilotModal } from './AICopilotModal';
import { AppManagementModal } from './AppManagementModal';
import { 
  Code2, 
  Sparkles, 
  DollarSign, 
  TrendingUp, 
  DownloadCloud, 
  Users, 
  Plus, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ExternalLink,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Edit3,
  Copy,
  Pause,
  Play,
  Archive,
  History,
  Bot,
  MessageSquare,
  FileText,
  Key,
  Star,
  Zap,
  ShoppingBag,
  Award,
  ArrowUpRight,
  SlidersHorizontal,
  Check,
  Building
} from 'lucide-react';

export const CreatorStudioView: React.FC = () => {
  const { 
    apps, 
    currentUser, 
    updateApp,
    updateAppStatus, 
    duplicateApp,
    archiveApp,
    pauseAppSales,
    setCurrentView, 
    setSelectedAppForDetail,
    requestPayout,
    transactions,
    installations,
    licenses,
    reviews,
    showNotification
  } = useApp();

  // Navigation tab inside Creator Studio
  const [activeTab, setActiveTab] = useState<'dashboard' | 'apps' | 'sales' | 'finances' | 'copilot' | 'support'>('dashboard');
  
  // Active App selection for modals
  const [activeModalApp, setActiveModalApp] = useState<EcommerceApp | null>(null);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isCopilotModalOpen, setIsCopilotModalOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  // Payout Form State
  const [payoutAmount, setPayoutAmount] = useState<number>(1200);
  const [payoutMethod, setPayoutMethod] = useState('Stripe Express (IBAN ES***8921)');
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);

  // Filter apps belonging to current creator or default creator
  const myApps = apps.filter(a => a.creatorId === currentUser.id || a.creatorId === 'usr_creator_01');
  const activeApps = myApps.filter(a => a.status === 'published');
  const devApps = myApps.filter(a => a.status === 'draft' || a.status === 'ai_validation' || a.status === 'security_review');
  
  // Aggregate Metrics
  const totalInstalls = myApps.reduce((acc, a) => acc + a.installsCount, 0);
  const totalSubscribers = Math.floor(totalInstalls * 0.76);
  const totalGrossRevenue = transactions.filter(t => t.creatorId === 'usr_creator_01' || t.creatorId === currentUser.id).reduce((acc, t) => acc + t.amount, 0);
  const totalNetEarnings = totalGrossRevenue > 0 ? totalGrossRevenue * 0.85 : 14850.50;
  const avgRating = myApps.length > 0 
    ? (myApps.reduce((acc, a) => acc + a.rating, 0) / myApps.length).toFixed(1) 
    : '5.0';

  // Recent Sales & Activity Feed
  const recentSales = transactions.slice(0, 5);

  const handlePayoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payoutAmount <= 0) {
      showNotification('Introduce una cantidad válida para retirar', 'error');
      return;
    }
    setIsProcessingPayout(true);
    try {
      const success = await requestPayout(payoutAmount, payoutMethod);
      if (success) {
        showNotification(`Transferencia de $${payoutAmount} iniciada a ${payoutMethod}`, 'success');
      }
    } finally {
      setIsProcessingPayout(false);
    }
  };

  const getStatusBadge = (status: AppPublicationStatus) => {
    switch (status) {
      case 'published':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">Publicada</span>;
      case 'draft':
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold">Borrador</span>;
      case 'ai_validation':
      case 'security_review':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[10px] font-bold">En Revisión IA</span>;
      case 'suspended':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">Pausada</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-in fade-in">
      
      {/* Top Header & Level Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              <span>Creator Center Profesional</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono">
              Comisión Neta: 85% Creador / 15% Plataforma
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Panel de Negocio y Ciclo de Vida de Software
          </h1>
          <p className="text-xs text-slate-400">
            Gestiona desde la idea inicial con IA hasta el despliegue, ventas recurrentes y liquidaciones bancarias.
          </p>
        </div>

        <button
          onClick={() => setCurrentView('builder')}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all shrink-0 hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Crear Nueva App con IA</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Resumen del Negocio</span>
        </button>

        <button
          onClick={() => setActiveTab('apps')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'apps'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Mis Aplicaciones ({myApps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'sales'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Ventas & Clientes ({installations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'finances'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Finanzas & Stripe Payouts</span>
        </button>

        <button
          onClick={() => setActiveTab('copilot')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'copilot'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Bot className="w-4 h-4 text-cyan-400" />
          <span>Asistente IA Copilot</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'support'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Soporte & Consultas</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          
          {/* 6 Core Business KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Apps Publicadas</span>
              <p className="text-2xl font-black text-white">{activeApps.length}</p>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> 100% Online
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">En Desarrollo</span>
              <p className="text-2xl font-black text-blue-400">{devApps.length}</p>
              <span className="text-[11px] text-slate-400">Borradores & Tests</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Tiendas Activas</span>
              <p className="text-2xl font-black text-cyan-400">{totalInstalls.toLocaleString()}</p>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3" /> +14% este mes
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Suscriptores MRR</span>
              <p className="text-2xl font-black text-indigo-300">{totalSubscribers.toLocaleString()}</p>
              <span className="text-[11px] text-slate-400">Retención 94%</span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Ingresos Netos (85%)</span>
              <p className="text-2xl font-black text-emerald-400">${totalNetEarnings.toLocaleString()}</p>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <DollarSign className="w-3 h-3" /> Saldo disponible
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-1 shadow-lg">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Valoración Media</span>
              <p className="text-2xl font-black text-amber-400 flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-400" />
                <span>{avgRating}</span>
              </p>
              <span className="text-[11px] text-slate-400">({reviews.length} reseñas)</span>
            </div>

          </div>

          {/* AI Growth Recommendations & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* AI Actionable Recommendations */}
            <div className="lg:col-span-2 p-6 rounded-3xl border border-blue-500/20 bg-slate-900/60 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Recomendaciones Estratégicas de la IA
                  </h3>
                </div>
                <span className="text-xs text-cyan-400 font-mono">Analizado en tiempo real</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Optimización de Pricing en CartRecover AI Pro</span>
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      El 68% de tus usuarios superan los 1.000€ recuperados. Crear un plan Pro de $49/mes generaría un +24% de MRR inmediato sin fricción de churn.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('copilot');
                      showNotification('Cargando optimizador de precios...', 'info');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 shadow-sm"
                  >
                    Ver Análisis
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-blue-400" />
                      <span>Soporte para Checkout Extensibility 2025</span>
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Shopify está migrando todas las tiendas Plus a extensiones de checkout. Añadir el bloque nativo garantizará el sello "Shopify Certified 2025".
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (myApps[0]) {
                        setActiveModalApp(myApps[0]);
                        setIsVersionModalOpen(true);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shrink-0"
                  >
                    Crear Versión
                  </button>
                </div>
              </div>
            </div>

            {/* Live Activity Stream */}
            <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Actividad en Vivo</span>
              </h3>

              <div className="space-y-3">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        +$
                      </div>
                      <div>
                        <p className="font-semibold text-white truncate max-w-[120px]">{sale.appName || 'Aplicación'}</p>
                        <p className="text-[10px] text-slate-400">{sale.storeName || 'Tienda verificada'}</p>
                      </div>
                    </div>
                    <span className="font-bold text-emerald-400 font-mono">+${sale.netAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: MY APPS & LIFECYCLE */}
      {activeTab === 'apps' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Catálogo de Aplicaciones del Creador</h2>
            <button
              onClick={() => setCurrentView('builder')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Aplicación</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {myApps.map((app) => (
              <div
                key={app.id}
                className="p-6 rounded-3xl border border-slate-800 bg-slate-900/70 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold text-2xl shrink-0 shadow-md">
                    <Sparkles className="w-8 h-8" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white">{app.name}</h3>
                      {getStatusBadge(app.status)}
                      <span className="text-[10px] font-mono text-cyan-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        v{app.version}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 max-w-xl">{app.tagline}</p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Precio: <strong className="text-white">${app.priceMonthly}/mes</strong></span>
                      <span>•</span>
                      <span>Instalaciones: <strong className="text-white">{app.installsCount.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{app.rating}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  
                  {/* Edit in Studio */}
                  <button
                    onClick={() => {
                      setActiveModalApp(app);
                      setIsManagementOpen(true);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Configurar y Gestionar Aplicación"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={() => duplicateApp(app.id)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Duplicar Aplicación"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  {/* Version Manager */}
                  <button
                    onClick={() => {
                      setActiveModalApp(app);
                      setIsVersionModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                    title="Desplegar nueva versión"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Versiones</span>
                  </button>

                  {/* Pause / Resume */}
                  <button
                    onClick={() => pauseAppSales(app.id)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title={app.status === 'published' ? 'Pausar ventas' : 'Reanudar ventas'}
                  >
                    {app.status === 'published' ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  </button>

                  {/* Archivar */}
                  <button
                    onClick={() => {
                      if (confirm(`¿Estás seguro de que quieres archivar la aplicación "${app.name}"?`)) {
                        archiveApp(app.id);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Archivar Aplicación"
                  >
                    <Archive className="w-4 h-4" />
                  </button>

                  {/* Publish Checklist or View Details */}
                  {app.status !== 'published' ? (
                    <button
                      onClick={() => {
                        setActiveModalApp(app);
                        setIsChecklistOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Publicar</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedAppForDetail(app)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                    >
                      <span>Ver Ficha</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SALES & CUSTOMER LICENSES */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Compradores y Licencias Emitidas</h3>
              <span className="text-xs text-slate-400 font-mono">
                {licenses.length} licencias activas verificadas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                    <th className="pb-3">Aplicación</th>
                    <th className="pb-3">Tienda Compradora</th>
                    <th className="pb-3">Licencia Clave</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3">Emisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {licenses.map((lic) => (
                    <tr key={lic.id} className="text-slate-300">
                      <td className="py-3.5 font-bold text-white">{lic.appName}</td>
                      <td className="py-3.5 font-mono text-[11px] text-slate-400">{lic.storeUrl}</td>
                      <td className="py-3.5 font-mono text-cyan-400">{lic.licenseKey}</td>
                      <td className="py-3.5 capitalize font-semibold">{lic.plan === 'monthly' ? '$29/mes (Recurrente)' : 'Pago Único'}</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                          ACTIVA
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-400">{new Date(lic.issuedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCES & STRIPE PAYOUTS */}
      {activeTab === 'finances' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Payout Request Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6 shadow-xl">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Disponible para Retiro</span>
              <p className="text-3xl font-black text-white mt-1">${totalNetEarnings.toLocaleString()}</p>
              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">85% neto garantizado por contrato</p>
            </div>

            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Cantidad a Retirar ($USD)</label>
                <input
                  type="number"
                  min={50}
                  max={totalNetEarnings}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Destino de Transferencia</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Stripe Express (IBAN ES***8921)">Stripe Express (IBAN ES***8921)</option>
                  <option value="Transferencia Bancaria SEPA">Transferencia Bancaria SEPA Directa</option>
                  <option value="Cuenta PayPal Empresas">PayPal Empresas</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isProcessingPayout}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {isProcessingPayout ? <RefreshCw className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                <span>Solicitar Transferencia Inmediata</span>
              </button>
            </form>
          </div>

          {/* Transactions Ledger */}
          <div className="lg:col-span-2 p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white">Historial de Ventas y Liquidaciones</h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {transactions.map((t) => (
                <div key={t.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{t.appName || 'Venta de Aplicación'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{t.storeName || 'Tienda Compradora'} • {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-emerald-400 font-mono">+${t.netAmount.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500">Bruto: ${t.amount} (Comisión 15%: -${t.platformFee.toFixed(2)})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: AI COPILOT LAUNCHPAD */}
      {activeTab === 'copilot' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-blue-500/20 bg-slate-900/60 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Copiloto Inteligente para Creadores</h3>
              <p className="text-xs text-slate-400">
                Selecciona una de tus aplicaciones para abrir el motor de optimización comercial y generación de marketing.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myApps.map((app) => (
              <div
                key={app.id}
                onClick={() => {
                  setActiveModalApp(app);
                  setIsCopilotModalOpen(true);
                }}
                className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-blue-500/40 cursor-pointer transition-all flex items-center justify-between group shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <Bot className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{app.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">v{app.version} • {app.installsCount} tiendas</p>
                  </div>
                </div>

                <span className="px-3.5 py-1.5 rounded-xl bg-slate-800 group-hover:bg-blue-600 text-slate-200 group-hover:text-white text-xs font-semibold flex items-center gap-1 transition-all">
                  <span>Abrir Copiloto</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SUPPORT HUB */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
            <h3 className="text-base font-bold text-white">Centro de Soporte a Comerciantes</h3>
            <p className="text-xs text-slate-400">
              Responde a preguntas técnicas de comerciantes que han instalado tus aplicaciones.
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">¿Cómo integrar el webhook con Shopify Flow?</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">RESUELTO</span>
                </div>
                <p className="text-xs text-slate-400">
                  Respuesta oficial registrada: "La app emite automáticamente el evento `cart_recover/order_salvaged` con el payload de Shopify."
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isChecklistOpen && activeModalApp && (
        <PublishChecklistModal
          app={activeModalApp}
          onClose={() => setIsChecklistOpen(false)}
          onPublishSuccess={() => showNotification('Aplicación publicada en el Marketplace', 'success')}
        />
      )}

      {isVersionModalOpen && activeModalApp && (
        <VersionManagerModal
          app={activeModalApp}
          onClose={() => setIsVersionModalOpen(false)}
        />
      )}

      {isCopilotModalOpen && activeModalApp && (
        <AICopilotModal
          app={activeModalApp}
          onClose={() => setIsCopilotModalOpen(false)}
        />
      )}

      {isManagementOpen && activeModalApp && (
        <AppManagementModal
          app={activeModalApp}
          onClose={() => setIsManagementOpen(false)}
        />
      )}

    </div>
  );
};
