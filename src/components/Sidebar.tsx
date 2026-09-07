import React from 'react';
import { Employee, Shift, StoreSettings } from '../types';
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Clock, 
  Users, 
  Settings, 
  UserCheck, 
  AlertTriangle,
  LogOut,
  Store
} from 'lucide-react';

interface SidebarProps {
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

export const Sidebar: React.FC<SidebarProps> = ({
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
  const storeInitial = (settings.storeName || 'C').trim().charAt(0).toUpperCase();

  return (
    <aside className="no-print w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 h-screen sticky top-0 hidden md:flex border-r border-slate-800 select-none z-30">
      
      {/* Brand Header */}
      <div className="p-5 text-white font-bold text-lg flex items-center gap-3 border-b border-slate-800">
        <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-slate-900 font-black text-base shadow-xs">
          {storeInitial}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-black tracking-tight text-white truncate leading-tight">
            {settings.storeName || 'CANTINA PLUS'}
          </div>
          <div className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
            Bar & Cantina
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-none text-xs">
        
        {/* VENDAS */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Vendas
          </div>
          <button
            onClick={() => setCurrentTab('pos')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-colors text-left ${
              currentTab === 'pos'
                ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {currentTab === 'pos' ? (
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
            ) : (
              <ShoppingCart className="w-4 h-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate">Frente de Caixa</span>
          </button>
        </div>

        {/* ESTOQUE */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Estoque
          </div>
          <button
            onClick={() => setCurrentTab('stock')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-colors text-left ${
              currentTab === 'stock'
                ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {currentTab === 'stock' ? (
                <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
              ) : (
                <Package className="w-4 h-4 shrink-0 text-slate-400" />
              )}
              <span className="truncate">Gestão de Stock</span>
            </div>
            {lowStockCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0">
                {lowStockCount}
              </span>
            )}
          </button>
        </div>

        {/* RELATÓRIOS */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Relatórios
          </div>
          <button
            onClick={() => setCurrentTab('reports')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-colors text-left ${
              currentTab === 'reports'
                ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {currentTab === 'reports' ? (
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
            ) : (
              <BarChart3 className="w-4 h-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate">Relatórios de Vendas</span>
          </button>
        </div>

        {/* OPERAÇÃO & TURNOS */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Operação
          </div>
          <button
            onClick={() => setCurrentTab('shifts')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-colors text-left ${
              currentTab === 'shifts'
                ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {currentTab === 'shifts' ? (
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
            ) : (
              <Clock className="w-4 h-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate">Turnos & Caixa</span>
          </button>
        </div>

        {/* SISTEMA */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Sistema
          </div>
          <button
            onClick={() => setCurrentTab('employees')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium cursor-pointer transition-colors text-left ${
              currentTab === 'employees'
                ? 'bg-slate-800 text-white font-semibold shadow-2xs'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
            }`}
          >
            {currentTab === 'employees' ? (
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
            ) : (
              <Users className="w-4 h-4 shrink-0 text-slate-400" />
            )}
            <span className="truncate">Funcionários & Acessos</span>
          </button>
        </div>

        {/* Quick Shift Terminate Action in Sidebar */}
        {currentShift && (
          <div className="pt-2">
            <button
              onClick={onOpenShiftEndModal}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 transition font-bold text-xs cursor-pointer shadow-xs"
            >
              <Clock className="w-4 h-4" />
              <span>Terminar Período</span>
            </button>
          </div>
        )}

      </nav>

      {/* User Profile & Config Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-2">
        <button
          onClick={onOpenAuthModal}
          className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition cursor-pointer group"
          title="Trocar de Operador"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0 group-hover:border-amber-400">
            {activeEmployee.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate group-hover:text-amber-400">
              {activeEmployee.name.split(' ')[0]}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
              {activeEmployee.role}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenAuthModal}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Trocar Utilizador"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettingsModal}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Configurações do Bar & Cantina"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
};
