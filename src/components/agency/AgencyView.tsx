import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AgencyClient, EcommercePlatform } from '../../types';
import { 
  Building2, 
  Store, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  DollarSign, 
  ExternalLink, 
  Layers, 
  Users,
  Shield,
  Search
} from 'lucide-react';

export const AgencyView: React.FC = () => {
  const { agencyClients, addAgencyClient, apps, showNotification } = useApp();

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientRetainer, setClientRetainer] = useState(1500);

  const totalRetainers = agencyClients.reduce((acc, c) => acc + c.monthlyRetainer, 0);
  const totalClientStores = agencyClients.reduce((acc, c) => acc + c.storesCount, 0);
  const totalClientApps = agencyClients.reduce((acc, c) => acc + c.activeAppsCount, 0);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientCompany.trim()) return;

    const newClient: AgencyClient = {
      id: `cli_${Date.now()}`,
      name: clientName,
      company: clientCompany,
      email: clientEmail,
      storesCount: 1,
      activeAppsCount: 2,
      monthlyRetainer: clientRetainer,
      status: 'active',
      createdAt: new Date().toISOString(),
      assignedStores: [
        {
          storeName: `${clientCompany} Flagship`,
          platform: 'shopify',
          url: `https://${clientCompany.toLowerCase().replace(/\s+/g, '')}.myshopify.com`,
          installedApps: ['CartRecover AI Pro', 'DynamicUpsell AI Post-Purchase']
        }
      ]
    };

    addAgencyClient(newClient);
    setIsAddingClient(false);
    setClientName('');
    setClientCompany('');
    setClientEmail('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      
      {/* Agency Header */}
      <div className="p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Gestión Centralizada Multi-Cliente & Partners</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Portal de Agencia</h1>
          <p className="mt-1 text-sm text-slate-300">
            Administra las tiendas de tus clientes, despliega aplicaciones con IA y monitoriza ingresos por servicios de optimización.
          </p>
        </div>

        <button
          onClick={() => setIsAddingClient(!isAddingClient)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 flex items-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* Agency Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <p className="text-xs font-semibold text-slate-400">Facturación Mensual por Retainers</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">${totalRetainers.toLocaleString()} <span className="text-xs font-normal text-slate-400">/mes</span></p>
          <p className="text-[11px] text-slate-500 mt-1">{agencyClients.length} cuentas corporativas activas</p>
        </div>

        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <p className="text-xs font-semibold text-slate-400">Tiendas de Clientes Gestionadas</p>
          <p className="text-2xl font-black text-white mt-1">{totalClientStores}</p>
          <p className="text-[11px] text-slate-500 mt-1">Shopify Plus, WooCommerce y PrestaShop</p>
        </div>

        <div className="p-6 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-lg">
          <p className="text-xs font-semibold text-slate-400">Apps Desplegadas en Clientes</p>
          <p className="text-2xl font-black text-purple-400 mt-1">{totalClientApps}</p>
          <p className="text-[11px] text-slate-500 mt-1">Con licencia de agencia multi-sede</p>
        </div>
      </div>

      {/* Add Client Form */}
      {isAddingClient && (
        <form onSubmit={handleCreateClient} className="p-8 rounded-3xl border border-purple-500/40 bg-slate-900 shadow-2xl space-y-4 animate-in fade-in">
          <h3 className="text-base font-bold text-white">Alta de Cuenta de Cliente</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre del Contacto</label>
              <input
                type="text"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Nombre de la Empresa / Marca</label>
              <input
                type="text"
                required
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                placeholder="Moda Mediterránea S.L."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Email Corporativo</label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="contacto@empresa.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Cuota Mensual de Agencia ($)</label>
              <input
                type="number"
                value={clientRetainer}
                onChange={(e) => setClientRetainer(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingClient(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all"
            >
              Guardar Cliente
            </button>
          </div>
        </form>
      )}

      {/* Clients List */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-white">Cartera de Clientes</h3>

        <div className="space-y-4">
          {agencyClients.map((client) => (
            <div
              key={client.id}
              className="p-6 sm:p-8 rounded-3xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 transition-all space-y-6 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-lg font-bold text-white">{client.company}</h4>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono">
                      {client.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Contacto: {client.name} • {client.email}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-400">Cuota Mensual</p>
                  <p className="text-xl font-bold text-emerald-400">${client.monthlyRetainer.toLocaleString()}/mes</p>
                </div>
              </div>

              {/* Assigned stores */}
              <div className="space-y-3 pt-4 border-t border-slate-800/80">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tiendas y Aplicaciones Asignadas:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.assignedStores.map((s, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{s.storeName}</span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                          {s.platform}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-400 font-mono">{s.url}</p>

                      <div className="pt-2 border-t border-slate-800/80">
                        <p className="text-[10px] text-slate-500 font-semibold mb-1">Apps Activas:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.installedApps.map((appTitle, aIdx) => (
                            <span key={aIdx} className="text-[10px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/30">
                              {appTitle}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
