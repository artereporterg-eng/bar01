import React from 'react';
import { Employee, Shift, StoreSettings } from '../types';
import { 
  Store, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Clock, 
  Users, 
  Settings, 
  LogOut, 
  UserCheck, 
  AlertTriangle,
  Flame
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'pos' | 'stock' | 'reports' | 'shifts' | 'employees';
  setCurrentTab: (tab: 'pos' | 'stock' | 'reports' | 'shifts' | 'employees') => void;
  activeEmployee: Employee;
  currentShift: Shift | null;
  lowStockCount: number;
  settings: StoreSettings;
  onOpenShiftEndModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeEmployee,
  currentShift,
  lowStockCount,
  settings,
  onOpenShiftEndModal,
  onOpenAuthModal,
  onOpenSettingsModal,
}) => {
  return (
    <header className="no-print bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-900 font-extrabold shadow-sm">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  {settings.storeName}
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  Bar & Cantina
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-none">
                Sistema de Gestão Comercial e PDV
              </p>
            </div>
          </div>

          {/* Center / Shift Status & Highlighted "Término de Período" Button */}
          <div className="flex items-center gap-3">
            {currentShift ? (
              <div className="flex items-center gap-2">
                <div className="hidden md:flex flex-col items-end text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-400">
                      Turno #{currentShift.shiftNumber} Ativo
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Operador: {currentShift.employeeName.split(' ')[0]}
                  </span>
                </div>

                {/* PROMINENT REQUIRED BUTTON */}
                <button
                  onClick={onOpenShiftEndModal}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border border-amber-400/40"
                  title="Resumo de vendas e fecho de turno"
                >
                  <Clock className="w-4 h-4 text-slate-950" />
                  <span className="hidden sm:inline">Término de Período</span>
                  <span className="sm:hidden">Fechar Turno</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('shifts')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Abrir Turno
              </button>
            )}

            {/* Active Employee Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition text-left cursor-pointer group"
                title="Trocar de Operador"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 group-hover:border-amber-400">
                  {activeEmployee.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-white group-hover:text-amber-400">
                    {activeEmployee.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                    {activeEmployee.role}
                  </div>
                </div>
              </button>

              <button
                onClick={onOpenSettingsModal}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                title="Configurações"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Navigation Bar / Tabs */}
        <div className="flex gap-1 overflow-x-auto py-2 border-t border-slate-800/80 scrollbar-none text-xs">
          <button
            onClick={() => setCurrentTab('pos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              currentTab === 'pos'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            PDV / Vendas
          </button>

          <button
            onClick={() => setCurrentTab('stock')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer relative ${
              currentTab === 'stock'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            Stock & Produtos
            {lowStockCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {lowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              currentTab === 'reports'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Relatórios de Vendas
          </button>

          <button
            onClick={() => setCurrentTab('shifts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              currentTab === 'shifts'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            Turnos & Caixa
          </button>

          <button
            onClick={() => setCurrentTab('employees')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              currentTab === 'employees'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            Funcionários & Acessos
          </button>
        </div>

      </div>
    </header>
  );
};
