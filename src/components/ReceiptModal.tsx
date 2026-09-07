import React from 'react';
import { Sale, Shift, StoreSettings } from '../types';
import { formatMoney, formatDateTime } from '../utils/storage';
import { Printer, X, CheckCircle, Receipt, Clock, User, Store } from 'lucide-react';

interface ReceiptModalProps {
  sale?: Sale | null;
  shift?: Shift | null; // Can also print Shift Close (Z-Report)
  settings: StoreSettings;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  sale,
  shift,
  settings,
  onClose,
}) => {
  if (!sale && !shift) return null;

  const handlePrint = () => {
    window.print();
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'dinheiro': return 'Dinheiro / Numerário';
      case 'cartao_tpa': return 'Cartão Bancário / TPA';
      case 'transferencia_pix': return 'Transferência / MBWay / PIX';
      case 'fiado': return 'Conta Assinada / A Prazo';
      default: return method;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="no-print bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-base">
              {shift ? 'Resumo de Término de Turno (Z)' : 'Ticket de Venda'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="no-print bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-slate-500">
            Formato Térmico 80mm / A4
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir Ticket
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-medium transition cursor-pointer"
            >
              Concluído
            </button>
          </div>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 bg-slate-100/50 flex justify-center overflow-y-auto max-h-[70vh]">
          <div
            id="printable-receipt"
            className="bg-white p-6 shadow-sm rounded-lg border border-slate-300 w-full max-w-[340px] text-slate-900 font-mono-receipt text-xs leading-relaxed"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="flex justify-center mb-1">
                <Store className="w-6 h-6 text-slate-700" />
              </div>
              <h2 className="font-bold text-sm uppercase tracking-wide">
                {settings.storeName}
              </h2>
              <p className="text-[11px] text-slate-600">{settings.address}</p>
              <p className="text-[11px] text-slate-600">Tel: {settings.phone}</p>
              <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                NIF: {settings.nif}
              </p>
            </div>

            {/* Shift Close Z-Report */}
            {shift && (
              <div className="pt-3">
                <div className="text-center py-1 bg-slate-100 rounded mb-3">
                  <p className="font-bold text-xs uppercase tracking-wider">
                    FECHO DE PERÍODO DE VENDAS
                  </p>
                  <p className="text-[10px] text-slate-600">RELATÓRIO Z DE TURNO</p>
                </div>

                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Turno Nº:</span>
                    <span className="font-bold">#{shift.shiftNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Operador:</span>
                    <span className="font-semibold">{shift.employeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Abertura:</span>
                    <span>{formatDateTime(shift.startTime)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fecho:</span>
                    <span>{shift.endTime ? formatDateTime(shift.endTime) : 'Em curso'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Transações:</span>
                    <span className="font-bold">{shift.salesCount} vendas</span>
                  </div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
                  <p className="font-bold text-slate-700 uppercase text-[10px]">
                    Totais por Meio de Pagamento:
                  </p>
                  <div className="flex justify-between">
                    <span>Vendas em Numerário:</span>
                    <span className="font-semibold">{formatMoney(shift.totalCash, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vendas Cartão / TPA:</span>
                    <span className="font-semibold">{formatMoney(shift.totalCard, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transferência / Outros:</span>
                    <span className="font-semibold">{formatMoney(shift.totalTransfer, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-xs">
                    <span>FATURAMENTO TURNO:</span>
                    <span>{formatMoney(shift.totalSales, settings.currencySymbol)}</span>
                  </div>
                </div>

                <div className="py-2 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
                  <p className="font-bold text-slate-700 uppercase text-[10px]">
                    Conferência da Gaveta de Dinheiro:
                  </p>
                  <div className="flex justify-between">
                    <span>Fundo de Caixa Inicial:</span>
                    <span>{formatMoney(shift.openingCash, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entradas Vendas Dinheiro:</span>
                    <span>+ {formatMoney(shift.totalCash, settings.currencySymbol)}</span>
                  </div>
                  {shift.cashDrops?.map((d) => (
                    <div key={d.id} className="flex justify-between text-slate-600">
                      <span>Sangria ({d.reason.slice(0, 18)}):</span>
                      <span>- {formatMoney(d.amount, settings.currencySymbol)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                    <span>Dinheiro Físico Esperado:</span>
                    <span>{formatMoney(shift.closingCashExpected ?? (shift.openingCash + shift.totalCash), settings.currencySymbol)}</span>
                  </div>
                  {shift.closingCashReported !== undefined && (
                    <div className="flex justify-between font-bold">
                      <span>Dinheiro Contado Informado:</span>
                      <span>{formatMoney(shift.closingCashReported, settings.currencySymbol)}</span>
                    </div>
                  )}
                  {shift.cashDifference !== undefined && (
                    <div className={`flex justify-between font-bold ${shift.cashDifference === 0 ? 'text-emerald-700' : shift.cashDifference < 0 ? 'text-rose-700' : 'text-blue-700'}`}>
                      <span>Diferença / Quebra:</span>
                      <span>{shift.cashDifference >= 0 ? '+' : ''}{formatMoney(shift.cashDifference, settings.currencySymbol)}</span>
                    </div>
                  )}
                </div>

                {shift.notes && (
                  <div className="py-2 border-b border-dashed border-slate-300 text-[10px] text-slate-600">
                    <span className="font-bold">Observações:</span> {shift.notes}
                  </div>
                )}
              </div>
            )}

            {/* Sale Receipt */}
            {sale && (
              <div className="pt-3">
                <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Fatura/Ticket:</span>
                    <span className="font-bold">{sale.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Data / Hora:</span>
                    <span>{sale.date} {sale.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Operador:</span>
                    <span>{sale.employeeName}</span>
                  </div>
                  {sale.tableOrOrder && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mesa / Comanda:</span>
                      <span className="font-bold">{sale.tableOrOrder}</span>
                    </div>
                  )}
                  {sale.customerName && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cliente:</span>
                      <span>{sale.customerName}</span>
                    </div>
                  )}
                </div>

                {/* Items Table */}
                <div className="py-3 border-b border-dashed border-slate-300">
                  <div className="flex justify-between font-bold text-[10px] uppercase text-slate-500 mb-2">
                    <span>Qtd / Item</span>
                    <span>Total</span>
                  </div>
                  <div className="space-y-2">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-start text-[11px]">
                        <div className="pr-2">
                          <span className="font-semibold">{item.quantity}x </span>
                          <span>{item.productName}</span>
                          {item.notes && (
                            <p className="text-[10px] text-slate-500 italic">Nota: {item.notes}</p>
                          )}
                          <p className="text-[10px] text-slate-500">
                            @ {formatMoney(item.unitPrice, settings.currencySymbol)}
                          </p>
                        </div>
                        <span className="font-bold whitespace-nowrap">
                          {formatMoney(item.total, settings.currencySymbol)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Totals */}
                <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>{formatMoney(sale.subtotal, settings.currencySymbol)}</span>
                  </div>
                  {sale.discount > 0 && (
                    <div className="flex justify-between text-rose-600 font-medium">
                      <span>Desconto:</span>
                      <span>- {formatMoney(sale.discount, settings.currencySymbol)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 text-[10px]">
                    <span>IVA ({settings.taxPercentage}% incluído):</span>
                    <span>{formatMoney(sale.tax, settings.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-300 text-sm font-bold text-slate-900">
                    <span>TOTAL A PAGAR:</span>
                    <span>{formatMoney(sale.total, settings.currencySymbol)}</span>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Forma de Pagamento:</span>
                    <span className="font-semibold">{getPaymentLabel(sale.paymentMethod)}</span>
                  </div>
                  {sale.paymentMethod === 'dinheiro' && sale.cashReceived !== undefined && (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>Valor Entregue:</span>
                        <span>{formatMoney(sale.cashReceived, settings.currencySymbol)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Troco:</span>
                        <span>{formatMoney(sale.change || 0, settings.currencySymbol)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Footer Message */}
            <div className="text-center pt-4 text-[11px] text-slate-600 space-y-1">
              <p className="font-medium">{settings.receiptFooter}</p>
              <p className="text-[9px] text-slate-400">
                Software de Gestão Comercial • Bar & Cantina
              </p>
              <div className="flex justify-center pt-1">
                <div className="h-6 w-36 bg-slate-200 flex items-center justify-center tracking-widest text-[9px] text-slate-700 font-mono">
                  ||||| | |||| ||| |||||
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
