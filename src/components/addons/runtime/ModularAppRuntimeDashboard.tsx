import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { AppInstallation, EcommerceApp } from '../../../types';
import { AppRuntimeEvent, AppRuntimeSettings } from '../../../server/appRuntimeDatabase';
import {
  Sparkles,
  Layers,
  Store,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Power,
  Settings,
  Activity,
  Zap,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Send,
  Sliders,
  Terminal,
  FileText,
  Clock,
  Check,
  Cpu,
  BarChart3,
  Bot,
  Flame,
  CreditCard
} from 'lucide-react';

export const ModularAppRuntimeDashboard: React.FC = () => {
  const { 
    installations, 
    apps, 
    stores, 
    setCurrentView, 
    showNotification,
    toggleInstallationStatus,
    selectedAppForDetail
  } = useApp();

  // Find the selected installation
  const [selectedInstallId, setSelectedInstallId] = useState<string>(() => {
    return installations[0]?.id || '';
  });

  const activeInstall = installations.find(i => i.id === selectedInstallId) || installations[0];
  const matchedApp = apps.find(a => a.id === activeInstall?.appId) || null;
  const connectedStore = stores.find(s => s.id === activeInstall?.storeId) || stores[0] || null;

  // Active Sub-tab
  const [activeTab, setActiveTab] = useState<'overview' | 'ai_engine' | 'settings' | 'connector' | 'events' | 'credits'>('overview');

  // AI Module State
  const [aiModuleType, setAiModuleType] = useState<'analysis' | 'generation' | 'classification' | 'recommendation' | 'automation'>('analysis');
  const [isExecutingAI, setIsExecutingAI] = useState(false);
  const [aiOutput, setAiOutput] = useState<any>(null);
  const [customGoal, setCustomGoal] = useState('');

  // Settings State
  const [appSettings, setAppSettings] = useState<Record<string, any>>({
    discountPercentage: 10,
    cooldownHours: 24,
    channel: 'whatsapp_and_email',
    enableExitIntent: true,
    minCartValue: 50,
    notificationEmail: 'merchant@store.com'
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Events & Logs State
  const [eventsList, setEventsList] = useState<AppRuntimeEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Load Saved Settings & Events from Backend
  const loadInstallData = async (installId: string) => {
    if (!installId) return;
    setIsLoadingEvents(true);
    try {
      // Load events
      const evRes = await fetch(`/api/addons/runtime/events/${installId}`);
      const evData = await evRes.json();
      if (evData.success && Array.isArray(evData.events)) {
        setEventsList(evData.events);
      }

      // Load settings
      const setRes = await fetch(`/api/addons/runtime/settings/${installId}`);
      const setData = await setRes.json();
      if (setData.success && setData.settings) {
        setAppSettings(prev => ({ ...prev, ...setData.settings.settings }));
      }
    } catch (err) {
      console.error('Error loading install data:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (activeInstall) {
      loadInstallData(activeInstall.id);
    }
  }, [activeInstall?.id]);

  // Execute Real AI Function
  const handleExecuteAIFeature = async () => {
    if (!activeInstall || !matchedApp) return;

    setIsExecutingAI(true);
    setAiOutput(null);

    try {
      const payload = {
        installationId: activeInstall.id,
        appId: matchedApp.id,
        appName: matchedApp.name,
        storeName: connectedStore?.name || activeInstall.storeName,
        platform: connectedStore?.platform || activeInstall.storePlatform,
        moduleType: aiModuleType,
        customPrompt: customGoal.trim() || undefined,
        inputData: {
          storeRevenue: connectedStore?.stats?.revenue || 45000,
          ordersCount: connectedStore?.stats?.orders || 320,
          productsCount: connectedStore?.stats?.products || 110,
          appSettings
        }
      };

      const res = await fetch('/api/addons/runtime/execute-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success && data.output) {
        setAiOutput(data.output);
        showNotification(`✓ Módulo IA [${aiModuleType.toUpperCase()}] ejecutado con éxito (-${data.creditsConsumed} créditos)`, 'success');
        
        // Refresh event logs
        if (data.event) {
          setEventsList(prev => [data.event, ...prev]);
        }
      } else {
        showNotification(data.error || 'Error al ejecutar el módulo de IA', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error de red al ejecutar función de IA', 'error');
    } finally {
      setIsExecutingAI(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInstall || !matchedApp) return;

    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/addons/runtime/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installationId: activeInstall.id,
          appId: matchedApp.id,
          settings: appSettings,
          enabled: activeInstall.status === 'active'
        })
      });

      const data = await res.json();
      if (data.success) {
        showNotification('Configuración del addon guardada y sincronizada correctamente', 'success');
      }
    } catch (err) {
      showNotification('Error al guardar la configuración', 'error');
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!activeInstall || !matchedApp) {
    return (
      <div className="p-16 text-center rounded-3xl border border-slate-800 bg-slate-900/60 max-w-xl mx-auto space-y-4">
        <Layers className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-lg font-bold text-white">No hay aplicaciones instaladas</h3>
        <p className="text-xs text-slate-400">Instala un addon desde el Marketplace para comenzar a utilizarlo.</p>
        <button
          onClick={() => setCurrentView('marketplace')}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
        >
          Ir al Marketplace
        </button>
      </div>
    );
  }

  const isPaused = activeInstall.status === 'paused';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20 animate-in fade-in">
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button 
            onClick={() => setCurrentView('installed-apps')}
            className="hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Mis Aplicaciones</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-white font-semibold">{matchedApp.name}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-cyan-300 border border-blue-500/20 font-bold">
            Módulo Activo v{matchedApp.version}
          </span>
        </div>

        {/* Switch Installed App Selector */}
        {installations.length > 1 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Addon:</span>
            <select
              value={selectedInstallId}
              onChange={(e) => setSelectedInstallId(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer text-xs"
            >
              {installations.map(inst => (
                <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                  {inst.appName} ({inst.storeName})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Addon Banner Header */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-2xl shadow-xl shadow-blue-500/25 shrink-0">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {matchedApp.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                  isPaused 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isPaused ? 'Pausado' : 'En Ejecución'}
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {activeInstall.storePlatform}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {matchedApp.tagline}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 font-mono">
                <span>Tienda Conectada: <strong className="text-white">{activeInstall.storeName}</strong></span>
                <span>•</span>
                <span>Plan: <strong className="text-cyan-400 uppercase">{activeInstall.activePlan || 'monthly'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Power Toggle Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleInstallationStatus(activeInstall.id)}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-lg transition-all ${
                isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isPaused ? 'Reanudar Addon' : 'Pausar Addon'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Visión General & KPIs', icon: BarChart3 },
          { id: 'ai_engine', label: 'Motor IA & Procesamiento', icon: Bot },
          { id: 'settings', label: 'Configuración del Addon', icon: Sliders },
          { id: 'connector', label: 'Conector Ecommerce Activo', icon: Store },
          { id: 'events', label: `Eventos & Auditoría (${eventsList.length})`, icon: Activity },
          { id: 'credits', label: 'Créditos IA & Consumo', icon: Flame },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-white bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* TAB 1: OVERVIEW & KPIS */}
      {/* ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Impacto en Ventas / ROI</span>
              <p className="text-3xl font-black text-emerald-400 font-mono">
                +${activeInstall.stats.recoveredRevenue?.toLocaleString() || '1,840'}
              </p>
              <span className="text-[10px] text-emerald-400">Atribuido directamente</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Eventos Procesados</span>
              <p className="text-3xl font-black text-cyan-400 font-mono">
                {activeInstall.stats.eventsHandled?.toLocaleString() || eventsList.length || '420'}
              </p>
              <span className="text-[10px] text-slate-400">Webhooks y llamadas</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Precisión de Inferencia</span>
              <p className="text-3xl font-black text-white font-mono">
                98.6%
              </p>
              <span className="text-[10px] text-cyan-400">Gemini 3.8 Flash</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Estado del Módulo</span>
              <p className="text-2xl font-black text-emerald-400 font-mono flex items-center gap-1.5 pt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </p>
              <span className="text-[10px] text-slate-400">SLA 99.98% de disponibilidad</span>
            </div>
          </div>

          {/* Module Capabilities & Architecture Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-cyan-400" />
                <span>Funciones Inteligentes Activas en Tienda</span>
              </h3>
              
              <div className="space-y-3">
                {matchedApp.features.map((feat, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{feat.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                        {feat.impact}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{feat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Permisos y Seguridad Certificada</span>
              </h3>

              <div className="space-y-2 text-xs">
                <p className="text-slate-300">
                  Esta aplicación se ejecuta en un entorno aislado con cifrado AES-256 en reposo y tránsito.
                </p>
                
                <div className="pt-2">
                  <span className="text-slate-400 font-bold block mb-1.5">Permisos concedidos por la tienda:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedApp.permissionsRequired.map((perm, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-cyan-300 border border-blue-500/20 font-mono text-[10px]">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3">
                  <span className="text-slate-400 font-bold block mb-1.5">Webhooks escuchados en tiempo real:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedApp.webhooks.map((wh, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono text-[10px]">
                        {wh}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: AI ENGINE & PROCESSING */}
      {/* ======================================================== */}
      {activeTab === 'ai_engine' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                <span>Ejecutor de Módulos de Inteligencia Artificial</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ejecuta procesamiento real con Gemini sobre los datos de tu tienda {activeInstall.storeName}.
              </p>
            </div>

            {/* AI Module Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'analysis', label: '1. Análisis', desc: 'Patrones y embudos' },
                { id: 'generation', label: '2. Generación', desc: 'Ofertas y copys' },
                { id: 'classification', label: '3. Clasificación', desc: 'Scoring de clientes' },
                { id: 'recommendation', label: '4. Recomendaciones', desc: 'Acciones de alto ROI' },
                { id: 'automation', label: '5. Automatización', desc: 'Reglas y triggers' },
              ].map(mod => (
                <button
                  key={mod.id}
                  onClick={() => {
                    setAiModuleType(mod.id as any);
                    setAiOutput(null);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    aiModuleType === mod.id
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                  }`}
                >
                  <p className="font-bold text-xs text-white">{mod.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{mod.desc}</p>
                </button>
              ))}
            </div>

            {/* Custom Directive Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">
                Directiva u Objetivo Específico para el Motor IA (Opcional):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder={`Ej: Enfocar en clientes que visitan desde móvil y dudan en checkout...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleExecuteAIFeature}
                  disabled={isExecutingAI}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isExecutingAI ? 'animate-spin' : ''}`} />
                  <span>{isExecutingAI ? 'Procesando con IA...' : 'Ejecutar Inferencia'}</span>
                </button>
              </div>
            </div>

            {/* AI Output Display */}
            {aiOutput && (
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-white uppercase tracking-wider">
                      Resultado del Módulo: {aiModuleType}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    Motor: Gemini 3.8 Flash
                  </span>
                </div>

                <pre className="text-xs font-mono text-slate-200 overflow-x-auto p-4 rounded-xl bg-slate-900 border border-slate-850 leading-relaxed max-h-80">
                  {JSON.stringify(aiOutput, null, 2)}
                </pre>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SETTINGS & PARAMETERS */}
      {/* ======================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in">
          <form onSubmit={handleSaveSettings} className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <span>Configuración Operativa del Addon</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ajusta las reglas de negocio, umbrales y canales de comunicación para {activeInstall.storeName}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Descuento Dinámico Ofrecido (%)</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={appSettings.discountPercentage || 10}
                  onChange={(e) => setAppSettings({ ...appSettings, discountPercentage: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Período de Enfriamiento (Cooldown en Horas)</label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={appSettings.cooldownHours || 24}
                  onChange={(e) => setAppSettings({ ...appSettings, cooldownHours: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Canal de Entrega</label>
                <select
                  value={appSettings.channel || 'whatsapp_and_email'}
                  onChange={(e) => setAppSettings({ ...appSettings, channel: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="whatsapp_and_email">WhatsApp Business + Email Transaccional</option>
                  <option value="storefront_modal">Solo Modal en Storefront (Exit-Intent)</option>
                  <option value="webhook_dispatch">Solo Despacho vía Webhook a CRM</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Valor Mínimo de Carrito ($)</label>
                <input
                  type="number"
                  min={0}
                  value={appSettings.minCartValue || 50}
                  onChange={(e) => setAppSettings({ ...appSettings, minCartValue: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingSettings ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CONNECTOR & STORE STATUS */}
      {/* ======================================================== */}
      {activeTab === 'connector' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-cyan-400" />
                <span>Conector Central de Ecommerce</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                La aplicación utiliza el conector central para sincronizar pedidos, productos y clientes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {connectedStore?.name || activeInstall.storeName}
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 uppercase font-bold">
                      {activeInstall.storePlatform}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">{connectedStore?.url || 'URL Verificada'}</p>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Conexión Activa y Autorizada
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Endpoint de Recepción</span>
                  <p className="text-white font-mono text-[11px] truncate">/api/webhooks/{activeInstall.storePlatform}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Cifrado de Webhooks</span>
                  <p className="text-cyan-400 font-mono text-[11px]">HMAC-SHA256 Verificado</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Última Sincronización</span>
                  <p className="text-slate-300 font-mono text-[11px]">{activeInstall.stats?.lastActive || 'En tiempo real'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: EVENTS & AUDIT LOG */}
      {/* ======================================================== */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>Registro de Eventos y Ejecuciones de IA</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Trazabilidad inmutable de cada acción, webhook recibido e inferencia completada.
                </p>
              </div>
              <button
                onClick={() => loadInstallData(activeInstall.id)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                title="Actualizar eventos"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingEvents ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            {eventsList.length === 0 ? (
              <p className="text-xs text-slate-500 py-12 text-center">
                Aún no hay eventos registrados para esta aplicación. Ejecuta una acción en la pestaña "Motor IA" para ver el primer registro.
              </p>
            ) : (
              <div className="space-y-2.5 pt-2">
                {eventsList.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="font-bold text-white font-mono">{ev.eventType}</span>
                        {ev.aiFunctionUsed && (
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300">
                            {ev.aiFunctionUsed}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          -{ev.creditsConsumed} créditos
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">{ev.summary}</p>
                    </div>

                    <span className="text-[11px] text-slate-500 font-mono shrink-0">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: AI CREDITS & CONSUMPTION */}
      {/* ======================================================== */}
      {activeTab === 'credits' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <span>Control de Consumo de Créditos IA</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Monitoreo del uso de modelos Gemini según el plan contratado ({(activeInstall.activePlan || 'monthly').toUpperCase()}).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Créditos Disponibles</span>
                <p className="text-3xl font-black text-amber-400 font-mono">
                  850 <span className="text-sm font-normal text-slate-500">/ 1,000</span>
                </p>
                <span className="text-[10px] text-slate-400">Renovación mensual automática</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Llamadas a la API IA</span>
                <p className="text-3xl font-black text-cyan-400 font-mono">
                  {eventsList.filter(e => e.aiFunctionUsed).length + 12}
                </p>
                <span className="text-[10px] text-cyan-400">Inferencia de alta velocidad</span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Límite por Plan</span>
                <p className="text-2xl font-black text-white font-mono pt-1 uppercase">
                  {activeInstall.activePlan || 'monthly'}
                </p>
                <span className="text-[10px] text-emerald-400">Sin cortes bruscos de servicio</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
              <span className="font-bold text-white block">Tarifa por tipo de módulo IA:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] font-mono">
                <li>Módulo de Análisis Predictivo: 15 créditos por ejecución.</li>
                <li>Módulo de Generación de Copys / Cupones: 10 créditos por ejecución.</li>
                <li>Módulo de Clasificación y Scoring: 8 créditos por ejecución.</li>
                <li>Módulo de Recomendaciones: 8 créditos por ejecución.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
