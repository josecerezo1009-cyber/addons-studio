import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, EcommercePlatform } from '../../types';
import { 
  Sparkles, 
  Store, 
  Code2, 
  Building2, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Zap,
  Globe,
  Layers,
  X
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete, onClose }) => {
  const { setActiveRole, updateUserProfile, addStore, showNotification, setCurrentView } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedRole, setSelectedRole] = useState<UserRole>('merchant');
  
  // Step 2 state: User profile
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');

  // Step 3 state: Role-specific setup (Store URL for merchant vs Stripe/Dev info for creator)
  const [storePlatform, setStorePlatform] = useState<EcommercePlatform>('shopify');
  const [storeUrl, setStoreUrl] = useState('');
  const [stripeAccount, setStripeAccount] = useState('ES8921-STRIPE-EXPRESS');
  const [selectedGoal, setSelectedGoal] = useState('recover_carts');

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!name.trim()) {
        showNotification('Por favor ingresa tu nombre', 'error');
        return;
      }
      updateUserProfile({
        name,
        companyName: companyName || (selectedRole === 'merchant' ? 'Mi Tienda Online' : 'App Studio'),
        email: email || 'usuario@empresa.com',
        role: selectedRole
      });
      setActiveRole(selectedRole);
      setStep(3);
    } else if (step === 3) {
      if (selectedRole === 'merchant' && storeUrl.trim()) {
        const clean = storeUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        addStore({
          id: `store_${Date.now()}`,
          name: companyName || `${clean.split('.')[0].toUpperCase()} Store`,
          platform: storePlatform,
          url: `https://${clean}`,
          status: 'connected',
          connectedAt: new Date().toISOString(),
          lastSync: 'Recién conectada',
          stats: {
            revenue: 15400,
            orders: 180,
            products: 65,
            currency: 'USD'
          }
        });
      }
      setStep(4);
    } else if (step === 4) {
      onComplete();
      if (selectedRole === 'creator') {
        setCurrentView('builder');
      } else {
        setCurrentView('marketplace');
      }
      showNotification('¡Bienvenido a bordo! Tu espacio de trabajo está listo.', 'success');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-6 sm:p-8 relative space-y-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Wizard Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
            <span>Paso {step} de 4: {
              step === 1 ? 'Selección de Rol' :
              step === 2 ? 'Datos de Cuenta' :
              step === 3 ? 'Configuración Inicial' : '¡Todo Listo!'
            }</span>
            <span className="font-mono text-cyan-400">{step * 25}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${step * 25}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center space-y-1 pb-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">¿Cómo vas a usar la plataforma?</h2>
              <p className="text-xs text-slate-400">Personalizaremos tu experiencia según tus objetivos principales.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('merchant')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedRole === 'merchant'
                    ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                    <Store className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Tengo una Tienda</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Instalar apps en 1 clic para aumentar la conversión y automatizar operaciones.
                  </p>
                </div>
                <span className="text-[10px] text-emerald-400 font-semibold mt-3">Shopify • WooCommerce • PrestaShop</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('creator')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedRole === 'creator'
                    ? 'bg-blue-600/15 border-blue-500 text-white ring-1 ring-blue-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Soy Creador / Developer</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Crear aplicaciones con IA, publicarlas en el marketplace y cobrar el 85% neto.
                  </p>
                </div>
                <span className="text-[10px] text-cyan-400 font-semibold mt-3">Stripe Express • Reparto 85/15</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Profile info */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center space-y-1 pb-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Completa tu Perfil Profesional</h2>
              <p className="text-xs text-slate-400">Tus datos para la facturación y la gestión de aplicaciones.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Tu Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Elena Rostova"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  {selectedRole === 'merchant' ? 'Nombre de tu Tienda o Marca' : 'Nombre de tu Estudio / Empresa'}
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={selectedRole === 'merchant' ? 'Nordic Living Store' : 'AppStack Labs'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email Profesional</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@empresa.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Connect Store or Payout Account */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center space-y-1 pb-2">
              <h2 className="text-xl font-bold text-white tracking-tight">
                {selectedRole === 'merchant' ? 'Conecta tu Tienda Online' : 'Configura tus Cobros con Stripe'}
              </h2>
              <p className="text-xs text-slate-400">
                {selectedRole === 'merchant'
                  ? 'Permite la instalación en 1 clic e indexación de catálogos.'
                  : 'Para recibir tus transferencias semanales del 85% de comisión.'}
              </p>
            </div>

            {selectedRole === 'merchant' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Plataforma Ecommerce</label>
                  <select
                    value={storePlatform}
                    onChange={(e) => setStorePlatform(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="shopify">Shopify Plus / OS 2.0</option>
                    <option value="woocommerce">WooCommerce</option>
                    <option value="prestashop">PrestaShop</option>
                    <option value="bigcommerce">BigCommerce</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">URL de la Tienda</label>
                  <input
                    type="text"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    placeholder="mitienda.myshopify.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Conexión cifrada OAuth 2.0. Puedes conectar más tiendas luego.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      Stripe Express Connect
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                      Verificación Instantánea
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Cuenta para transferencias periódicas directas a tu banco.</p>
                  <input
                    type="text"
                    value={stripeAccount}
                    onChange={(e) => setStripeAccount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300">
                  <strong>Reparto Garantizado:</strong> 85% de cada suscripción mensual va directo a tu cuenta de Stripe.
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Ready to Start */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in py-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">¡Configuración Completada con Éxito!</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                {selectedRole === 'merchant'
                  ? 'Tu tienda está vinculada. Ahora puedes explorar el Marketplace o generar una aplicación a medida para recuperar carritos y aumentar el ticket medio.'
                  : 'Tu entorno de creador está preparado. Puedes utilizar el AI App Builder para diseñar, compilar y publicar tu primera aplicación en minutos.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Perfil y permisos configurados</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Motor Gemini 3.8 Flash listo para arquitectura</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pasarela de transacciones y webhooks activos</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Atrás</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-105 ml-auto"
          >
            <span>{step === 4 ? 'Ir a mi Espacio de Trabajo' : 'Continuar'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
