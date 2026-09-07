import React, { useState } from 'react';
import { Shift, StoreSettings, Employee } from '../types';
import { 
  Clock, 
  Store, 
  Menu, 
  X, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Users, 
  Settings, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';

interface TopHeaderProps {
  currentTab: 'pos' | 'stock' | 'reports' | 'shifts' | 'employees';
  currentShift: Shift | null;
  activeEmployee: Employee;
  lowStockCount: number;
  settings: StoreSettings;
  onOpenShiftEndModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSettingsModal: () => void;
  onSelectTab: (tab: 'pos' | 'stock' | 'reports' | 'shifts' | 'employees') => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  currentShift,
  activeEmployee,
  lowStockCount,
  settings,
  onOpenShiftEndModal,
  onOpenAuthModal,
  onOpenSettingsModal,
  onSelectTab,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Tab details for header
  const tabTitles: Record<typeof currentTab, { title: string; subtitle: string }> = {
    pos: {
      title: 'Frente de Caixa',
      subtitle: 'Terminal de Vendas & Registo de Pedidos',
    },
    stock: {
      title: 'Gestão de Stock',
      subtitle: 'Controlo de Inventário, Reposições & Alertas de Mínimos',
    },
    reports: {
      title: 'Relatórios de Vendas',
      subtitle: 'Desempenho Comercial Diário, Mensal e Anual',
    },
    shifts: {
      title: 'Turnos & Caixa',
      subtitle: 'Histórico de Fechos de Período & Movimentações de Dinheiro',
    },
    employees: {
      title: 'Funcionários & Acessos',
      subtitle: 'Gestão de Equipa e Controlo de Níveis de Permissão',
    },
  };

  const currentInfo = tabTitles[currentTab];

  // Format today's date in Portuguese
  const todayFormatted = new Date().toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
      
      {/* Main Bar */}
      <div className="h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        
        {/* Left Side: Title & Subtitle + Mobile Hamburger */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight truncate">
              {currentInfo.title}
            </h2>
            <p className="text-xs text-slate-400 capitalize truncate hidden sm:block">
              {todayFormatted} • Terminal #01 • Operador: {activeEmployee.name.split(' ')[0]}
            </p>
          </div>
        </div>

        {/* Right Side: Shift Status & Terminar Período Action */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Shift Status Badge */}
          {currentShift ? (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs font-semibold border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">
                Turno #{currentShift.shiftNumber} Ativo ({new Date(currentShift.startTime).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })})
              </span>
              <span className="sm:hidden">
                Turno #{currentShift.shiftNumber}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onSelectTab('shifts')}
              className="flex items-center gap-2 bg-amber-50 text-amber-800 px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold border border-amber-200 hover:bg-amber-100 transition cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>Sem Turno • Abrir</span>
            </button>
          )}

          {/* REQUIRED PROMINENT BUTTON: TERMINAR PERÍODO */}
          {currentShift && (
            <button
              onClick={onOpenShiftEndModal}
              className="bg-rose-600 hover:bg-rose-700 text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold shadow-md shadow-rose-100 flex items-center gap-2 transition cursor-pointer text-xs sm:text-sm"
              title="Resumo de vendas e fecho de turno"
            >
              <Clock className="w-4 h-4 text-white" />
              <span className="hidden sm:inline tracking-wide">TERMINAR PERÍODO</span>
              <span className="sm:hidden">FECHAR</span>
            </button>
          )}

          {/* Quick Settings on Mobile */}
          <div className="md:hidden flex items-center gap-1 pl-1 border-l border-slate-200">
            <button
              onClick={onOpenAuthModal}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              title="Trocar Operador"
            >
              <UserCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenSettingsModal}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              title="Configurações"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 text-slate-200 p-4 border-t border-slate-800 space-y-2 text-xs">
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between text-white">
            <span className="font-bold">{settings.storeName}</span>
            <span className="text-amber-400 text-[10px]">Bar & Cantina</span>
          </div>

          <button
            onClick={() => { onSelectTab('pos'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left ${
              currentTab === 'pos' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Frente de Caixa (PDV)</span>
          </button>

          <button
            onClick={() => { onSelectTab('stock'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg text-left ${
              currentTab === 'stock' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Gestão de Stock</span>
            </div>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { onSelectTab('reports'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left ${
              currentTab === 'reports' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Relatórios de Vendas</span>
          </button>

          <button
            onClick={() => { onSelectTab('shifts'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left ${
              currentTab === 'shifts' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Turnos & Caixa</span>
          </button>

          <button
            onClick={() => { onSelectTab('employees'); setMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left ${
              currentTab === 'employees' ? 'bg-slate-800 text-white font-bold' : 'text-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Funcionários & Acessos</span>
          </button>
        </div>
      )}

    </header>
  );
};
