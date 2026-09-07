import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { Store, Save, RotateCcw, X, ShieldAlert } from 'lucide-react';

interface SettingsModalProps {
  settings: StoreSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSaveSettings,
  onResetDemoData,
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Atenção: isto irá recarregar os dados de demonstração com produtos, turnos e vendas padrão. Deseja continuar?')) {
      onResetDemoData();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">Configurações do Bar & Cantina</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nome do Estabelecimento / Cantina:
            </label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-amber-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIF / Contribuinte:
              </label>
              <input
                type="text"
                required
                value={formData.nif}
                onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-amber-600 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Telefone / Contacto:
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-amber-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Endereço / Localização:
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-amber-600 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Moeda do Sistema:
              </label>
              <select
                value={formData.currencySymbol}
                onChange={(e) => {
                  const symbol = e.target.value;
                  const code = symbol === 'Kz' ? 'AOA' : symbol === '€' ? 'EUR' : symbol === 'R$' ? 'BRL' : 'USD';
                  setFormData({ ...formData, currencySymbol: symbol, currency: code });
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:border-amber-600 focus:outline-hidden"
              >
                <option value="Kz">Kwanza (Kz) - Angola</option>
                <option value="€">Euro (€) - Portugal / UE</option>
                <option value="R$">Real (R$) - Brasil</option>
                <option value="$">Dólar ($) - USD</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Taxa de IVA / Imposto (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.taxPercentage}
                onChange={(e) => setFormData({ ...formData, taxPercentage: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-amber-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Mensagem de Rodapé dos Tickets:
            </label>
            <input
              type="text"
              value={formData.receiptFooter}
              onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-amber-600 focus:outline-hidden"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restaurar Dados Demo
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
