import React, { useState } from 'react';
import { Shift, Employee, StoreSettings } from '../types';
import { formatMoney, formatDateTime } from '../utils/storage';
import { 
  Clock, 
  PlusCircle, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  FileText,
  Calendar,
  User,
  ArrowDownRight
} from 'lucide-react';

interface ShiftHistoryViewProps {
  shifts: Shift[];
  currentShift: Shift | null;
  employees: Employee[];
  settings: StoreSettings;
  onOpenNewShift: (employeeId: string, employeeName: string, openingCash: number) => void;
  onSelectShiftToPrint: (shift: Shift) => void;
  onOpenShiftEndModal: () => void;
}

export const ShiftHistoryView: React.FC<ShiftHistoryViewProps> = ({
  shifts,
  currentShift,
  employees,
  settings,
  onOpenNewShift,
  onSelectShiftToPrint,
  onOpenShiftEndModal,
}) => {
  const [showOpenModal, setShowOpenModal] = useState<boolean>(false);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const [initialFloat, setInitialFloat] = useState<string>('10000');
  const [filterEmployee, setFilterEmployee] = useState<string>('all');

  const handleStartShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === selectedEmpId);
    if (!emp) return;
    const floatAmount = parseFloat(initialFloat) || 0;
    onOpenNewShift(emp.id, emp.name, floatAmount);
    setShowOpenModal(false);
  };

  const filteredShifts = shifts.filter((s) => {
    if (filterEmployee !== 'all' && s.employeeId !== filterEmployee) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Current Status */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-lg font-bold text-slate-900">
              Gestão de Turnos & Fecho de Período
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Controle de turnos de funcionários, fundo de caixa inicial, sangrias e auditoria de fecho Z.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {currentShift ? (
            <button
              onClick={onOpenShiftEndModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              Término de Período / Fechar Turno #{currentShift.shiftNumber}
            </button>
          ) : (
            <button
              onClick={() => setShowOpenModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Abrir Novo Turno
            </button>
          )}
        </div>
      </div>

      {/* Current Active Shift Card */}
      {currentShift && (
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white rounded-2xl p-6 border border-amber-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-amber-200/80 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-xs">
                #{currentShift.shiftNumber}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">Turno Atualmente em Curso</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                    ABERTO
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Operador: <strong>{currentShift.employeeName}</strong> • Aberto em: {formatDateTime(currentShift.startTime)}
                </p>
              </div>
            </div>

            <button
              onClick={onOpenShiftEndModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            >
              Ver Resumo & Encerrar Período
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Fundo Inicial:</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                {formatMoney(currentShift.openingCash, settings.currencySymbol)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Total Faturado:</span>
              <span className="font-extrabold text-amber-700 text-sm mt-0.5 block">
                {formatMoney(currentShift.totalSales, settings.currencySymbol)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Vendas em Numerário:</span>
              <span className="font-bold text-emerald-600 text-sm mt-0.5 block">
                {formatMoney(currentShift.totalCash, settings.currencySymbol)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Vendas Cartão / TPA:</span>
              <span className="font-bold text-blue-600 text-sm mt-0.5 block">
                {formatMoney(currentShift.totalCard, settings.currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters & Shifts History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Histórico de Turnos e Fechos de Caixa</h3>
            <p className="text-xs text-slate-500">Consulte relatórios Z passados e reimprima tickets de fecho</p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-600">Filtrar Operador:</label>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:border-amber-600 font-medium"
            >
              <option value="all">Todos os Funcionários</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Turno</th>
                <th className="py-3 px-4">Funcionário</th>
                <th className="py-3 px-4">Abertura / Fecho</th>
                <th className="py-3 px-3 text-right">Fundo Inicial</th>
                <th className="py-3 px-3 text-right">Faturamento Total</th>
                <th className="py-3 px-3 text-right">Dinheiro em Gaveta</th>
                <th className="py-3 px-3 text-center">Diferença (Quebra)</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShifts.map((sh) => (
                <tr key={sh.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                        #{sh.shiftNumber}
                      </span>
                      {sh.status === 'open' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700">
                          ABERTO
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {sh.employeeName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <div>{formatDateTime(sh.startTime)}</div>
                    {sh.endTime && (
                      <div className="text-[10px] text-slate-400">Até: {formatDateTime(sh.endTime)}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                    {formatMoney(sh.openingCash, settings.currencySymbol)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                    {formatMoney(sh.totalSales, settings.currencySymbol)}
                  </td>
                  <td className="py-3.5 px-3 text-right font-semibold text-emerald-700">
                    {formatMoney(sh.closingCashReported ?? (sh.openingCash + sh.totalCash), settings.currencySymbol)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    {sh.cashDifference === undefined || sh.status === 'open' ? (
                      <span className="text-slate-400">-</span>
                    ) : sh.cashDifference === 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        Correto (0.00)
                      </span>
                    ) : sh.cashDifference < 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200">
                        {formatMoney(sh.cashDifference, settings.currencySymbol)}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                        +{formatMoney(sh.cashDifference, settings.currencySymbol)}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onSelectShiftToPrint(sh)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition cursor-pointer"
                      title="Imprimir Relatório Z de Fecho"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-600" />
                      Ticket Z
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Abrir Novo Turno */}
      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Abertura de Novo Turno</h3>
              </div>
              <button
                onClick={() => setShowOpenModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStartShiftSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Funcionário / Operador do Turno:
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                >
                  {employees.filter((x) => x.active).map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Fundo de Caixa Inicial / Troco ({settings.currencySymbol}):
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Ex: 10000"
                  value={initialFloat}
                  onChange={(e) => setInitialFloat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-base text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Valor em dinheiro físico colocado na gaveta para trocos no início do turno.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowOpenModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Iniciar Turno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
