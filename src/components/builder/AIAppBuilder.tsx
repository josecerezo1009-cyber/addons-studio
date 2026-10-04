import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp, EcommercePlatform, AppCategory, CodeFile, SecurityAuditResult } from '../../types';
import { 
  Sparkles, 
  Send, 
  Code2, 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Cpu, 
  RefreshCw, 
  Layers, 
  DollarSign, 
  Store, 
  Sliders, 
  ArrowRight,
  Terminal,
  FileCode,
  Copy,
  Check,
  Zap,
  Globe,
  MessageSquare,
  BarChart3,
  Bot,
  Play,
  ShoppingBag,
  Rocket
} from 'lucide-react';

export const AIAppBuilder: React.FC = () => {
  const { addApp, setCurrentView, showNotification, currentUser } = useApp();

  // Builder States
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [promptInput, setPromptInput] = useState('');
  const [targetPlatform, setTargetPlatform] = useState<EcommercePlatform>('shopify');
  const [targetCategory, setTargetCategory] = useState<AppCategory>('conversion');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generated App Specification
  const [generatedSpec, setGeneratedSpec] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'architecture' | 'code' | 'simulator' | 'security'>('architecture');
  const [selectedCodeFileIndex, setSelectedCodeFileIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState(false);

  // Simulator Interaction State
  const [simCartValue, setSimCartValue] = useState(120);
  const [simDiscount, setSimDiscount] = useState(10);
  const [simTriggerModal, setSimTriggerModal] = useState(false);

  const steps = [
    { num: 1, title: 'Describe tu idea', desc: 'Objetivo y modelo' },
    { num: 2, title: 'IA Analiza', desc: 'Estructura y flujos' },
    { num: 3, title: 'Genera aplicación', desc: 'Código y webhooks' },
    { num: 4, title: 'Personaliza', desc: 'Permisos y precios' },
    { num: 5, title: 'Prueba', desc: 'Sandbox en vivo' },
    { num: 6, title: 'Publica', desc: 'En Marketplace' },
  ];

  const handleGenerateApp = async (customPrompt?: string) => {
    const promptToUse = customPrompt || promptInput;
    if (!promptToUse.trim()) {
      showNotification('Por favor escribe la descripción de tu aplicación', 'info');
      return;
    }

    setIsGenerating(true);
    setCurrentStep(2);

    try {
      const response = await fetch('/api/ai/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          platform: targetPlatform,
          category: targetCategory,
          targetAudience: 'Comercios de comercio electrónico B2C y B2B',
          pricingModel: 'monthly'
        })
      });

      const data = await response.json();
      if (data.success && data.appSpec) {
        setGeneratedSpec(data.appSpec);
        setSimDiscount(data.appSpec.defaultSettings?.discountPercentage || 10);
        setCurrentStep(3);
        showNotification(`¡Aplicación "${data.appSpec.name}" generada exitosamente!`, 'success');
      } else {
        showNotification('No se pudo generar la aplicación. Reintentando...', 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('Error de conexión con el motor de IA.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublishToMarketplace = () => {
    if (!generatedSpec) return;

    const newApp: EcommerceApp = {
      id: `app_${Date.now()}`,
      name: generatedSpec.name,
      slug: generatedSpec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: generatedSpec.tagline,
      description: generatedSpec.description,
      icon: 'Sparkles',
      category: generatedSpec.category || targetCategory,
      platforms: generatedSpec.platforms || [targetPlatform, 'shopify', 'woocommerce'],
      pricingType: generatedSpec.pricingType || 'monthly',
      priceMonthly: generatedSpec.recommendedPriceMonthly || 29,
      priceOneTime: generatedSpec.recommendedPriceOneTime || 290,
      rating: 5.0,
      reviewsCount: 0,
      installsCount: 0,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      status: 'published',
      features: generatedSpec.features || [],
      codeFiles: generatedSpec.codeFiles || [],
      permissionsRequired: generatedSpec.permissionsRequired || ['read_products', 'write_products'],
      webhooks: generatedSpec.webhooks || ['checkouts/update', 'orders/paid'],
      defaultSettings: generatedSpec.defaultSettings || { enabled: true },
      securityAudit: generatedSpec.securityAudit,
      version: '1.0.0',
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addApp(newApp);
    setCurrentStep(6);
    showNotification(`¡"${newApp.name}" ha sido publicada en el Marketplace!`, 'success');
    setCurrentView('marketplace');
  };

  const copyCodeToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showNotification('Código copiado al portapapeles', 'info');
  };

  const quickTemplates = [
    { title: 'Recuperador de Carrito WhatsApp', prompt: 'Una aplicación que detecte cuando un usuario va a abandonar el carrito y le ofrezca un cupón con cuenta atrás y envíe recordatorio por WhatsApp' },
    { title: 'Upsell Inteligente Post-Pago', prompt: 'Motor de ofertas 1-click post-checkout que recomienda el accesorio más compatible con el producto comprado' },
    { title: 'Buscador Semántico & Visual', prompt: 'Buscador inteligente con autocompletado en 20ms y soporte para búsqueda por fotos' },
    { title: 'Auditor SEO Automático con IA', prompt: 'Herramienta que escanea las URLs y metadatos de productos y optimiza títulos y descripciones SEO automáticamente' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Entorno de Creación de Software con IA</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">AI App Builder</h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Describe tu idea en lenguaje natural. Nuestro motor de IA genera el código, define los esquemas de webhooks y empaqueta la extensión para Shopify, WooCommerce y PrestaShop.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('marketplace')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
            >
              Ver Marketplace
            </button>
          </div>
        </div>

        {/* 6-Step Visual Progress Bar */}
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`p-3 rounded-2xl border transition-all ${
                  currentStep === s.num
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-2xs font-bold'
                    : currentStep > s.num
                    ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900 font-semibold'
                    : 'border-slate-200 bg-slate-50/60 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentStep === s.num
                      ? 'bg-blue-600 text-white'
                      : currentStep > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {currentStep > s.num ? '✓' : s.num}
                  </span>
                  <span className="text-xs truncate">{s.title}</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Creation Workshop Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Prompt Generator & Generated Architecture */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Prompt Input Card */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">1. Describe tu Solución</h3>
                <p className="text-xs text-slate-500">Define la lógica comercial, reglas de activación o automatización deseada</p>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                rows={4}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Ejemplo: Una aplicación que detecte cuando un usuario va a abandonar el carrito y le ofrezca un cupón dinámico con cuenta atrás de 10 minutos y sincronización de inventario..."
                className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-all font-medium resize-none shadow-2xs leading-relaxed"
              />

              {/* Platform & Category Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Plataforma Principal</label>
                  <select
                    value={targetPlatform}
                    onChange={(e) => setTargetPlatform(e.target.value as EcommercePlatform)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="shopify">Shopify (Online Store 2.0 / Admin API)</option>
                    <option value="woocommerce">WooCommerce (REST API v3)</option>
                    <option value="prestashop">PrestaShop (Web Service API)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Categoría Comercial</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value as AppCategory)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="conversion">Ventas & Conversión</option>
                    <option value="marketing">SEO & Marketing</option>
                    <option value="support">Atención al Cliente</option>
                    <option value="operations">Inventario & Logística</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={() => handleGenerateApp()}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:scale-101"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Analizando Arquitectura & Generando Código...' : 'Generar Aplicación con IA'}</span>
              </button>
            </div>
          </div>

          {/* Generated Code & Architecture Workspace */}
          {generatedSpec && (
            <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{generatedSpec.name}</h3>
                  <p className="text-xs text-slate-500">{generatedSpec.tagline}</p>
                </div>

                {/* Sub-tabs */}
                <div className="flex items-center gap-1.5">
                  {(['architecture', 'code', 'simulator', 'security'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                        activeTab === tab
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab === 'architecture' ? 'Arquitectura' : tab === 'code' ? 'Código' : tab === 'simulator' ? 'Simulador' : 'Seguridad'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Architecture Tab */}
              {activeTab === 'architecture' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900">Descripción del Módulo</h4>
                    <p className="text-slate-600 leading-relaxed">{generatedSpec.description}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-700">Webhooks Suscritos</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(generatedSpec.webhooks || ['checkouts/update', 'orders/paid']).map((wh: string) => (
                          <span key={wh} className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700">
                            {wh}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-700">Permisos Requeridos</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(generatedSpec.permissionsRequired || ['read_products', 'write_products']).map((p: string) => (
                          <span key={p} className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 font-mono text-[10px] text-emerald-700 font-bold">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Code Tab */}
              {activeTab === 'code' && generatedSpec.codeFiles && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                      {generatedSpec.codeFiles.map((file: CodeFile, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedCodeFileIndex(idx)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                            selectedCodeFileIndex === idx
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {file.filename}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => copyCodeToClipboard(generatedSpec.codeFiles[selectedCodeFileIndex]?.content || '')}
                      className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copiar</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-80 leading-relaxed">
                    <pre>{generatedSpec.codeFiles[selectedCodeFileIndex]?.content || '// No code available'}</pre>
                  </div>
                </div>
              )}

              {/* Simulator Tab */}
              {activeTab === 'simulator' && (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs">Simulador de Tienda en Vivo</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Entorno Sandbox Activo
                    </span>
                  </div>

                  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 text-center">
                    <p className="text-xs text-slate-500">Valor de Carrito en Tienda: <strong>{simCartValue} €</strong></p>
                    
                    <button
                      onClick={() => setSimTriggerModal(true)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                    >
                      Probar Evento de Activación
                    </button>

                    {simTriggerModal && (
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium space-y-2 mt-3 animate-in fade-in">
                        <p className="font-bold">¡Descuento activado por {generatedSpec.name}!</p>
                        <p className="text-[11px] text-blue-700">Ahorras un {simDiscount}% con el cupón dinámico generado.</p>
                        <button
                          onClick={() => setSimTriggerModal(false)}
                          className="px-3 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold"
                        >
                          Cerrar Modal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Auditoría de Seguridad Automatizada</span>
                  </h4>
                  <ul className="space-y-1.5 text-slate-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Protección contra CSRF mediante firmas HMAC-SHA256: <strong>100% Verificado</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Cifrado de credenciales con AES-256-GCM en PostgreSQL: <strong>Cumple normativa</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Sin exposición de secretos en el cliente: <strong>Verificado</strong></span>
                    </li>
                  </ul>
                </div>
              )}

              {/* Action Button: Publish to Marketplace */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handlePublishToMarketplace}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Publicar en Marketplace Oficial</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Col: Quick Templates & Best Practices */}
        <div className="space-y-6">
          
          {/* Templates */}
          <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Plantillas Rápidas</h3>
            <p className="text-xs text-slate-500">Comienza con un caso de uso probado</p>

            <div className="space-y-2.5">
              {quickTemplates.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPromptInput(tmpl.prompt);
                    handleGenerateApp(tmpl.prompt);
                  }}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer space-y-1 group"
                >
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {tmpl.title}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {tmpl.prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue share callout */}
          <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-blue-900 font-bold">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span>85% de Comisión para Creadores</span>
            </div>
            <p className="text-blue-700 leading-relaxed text-[11px]">
              Al publicar tu aplicación en nuestro Marketplace, recibes el 85% neto de cada suscripción mensual cobrada a los comerciantes.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
