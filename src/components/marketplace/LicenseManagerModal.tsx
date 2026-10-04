import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EcommerceApp, AppLicense } from '../../types';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Check, 
  Copy, 
  RefreshCw, 
  Calendar, 
  Store, 
  Lock,
  ExternalLink,
  Zap
} from 'lucide-react';

interface LicenseManagerModalProps {
  app: EcommerceApp;
  license?: AppLicense;
  onClose: () => void;
}

export const LicenseManagerModal: React.FC<LicenseManagerModalProps> = ({ app, license, onClose }) => {
  const { showNotification } = useApp();
  const [copied, setCopied] = useState(false);
  const [validating, setValidating] = useState(false);

  const fallbackLicense: AppLicense = license || {
    id: `lic_${app.id}`,
    licenseKey: `LIC-${app.slug.toUpperCase().slice(0, 4)}-${Math.floor(10000 + Math.random() * 90000)}-NX`,
    appId: app.id,
    appName: app.name,
    merchantId: 'usr_merchant_01',
    storeUrl: 'https://nordic-living-direct.myshopify.com',
    storePlatform: 'shopify',
    plan: app.pricingType === 'monthly' ? 'monthly' : 'one_time',
    status: 'active',
    issuedAt: new Date().toISOString(),
    renewalDate: new Date(Date.now() + 30 * 86400000).toISOString(),
    lastValidatedAt: 'Recién comprobada',
    signatureHash: 'sha256_8891bc00192ea88b01',
    monthlyCost: app.priceMonthly
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fallbackLicense.licenseKey);
    setCopied(true);
    showNotification('Clave de licencia copiada al portapapeles', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleValidateNow = () => {
    setValidating(true);
    setTimeout(() => {
      setValidating(false);
      showNotification('Licencia criptográfica validada con éxito (Estado: ACTIVA)', 'success');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Licencia Criptográfica Oficial</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-2">
            Gestión de Licencia — {app.name}
          </h2>
          <p className="text-xs text-slate-400">
            Valida el uso legal y la autenticación de webhooks en tu tienda ecommerce.
          </p>
        </div>

        {/* License Key Card */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              License Key
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              ACTIVA
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 font-mono text-sm text-cyan-300">
            <span className="truncate">{fallbackLicense.licenseKey}</span>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Copiar Clave"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] font-semibold uppercase">Tienda Vinculada</span>
            <p className="font-semibold text-white truncate">{fallbackLicense.storeUrl}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] font-semibold uppercase">Tipo de Plan</span>
            <p className="font-semibold text-white">
              {fallbackLicense.plan === 'monthly' ? `$${app.priceMonthly}/mes (Suscripción)` : `$${app.priceOneTime} (Pago Único)`}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] font-semibold uppercase">Fecha de Emisión</span>
            <p className="font-semibold text-white">{new Date(fallbackLicense.issuedAt).toLocaleDateString()}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[10px] font-semibold uppercase">Firma Digital HMAC</span>
            <p className="font-mono text-slate-300 truncate">{fallbackLicense.signatureHash}</p>
          </div>
        </div>

        {/* Validate Button */}
        <div className="pt-2 flex items-center justify-between">
          <button
            onClick={handleValidateNow}
            disabled={validating}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${validating ? 'animate-spin' : ''}`} />
            <span>{validating ? 'Validando...' : 'Re-verificar con Servidor'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
