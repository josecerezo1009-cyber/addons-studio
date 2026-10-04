import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  DownloadCloud, 
  CheckCircle2, 
  RefreshCw,
  Zap,
  Layers,
  Sliders
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const { transactions, currentUser, requestPayout, showNotification } = useApp();

  const [calcPrice, setCalcPrice] = useState(29);
  const [calcInstalls, setCalcInstalls] = useState(50);

  const creatorRevenue = calcPrice * calcInstalls * 0.85;
  const platformFee = calcPrice * calcInstalls * 0.15;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 animate-in fade-in">
      
      {/* Finance Header */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Liquidación Financiera & Facturación</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Finanzas & Facturación</h1>
          <p className="mt-1 text-sm text-slate-500">
            Transparencia en comisiones, suscripciones y liquidaciones a cuentas bancarias.
          </p>
        </div>

        <div className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-right">
          <p className="text-[11px] text-slate-500 font-medium">Balance en Cuenta</p>
          <p className="text-2xl font-black text-emerald-600">${currentUser.balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Interactive 85/15 Commission Calculator */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Calculadora de Rendimiento Económico (Reparto 85% / 15%)
          </h3>
          <p className="text-xs text-slate-500">
            Calcula los ingresos netos que generará tu aplicación según el precio de suscripción y las tiendas activas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-700 mb-1 font-semibold">
                <span>Precio Mensual de la App:</span>
                <strong className="text-slate-900 font-bold">${calcPrice} / mes</strong>
              </div>
              <input
                type="range"
                min={5}
                max={299}
                value={calcPrice}
                onChange={(e) => setCalcPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-700 mb-1 font-semibold">
                <span>Tiendas Suscritas:</span>
                <strong className="text-slate-900 font-bold">{calcInstalls} tiendas</strong>
              </div>
              <input
                type="range"
                min={1}
                max={500}
                value={calcInstalls}
                onChange={(e) => setCalcInstalls(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Facturación Bruta:</span>
              <span className="text-slate-900 font-bold">${(calcPrice * calcInstalls).toLocaleString()} / mes</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">Comisión Plataforma (15%):</span>
              <span className="text-slate-500 font-mono">-${platformFee.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-700">Ingreso Neto Creador (85%):</span>
              <span className="text-xl font-black text-emerald-600">${creatorRevenue.toLocaleString()} / mes</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Los pagos se liquidan automáticamente a la cuenta Stripe Express vinculada.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="p-8 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Libro de Transacciones</h3>
            <p className="text-xs text-slate-500">Registro de suscripciones, cobros y liquidaciones.</p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            No hay transacciones registradas todavía. Las nuevas ventas y suscripciones aparecerán aquí en tiempo real.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">ID Transacción</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Detalle / App</th>
                  <th className="py-3 px-4">Bruto</th>
                  <th className="py-3 px-4">Fee 15%</th>
                  <th className="py-3 px-4">Neto</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-medium">{txn.id}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        txn.type === 'sale' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}>
                        {txn.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-900 font-medium">
                      {txn.appName || txn.payoutMethod}
                    </td>
                    <td className="py-3 px-4 text-slate-900 font-bold">${txn.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-slate-400">-${txn.platformFee.toFixed(2)}</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">${txn.netAmount.toFixed(2)}</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase">
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
