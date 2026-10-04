import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommercePlatform, AppCategory, StudioProject } from '../../types';
import { 
  Sparkles, 
  Bot, 
  Target, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  Layers, 
  FileText, 
  Copy, 
  Check, 
  RefreshCw, 
  Send, 
  HelpCircle,
  Clock,
  Code2,
  TrendingUp,
  Tag,
  Store,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';

export interface ProductProposal {
  name: string;
  tagline: string;
  goal: string;
  problemSolved: string;
  targetAudience: string;
  category: AppCategory;
  targetPlatforms: EcommercePlatform[];
  recommendedFeatures: {
    title: string;
    description: string;
    impact: string;
    priority: 'core' | 'recommended' | 'advanced';
  }[];
  pricingStrategy: {
    model: 'monthly' | 'one_time' | 'free';
    recommendedPriceMonthly: number;
    recommendedPriceOneTime: number;
    justification: string;
  };
  technicalRequirements: {
    permissions: string[];
    webhooks: string[];
    shopifyExtensionType: string;
  };
  competitiveAdvantage: string;
  launchReadinessScore: number;
  nextSteps: string[];
}

interface ProductAgentViewProps {
  onAdoptProposal: (proposal: ProductProposal) => void;
}

export const ProductAgentView: React.FC<ProductAgentViewProps> = ({ onAdoptProposal }) => {
  const { showNotification } = useApp();

  // Input state
  const [businessIdea, setBusinessIdea] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<EcommercePlatform>('shopify');
  const [selectedCategory, setSelectedCategory] = useState<AppCategory>('conversion');
  const [pricingPreference, setPricingPreference] = useState<'monthly' | 'one_time' | 'free'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedProposal, setCopiedProposal] = useState(false);

  // Active Proposal
  const [proposal, setProposal] = useState<ProductProposal | null>(null);

  // Conversational refinement state
  const [refineQuery, setRefineQuery] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Quick Inspirations
  const quickIdeas = [
    {
      label: 'Recuperación WhatsApp con Urgencia',
      idea: 'Una app para recuperar carritos abandonados que detecta exit-intent y envía recordatorios automáticos por WhatsApp con cupones de 10 minutos de cuenta atrás.'
    },
    {
      label: '1-Click Post-Purchase Upsell',
      idea: 'Un motor de ofertas complementarias post-pago que permite a los clientes añadir productos con 1 solo clic sin volver a introducir tarjeta en Shopify Checkout.'
    },
    {
      label: 'Buscador Multimodal con IA Visual',
      idea: 'Buscador inteligente para tiendas de ropa que permite a los usuarios subir una foto desde el móvil y encontrar prendas idénticas o similares del catálogo.'
    },
    {
      label: 'Descuentos por Volumen Escalonados',
      idea: 'Barra de progreso interactiva en el carrito que muestra cuánto falta para desbloquear envío gratis, 10% y 20% de descuento automático.'
    }
  ];

  const handleGenerateProposal = async (customIdea?: string) => {
    const ideaToUse = customIdea || businessIdea;
    if (!ideaToUse.trim()) {
      showNotification('Describe tu idea de negocio o selecciona una sugerencia', 'info');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/product-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: ideaToUse,
          platform: selectedPlatform,
          category: selectedCategory,
          pricingPreference
        })
      });

      const data = await res.json();
      if (data.success && data.proposal) {
        setProposal(data.proposal);
        showNotification(`Propuesta estructurada para "${data.proposal.name}" creada con éxito por el Product Agent`, 'success');
      }
    } catch (error) {
      showNotification('Error al conectar con el Product Agent de Gemini', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefineProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineQuery.trim() || !proposal) return;

    setIsRefining(true);

    try {
      const combinedPrompt = `Original Proposal for ${proposal.name}: ${JSON.stringify(proposal)}\n\nRefinement Request from creator: "${refineQuery}". Adjust and improve the proposal according to these instructions.`;

      const res = await fetch('/api/ai/product-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: combinedPrompt,
          platform: selectedPlatform,
          category: selectedCategory,
          pricingPreference
        })
      });

      const data = await res.json();
      if (data.success && data.proposal) {
        setProposal(data.proposal);
        setRefineQuery('');
        showNotification('Propuesta refinada y actualizada con las indicaciones del Product Agent', 'success');
      }
    } catch (error) {
      showNotification('Error al refinar la propuesta', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!proposal) return;

    const md = `# Propuesta de Producto: ${proposal.name}
**Tagline**: ${proposal.tagline}
**Puntuación de Preparación**: ${proposal.launchReadinessScore}/100

## 1. Objetivo Principal
${proposal.goal}

## 2. Problema que Resuelve
${proposal.problemSolved}

## 3. Público Objetivo
${proposal.targetAudience}

## 4. Funcionalidades Recomendadas
${proposal.recommendedFeatures.map(f => `- **${f.title}** (${f.priority.toUpperCase()}): ${f.description} (Impacto: ${f.impact})`).join('\n')}

## 5. Modelo de Precios & Comisiones
- **Modelo**: ${proposal.pricingStrategy.model}
- **Precio Mensual**: $${proposal.pricingStrategy.recommendedPriceMonthly}/mes (85% creador: $${(proposal.pricingStrategy.recommendedPriceMonthly * 0.85).toFixed(2)})
- **Justificación**: ${proposal.pricingStrategy.justification}

## 6. Arquitectura Técnica & Scopes
- **Tipo de Extensión**: ${proposal.technicalRequirements.shopifyExtensionType}
- **Permisos Requeridos**: ${proposal.technicalRequirements.permissions.join(', ')}
- **Webhooks**: ${proposal.technicalRequirements.webhooks.join(', ')}
- **Ventaja Competitiva**: ${proposal.competitiveAdvantage}
`;

    navigator.clipboard.writeText(md);
    setCopiedProposal(true);
    showNotification('Propuesta de producto copiada en formato Markdown', 'success');
    setTimeout(() => setCopiedProposal(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Product Manager Agent — Gemini AI</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Transforma cualquier idea ecommerce en una propuesta de producto lista para construir
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
            El <strong className="text-white">Product Agent</strong> analiza el mercado, identifica el dolor del comerciante, define el público objetivo exacto y estructura la matriz de funcionalidades con impacto cuantificable en ventas.
          </p>
        </div>
      </div>

      {/* Idea Submission Input Box */}
      <div className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Describe tu Idea de Negocio o Necesidad de Tienda</span>
          </label>
          <textarea
            rows={4}
            value={businessIdea}
            onChange={(e) => setBusinessIdea(e.target.value)}
            placeholder="Ejemplo: Quiero una aplicación para Shopify que detecte cuando un usuario va a abandonar el carrito y le ofrezca un descuento con cuenta atrás enviado por WhatsApp con enlace directo al pago..."
            className="w-full p-4 rounded-2xl bg-slate-950/90 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all leading-relaxed shadow-inner"
          />
        </div>

        {/* Quick Inspiration Pills */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Ideas Rápidas de Alta Conversión:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickIdeas.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setBusinessIdea(item.idea);
                  handleGenerateProposal(item.idea);
                }}
                className="p-3 rounded-xl bg-slate-950/60 hover:bg-blue-900/20 border border-slate-800 hover:border-blue-500/40 text-left transition-all group"
              >
                <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                  {item.label}
                </p>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {item.idea}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Plataforma Principal</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="shopify">Shopify (OS 2.0 & Plus)</option>
              <option value="woocommerce">WooCommerce</option>
              <option value="prestashop">PrestaShop</option>
              <option value="bigcommerce">BigCommerce</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Categoría Comercial</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="conversion">Conversión & Carrito</option>
              <option value="marketing">Marketing & Upsell</option>
              <option value="checkout">Checkout & Pagos</option>
              <option value="inventory">Inventario & Stock</option>
              <option value="loyalty">Reseñas & Fidelización</option>
              <option value="analytics">Analítica & Tracking</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Preferencia de Monetización</label>
            <select
              value={pricingPreference}
              onChange={(e) => setPricingPreference(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="monthly">Suscripción Mensual (MRR)</option>
              <option value="one_time">Pago Único (Lifetime)</option>
              <option value="free">Gratis (Lead Magnet)</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Impulsado por Gemini 3.8 Flash con razonamiento de producto
          </span>

          <button
            onClick={() => handleGenerateProposal()}
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 disabled:opacity-50 text-white font-bold text-xs shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-cyan-300" />}
            <span>{isLoading ? 'Analizando con Gemini...' : 'Estructurar Propuesta con Product Agent'}</span>
          </button>
        </div>

      </div>

      {/* Structured Proposal Output */}
      {proposal && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Proposal Header Banner */}
          <div className="p-6 sm:p-8 rounded-3xl border border-blue-500/30 bg-slate-900/90 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">{proposal.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-semibold capitalize font-mono">
                    {proposal.category}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono">
                    Score {proposal.launchReadinessScore}/100
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">{proposal.tagline}</p>
              </div>

              {/* Top Quick Actions */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  {copiedProposal ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedProposal ? 'Copiado' : 'Copiar Markdown'}</span>
                </button>

                <button
                  onClick={() => onAdoptProposal(proposal)}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Adoptar Propuesta y Generar Código</span>
                </button>
              </div>
            </div>

            {/* Goal, Problem Solved & Target Audience Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                  <Target className="w-4 h-4" />
                  <span>Objetivo Principal (Goal)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {proposal.goal}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>Problema que Resuelve</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {proposal.problemSolved}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  <span>Público Objetivo (Audience)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {proposal.targetAudience}
                </p>
              </div>

            </div>

            {/* Recommended Features Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Conjunto de Funcionalidades Recomendadas (Feature Set)</span>
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {proposal.recommendedFeatures.length} módulos planificados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {proposal.recommendedFeatures.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                          feat.priority === 'core'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : feat.priority === 'recommended'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        }`}>
                          {feat.priority === 'core' ? 'Core MVP' : feat.priority === 'recommended' ? 'Recomendado' : 'Avanzado'}
                        </span>

                        <span className="text-[10px] font-bold text-cyan-400 font-mono">
                          {feat.impact}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white">{feat.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{feat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Strategy & Technical Blueprint */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* Pricing */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Estrategia de Precios & Retención</span>
                  </span>
                  <span className="text-sm font-black text-white font-mono">
                    ${proposal.pricingStrategy.recommendedPriceMonthly}
                    <span className="text-xs font-normal text-slate-400">/mes</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {proposal.pricingStrategy.justification}
                </p>
                <div className="pt-2 flex items-center gap-4 text-[11px] text-slate-400 border-t border-slate-800/60 font-mono">
                  <span>Neto Creador (85%): <strong className="text-emerald-400">${(proposal.pricingStrategy.recommendedPriceMonthly * 0.85).toFixed(2)}/mes</strong></span>
                  <span>Pago Único Sugerido: <strong className="text-white">${proposal.pricingStrategy.recommendedPriceOneTime}</strong></span>
                </div>
              </div>

              {/* Technical Scopes */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-cyan-400" />
                    <span>Arquitectura Shopify & Webhooks</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {proposal.technicalRequirements.shopifyExtensionType}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-slate-400 text-[11px]">
                    <strong className="text-slate-300">Permisos OAuth:</strong> {proposal.technicalRequirements.permissions.join(', ')}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    <strong className="text-slate-300">Webhooks Sincronizados:</strong> {proposal.technicalRequirements.webhooks.join(', ')}
                  </p>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium pt-1 border-t border-slate-800/60">
                  Ventaja Competitiva: {proposal.competitiveAdvantage}
                </p>
              </div>

            </div>

            {/* Next Steps Roadmap */}
            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Hoja de Ruta Recomendada por el Product Agent</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {proposal.nextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Conversational Refinement Form */}
            <form onSubmit={handleRefineProposal} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>¿Deseas afinar o solicitar cambios en la propuesta al Product Agent?</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={refineQuery}
                  onChange={(e) => setRefineQuery(e.target.value)}
                  placeholder="Ej: Añade integración con Klaviyo para enviar emails y ajusta el precio a $39/mes..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isRefining || !refineQuery.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0"
                >
                  {isRefining ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Refinar</span>
                </button>
              </div>
            </form>

            {/* Bottom Final Action */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => onAdoptProposal(proposal)}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-black text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Adoptar Propuesta y Comenzar Construcción</span>
                <ArrowRight className="w-4 h-4 text-cyan-300" />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
