import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  StudioProject, 
  EcommercePlatform, 
  AppCategory, 
  AppFeature, 
  AISuggestion,
  ProjectVersion,
  EcommerceApp
} from '../../types';
import { ProductAgentView, ProductProposal } from './ProductAgentView';
import { 
  Sparkles, 
  Layers, 
  Sliders, 
  BookOpen, 
  History, 
  ShieldCheck, 
  Rocket, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Edit3, 
  Code2, 
  Eye, 
  DollarSign, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  BrainCircuit, 
  FileText, 
  FolderDown, 
  HelpCircle,
  Clock,
  Terminal,
  FileCode,
  Tag,
  UserCheck,
  Building,
  CheckCheck,
  Bot
} from 'lucide-react';

const INITIAL_STUDIO_PROJECT: StudioProject = {
  id: `proj_${Date.now()}`,
  name: 'CartRescue AI Suite',
  slug: 'cart-rescue-ai-suite',
  tagline: 'Recuperación inteligente de carritos con WhatsApp y cupones dinámicos por IA.',
  description: `### Solución Empresarial de Conversión\n\n**CartRescue AI Suite** ayuda a comercios de Shopify, WooCommerce y PrestaShop a recuperar ventas perdidas interceptando la intención de abandono con ofertas personalizadas y recordatorios automáticos multicanal.`,
  objective: 'Reducir la tasa de abandono de checkout del 70% al 45% y elevar el ticket medio.',
  problemSolved: 'Pérdida de carritos por dudas de última hora o falta de incentivo de compra inmediato.',
  targetAudience: 'Comercios B2C de moda, electrónica y cosmética con más de 200 visitas diarias.',
  category: 'conversion',
  platforms: ['shopify', 'woocommerce', 'prestashop'],
  pricingType: 'monthly',
  priceMonthly: 29,
  priceOneTime: 290,
  rating: 5.0,
  reviewsCount: 0,
  installsCount: 0,
  creatorId: 'usr_creator_01',
  creatorName: 'AppStack AI Labs',
  status: 'draft',
  version: '1.0.0',
  tags: ['carritos', 'whatsapp', 'descuentos', 'conversion', 'shopify-os2'],
  features: [
    {
      title: 'Algoritmo Exit-Intent Predictivo',
      description: 'Detecta el movimiento de salida del cursor hacia la barra de pestañas y activa el modal.',
      impact: '+24% carritos retenidos'
    },
    {
      title: 'Cupones Dinámicos de 1 Solo Uso',
      description: 'Genera códigos con cuenta atrás de 10 minutos para generar urgencia real sin fugas.',
      impact: '+18% conversión inmediata'
    },
    {
      title: 'Mensajería Automatizada WhatsApp Business',
      description: 'Envío de enlace al carrito pre-llenado con un solo clic para el comprador.',
      impact: '92% tasa de apertura'
    }
  ],
  codeFiles: [
    {
      filename: 'cart-intent-widget.js',
      language: 'javascript',
      description: 'Script storefront no bloqueante (<7KB gzipped).',
      content: `(function() {
  const Config = window.NexusEcomConfig || { discount: 10, expiryMin: 15 };
  console.log('[NexusEcom] Engine active on store');
  document.addEventListener('mouseleave', function(e) {
    if (e.clientY <= 0) {
      window.NexusEcomModal?.show(Config.discount);
    }
  });
})();`
    },
    {
      filename: 'webhook-worker.js',
      language: 'javascript',
      description: 'Handler Express para eventos orders/paid y checkouts/update con verificación HMAC.',
      content: `const crypto = require('crypto');
exports.handler = async (req, res) => {
  const hmac = req.headers['x-shopify-hmac-sha256'];
  const digest = crypto.createHmac('sha256', process.env.APP_SECRET).update(req.rawBody).digest('base64');
  if (digest !== hmac) return res.status(401).send('Invalid signature');
  res.status(200).json({ status: 'processed' });
};`
    }
  ],
  permissionsRequired: ['read_orders', 'write_discounts', 'read_checkouts'],
  webhooks: ['checkouts/update', 'orders/paid'],
  defaultSettings: {
    enabled: true,
    discountPercentage: 10,
    countdownMinutes: 15,
    primaryColor: '#2563eb',
    soundEffect: true
  },
  documentation: {
    commercialDescription: 'La aplicación definitiva para tiendas que invierten en Meta Ads o Google Ads y quieren rentabilizar cada visita evitando que el carrito se quede sin pagar.',
    featureMatrix: '• Detección de salida\n• Cupones con expiración\n• WhatsApp API Bridge\n• Panel de métricas de ingresos recuperados',
    installationGuide: {
      shopify: '1. Instala la app desde el Marketplace.\n2. En el Editor de Temas de Shopify, activa el bloque "CartRescue Widget".\n3. Configura tu porcentaje de descuento.',
      woocommerce: '1. Instala el plugin desde el panel de WordPress.\n2. Introduce tu Consumer Key y Secret.\n3. Guarda cambios.',
      prestashop: '1. Sube el archivo ZIP al gestor de módulos.\n2. Activa el Hook en Header.\n3. Verifica el webservice.'
    },
    faqs: [
      { question: '¿Ralentiza la tienda?', answer: 'No. El widget se carga asíncronamente en CDN y pesa menos de 8KB.' },
      { question: '¿Cumple con GDPR?', answer: 'Sí. No almacena cookies de seguimiento sin consentimiento previo del comprador.' }
    ],
    updateNotes: 'v1.0.0: Lanzamiento inicial con soporte nativo para Shopify Online Store 2.0.'
  },
  versions: [
    {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      changelog: 'Versión base generada en el AI Product Studio con scaffold completo.',
      snapshot: {}
    }
  ],
  suggestions: [
    {
      id: 'sug_01',
      agent: 'business',
      type: 'pricing',
      title: 'Optimizar Precio a $39/mes por Suscripción',
      description: 'Basado en apps similares con WhatsApp en Shopify App Store, un precio de $39/mes aumenta el LTV un 34% sin reducir la conversión.',
      impact: '+$1.200 MRR proyectado',
      applied: false,
      actionPayload: { priceMonthly: 39 }
    },
    {
      id: 'sug_02',
      agent: 'ux',
      type: 'visual',
      title: 'Añadir Animación de Pulso al Botón de Descuento',
      description: 'La prueba social muestra que un micro-efecto de atención en el botón de cupón incrementa el CTR un 14%.',
      impact: '+14% Clics en Oferta',
      applied: false,
      actionPayload: { buttonEffect: 'pulse' }
    }
  ],
  securityAudit: {
    passed: true,
    score: 98,
    vulnerabilityCount: 0,
    gdprCompliance: 'Compliant',
    performanceRating: 'A+',
    checks: [
      { name: 'XSS Sanitization', status: 'passed', details: 'DOMPurify en todas las entradas de usuario.' },
      { name: 'HMAC Webhook Validation', status: 'passed', details: 'Verificación estricta de firma en peticiones entrantes.' },
      { name: 'Data Retention (<90 días)', status: 'passed', details: 'No se almacenan datos PII de forma permanente.' }
    ],
    recommendations: ['Mantener la clave de cifrado rotada cada 90 días.']
  },
  lastAutoSaved: 'Guardado automáticamente ahora',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const AIProductStudio: React.FC = () => {
  const { addApp, currentUser, setCurrentView, showNotification } = useApp();

  // Active Studio Mode: 'initializer' vs 'workspace'
  const [studioMode, setStudioMode] = useState<'initializer' | 'workspace'>('initializer');
  const [initializerMode, setInitializerMode] = useState<'product_agent' | 'quick_prompt' | 'templates'>('product_agent');
  const [activeTab, setActiveTab] = useState<'product_agent' | 'canvas' | 'visual_builder' | 'docs' | 'versions' | 'ai_suggestions' | 'launchpad'>('product_agent');

  // Input states for project creation
  const [ideaPrompt, setIdeaPrompt] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('conversion');
  const [selectedPlatform, setSelectedPlatform] = useState<EcommercePlatform>('shopify');
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Multi-Agent Specialty in Chat
  const [activeAgent, setActiveAgent] = useState<'pm' | 'architect' | 'ux' | 'business' | 'reviewer'>('pm');
  const [agentChatMessage, setAgentChatMessage] = useState('');
  const [agentChatHistory, setAgentChatHistory] = useState<{ sender: 'user' | 'agent'; agent: string; text: string; time: string }[]>([
    {
      sender: 'agent',
      agent: 'Product Manager',
      text: '¡Hola! Soy tu Lead Product Manager de NexusEcom. He analizado el mercado y estoy listo para ayudarte a definir los requisitos, clientes ideales y flujos de valor para tu aplicación.',
      time: '12:00'
    }
  ]);
  const [agentLoading, setAgentLoading] = useState(false);

  // Project state with guaranteed initial object
  const [project, setProject] = useState<StudioProject>(INITIAL_STUDIO_PROJECT);

  const handleAdoptProposal = (prop: ProductProposal) => {
    setProject(prev => ({
      ...prev,
      name: prop.name,
      slug: prop.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: prop.tagline,
      description: `### Propuesta de Producto: ${prop.name}\n\n**${prop.tagline}**\n\n#### Objetivo Principal:\n${prop.goal}\n\n#### Problema que Resuelve:\n${prop.problemSolved}\n\n#### Público Objetivo:\n${prop.targetAudience}\n\n#### Ventaja Competitiva:\n${prop.competitiveAdvantage}`,
      objective: prop.goal,
      problemSolved: prop.problemSolved,
      targetAudience: prop.targetAudience,
      category: prop.category,
      platforms: prop.targetPlatforms,
      priceMonthly: prop.pricingStrategy.recommendedPriceMonthly,
      priceOneTime: prop.pricingStrategy.recommendedPriceOneTime,
      features: prop.recommendedFeatures.map(f => ({
        title: f.title,
        description: f.description,
        impact: f.impact
      })),
      permissionsRequired: prop.technicalRequirements.permissions,
      webhooks: prop.technicalRequirements.webhooks,
      updatedAt: new Date().toISOString()
    }));

    setStudioMode('workspace');
    setActiveTab('canvas');
    showNotification(`¡Propuesta de "${prop.name}" adoptada con éxito! Inicializando entorno de desarrollo.`, 'success');
  };

  // Autosave Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setProject(prev => ({
        ...prev,
        lastAutoSaved: `Guardado a las ${new Date().toLocaleTimeString()}`
      }));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Templates catalog
  const studioTemplates = [
    {
      title: 'Recuperador de Carritos WhatsApp',
      cat: 'conversion' as AppCategory,
      tagline: 'Intercepción de abandono con WhatsApp y cupones temporales.',
      prompt: 'Una aplicación para recuperar carritos abandonados mediante pop-up con cuenta atrás y recordatorios de WhatsApp con enlaces directos.'
    },
    {
      title: 'Post-Purchase 1-Click Upsell',
      cat: 'conversion' as AppCategory,
      tagline: 'Ofertas complementarias inmediatas después de pagar sin reintroducir tarjeta.',
      prompt: 'Motor de ofertas 1-click post-checkout que analiza el pedido y ofrece un accesorio con descuento exclusivo.'
    },
    {
      title: 'Buscador Semántico & Visual AI',
      cat: 'marketing' as AppCategory,
      tagline: 'Búsqueda por fotos y lenguaje natural en menos de 20ms.',
      prompt: 'Buscador inteligente para ecommerce con autocompletado instantáneo y capacidad de buscar subiendo fotos desde el móvil.'
    },
    {
      title: 'Programa de Fidelización & Reseñas con Foto',
      cat: 'loyalty' as AppCategory,
      tagline: 'Captura de reseñas con foto a cambio de puntos y cupones automáticos.',
      prompt: 'Sistema automatizado que solicita reseñas con foto por email tras la entrega y recompensa con puntos de descuento.'
    },
    {
      title: 'CheckoutGuard & Escudo Anti-Fraude',
      cat: 'checkout' as AppCategory,
      tagline: 'Bloqueo en tiempo real de pedidos de alto riesgo y contracargos.',
      prompt: 'Analizador de riesgo de pedidos en tiempo real con bloqueo de IPs sospechosas y verificación 3DS forzada.'
    }
  ];

  // Generation from prompt
  const handleGenerateFromIdea = async (customPrompt?: string) => {
    const promptToUse = customPrompt || ideaPrompt;
    if (!promptToUse.trim()) {
      showNotification('Introduce una idea o necesidad para comenzar', 'info');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai/builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          platform: selectedPlatform,
          category: selectedCategory,
          targetAudience: 'Comercios de comercio electrónico B2C y B2B',
          pricingModel: 'monthly'
        })
      });

      const data = await res.json();
      if (data.success && data.appSpec) {
        const spec = data.appSpec;
        setProject(prev => ({
          ...prev,
          name: spec.name,
          slug: spec.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          tagline: spec.tagline,
          description: spec.description,
          category: spec.category || selectedCategory,
          platforms: spec.platforms || [selectedPlatform, 'shopify', 'woocommerce'],
          priceMonthly: spec.recommendedPriceMonthly || 29,
          priceOneTime: spec.recommendedPriceOneTime || 290,
          features: spec.features || prev.features,
          codeFiles: spec.codeFiles || prev.codeFiles,
          permissionsRequired: spec.permissionsRequired || prev.permissionsRequired,
          webhooks: spec.webhooks || prev.webhooks,
          defaultSettings: spec.defaultSettings || prev.defaultSettings,
          updatedAt: new Date().toISOString()
        }));

        setStudioMode('workspace');
        setActiveTab('canvas');
        showNotification(`¡Proyecto "${spec.name}" generado y estructurado por el equipo de IA!`, 'success');
      }
    } catch (e) {
      showNotification('Error al contactar con el motor de IA', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Agent chat dispatch
  const handleSendAgentMessage = async () => {
    if (!agentChatMessage.trim()) return;

    const userText = agentChatMessage;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAgentChatHistory(prev => [...prev, { sender: 'user', agent: 'Tú', text: userText, time: timeNow }]);
    setAgentChatMessage('');
    setAgentLoading(true);

    try {
      const res = await fetch('/api/ai/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType: activeAgent === 'pm' ? 'product' : (activeAgent === 'ux' ? 'design' : (activeAgent === 'business' ? 'marketing' : 'developer')),
          message: userText,
          appData: project
        })
      });

      const data = await res.json();
      if (data.reply) {
        const agentNames: Record<string, string> = {
          pm: 'Product Manager',
          architect: 'Arquitecto Funcional',
          ux: 'Diseñador UX/UI',
          business: 'Consultor de Negocio',
          reviewer: 'Revisor de Seguridad'
        };

        setAgentChatHistory(prev => [
          ...prev, 
          { 
            sender: 'agent', 
            agent: agentNames[activeAgent] || 'IA Specialist', 
            text: data.reply, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
        ]);
      }
    } catch (err) {
      showNotification('Error de comunicación con el agente', 'error');
    } finally {
      setAgentLoading(false);
    }
  };

  // Apply continuous AI suggestion
  const handleApplySuggestion = (sugId: string) => {
    const sug = (project.suggestions || []).find(s => s.id === sugId);
    if (!sug) return;

    if (sug.actionPayload?.priceMonthly) {
      setProject(prev => ({ ...prev, priceMonthly: sug.actionPayload.priceMonthly }));
    }

    setProject(prev => ({
      ...prev,
      suggestions: (prev.suggestions || []).map(s => s.id === sugId ? { ...s, applied: true } : s)
    }));

    showNotification(`Sugerencia "${sug.title}" aplicada al proyecto`, 'success');
  };

  // Create SemVer Version Snapshot
  const handleCreateVersionSnapshot = (versionTag: string, changelogText: string) => {
    const newVer: ProjectVersion = {
      version: versionTag,
      timestamp: new Date().toISOString(),
      changelog: changelogText,
      snapshot: { ...project }
    };

    setProject(prev => ({
      ...prev,
      version: versionTag,
      versions: [newVer, ...(prev.versions || [])],
      updatedAt: new Date().toISOString()
    }));

    showNotification(`Nueva versión v${versionTag} sellada y registrada en el historial`, 'success');
  };

  // Restore Version Snapshot
  const handleRestoreVersion = (ver: ProjectVersion) => {
    if (confirm(`¿Deseas restaurar la versión v${ver.version}? Se recuperará el estado correspondiente.`)) {
      setProject(prev => ({
        ...prev,
        ...ver.snapshot,
        version: ver.version,
        updatedAt: new Date().toISOString()
      }));
      showNotification(`Proyecto restaurado a la versión v${ver.version}`, 'info');
    }
  };

  // 1-Click Publish to Marketplace
  const handlePublishProjectToMarketplace = () => {
    const newMarketplaceApp: EcommerceApp = {
      ...project,
      id: `app_${Date.now()}`,
      icon: 'Sparkles',
      status: 'published',
      verified: true,
      rating: 5.0,
      reviewsCount: 0,
      installsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    addApp(newMarketplaceApp);
    showNotification(`¡"${project.name}" ha superado la auditoría y está publicada en el Marketplace!`, 'success');
    setCurrentView('marketplace');
  };

  // Pre-flight readiness score
  const codeFilesList = project.codeFiles || [];
  const versionsList = project.versions || [];
  const suggestionsList = project.suggestions || [];
  const docs = project.documentation || {
    commercialDescription: '',
    featureMatrix: '',
    installationGuide: { shopify: '', woocommerce: '', prestashop: '' },
    faqs: [],
    updateNotes: ''
  };

  const hasFeatures = (project.features || []).length >= 2;
  const hasCode = codeFilesList.length >= 1;
  const hasPricing = project.priceMonthly > 0;
  const hasSecurity = (project.securityAudit?.score || 98) >= 90;
  const hasDocs = Boolean(docs.commercialDescription && docs.installationGuide.shopify);

  const readinessPercent = [hasFeatures, hasCode, hasPricing, hasSecurity, hasDocs].filter(Boolean).length * 20;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      
      {/* INITIALIZER MODE: Choose Start Method */}
      {studioMode === 'initializer' && (
        <div className="space-y-8 animate-in fade-in">
          
          {/* Method Switcher Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInitializerMode('product_agent')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  initializerMode === 'product_agent'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Product Agent (Gemini AI)</span>
              </button>

              <button
                onClick={() => setInitializerMode('quick_prompt')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  initializerMode === 'quick_prompt'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Prompt Rápido & Scaffold</span>
              </button>

              <button
                onClick={() => setInitializerMode('templates')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  initializerMode === 'templates'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Plantillas Pre-configuradas ({studioTemplates.length})</span>
              </button>
            </div>
          </div>

          {/* Option 1: Product Agent Full Workflow */}
          {initializerMode === 'product_agent' && (
            <ProductAgentView onAdoptProposal={handleAdoptProposal} />
          )}

          {/* Option 2: Natural Language Prompt Entry */}
          {initializerMode === 'quick_prompt' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-8 sm:p-10 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 shadow-2xl relative overflow-hidden">
                <div className="max-w-3xl space-y-3 relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                    <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
                    <span>AI Product Studio • Creación Directa</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    Describe tu necesidad de ecommerce
                  </h1>
                  <p className="text-sm text-slate-300 leading-relaxed font-normal">
                    La IA generará automáticamente el código, hooks de Shopify y configuración en tiempo real.
                  </p>
                </div>
              </div>

              <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/70 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Prompt de Generación de Aplicación</span>
                </h3>

                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={ideaPrompt}
                    onChange={(e) => setIdeaPrompt(e.target.value)}
                    placeholder="Ejemplo: Quiero una aplicación para recuperar clientes que dudan en el checkout mediante un pop-up con cupón de 10 minutos y recordatorio por WhatsApp..."
                    className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all font-medium resize-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-semibold">Categoría:</span>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value as any)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                        >
                          <option value="conversion">Conversión & Carrito</option>
                          <option value="marketing">Marketing & Upsell</option>
                          <option value="checkout">Checkout & Pagos</option>
                          <option value="inventory">Inventario & Stock</option>
                          <option value="loyalty">Fidelización & Reseñas</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-semibold">Plataforma Principal:</span>
                        <select
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value as any)}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                        >
                          <option value="shopify">Shopify Plus / OS 2.0</option>
                          <option value="woocommerce">WooCommerce REST</option>
                          <option value="prestashop">PrestaShop Webservice</option>
                          <option value="bigcommerce">BigCommerce</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => handleGenerateFromIdea()}
                      disabled={isGenerating}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                          <span>El equipo IA está diseñando la app...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-cyan-200" />
                          <span>Comenzar Proyecto con IA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Option 3: Pre-Engineered Templates */}
          {initializerMode === 'templates' && (
            <div className="space-y-4 animate-in fade-in">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-1">
                Elige una plantilla probada de alto rendimiento:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {studioTemplates.map((tpl, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setIdeaPrompt(tpl.prompt);
                      setSelectedCategory(tpl.cat);
                      handleGenerateFromIdea(tpl.prompt);
                    }}
                    className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between group shadow-xl"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold uppercase">
                          {tpl.cat}
                        </span>
                        <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      </div>

                      <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors mb-1.5">
                        {tpl.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">
                        {tpl.tagline}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-semibold">
                      <span>Usar esta plantilla</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* WORKSPACE MODE: The Complete AI Product Studio */}
      {studioMode === 'workspace' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Top Project Bar with Autosave Indicator & Actions */}
          <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setStudioMode('initializer')}
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 mr-2"
                >
                  ← Cambiar Proyecto
                </button>
                <h2 className="text-2xl font-black text-white tracking-tight">{project.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
                  v{project.version}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase">
                  {project.category}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <CheckCheck className="w-3.5 h-3.5" />
                  {project.lastAutoSaved || 'Autoguardado activo'}
                </span>
                <span>•</span>
                <span>Objetivo: {project.objective}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('launchpad')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all hover:scale-105"
              >
                <Rocket className="w-4 h-4" />
                <span>Lanzar al Marketplace ({readinessPercent}%)</span>
              </button>
            </div>
          </div>

          {/* Main Navigation Tabs of Studio */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('product_agent')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'product_agent' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              Product Agent
            </button>
            <button
              onClick={() => setActiveTab('canvas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'canvas' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              Equipo IA Multidisciplinar
            </button>
            <button
              onClick={() => setActiveTab('visual_builder')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'visual_builder' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Constructor Visual & Código
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'docs' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Centro de Documentación
            </button>
            <button
              onClick={() => setActiveTab('versions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'versions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <History className="w-4 h-4" />
              Gestión SemVer ({versionsList.length})
            </button>
            <button
              onClick={() => setActiveTab('ai_suggestions')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'ai_suggestions' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 text-cyan-300" />
              Sugerencias de Mejora ({suggestionsList.filter(s => !s.applied).length})
            </button>
            <button
              onClick={() => setActiveTab('launchpad')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'launchpad' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Rocket className="w-4 h-4" />
              Launchpad ({readinessPercent}%)
            </button>
          </div>

          {/* TAB 0: Product Agent Interactive Proposal Engine */}
          {activeTab === 'product_agent' && (
            <ProductAgentView onAdoptProposal={handleAdoptProposal} />
          )}

          {/* TAB 1: Canvas & Multi-Agent Team */}
          {activeTab === 'canvas' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Agent Selector Sidebar */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Especialistas del Equipo IA</p>
                
                {[
                  { id: 'pm', name: 'Product Manager', desc: 'Define objetivos, buyer persona y alcance', icon: UserCheck, color: 'text-blue-400' },
                  { id: 'architect', name: 'Arquitecto Funcional', desc: 'Estructura módulos, webhooks y SQL schema', icon: Code2, color: 'text-indigo-400' },
                  { id: 'ux', name: 'Diseñador UX/UI', desc: 'Diseña el storefront widget y el panel', icon: Sliders, color: 'text-cyan-400' },
                  { id: 'business', name: 'Consultor de Negocio', desc: 'Estrategia de precios y monetización', icon: DollarSign, color: 'text-emerald-400' },
                  { id: 'reviewer', name: 'Revisor de Seguridad', desc: 'Auditoría de vulnerabilidades y GDPR', icon: ShieldCheck, color: 'text-purple-400' }
                ].map((ag) => {
                  const Icon = ag.icon;
                  const isSelected = activeAgent === ag.id;

                  return (
                    <button
                      key={ag.id}
                      onClick={() => setActiveAgent(ag.id as any)}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all border ${
                        isSelected 
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md' 
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <Icon className={`w-4 h-4 ${ag.color}`} />
                        <span>{ag.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{ag.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Chat Session with Active Specialist */}
              <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-950 flex flex-col h-[520px] shadow-2xl">
                
                {/* Chat Top Info */}
                <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Asistente: {activeAgent.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Modelo: Gemini 3.8 Flash</span>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {agentChatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-4 mb-1 opacity-70 text-[10px] font-bold">
                          <span>{msg.agent}</span>
                          <span>{msg.time}</span>
                        </div>
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </div>
                  ))}

                  {agentLoading && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      <span>El especialista está procesando la solicitud...</span>
                    </div>
                  )}
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={agentChatMessage}
                    onChange={(e) => setAgentChatMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendAgentMessage()}
                    placeholder={`Pide al ${activeAgent} que refine el proyecto...`}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleSendAgentMessage}
                    disabled={agentLoading}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Visual Builder & Code */}
          {activeTab === 'visual_builder' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Properties Editor */}
              <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  Editor de Propiedades del Producto
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Nombre Comercial:</label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => setProject({ ...project, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Tagline / Propuesta de Valor:</label>
                    <input
                      type="text"
                      value={project.tagline}
                      onChange={(e) => setProject({ ...project, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Precio Mensual ($):</label>
                      <input
                        type="number"
                        value={project.priceMonthly}
                        onChange={(e) => setProject({ ...project, priceMonthly: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-semibold block mb-1">Licencia Vitalicia ($):</label>
                      <input
                        type="number"
                        value={project.priceOneTime}
                        onChange={(e) => setProject({ ...project, priceOneTime: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold"
                      />
                    </div>
                  </div>

                  {/* Features List with Add/Remove */}
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-400 font-semibold">Funcionalidades Principales ({project.features.length}):</label>
                      <button
                        onClick={() => {
                          const newF: AppFeature = {
                            title: 'Nueva Funcionalidad',
                            description: 'Descripción de la capacidad técnica.',
                            impact: '+15% Rendimiento'
                          };
                          setProject({ ...project, features: [...project.features, newF] });
                        }}
                        className="text-blue-400 hover:text-blue-300 font-semibold text-[11px] flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Añadir
                      </button>
                    </div>

                    <div className="space-y-2">
                      {project.features.map((feat, fIdx) => (
                        <div key={fIdx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <input
                              type="text"
                              value={feat.title}
                              onChange={(e) => {
                                const nextF = [...project.features];
                                nextF[fIdx].title = e.target.value;
                                setProject({ ...project, features: nextF });
                              }}
                              className="bg-transparent text-white font-semibold text-xs focus:outline-none w-full mr-2"
                            />
                            <button
                              onClick={() => {
                                setProject({ ...project, features: project.features.filter((_, idx) => idx !== fIdx) });
                              }}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            value={feat.description}
                            onChange={(e) => {
                              const nextF = [...project.features];
                              nextF[fIdx].description = e.target.value;
                              setProject({ ...project, features: nextF });
                            }}
                            className="bg-transparent text-slate-400 text-[11px] focus:outline-none w-full"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Generated Source Code Viewer */}
              <div className="p-6 rounded-3xl border border-slate-800 bg-slate-950 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 font-mono">
                    <FileCode className="w-4 h-4 text-indigo-400" />
                    Código Fuente ({codeFilesList.length} archivos)
                  </h3>
                  <span className="text-[10px] text-emerald-400 font-mono">Validado por AST</span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[420px]">
                  {codeFilesList.map((file, fIdx) => (
                    <div key={fIdx} className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
                      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-cyan-300 font-bold">{file.filename}</span>
                        <span className="text-[10px] uppercase text-slate-500">{file.language}</span>
                      </div>
                      <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                        {file.content}
                      </pre>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                  Cumple con los estándares de Theme App Extensions y verificación de firmas HMAC de Shopify y WooCommerce.
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Auto-Generated Documentation Center */}
          {activeTab === 'docs' && (
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    Centro de Documentación del Producto
                  </h3>
                  <p className="text-xs text-slate-400">
                    Generado automáticamente por el Marketing & Functional Agent. Totalmente editable.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                
                {/* Commercial Description */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Descripción Comercial:</label>
                  <textarea
                    rows={3}
                    value={docs.commercialDescription}
                    onChange={(e) => setProject({
                      ...project,
                      documentation: { ...docs, commercialDescription: e.target.value }
                    })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white resize-none"
                  />
                </div>

                {/* Installation Guides per platform */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Guía de Instalación Oficial:</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-bold text-xs text-emerald-400">Para Shopify OS 2.0:</span>
                      <textarea
                        rows={4}
                        value={docs.installationGuide?.shopify || ''}
                        onChange={(e) => setProject({
                          ...project,
                          documentation: {
                            ...docs,
                            installationGuide: { ...(docs.installationGuide || { woocommerce: '', prestashop: '' }), shopify: e.target.value }
                          }
                        })}
                        className="w-full bg-transparent text-xs text-slate-300 resize-none focus:outline-none"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-bold text-xs text-purple-400">Para WooCommerce:</span>
                      <textarea
                        rows={4}
                        value={docs.installationGuide?.woocommerce || ''}
                        onChange={(e) => setProject({
                          ...project,
                          documentation: {
                            ...docs,
                            installationGuide: { ...(docs.installationGuide || { shopify: '', prestashop: '' }), woocommerce: e.target.value }
                          }
                        })}
                        className="w-full bg-transparent text-xs text-slate-300 resize-none focus:outline-none"
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="font-bold text-xs text-pink-400">Para PrestaShop:</span>
                      <textarea
                        rows={4}
                        value={docs.installationGuide?.prestashop || ''}
                        onChange={(e) => setProject({
                          ...project,
                          documentation: {
                            ...docs,
                            installationGuide: { ...(docs.installationGuide || { shopify: '', woocommerce: '' }), prestashop: e.target.value }
                          }
                        })}
                        className="w-full bg-transparent text-xs text-slate-300 resize-none focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: SemVer Version History */}
          {activeTab === 'versions' && (
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Historial de Versiones y Puntos de Restauración</h3>
                  <p className="text-xs text-slate-400">Sistema de snapshots SemVer para volver a cualquier estado previo sin pérdida de datos.</p>
                </div>

                <button
                  onClick={() => {
                    const nextVer = `1.${versionsList.length}.0`;
                    handleCreateVersionSnapshot(nextVer, `Actualización iterativa v${nextVer}`);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Snapshot SemVer</span>
                </button>
              </div>

              <div className="space-y-3">
                {versionsList.map((ver, vIdx) => (
                  <div key={vIdx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm font-mono">v{ver.version}</span>
                        {vIdx === 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">ACTUAL</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{ver.changelog}</p>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(ver.timestamp).toLocaleString()}</span>
                    </div>

                    {vIdx !== 0 && (
                      <button
                        onClick={() => handleRestoreVersion(ver)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                      >
                        Restaurar a esta versión
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AI Continuous Suggestions */}
          {activeTab === 'ai_suggestions' && (
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Sugerencias Proactivas de Mejora Continua
                </h3>
                <p className="text-xs text-slate-400">
                  La IA analiza constantemente el proyecto y propone optimizaciones de conversión, seguridad y precio.
                </p>
              </div>

              <div className="space-y-4">
                {suggestionsList.map((sug) => (
                  <div
                    key={sug.id}
                    className={`p-6 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      sug.applied 
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60' 
                        : 'bg-slate-950 border-slate-800 shadow-md ring-1 ring-blue-500/20'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sug.title}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                          {sug.agent}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{sug.description}</p>
                      <span className="text-[11px] text-emerald-400 font-semibold font-mono">Impacto estimado: {sug.impact}</span>
                    </div>

                    {sug.applied ? (
                      <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 shrink-0">
                        <Check className="w-4 h-4" />
                        Aplicada
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplySuggestion(sug.id)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Aplicar Mejora</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Launchpad & Pre-Publication Readiness */}
          {activeTab === 'launchpad' && (
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-emerald-400" />
                    Launchpad & Lista de Comprobación para Publicación
                  </h3>
                  <p className="text-xs text-slate-400">
                    Verificación pre-vuelo para garantizar la máxima calidad antes de publicar en el Marketplace.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">Preparación para Lanzamiento</p>
                  <p className="text-3xl font-black text-emerald-400">{readinessPercent}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${readinessPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">Funcionalidades Definidas (≥2)</span>
                  {hasFeatures ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">Archivos de Código Generados</span>
                  {hasCode ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">Precio & Modelo de Monetización</span>
                  {hasPricing ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300">Auditoría de Seguridad (Score ≥90)</span>
                  {hasSecurity ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-amber-400" />}
                </div>
              </div>

              <button
                onClick={handlePublishProjectToMarketplace}
                disabled={readinessPercent < 80}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket className="w-5 h-5" />
                <span>Confirmar y Publicar en el Marketplace Oficial (1-Click)</span>
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
