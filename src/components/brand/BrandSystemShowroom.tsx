import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Eye, 
  Layers, 
  Palette, 
  Type, 
  Layout, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Store,
  Code2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const BrandSystemShowroom: React.FC = () => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'logos' | 'colors' | 'typography' | 'components' | 'principles'>('logos');

  const copyToClipboard = (text: string, tokenName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const colorPalettes = [
    {
      group: 'Superficies Principales (Deep Space & Slate)',
      tokens: [
        { name: 'Canvas Base (Background)', hex: '#020617', rgb: 'rgb(2, 6, 23)', role: 'Fondo de pantalla principal inmersivo' },
        { name: 'Surface Panel (Cards)', hex: '#090d16', rgb: 'rgb(9, 13, 22)', role: 'Contenedores de tarjetas y paneles modulares' },
        { name: 'Surface Elevated', hex: '#0f172a', rgb: 'rgb(15, 23, 42)', role: 'Modales, dropdowns y tooltips flotantes' },
        { name: 'Border Subdued', hex: '#1e293b', rgb: 'rgb(30, 41, 59)', role: 'Bordes estructurales y separadores tenues' },
        { name: 'Border Interactive', hex: '#334155', rgb: 'rgb(51, 65, 85)', role: 'Bordes en estado hover y activo' }
      ]
    },
    {
      group: 'Acentos Primarios (Neural AI Gradients)',
      tokens: [
        { name: 'Electric Cyan', hex: '#38bdf8', rgb: 'rgb(56, 189, 248)', role: 'Puntos focales IA, micro-brillos y badges de estado' },
        { name: 'Core Indigo', hex: '#6366f1', rgb: 'rgb(99, 102, 241)', role: 'Botones primarios y llamadas a la acción' },
        { name: 'Vibrant Purple', hex: '#a855f7', rgb: 'rgb(168, 85, 247)', role: 'Acentos de creadores y analítica avanzada' },
        { name: 'Royal Blue', hex: '#2563eb', rgb: 'rgb(37, 99, 235)', role: 'Interacciones de navegación activa' }
      ]
    },
    {
      group: 'Comercio, Finanzas & Estados Funcionales',
      tokens: [
        { name: 'Commerce Emerald', hex: '#10b981', rgb: 'rgb(16, 185, 129)', role: 'Ingresos, pagos aprobados, verificación segura' },
        { name: 'Warning Amber', hex: '#f59e0b', rgb: 'rgb(245, 158, 11)', role: 'Puntuaciones de valoración, alertas de moderación' },
        { name: 'Error / Critical Rose', hex: '#f43f5e', rgb: 'rgb(244, 63, 94)', role: 'Errores de validación, cancelaciones y riesgos' }
      ]
    },
    {
      group: 'Jerarquía Tipográfica y Contraste de Texto',
      tokens: [
        { name: 'Text Primary', hex: '#f8fafc', rgb: 'rgb(248, 250, 252)', role: 'Títulos principales, datos numéricos y encabezados' },
        { name: 'Text Secondary', hex: '#cbd5e1', rgb: 'rgb(203, 213, 225)', role: 'Cuerpo de texto, explicaciones y etiquetas' },
        { name: 'Text Muted', hex: '#64748b', rgb: 'rgb(100, 116, 139)', role: 'Metadatos, marcas de tiempo y placeholders' }
      ]
    }
  ];

  const typeScales = [
    { level: 'Display Hero', size: 'text-5xl sm:text-6xl font-black', rem: '3.75rem / 60px', leading: 'leading-[1.1]', usage: 'Títulos principales de landing y propuestas de valor' },
    { level: 'Heading 1 (Page Title)', size: 'text-3xl font-extrabold', rem: '1.875rem / 30px', leading: 'leading-tight', usage: 'Títulos de sección en dashboards y vistas maestras' },
    { level: 'Heading 2 (Card / Section)', size: 'text-lg font-bold', rem: '1.125rem / 18px', leading: 'leading-snug', usage: 'Cabeceras de tarjetas, widgets y modales' },
    { level: 'Body Regular', size: 'text-sm font-normal', rem: '0.875rem / 14px', leading: 'leading-relaxed', usage: 'Párrafos de descripción, especificaciones y notas' },
    { level: 'Body Compact / UI', size: 'text-xs font-medium', rem: '0.75rem / 12px', leading: 'leading-normal', usage: 'Botones, etiquetas de formulario y tablas de datos' },
    { level: 'Technical Mono', size: 'text-xs font-mono font-semibold', rem: '0.75rem / 12px', leading: 'leading-none', usage: 'API keys, webhooks, versiones SemVer y código SQL' }
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20 animate-in fade-in">
      
      {/* Design System Hero */}
      <div className="p-8 sm:p-10 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Design System & Brand Identity • NexusEcom AI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Guía de Identidad Visual & Sistema de Diseño
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Fundamentos de marca, tokens cromáticos, arquitectura tipográfica y componentes visuales que rigen la experiencia de <strong>AI ECOMMERCE APP MARKETPLACE</strong>.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('logos')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'logos' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Suite de Logotipos SVG
        </button>
        <button
          onClick={() => setActiveTab('colors')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'colors' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Palette className="w-4 h-4" />
          Paleta de Color & Tokens
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'typography' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Type className="w-4 h-4" />
          Jerarquía Tipográfica
        </button>
        <button
          onClick={() => setActiveTab('components')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'components' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Layout className="w-4 h-4" />
          Componentes UI Principales
        </button>
        <button
          onClick={() => setActiveTab('principles')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'principles' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Principios de Diseño
        </button>
      </div>

      {/* TAB 1: LOGOS */}
      {activeTab === 'logos' && (
        <div className="space-y-8">
          
          {/* Logo Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Horizontal Full Logo on Dark */}
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Variante 01 • Logotipo Horizontal Primario (Dark Surface)
                </span>
                <div className="py-8 flex items-center justify-center">
                  <BrandLogo variant="full" size="xl" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Uso principal en cabeceras de navegación y landing page.</span>
                <span className="font-mono text-slate-500 text-[11px]">SVG Vectorial</span>
              </div>
            </div>

            {/* Isotype / Icon Mark */}
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Variante 02 • Isotipo Geométrico Nodal (Icon / Favicon)
                </span>
                <div className="py-8 flex items-center justify-center gap-6">
                  <BrandLogo variant="icon" size="sm" />
                  <BrandLogo variant="icon" size="md" />
                  <BrandLogo variant="icon" size="lg" />
                  <BrandLogo variant="icon" size="xl" />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Favicons, app icons móviles y avatares de sistema.</span>
                <span className="font-mono text-slate-500 text-[11px]">48x48 Base Grid</span>
              </div>
            </div>

            {/* Light / High-Contrast Background Test */}
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-100 text-slate-950 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-700 font-bold uppercase tracking-wider">
                  Variante 03 • Contraste en Superficie Clara (Inverted Preview)
                </span>
                <div className="py-8 flex items-center justify-center">
                  <div className="p-3 rounded-2xl bg-slate-950 inline-block shadow-xl">
                    <BrandLogo variant="full" size="lg" />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
                <span>Legibilidad garantizada bajo ratios WCAG AAA.</span>
                <span className="font-mono text-slate-500 text-[11px]">Ratio 18.5:1</span>
              </div>
            </div>

            {/* Geometry Anatomy */}
            <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-4 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                  Anatomía & Significado del Símbolo
                </span>
                <ul className="space-y-3 pt-4 text-xs text-slate-300 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                    <span><strong>Prisma Hexagonal:</strong> Representa la estructura organizada del inventario y la solidez institucional.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                    <span><strong>Nodos Neuronales Interconectados:</strong> Simbolizan la red de agentes de Inteligencia Artificial colaborando en tiempo real.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span><strong>Foco Central Radiante:</strong> El punto de encuentro donde el código generado se convierte en valor económico y ventas reales.</span>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
                Diseño 100% propietario y libre de clichés (sin robots genéricos ni cerebros estándar).
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: COLORS */}
      {activeTab === 'colors' && (
        <div className="space-y-8">
          {colorPalettes.map((group, gIdx) => (
            <div key={gIdx} className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{group.group}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.tokens.map((token, tIdx) => (
                  <div 
                    key={tIdx}
                    onClick={() => copyToClipboard(token.hex, token.name)}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all space-y-3 group"
                  >
                    <div 
                      className="h-16 rounded-xl border border-white/10 shadow-inner flex items-end justify-end p-2"
                      style={{ backgroundColor: token.hex }}
                    >
                      <span className="p-1 rounded bg-black/40 text-[10px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        {copiedToken === token.name ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedToken === token.name ? 'Copiado' : 'Copiar'}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-white">{token.name}</p>
                      <p className="text-[11px] font-mono text-cyan-400 font-semibold">{token.hex}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-tight">{token.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: TYPOGRAPHY */}
      {activeTab === 'typography' && (
        <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Escala Tipográfica Oficial</h3>
            <p className="text-xs text-slate-400">Diseñada para garantizar contraste, legibilidad instantánea y elegancia técnica.</p>
          </div>

          <div className="space-y-6">
            {typeScales.map((scale, sIdx) => (
              <div key={sIdx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 font-mono gap-2 border-b border-slate-800 pb-2">
                  <span className="text-cyan-400 font-bold">{scale.level}</span>
                  <span>{scale.rem} • {scale.leading}</span>
                  <span className="text-slate-400 font-sans">{scale.usage}</span>
                </div>

                <div className={`${scale.size} ${scale.leading} text-white pt-1`}>
                  AI Ecommerce App Marketplace
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: COMPONENTS */}
      {activeTab === 'components' && (
        <div className="space-y-8">
          
          {/* Buttons Showcase */}
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">1. Sistema de Botones & Jerarquías de Acción</h3>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Primary Electric Button */}
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:scale-105 transition-all flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Botón Primario Gradient</span>
              </button>

              {/* Secondary Slate Button */}
              <button className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors">
                Botón Secundario
              </button>

              {/* Success / Action Button */}
              <button className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Acción de Pago / Éxito</span>
              </button>

              {/* Subtle Ghost Button */}
              <button className="px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 text-xs font-semibold transition-colors">
                Botón Terciario / Ghost
              </button>
            </div>
          </div>

          {/* Badges & Chips Showcase */}
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Badges de Estado & Micro-Chips</h3>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                VERIFICADA (SCORE 98/100)
              </span>

              <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold font-mono">
                SHOPIFY OS 2.0
              </span>

              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold font-mono">
                WOOCOMMERCE REST
              </span>

              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                EN REVISIÓN
              </span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 5: PRINCIPLES */}
      {activeTab === 'principles' && (
        <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Los 5 Mandamientos de Diseño</h3>
            <p className="text-xs text-slate-400">Reglas innegociables para toda interfaz que se construya en la plataforma.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">1. Propósito Funcional Estricto (Zero Waste UI)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada botón, icono o tarjeta existe porque realiza una acción de valor económico o de control real. Quedan prohibidos elementos puramente decorativos o sin función.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">2. Simplicidad Radical (Apple Standard)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Una persona sin conocimientos técnicos debe poder crear e instalar una app en menos de 3 clics. La complejidad técnica (OAuth, webhooks, JSON) queda oculta bajo interfaces limpias.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">3. Confianza & Solidez Institucional (Stripe Standard)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Los datos financieros, comisiones, cuentas bancarias y auditorías de seguridad se presentan con tipografía numérica precisa, micro-chips verificados y estados en tiempo real.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-white">4. Rendimiento & Respuesta Inmediata (Linear Standard)</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Las transiciones son instantáneas (&lt;100ms), las animaciones guían la atención sin retrasar la navegación y los bundles son ultraligeros.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
