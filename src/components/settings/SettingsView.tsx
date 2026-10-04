import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  User, 
  Key, 
  ShieldCheck, 
  Bell, 
  Check, 
  CreditCard, 
  Sparkles,
  Layers,
  Copy,
  Lock,
  Mail,
  Smartphone,
  LogOut,
  Shield,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    changePassword, 
    verifyEmail, 
    logout,
    showNotification 
  } = useApp();

  // Profile form
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [companyName, setCompanyName] = useState(currentUser.companyName || '');

  // Password change form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // 2FA state
  const [twoFactor, setTwoFactor] = useState(currentUser.twoFactorEnabled || false);

  const [apiKey] = useState('sk_live_ai_mkt_' + Math.random().toString(36).substring(2, 18));
  const [webhookSecret] = useState('whsec_' + Math.random().toString(36).substring(2, 18));
  const [copiedKey, setCopiedKey] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, email, companyName });
    showNotification('Perfil actualizado correctamente', 'success');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }
    const ok = changePassword(currentPassword, newPassword);
    if (ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
    showNotification('Clave copiada al portapapeles', 'info');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      
      {/* Header */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-blue-950/20 to-slate-900 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Perfil & Seguridad</h1>
          <p className="mt-1 text-sm text-slate-300">
            Gestiona tu cuenta, credenciales de acceso, verificación de correo y claves API.
          </p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-300 hover:text-rose-400 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Email verification notice if not verified */}
      {!currentUser.emailVerified ? (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-300">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>Tu correo electrónico <strong>{currentUser.email}</strong> está pendiente de verificación.</span>
          </div>
          <button
            onClick={verifyEmail}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 transition-colors"
          >
            Verificar Ahora
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Correo electrónico verificado y cuenta asegurada con cifrado OAuth 2.0.</span>
        </div>
      )}

      {/* Profile Details Form */}
      <form onSubmit={handleSaveProfile} className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-blue-400" />
          Información del Perfil ({currentUser.role.toUpperCase()})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-400 block mb-1">Empresa / Nombre Comercial</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          <span>Guardar Cambios de Perfil</span>
        </button>
      </form>

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-400" />
          Cambiar Contraseña
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Contraseña Actual</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Nueva Contraseña</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              required
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all border border-slate-700"
        >
          Actualizar Contraseña
        </button>
      </form>

      {/* Developer API Keys & Webhooks */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-400" />
          Claves API de Producción (Marketplace SDK)
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Secret API Key (Live)</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                readOnly
                value={apiKey}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(apiKey)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">Webhook Secret Signature (HMAC-SHA256)</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                readOnly
                value={webhookSecret}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(webhookSecret)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
