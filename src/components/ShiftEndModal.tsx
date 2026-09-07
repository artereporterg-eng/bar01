import React, { useState, useMemo } from 'react';
import { Shift, Sale, StoreSettings, CashDrop } from '../types';
import { formatMoney, formatDateTime } from '../utils/storage';
import { 
  X, 
  Clock, 
  Coins, 
  CreditCard, 
  ArrowDownRight, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  PackageCheck, 
  FileText,
  UserCheck,
  DollarSign
} from 'lucide-react';

interface ShiftEndModalProps {
  currentShift: Shift | null;
  shiftSales: Sale[];
  settings: StoreSettings;
  onClose: () => void;
  onConfirmCloseShift: (
    closingCashReported: number, 
    notes: string, 
    onSuccessPrint: (closedShift: Shift) => void
  ) => void;
  onAddCashDrop: (type: 'sangria' | 'suprimento', amount: number, reason: string) => void;
}

export const ShiftEndModal: React.FC<ShiftEndModalProps> = ({
  currentShift,
  shiftSales,
  settings,
  onClose,
  onConfirmCloseShift,
  onAddCashDrop,
}) => {
  if (!currentShift) return null;

  const [activeTab, setActiveTab] = useState<'resumo' | 'produtos' | 'movimentos'>('resumo');
  const [reportedCash, setReportedCash] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Quick cash drop / sangria modal state
  const [showDropModal, setShowDropModal] = useState<boolean>(false);
  const [dropType, setDropType] = useState<'sangria' | 'suprimento'>('sangria');
  const [dropAmount, setDropAmount] = useState<string>('');
  const [dropReason, setDropReason] = useState<string>('');

  // Calculate items sold in this specific shift
  const productsSold = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; total: number; unitPrice: number }>();
    
    shiftSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = map.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.total += item.total;
        } else {
          map.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            total: item.total,
            unitPrice: item.unitPrice,
          });
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
  }, [shiftSales]);

  // Financial calculations
  const totalSales = currentShift.totalSales;
  const cashSales = currentShift.totalCash;
  const cardSales = currentShift.totalCard;
  const transferSales = currentShift.totalTransfer;

  const totalSangrias = (currentShift.cashDrops || [])
    .filter((d) => d.type === 'sangria')
    .reduce((acc, d) => acc + d.amount, 0);

  const totalSuprimentos = (currentShift.cashDrops || [])
    .filter((d) => d.type === 'suprimento')
    .reduce((acc, d) => acc + d.amount, 0);

  // Expected cash in the register drawer = Opening cash + Cash sales + Suprimentos - Sangrias
  const expectedCash = currentShift.openingCash + cashSales + totalSuprimentos - totalSangrias;

  // Difference calculation
  const numericReported = reportedCash === '' ? null : parseFloat(reportedCash) || 0;
  const cashDifference = numericReported !== null ? numericReported - expectedCash : null;

  // Turn time duration
  const startTime = new Date(currentShift.startTime);
  const now = new Date();
  const diffHours = Math.max(0, Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60 * 60)));
  const diffMinutes = Math.max(0, Math.floor(((now.getTime() - startTime.getTime()) % (1000 * 60 * 60)) / (1000 * 60)));

  const handleCreateCashDrop = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(dropAmount);
    if (!amt || amt <= 0) return;
    if (!dropReason.trim()) return;

    onAddCashDrop(dropType, amt, dropReason);
    setDropAmount('');
    setDropReason('');
    setShowDropModal(false);
  };

  const handleCloseShift = () => {
    if (numericReported === null) {
      alert('Por favor, informe a contagem física do dinheiro existente na gaveta.');
      return;
    }

    setIsSubmitting(true);
    onConfirmCloseShift(numericReported, notes, (closed) => {
      setIsSubmitting(false);
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col my-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-amber-200">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Término de Período de Vendas</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-xs font-semibold uppercase tracking-wide border border-amber-400/30">
                  Turno Ativo #{currentShift.shiftNumber}
                </span>
              </div>
              <p className="text-xs text-amber-100/90 flex items-center gap-2 mt-0.5">
                <span>Operador: <strong>{currentShift.employeeName}</strong></span>
                <span>•</span>
                <span>Aberto às: {formatDateTime(currentShift.startTime)}</span>
                <span>•</span>
                <span>Duração: {diffHours}h {diffMinutes}min</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2">
          <button
            onClick={() => setActiveTab('resumo')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'resumo'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4" />
            Balanço Financeiro e Caixa
          </button>
          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'produtos'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            Tudo o que foi Vendido ({productsSold.reduce((acc, p) => acc + p.quantity, 0)} itens)
          </button>
          <button
            onClick={() => setActiveTab('movimentos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${
              activeTab === 'movimentos'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            Sangrias e Entradas ({currentShift.cashDrops?.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {activeTab === 'resumo' && (
            <div className="space-y-6">
              {/* Financial Quick Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500 font-medium block">Total Faturado</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">
                    {formatMoney(totalSales, settings.currencySymbol)}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    {currentShift.salesCount} vendas realizadas
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                  <span className="text-xs text-emerald-700 font-medium block">Vendas em Numerário</span>
                  <span className="text-lg font-bold text-emerald-800 mt-1 block">
                    {formatMoney(cashSales, settings.currencySymbol)}
                  </span>
                  <span className="text-[11px] text-emerald-600 mt-0.5 block">
                    Entradas em dinheiro
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80">
                  <span className="text-xs text-blue-700 font-medium block">Cartão / TPA</span>
                  <span className="text-lg font-bold text-blue-800 mt-1 block">
                    {formatMoney(cardSales, settings.currencySymbol)}
                  </span>
                  <span className="text-[11px] text-blue-600 mt-0.5 block">
                    Pagamentos eletrónicos
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80">
                  <span className="text-xs text-purple-700 font-medium block">Transferência / PIX</span>
                  <span className="text-lg font-bold text-purple-800 mt-1 block">
                    {formatMoney(transferSales, settings.currencySymbol)}
                  </span>
                  <span className="text-[11px] text-purple-600 mt-0.5 block">
                    Bancos / QR Code
                  </span>
                </div>
              </div>

              {/* Cash Reconciliation Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      Conferência da Gaveta de Dinheiro Físico
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verificação do dinheiro em cofre/gaveta antes de finalizar o turno
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDropModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
                    Registar Sangria / Suprimento
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Fundo de Caixa Inicial (Abertura):</span>
                      <span className="font-semibold text-slate-800">
                        {formatMoney(currentShift.openingCash, settings.currencySymbol)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>(+) Vendas em Dinheiro:</span>
                      <span className="font-semibold text-emerald-600">
                        + {formatMoney(cashSales, settings.currencySymbol)}
                      </span>
                    </div>
                    {totalSuprimentos > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>(+) Suprimentos de Troco:</span>
                        <span className="font-semibold text-blue-600">
                          + {formatMoney(totalSuprimentos, settings.currencySymbol)}
                        </span>
                      </div>
                    )}
                    {totalSangrias > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>(-) Sangrias (Retiradas):</span>
                        <span className="font-semibold text-rose-600">
                          - {formatMoney(totalSangrias, settings.currencySymbol)}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-sm">
                      <span>Dinheiro Esperado em Gaveta:</span>
                      <span className="text-amber-700 font-extrabold">
                        {formatMoney(expectedCash, settings.currencySymbol)}
                      </span>
                    </div>
                  </div>

                  {/* Cash counted input */}
                  <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Dinheiro Físico Contado na Gaveta ({settings.currencySymbol}):
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder={`Ex: ${expectedCash}`}
                        value={reportedCash}
                        onChange={(e) => setReportedCash(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-amber-600 focus:outline-hidden text-base font-bold text-slate-900 bg-amber-50/20"
                      />
                    </div>

                    {numericReported !== null && (
                      <div
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          cashDifference === 0
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : cashDifference! < 0
                            ? 'bg-rose-50 border-rose-300 text-rose-800'
                            : 'bg-blue-50 border-blue-300 text-blue-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {cashDifference === 0 ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          )}
                          <span className="font-bold">
                            {cashDifference === 0
                              ? 'Gaveta Exata (Sem Quebra)'
                              : cashDifference! < 0
                              ? 'Quebra de Caixa (Falta)'
                              : 'Sobra de Caixa (Excesso)'}
                          </span>
                        </div>
                        <span className="font-extrabold text-sm">
                          {cashDifference! >= 0 ? '+' : ''}
                          {formatMoney(cashDifference!, settings.currencySymbol)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes / Observações */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações / Justificativas do Turno (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Turno encerrado às 22h, sobra de 500 Kz referente a gorjeta coletiva, reposição de cerveja concluída."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-amber-600 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Everything sold in this shift */}
          {activeTab === 'produtos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Itens Vendidos no Turno #{currentShift.shiftNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Resumo detalhado de quantidades para controle de balcão e cantina
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold">
                  {productsSold.length} produtos diferentes vendidos
                </span>
              </div>

              {productsSold.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <PackageCheck className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">Nenhuma venda registrada neste turno ainda.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Produto</th>
                        <th className="py-3 px-3 text-right">Preço Unit.</th>
                        <th className="py-3 px-3 text-center">Qtd Vendida</th>
                        <th className="py-3 px-4 text-right">Total Faturado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {productsSold.map((prod, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-4 font-semibold text-slate-800">
                            {prod.name}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500">
                            {formatMoney(prod.unitPrice, settings.currencySymbol)}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-amber-700">
                            <span className="px-2 py-0.5 bg-amber-50 rounded-full border border-amber-200/60">
                              {prod.quantity}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                            {formatMoney(prod.total, settings.currencySymbol)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                      <tr>
                        <td className="py-3 px-4">TOTAL CONSOLIDADO</td>
                        <td></td>
                        <td className="py-3 px-3 text-center text-amber-800 font-extrabold text-sm">
                          {productsSold.reduce((acc, p) => acc + p.quantity, 0)} itens
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-sm text-slate-900">
                          {formatMoney(totalSales, settings.currencySymbol)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Sangrias and Suprimentos */}
          {activeTab === 'movimentos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Histórico de Sangrias e Suprimentos
                  </h3>
                  <p className="text-xs text-slate-500">
                    Retiradas para cofre ou inserções de troco durante o expediente
                  </p>
                </div>
                <button
                  onClick={() => setShowDropModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Nova Sangria / Suprimento
                </button>
              </div>

              {(!currentShift.cashDrops || currentShift.cashDrops.length === 0) ? (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <ArrowDownRight className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">Nenhuma sangria ou suprimento registrado neste turno.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentShift.cashDrops.map((drop) => (
                    <div
                      key={drop.id}
                      className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs bg-slate-50/60"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            drop.type === 'sangria'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {drop.type === 'sangria' ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 uppercase">
                              {drop.type === 'sangria' ? 'Sangria (Retirada)' : 'Suprimento (Entrada de Troco)'}
                            </span>
                            <span className="text-[10px] text-slate-400">• {drop.time}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{drop.reason}</p>
                        </div>
                      </div>
                      <span
                        className={`font-bold text-sm ${
                          drop.type === 'sangria' ? 'text-rose-700' : 'text-blue-700'
                        }`}
                      >
                        {drop.type === 'sangria' ? '-' : '+'}
                        {formatMoney(drop.amount, settings.currencySymbol)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition cursor-pointer"
          >
            Continuar Vendas (Voltar ao PDV)
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseShift}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-4 h-4" />
              Confirmar Fecho de Turno e Imprimir Relatório Z
            </button>
          </div>
        </div>

        {/* Sangria / Suprimento Sub-Modal */}
        {showDropModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm p-5 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-bold text-sm text-slate-900">
                  Registar Movimento de Caixa
                </h4>
                <button
                  onClick={() => setShowDropModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCashDrop} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDropType('sangria')}
                      className={`py-2 px-3 rounded-lg border font-semibold text-xs cursor-pointer ${
                        dropType === 'sangria'
                          ? 'bg-rose-50 border-rose-500 text-rose-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Sangria (Retirada)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDropType('suprimento')}
                      className={`py-2 px-3 rounded-lg border font-semibold text-xs cursor-pointer ${
                        dropType === 'suprimento'
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      Suprimento (Entrada)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Valor ({settings.currencySymbol}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ex: 5000"
                    value={dropAmount}
                    onChange={(e) => setDropAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-sm text-slate-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Motivo / Justificativa:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Recolha para cofre da gerência"
                    value={dropReason}
                    onChange={(e) => setDropReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:border-amber-600 focus:outline-hidden"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDropModal(false)}
                    className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                  >
                    Gravar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
