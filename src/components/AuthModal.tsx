import React, { useState } from 'react';
import { Employee } from '../types';
import { Lock, UserCheck, X, KeyRound, ShieldAlert } from 'lucide-react';

interface AuthModalProps {
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onSelectEmployee: (emp: Employee) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  employees,
  isOpen,
  onClose,
  onSelectEmployee,
}) => {
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const handleSelect = (emp: Employee) => {
    setSelectedEmp(emp);
    setPin('');
    setErrorMsg('');
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    if (selectedEmp.pin === pin) {
      onSelectEmployee(selectedEmp);
      onClose();
    } else {
      setErrorMsg('PIN incorreto. Verifique com a gerência.');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-slate-900">
              {selectedEmp ? `Entrar como ${selectedEmp.name}` : 'Trocar de Operador / Funcionário'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!selectedEmp ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Selecione o funcionário para autenticar no caixa ou aceder aos recursos do sistema:
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {employees.filter((e) => e.active).map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => handleSelect(emp)}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition flex items-center justify-between group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-700">
                        {emp.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                        {emp.role}
                      </p>
                    </div>
                  </div>
                  <KeyRound className="w-4 h-4 text-slate-300 group-hover:text-amber-500" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handlePinSubmit} className="space-y-4 text-xs">
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-base mx-auto mb-2">
                {selectedEmp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <h4 className="font-bold text-sm text-slate-900">{selectedEmp.name}</h4>
              <p className="text-[11px] text-slate-500 uppercase tracking-wider">{selectedEmp.role}</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 text-center">
                Digite o seu PIN de Acesso (4 dígitos):
              </label>
              <input
                type="password"
                maxLength={6}
                autoFocus
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full py-3 text-center text-2xl font-mono tracking-widest rounded-xl border-2 border-slate-300 focus:border-amber-600 focus:outline-hidden"
              />
              <p className="text-[10px] text-center text-slate-400 mt-1">
                PIN de demonstração: <strong>{selectedEmp.pin}</strong>
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-center font-medium">
                {errorMsg}
              </div>
            )}

            <div className="pt-2 flex justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedEmp(null)}
                className="px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs cursor-pointer"
              >
                Confirmar Acesso
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
