import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  X, 
  Store, 
  Code2, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  Check,
  Lock,
  Mail,
  User,
  KeyRound,
  Shield,
  ArrowLeft
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'forgot_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialMode = 'login' }) => {
  const { 
    login, 
    register, 
    requestPasswordReset, 
    setActiveRole, 
    setCurrentView, 
    showNotification 
  } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>(initialMode);
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('merchant');
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      const ok = login(email, password);
      if (ok) {
        onClose();
        setCurrentView('dashboard');
      }
    } else if (mode === 'register') {
      if (!termsAccepted) {
        showNotification('Debes aceptar los términos y condiciones', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showNotification('Las contraseñas no coinciden', 'error');
        return;
      }
      const ok = register(name, email, password, selectedRole);
      if (ok) {
        onClose();
        setCurrentView('dashboard');
      }
    } else if (mode === 'forgot_password') {
      const ok = requestPasswordReset(email);
      if (ok) {
        setMode('login');
      }
    }
  };

  const handleQuickRoleSelect = (role: UserRole) => {
    setActiveRole(role);
    setCurrentView('dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Tabs */}
        {mode !== 'forgot_password' && (
          <div className="flex border-b border-slate-800 pb-3 gap-6">
            <button
              onClick={() => setMode('login')}
              className={`text-sm font-bold pb-1 transition-all ${
                mode === 'login' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setMode('register')}
              className={`text-sm font-bold pb-1 transition-all ${
                mode === 'register' ? 'text-white border-b-2 border-blue-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              Crear Cuenta
            </button>
          </div>
        )}

        {/* FORGOT PASSWORD HEADER */}
        {mode === 'forgot_password' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('login')}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-bold text-white">Recuperar Contraseña</h3>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Elena Rostova"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Profesional</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {mode !== 'forgot_password' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-300">Contraseña</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot_password')}
                    className="text-[11px] text-blue-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Perfil Principal</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('merchant')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      selectedRole === 'merchant'
                        ? 'bg-blue-600/15 border-blue-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <p className="font-bold text-white">Tienda / Comprador</p>
                    <p className="text-[10px] text-slate-400">Instalar apps y vender</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('creator')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      selectedRole === 'creator'
                        ? 'bg-blue-600/15 border-blue-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <p className="font-bold text-white">Creador / Developer</p>
                    <p className="text-[10px] text-slate-400">Crear y vender apps</p>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="terms" className="text-[11px] text-slate-400">
                  Acepto los términos de servicio, política de comisiones 85/15 y GDPR.
                </label>
              </div>
            </>
          )}

          {mode === 'login' && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Mantener sesión activa</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <span>{
              mode === 'login' ? 'Iniciar Sesión en el Portal' :
              mode === 'register' ? 'Crear Cuenta y Comenzar' :
              'Enviar Enlace de Recuperación'
            }</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Access with verified platform accounts */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
            O accede con una cuenta corporativa registrada:
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => handleQuickRoleSelect('merchant')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-center truncate"
              title="Cuenta Elena Rostova (Merchant)"
            >
              Comerciante
            </button>
            <button
              onClick={() => handleQuickRoleSelect('creator')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-cyan-400 font-semibold text-center truncate"
              title="Cuenta Carlos Mendoza (Creador / Developer)"
            >
              Creador
            </button>
            <button
              onClick={() => handleQuickRoleSelect('admin')}
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-purple-400 font-semibold text-center truncate"
              title="Cuenta Alex Rivera (Super Admin)"
            >
              Administrador
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
