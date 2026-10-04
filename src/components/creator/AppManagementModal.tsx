import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp, EcommercePlatform, SecurityAuditResult, ProjectDocumentation } from '../../types';
import { 
  X, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Check, 
  HelpCircle, 
  Cpu, 
  Info, 
  Lock, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Clock, 
  BookOpen, 
  Code2, 
  Activity, 
  Loader2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface AppManagementModalProps {
  app: EcommerceApp;
  onClose: () => void;
}

export const AppManagementModal: React.FC<AppManagementModalProps> = ({ app, onClose }) => {
  const { updateApp, showNotification } = useApp();

  const [activeTab, setActiveTab] = useState<'general' | 'oauth' | 'docs' | 'audit'>('general');

  // Basic Information
  const [name, setName] = useState(app.name);
  const [tagline, setTagline] = useState(app.tagline);
  const [priceMonthly, setPriceMonthly] = useState(app.priceMonthly);
  const [priceOneTime, setPriceOneTime] = useState(app.priceOneTime);

  // Platform Compatibility
  const [platforms, setPlatforms] = useState<EcommercePlatform[]>(app.platforms || []);
  const availablePlatforms: { id: EcommercePlatform; name: string }[] = [
    { id: 'shopify', name: 'Shopify Plus / Advanced' },
    { id: 'woocommerce', name: 'WooCommerce WordPress' },
    { id: 'prestashop', name: 'PrestaShop Webservice' },
    { id: 'magento', name: 'Magento 2.4 Enterprise' },
    { id: 'bigcommerce', name: 'BigCommerce GraphQL' }
  ];

  // OAuth Scopes / Permissions
  const [scopes, setScopes] = useState<string[]>(app.permissionsRequired || []);
  const availableScopes = [
    { id: 'read_products', name: 'read_products', desc: 'Leer catálogo de productos y variantes' },
    { id: 'write_products', name: 'write_products', desc: 'Crear y modificar productos del catálogo' },
    { id: 'read_orders', name: 'read_orders', desc: 'Leer detalles de pedidos e historial' },
    { id: 'write_orders', name: 'write_orders', desc: 'Crear cupones y actualizar estado del pedido' },
    { id: 'read_customers', name: 'read_customers', desc: 'Sincronizar emails y perfiles de compradores' },
    { id: 'read_inventory', name: 'read_inventory', desc: 'Verificar niveles de stock en almacén' }
  ];

  // Documentation and FAQs
  const [installationShopify, setInstallationShopify] = useState(app.documentation?.installationGuide?.shopify || '1. Haz clic en "Instalar vía OAuth" en el marketplace.\n2. Introduce el dominio de tu tienda.\n3. Acepta los permisos de sincronización de la app.');
  const [installationWoo, setInstallationWoo] = useState(app.documentation?.installationGuide?.woocommerce || '1. Asegúrate de tener activada la clave REST API v3 en WooCommerce.\n2. Introduce tu Consumer Key y Consumer Secret.\n3. Sincroniza el catálogo.');
  const [installationPresta, setInstallationWooPresta] = useState(app.documentation?.installationGuide?.prestashop || '1. Activa la clave de Webservice en la sección de Parámetros Avanzados.\n2. Vincula el token con permisos GET/POST para productos y pedidos.');
  const [commercialDescription, setCommercialDescription] = useState(app.documentation?.commercialDescription || app.description);
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(
    app.documentation?.faqs || [
      { question: '¿Cómo funciona la recuperación de carritos por WhatsApp?', answer: 'El sistema detecta cuando el comprador abandona el checkout, genera un cupón dinámico por IA y encola un mensaje automatizado.' }
    ]
  );
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqAnswer, setNewFaqAnswer] = useState('');

  // Webhooks Configuration State
  const [webhooksList, setWebhooksList] = useState<string[]>(app.webhooks || ['orders/create']);
  const [newWebhookTopic, setNewWebhookTopic] = useState('');

  // Ecosystem Audit States
  const [auditStatus, setAuditStatus] = useState<'not_started' | 'running' | 'completed' | 'failed'>(
    app.securityAudit ? 'completed' : 'not_started'
  );
  const [auditResult, setAuditResult] = useState<SecurityAuditResult | null>(
    app.securityAudit || null
  );

  const handleTogglePlatform = (p: EcommercePlatform) => {
    setPlatforms(prev => 
      prev.includes(p) ? prev.filter(item => item !== p) : [...prev, p]
    );
  };

  const handleToggleScope = (s: string) => {
    setScopes(prev => 
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const handleAddFaq = () => {
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    setFaqs(prev => [...prev, { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }]);
    setNewFaqQuestion('');
    setNewFaqAnswer('');
  };

  const handleRemoveFaq = (idx: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== idx));
  };

  // Automated Ecosystem Audit Runner
  const runEcosystemAudit = async () => {
    setAuditStatus('running');
    setAuditResult(null);

    try {
      const response = await fetch('/api/ai/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: name,
          permissions: scopes,
          webhooks: webhooksList,
          codeFiles: app.codeFiles || []
        })
      });

      const data = await response.json();
      
      // Artificial delay to show beautiful verification scanner
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (data.success && data.audit) {
        // Enforce ecosystem publishing rules:
        // - App must have at least 1 compatible platform.
        // - App must have at least 1 declared scope.
        // - Score must be over 90.
        const score = data.audit.score || 95;
        const passesRules = platforms.length > 0 && scopes.length > 0 && score >= 90;

        const customizedAudit: SecurityAuditResult = {
          ...data.audit,
          passed: passesRules,
          checks: [
            { 
              name: 'Declaración de Plataformas Compatibles', 
              status: platforms.length > 0 ? 'passed' : 'failed', 
              details: platforms.length > 0 ? `Asociado con ${platforms.length} plataforma(s).` : 'Debes declarar al menos 1 plataforma de destino.' 
            },
            { 
              name: 'Declaración de Permisos (OAuth Scopes)', 
              status: scopes.length > 0 ? 'passed' : 'failed', 
              details: scopes.length > 0 ? `${scopes.length} permisos declarados.` : 'Debes declarar al menos un permiso/scope requerido.' 
            },
            ...data.audit.checks
          ]
        };

        const finalPassed = customizedAudit.checks.every(c => c.status === 'passed') && score >= 90;
        customizedAudit.passed = finalPassed;

        setAuditResult(customizedAudit);
        setAuditStatus(finalPassed ? 'completed' : 'failed');
        
        if (finalPassed) {
          showNotification('¡Auditoría de Ecosistema superada con éxito (Calidad Certificada)!', 'success');
        } else {
          showNotification('Auditoría suspendida: No cumple con los requisitos del ecosistema.', 'error');
        }
      } else {
        setAuditStatus('not_started');
        showNotification('Error al contactar con el auditor estático de la plataforma.', 'error');
      }
    } catch (err) {
      setAuditStatus('not_started');
      showNotification('Error de red al procesar el análisis.', 'error');
    }
  };

  const handleSaveAll = () => {
    if (platforms.length === 0) {
      showNotification('Debes declarar al menos una plataforma compatible', 'error');
      setActiveTab('oauth');
      return;
    }

    if (scopes.length === 0) {
      showNotification('Debes declarar al menos un permiso OAuth requerido', 'error');
      setActiveTab('oauth');
      return;
    }

    const updatedDoc: ProjectDocumentation = {
      commercialDescription,
      featureMatrix: app.documentation?.featureMatrix || 'Matriz de ROI detallada',
      installationGuide: {
        shopify: installationShopify,
        woocommerce: installationWoo,
        prestashop: installationPresta
      },
      faqs,
      updateNotes: app.documentation?.updateNotes || `Configurado el ${new Date().toLocaleDateString()}`
    };

    updateApp(app.id, {
      name,
      tagline,
      priceMonthly,
      priceOneTime,
      platforms,
      permissionsRequired: scopes,
      webhooks: webhooksList,
      documentation: updatedDoc,
      securityAudit: auditResult || undefined,
      status: auditResult?.passed ? app.status : 'draft' // Reset to draft if audit hasn't passed
    });

    showNotification('Parámetros de la aplicación actualizados correctamente', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Configuración Avanzada & Auditoría Técnica</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">Gestionar Aplicación: {app.name}</h2>
          <p className="text-xs text-slate-400">
            Define las compatibilidades, solicita scopes de OAuth declarados, edita documentación y pasa la auditoría de seguridad del ecosistema.
          </p>
        </div>

        {/* Tabs navigation */}
        <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
          {[
            { id: 'general', label: 'Básico', icon: Info },
            { id: 'oauth', label: 'Plataformas & Permisos', icon: Lock },
            { id: 'docs', label: 'Documentación Técnica', icon: BookOpen },
            { id: 'audit', label: 'Auditoría del Ecosistema', icon: ShieldCheck }
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

        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nombre de la Aplicación</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tagline (Propuesta Corta)</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Precio Suscripción Mensual ($USD)</label>
                <input
                  type="number"
                  value={priceMonthly}
                  onChange={(e) => setPriceMonthly(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Precio Licencia Unica ($USD)</label>
                <input
                  type="number"
                  value={priceOneTime}
                  onChange={(e) => setPriceOneTime(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Platforms & OAuth scopes */}
        {activeTab === 'oauth' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            
            {/* Platforms selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Plataformas Compatibles
              </label>
              <p className="text-[11px] text-slate-400">Define en qué marketplaces o tiendas de CMS se distribuirá y se validará tu app.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {availablePlatforms.map((p) => {
                  const active = platforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleTogglePlatform(p.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        active
                          ? 'bg-blue-600/10 border-blue-500 text-white'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold">{p.name}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        active ? 'border-blue-400 bg-blue-500 text-white' : 'border-slate-700 bg-slate-950'
                      }`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* OAuth Scopes selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                OAuth Scopes / Permisos Requeridos
              </label>
              <p className="text-[11px] text-slate-400">Declara estrictamente los scopes de lectura/escritura necesarios. Los permisos que solicites se mostrarán transparentemente al comerciante.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {availableScopes.map((scope) => {
                  const active = scopes.includes(scope.id);
                  return (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => handleToggleScope(scope.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all gap-4 ${
                        active
                          ? 'bg-emerald-600/10 border-emerald-500/30 text-white'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-mono font-bold text-white">{scope.id}</span>
                        <p className="text-[10px] text-slate-400 leading-normal">{scope.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 shrink-0 ${
                        active ? 'border-emerald-400 bg-emerald-500 text-white' : 'border-slate-700 bg-slate-950'
                      }`}>
                        {active && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Webhook Configuration section */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Configuración de Webhooks del Ecosistema
              </label>
              <p className="text-[11px] text-slate-400">
                Registra los eventos comerciales (por ejemplo, <code>orders/create</code> o <code>carts/update</code>) que tu aplicación escuchará en tiempo real con firmas de cifrado HMAC-SHA256 para evitar suplantación de identidad.
              </p>

              <div className="flex flex-wrap gap-1.5 py-1">
                {webhooksList.map((topic, index) => (
                  <div key={index} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-400">
                    <span>{topic}</span>
                    <button
                      type="button"
                      onClick={() => setWebhooksList(prev => prev.filter((_, i) => i !== index))}
                      className="text-slate-500 hover:text-rose-400 font-bold ml-1 text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {webhooksList.length === 0 && (
                  <p className="text-[10px] text-amber-400 italic">No hay ningún webhook registrado. La auditoría fallará.</p>
                )}
              </div>

              <div className="flex gap-2 max-w-sm">
                <input
                  type="text"
                  value={newWebhookTopic}
                  onChange={(e) => setNewWebhookTopic(e.target.value)}
                  placeholder="Ej: orders/create, carts/update"
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = newWebhookTopic.trim();
                    if (trimmed && !webhooksList.includes(trimmed)) {
                      setWebhooksList(prev => [...prev, trimmed]);
                      setNewWebhookTopic('');
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                >
                  Añadir
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: Documentation and FAQs */}
        {activeTab === 'docs' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Descripción Comercial (Formato Markdown)</label>
              <textarea
                rows={3}
                value={commercialDescription}
                onChange={(e) => setCommercialDescription(e.target.value)}
                placeholder="Escribe una descripción completa que convenza a los comercios..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Guía de Shopify</label>
                <textarea
                  rows={4}
                  value={installationShopify}
                  onChange={(e) => setInstallationShopify(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Guía de WooCommerce</label>
                <textarea
                  rows={4}
                  value={installationWoo}
                  onChange={(e) => setInstallationWoo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Guía de PrestaShop</label>
                <textarea
                  rows={4}
                  value={installationPresta}
                  onChange={(e) => setInstallationWooPresta(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* FAQs management */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Preguntas Frecuentes (FAQs)</h4>
              
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                {faqs.map((faq, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 flex items-start justify-between gap-3 text-[11px]">
                    <div>
                      <p className="font-bold text-white">Q: {faq.question}</p>
                      <p className="text-slate-400 mt-0.5">A: {faq.answer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                <input
                  type="text"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  placeholder="Añadir nueva pregunta..."
                  className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-850 text-xs text-white"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    placeholder="Escribe la respuesta..."
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-850 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="px-3.5 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-200 hover:text-white text-xs font-bold transition-all"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Ecosystem Security & Compliance Audit */}
        {activeTab === 'audit' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            
            <div className="p-5 rounded-3xl border border-blue-500/25 bg-blue-500/10 flex items-start gap-4">
              <Cpu className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Auditor Automatizado de Ecosistema</h4>
                <p className="text-xs text-slate-300 leading-normal">
                  Nuestra pasarela de calidad ejecuta automáticamente un análisis estático de tu aplicación. Para publicar, tu aplicación debe declarar plataformas, scopes válidos, y pasar las pruebas de seguridad con una **puntuación mínima de 90/100**.
                </p>
              </div>
            </div>

            {/* Audit Status Screen */}
            {auditStatus === 'not_started' && (
              <div className="p-12 text-center border border-slate-850 bg-slate-950/40 rounded-3xl space-y-4">
                <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Auditoría pendiente de ejecutar</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Haz clic en el botón de abajo para que el agente auditor IA verifique tus scopes OAuth, webhooks y archivos de código.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={runEcosystemAudit}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Ejecutar Auditoría del Ecosistema
                </button>
              </div>
            )}

            {auditStatus === 'running' && (
              <div className="p-12 text-center border border-blue-500/30 bg-slate-950/40 rounded-3xl space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-white">Ejecutando Pruebas Estáticas de Ecosistema...</p>
                  <p className="text-[11px] text-slate-400">Analizando GDPR, inyección de scripts, disponibilidad de webhooks y tokens de seguridad.</p>
                </div>
                <div className="max-w-xs mx-auto h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-infinite-scroll w-2/3" />
                </div>
              </div>
            )}

            {(auditStatus === 'completed' || auditStatus === 'failed') && auditResult && (
              <div className="space-y-4 animate-in zoom-in-98 duration-150">
                
                {/* Score Summary */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Análisis de Requisitos e Integridad</p>
                    <p className="text-[10px] text-slate-500">GDPR Compliance: {auditResult.gdprCompliance} • Rendimiento: {auditResult.performanceRating}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Puntuación</span>
                      <p className="text-xl font-black font-mono text-emerald-400">{auditResult.score}/100</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      auditResult.passed 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {auditResult.passed ? 'COMPLIANT ✓' : 'FALTA REQUISITOS ⚠'}
                    </span>
                  </div>
                </div>

                {/* Checks List */}
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {auditResult.checks.map((check, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border flex items-start gap-3 justify-between text-xs ${
                        check.status === 'passed' 
                          ? 'bg-slate-950/40 border-slate-900 text-slate-300' 
                          : 'bg-rose-950/10 border-rose-500/20 text-rose-300'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                          check.status === 'passed' ? 'bg-emerald-400' : 'bg-rose-400'
                        }`} />
                        <div>
                          <p className="font-semibold text-white">{check.name}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{check.details}</p>
                        </div>
                      </div>

                      <span className={`text-[9px] font-bold uppercase font-mono px-1.5 py-0.5 rounded shrink-0 ${
                        check.status === 'passed' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {check.status === 'passed' ? 'Aprobado' : 'Revisar'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Audit recommendations if any */}
                {auditResult.recommendations && auditResult.recommendations.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-850/80 text-[11px] text-slate-400 space-y-1">
                    <p className="font-bold text-white uppercase tracking-wider text-[10px]">Recomendaciones de Seguridad:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {auditResult.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={runEcosystemAudit}
                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 hover:underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Volver a Ejecutar Auditoría</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/10 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-cyan-200" />
            <span>Guardar Parámetros de la App</span>
          </button>
        </div>

      </div>
    </div>
  );
};
