import React, { useState, useMemo } from 'react';
import { Sale, StoreSettings } from '../types';
import { formatMoney, formatDateTime } from '../utils/storage';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  Coins, 
  Sparkles, 
  Printer, 
  Download, 
  Clock, 
  Package, 
  FileText,
  PieChart
} from 'lucide-react';

interface ReportsViewProps {
  sales: Sale[];
  settings: StoreSettings;
  onSelectSaleToPrint: (sale: Sale) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  sales,
  settings,
  onSelectSaleToPrint,
}) => {
  const [reportType, setReportType] = useState<'diario' | 'mensal' | 'anual'>('diario');

  // Today default
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Month default
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // Month names in PT
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // 1. DAILY REPORT DATA
  const dailySales = useMemo(() => {
    return sales.filter((s) => s.date === selectedDate && s.status === 'completed');
  }, [sales, selectedDate]);

  const dailyTotal = useMemo(() => dailySales.reduce((sum, s) => sum + s.total, 0), [dailySales]);
  const dailyCost = useMemo(() => dailySales.reduce((sum, s) => sum + s.costTotal, 0), [dailySales]);
  const dailyProfit = Math.max(0, dailyTotal - dailyCost);
  const dailyProfitMargin = dailyTotal > 0 ? Math.round((dailyProfit / dailyTotal) * 100) : 0;
  const dailyCount = dailySales.length;
  const dailyAvgTicket = dailyCount > 0 ? dailyTotal / dailyCount : 0;

  // Daily by Payment Method
  const dailyPayments = useMemo(() => {
    let cash = 0;
    let card = 0;
    let transfer = 0;
    let credit = 0;

    dailySales.forEach((s) => {
      if (s.paymentMethod === 'dinheiro') cash += s.total;
      else if (s.paymentMethod === 'cartao_tpa') card += s.total;
      else if (s.paymentMethod === 'transferencia_pix') transfer += s.total;
      else credit += s.total;
    });

    return { cash, card, transfer, credit };
  }, [dailySales]);

  // Hourly distribution for daily report (8:00 to 23:00)
  const hourlySales = useMemo(() => {
    const list: { hour: number; total: number }[] = [];
    for (let h = 8; h <= 23; h++) {
      list.push({ hour: h, total: 0 });
    }

    dailySales.forEach((s) => {
      if (s.time) {
        const h = parseInt(s.time.split(':')[0]);
        if (h >= 8 && h <= 23) {
          const item = list.find((it) => it.hour === h);
          if (item) item.total += s.total;
        }
      }
    });

    const maxVal = Math.max(...list.map((it) => it.total), 1);
    return { list, maxVal };
  }, [dailySales]);

  // 2. MONTHLY REPORT DATA
  const monthlySales = useMemo(() => {
    return sales.filter((s) => {
      if (s.status !== 'completed') return false;
      const [year, month] = s.date.split('-').map(Number);
      return year === selectedYear && month === selectedMonth;
    });
  }, [sales, selectedYear, selectedMonth]);

  const monthlyTotal = useMemo(() => monthlySales.reduce((sum, s) => sum + s.total, 0), [monthlySales]);
  const monthlyCost = useMemo(() => monthlySales.reduce((sum, s) => sum + s.costTotal, 0), [monthlySales]);
  const monthlyProfit = Math.max(0, monthlyTotal - monthlyCost);
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const monthlyDailyAvg = daysInMonth > 0 ? monthlyTotal / daysInMonth : 0;

  // Monthly day-by-day distribution
  const monthlyDaysDistribution = useMemo(() => {
    const list: { day: number; total: number; count: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      list.push({ day: d, total: 0, count: 0 });
    }

    monthlySales.forEach((s) => {
      const day = parseInt(s.date.split('-')[2]);
      if (day >= 1 && day <= daysInMonth) {
        const item = list[day - 1];
        if (item) {
          item.total += s.total;
          item.count += 1;
        }
      }
    });

    const maxDayTotal = Math.max(...list.map((d) => d.total), 1);
    return { list, maxDayTotal };
  }, [monthlySales, daysInMonth]);

  // Top products of the month
  const monthlyTopProducts = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; total: number }>();
    monthlySales.forEach((s) => {
      s.items.forEach((it) => {
        const ex = map.get(it.productId);
        if (ex) {
          ex.quantity += it.quantity;
          ex.total += it.total;
        } else {
          map.set(it.productId, { name: it.productName, quantity: it.quantity, total: it.total });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [monthlySales]);

  // 3. ANNUAL REPORT DATA
  const annualSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.status !== 'completed') return false;
      const year = parseInt(s.date.split('-')[0]);
      return year === selectedYear;
    });
  }, [sales, selectedYear]);

  const annualTotal = useMemo(() => annualSales.reduce((sum, s) => sum + s.total, 0), [annualSales]);
  const annualCost = useMemo(() => annualSales.reduce((sum, s) => sum + s.costTotal, 0), [annualSales]);
  const annualProfit = Math.max(0, annualTotal - annualCost);

  const annualMonthBreakdown = useMemo(() => {
    const list: { month: number; name: string; total: number; cost: number; profit: number; count: number }[] = [];
    for (let m = 1; m <= 12; m++) {
      list.push({
        month: m,
        name: monthNames[m - 1],
        total: 0,
        cost: 0,
        profit: 0,
        count: 0,
      });
    }

    annualSales.forEach((s) => {
      const m = parseInt(s.date.split('-')[1]);
      if (m >= 1 && m <= 12) {
        list[m - 1].total += s.total;
        list[m - 1].cost += s.costTotal;
        list[m - 1].profit += Math.max(0, s.total - s.costTotal);
        list[m - 1].count += 1;
      }
    });

    const maxMonthVal = Math.max(...list.map((it) => it.total), 1);
    return { list, maxMonthVal };
  }, [annualSales]);

  // Export to CSV helper
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    if (reportType === 'diario') {
      csvContent += 'Fatura;Data;Hora;Mesa/Cliente;Operador;Metodo Pagamento;Total;Lucro\n';
      dailySales.forEach((s) => {
        csvContent += `"${s.receiptNumber}";"${s.date}";"${s.time}";"${s.tableOrOrder || ''} ${s.customerName || ''}";"${s.employeeName}";"${s.paymentMethod}";${s.total};${s.total - s.costTotal}\n`;
      });
    } else if (reportType === 'mensal') {
      csvContent += 'Dia;Data;Total Faturado;Qtd Vendas\n';
      monthlyDaysDistribution.list.forEach((item) => {
        csvContent += `${item.day};"${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(item.day).padStart(2, '0')}";${item.total};${item.count}\n`;
      });
    } else {
      csvContent += 'Mes;Nome;Faturamento;Custos;Lucro;Qtd Vendas\n';
      annualMonthBreakdown.list.forEach((m) => {
        csvContent += `${m.month};"${m.name}";${m.total};${m.cost};${m.profit};${m.count}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Relatórios de Vendas e Desempenho</h2>
          <p className="text-xs text-slate-500">
            Análise detalhada diária, mensal e anual de faturamento, margens de lucro e produtos mais vendidos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Exportar CSV
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Navigation Tabs (Diário, Mensal, Anual) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-2.5 gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setReportType('diario')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                reportType === 'diario'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Relatório Diário
            </button>
            <button
              onClick={() => setReportType('mensal')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                reportType === 'mensal'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Relatório Mensal
            </button>
            <button
              onClick={() => setReportType('anual')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                reportType === 'anual'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Relatório Anual
            </button>
          </div>

          {/* Date / Month / Year Picker */}
          <div className="flex items-center gap-2">
            {reportType === 'diario' && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-amber-600"
                />
              </div>
            )}

            {reportType === 'mensal' && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-amber-600"
                >
                  {monthNames.map((name, idx) => (
                    <option key={idx} value={idx + 1}>{name}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-hidden focus:border-amber-600"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            )}

            {reportType === 'anual' && (
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-600">Ano de Exercício:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 focus:outline-hidden focus:border-amber-600"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* ================= TAB 1: RELATÓRIO DIÁRIO ================= */}
        {reportType === 'diario' && (
          <div className="p-6 space-y-6">
            {/* Daily KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs font-semibold text-amber-800 block">Faturamento do Dia</span>
                <span className="text-2xl font-black text-amber-950 mt-1 block">
                  {formatMoney(dailyTotal, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-amber-700 mt-1 block">
                  {dailyCount} vendas concluídas
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs font-semibold text-emerald-800 block">Lucro Bruto do Dia</span>
                <span className="text-2xl font-black text-emerald-950 mt-1 block">
                  {formatMoney(dailyProfit, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-emerald-700 mt-1 block">
                  Margem média de {dailyProfitMargin}%
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                <span className="text-xs font-semibold text-blue-800 block">Ticket Médio</span>
                <span className="text-2xl font-black text-blue-950 mt-1 block">
                  {formatMoney(dailyAvgTicket, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-blue-700 mt-1 block">
                  Gasto médio por comanda
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block">Custo Mercadorias (CMV)</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {formatMoney(dailyCost, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Custo base de stock
                </span>
              </div>
            </div>

            {/* Hourly Sales SVG Chart */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Distribuição de Faturamento por Hora (08:00 às 23:00)
                </h4>
                <span className="text-[11px] text-slate-400">Picos de consumo no bar & cantina</span>
              </div>

              <div className="h-44 w-full flex items-end gap-1.5 pt-6 pb-2 px-2">
                {hourlySales.list.map((item) => {
                  const heightPercent = Math.max(8, Math.round((item.total / hourlySales.maxVal) * 100));
                  return (
                    <div key={item.hour} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono whitespace-nowrap z-10 pointer-events-none">
                        {item.hour}:00h • {formatMoney(item.total, settings.currencySymbol)}
                      </div>

                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          item.total > 0 ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-200/60'
                        }`}
                      ></div>
                      <span className="text-[9px] text-slate-400 font-mono mt-1">
                        {item.hour}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Methods Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    Numerário / Dinheiro
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    {dailyTotal > 0 ? Math.round((dailyPayments.cash / dailyTotal) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${dailyTotal > 0 ? (dailyPayments.cash / dailyTotal) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="font-bold text-sm text-slate-900 block">
                  {formatMoney(dailyPayments.cash, settings.currencySymbol)}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Cartão Bancário / TPA
                  </span>
                  <span className="text-xs font-bold text-blue-700">
                    {dailyTotal > 0 ? Math.round((dailyPayments.card / dailyTotal) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${dailyTotal > 0 ? (dailyPayments.card / dailyTotal) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="font-bold text-sm text-slate-900 block">
                  {formatMoney(dailyPayments.card, settings.currencySymbol)}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Transferência / PIX
                  </span>
                  <span className="text-xs font-bold text-purple-700">
                    {dailyTotal > 0 ? Math.round((dailyPayments.transfer / dailyTotal) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{ width: `${dailyTotal > 0 ? (dailyPayments.transfer / dailyTotal) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="font-bold text-sm text-slate-900 block">
                  {formatMoney(dailyPayments.transfer, settings.currencySymbol)}
                </span>
              </div>
            </div>

            {/* Daily Detailed Sales Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800">
                Lista de Vendas do Dia ({dailySales.length} comprovativos)
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-3">Hora</th>
                      <th className="py-3 px-3">Mesa / Cliente</th>
                      <th className="py-3 px-3">Operador</th>
                      <th className="py-3 px-3">Pagamento</th>
                      <th className="py-3 px-3 text-right">Total</th>
                      <th className="py-3 px-4 text-center">Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dailySales.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-800">
                          {s.receiptNumber}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {s.time}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          {s.tableOrOrder} {s.customerName ? `• ${s.customerName}` : ''}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {s.employeeName}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                            {s.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                          {formatMoney(s.total, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <button
                            onClick={() => onSelectSaleToPrint(s)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-slate-500" />
                            Ver / Imprimir
                          </button>
                        </td>
                      </tr>
                    ))}
                    {dailySales.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          Nenhuma venda registrada na data selecionada ({selectedDate}).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: RELATÓRIO MENSAL ================= */}
        {reportType === 'mensal' && (
          <div className="p-6 space-y-6">
            {/* Monthly KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs font-semibold text-amber-800 block">Total Mensal</span>
                <span className="text-2xl font-black text-amber-950 mt-1 block">
                  {formatMoney(monthlyTotal, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-amber-700 mt-1 block">
                  {monthNames[selectedMonth - 1]} {selectedYear}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs font-semibold text-emerald-800 block">Lucro Mensal</span>
                <span className="text-2xl font-black text-emerald-950 mt-1 block">
                  {formatMoney(monthlyProfit, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-emerald-700 mt-1 block">
                  Custos abatidos: {formatMoney(monthlyCost, settings.currencySymbol)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                <span className="text-xs font-semibold text-blue-800 block">Média Diária</span>
                <span className="text-2xl font-black text-blue-950 mt-1 block">
                  {formatMoney(monthlyDailyAvg, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-blue-700 mt-1 block">
                  Por dia de funcionamento
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block">Volume de Vendas</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {monthlySales.length}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Comandas fechadas no mês
                </span>
              </div>
            </div>

            {/* Monthly Day-by-Day Chart */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  Evolução Diária de Faturamento - {monthNames[selectedMonth - 1]} {selectedYear}
                </h4>
                <span className="text-[11px] text-slate-400">Dias 1 a {daysInMonth}</span>
              </div>

              <div className="h-44 w-full flex items-end gap-1 pt-6 pb-2 px-2">
                {monthlyDaysDistribution.list.map((item) => {
                  const heightPercent = Math.max(6, Math.round((item.total / monthlyDaysDistribution.maxDayTotal) * 100));
                  return (
                    <div key={item.day} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono whitespace-nowrap z-10 pointer-events-none">
                        Dia {item.day}: {formatMoney(item.total, settings.currencySymbol)} ({item.count} vendas)
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          item.total > 0 ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-200/50'
                        }`}
                      ></div>
                      <span className="text-[8px] text-slate-400 font-mono mt-1">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top 10 Products Ranking of the month */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Top 10 Produtos Mais Vendidos no Mês
              </h4>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Posição</th>
                      <th className="py-3 px-4">Produto</th>
                      <th className="py-3 px-3 text-center">Qtd Vendida</th>
                      <th className="py-3 px-4 text-right">Faturamento Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlyTopProducts.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-4 font-bold text-slate-400">
                          #{idx + 1}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800">
                          {p.name}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-amber-700">
                          {p.quantity} un
                        </td>
                        <td className="py-2.5 px-4 text-right font-black text-slate-900">
                          {formatMoney(p.total, settings.currencySymbol)}
                        </td>
                      </tr>
                    ))}
                    {monthlyTopProducts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400">
                          Nenhum produto vendido no mês selecionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: RELATÓRIO ANUAL ================= */}
        {reportType === 'anual' && (
          <div className="p-6 space-y-6">
            {/* Annual KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                <span className="text-xs font-semibold text-amber-800 block">Faturamento Anual</span>
                <span className="text-2xl font-black text-amber-950 mt-1 block">
                  {formatMoney(annualTotal, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-amber-700 mt-1 block">
                  Exercício de {selectedYear}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-xs font-semibold text-emerald-800 block">Lucro Bruto Anual</span>
                <span className="text-2xl font-black text-emerald-950 mt-1 block">
                  {formatMoney(annualProfit, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-emerald-700 mt-1 block">
                  Resultado operacional
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                <span className="text-xs font-semibold text-blue-800 block">Média Mensal</span>
                <span className="text-2xl font-black text-blue-950 mt-1 block">
                  {formatMoney(annualTotal / 12, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-blue-700 mt-1 block">
                  Por mês do ano
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold text-slate-500 block">Custos de Mercadorias</span>
                <span className="text-2xl font-black text-slate-900 mt-1 block">
                  {formatMoney(annualCost, settings.currencySymbol)}
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Total CMV de stock
                </span>
              </div>
            </div>

            {/* Annual Month-by-Month Chart */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  Evolução Mensal do Ano {selectedYear}
                </h4>
                <span className="text-[11px] text-slate-400">12 Meses (Janeiro a Dezembro)</span>
              </div>

              <div className="h-48 w-full flex items-end gap-2 pt-6 pb-2 px-2">
                {annualMonthBreakdown.list.map((m) => {
                  const heightPercent = Math.max(8, Math.round((m.total / annualMonthBreakdown.maxMonthVal) * 100));
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2 rounded font-mono whitespace-nowrap z-10 pointer-events-none">
                        {m.name}: {formatMoney(m.total, settings.currencySymbol)} (Lucro: {formatMoney(m.profit, settings.currencySymbol)})
                      </div>
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-md transition-all duration-300 ${
                          m.total > 0 ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-200/50'
                        }`}
                      ></div>
                      <span className="text-[9px] text-slate-500 font-semibold mt-1 truncate w-full text-center">
                        {m.name.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Annual Month Summary Table */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Mês</th>
                    <th className="py-3 px-4 text-center">Vendas</th>
                    <th className="py-3 px-3 text-right">Faturamento Bruto</th>
                    <th className="py-3 px-3 text-right">Custos Mercadoria</th>
                    <th className="py-3 px-4 text-right">Lucro Bruto</th>
                    <th className="py-3 px-3 text-center">Margem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {annualMonthBreakdown.list.map((m) => {
                    const margin = m.total > 0 ? Math.round((m.profit / m.total) * 100) : 0;
                    return (
                      <tr key={m.month} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-4 font-bold text-slate-800">
                          {m.name}
                        </td>
                        <td className="py-2.5 px-4 text-center font-medium text-slate-600">
                          {m.count}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {formatMoney(m.total, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500">
                          {formatMoney(m.cost, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-extrabold text-emerald-700">
                          {formatMoney(m.profit, settings.currencySymbol)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                          {margin}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                  <tr>
                    <td className="py-3 px-4">TOTAL CONSOLIDADO ANUAL</td>
                    <td className="py-3 px-4 text-center font-extrabold">{annualSales.length}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-amber-800">
                      {formatMoney(annualTotal, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium">
                      {formatMoney(annualCost, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700 text-sm">
                      {formatMoney(annualProfit, settings.currencySymbol)}
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-emerald-800">
                      {annualTotal > 0 ? Math.round((annualProfit / annualTotal) * 100) : 0}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
