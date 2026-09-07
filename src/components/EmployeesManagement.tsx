import React, { useState } from 'react';
import { Employee, Role, StoreSettings } from '../types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  Lock, 
  Shield, 
  UserCheck, 
  Clock 
} from 'lucide-react';

interface EmployeesManagementProps {
  employees: Employee[];
  activeEmployee: Employee;
  settings: StoreSettings;
  onSaveEmployee: (employee: Employee) => void;
  onSwitchUser: (employee: Employee) => void;
}

export const EmployeesManagement: React.FC<EmployeesManagementProps> = ({
  employees,
  activeEmployee,
  settings,
  onSaveEmployee,
  onSwitchUser,
}) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [visiblePins, setVisiblePins] = useState<{ [key: string]: boolean }>({});

  const togglePinVisibility = (id: string) => {
    setVisiblePins((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenNewEmployee = () => {
    setEditingEmployee({
      id: `emp-${Date.now()}`,
      name: '',
      username: '',
      pin: '0000',
      role: 'cashier',
      active: true,
      phone: '',
      createdAt: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee({ ...emp });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee || !editingEmployee.name.trim()) return;
    onSaveEmployee(editingEmployee);
    setModalOpen(false);
    setEditingEmployee(null);
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrador
          </span>
        );
      case 'manager':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            Gerente
          </span>
        );
      case 'cashier':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" />
            Operador de Caixa
          </span>
        );
      case 'waiter':
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Atendente / Garçom
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Cadastro de Funcionários & Níveis de Acesso</h2>
          <p className="text-xs text-slate-500">
            Defina operadores de turno, caixas, garçons e gerentes com credenciais e PINs de autorização
          </p>
        </div>

        <button
          onClick={handleOpenNewEmployee}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Cadastrar Funcionário
        </button>
      </div>

      {/* Permissions Matrix Explanation Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs">
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-amber-400">
          <Lock className="w-4 h-4" />
          Níveis de Acesso e Permissões do Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 p-3.5 rounded-xl">
            <span className="font-bold text-purple-300 block mb-1">Administrador:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Acesso irrestrito a todas as áreas: relatórios completos de lucros, gestão de funcionários, configurações gerais, cancelamentos e fecho de turnos.
            </p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl">
            <span className="font-bold text-blue-300 block mb-1">Gerente:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Supervisão diária do bar e cantina: reposição e compras de stock, fecho de turnos, autorização de sangrias e relatórios diários e mensais.
            </p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl">
            <span className="font-bold text-emerald-300 block mb-1">Operador de Caixa:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Vendas ágeis no PDV, recebimento de valores em dinheiro/cartão/transferência e fecho do seu próprio turno com contagem de gaveta.
            </p>
          </div>
          <div className="bg-white/10 p-3.5 rounded-xl">
            <span className="font-bold text-amber-300 block mb-1">Atendente / Garçom:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Lançamento e registo rápido de pedidos em comandas de mesas e balcão, sem acesso a relatórios gerenciais ou custos.
            </p>
          </div>
        </div>
      </div>

      {/* Employees Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map((emp) => {
          const isCurrentActive = emp.id === activeEmployee.id;
          const showPin = visiblePins[emp.id];

          return (
            <div
              key={emp.id}
              className={`p-5 rounded-2xl border transition bg-white shadow-2xs flex flex-col justify-between ${
                isCurrentActive ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-base border border-slate-200">
                      {emp.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{emp.name}</h4>
                        {isCurrentActive && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Sessão Ativa
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">@{emp.username}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    {getRoleBadge(emp.role)}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                      PIN de Autorização:
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {showPin ? emp.pin : '••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePinVisibility(emp.id)}
                        className="text-[10px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        {showPin ? 'Ocultar' : 'Ver'}
                      </button>
                    </div>
                  </div>

                  {emp.phone && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        Telefone:
                      </span>
                      <span className="font-medium text-slate-800">{emp.phone}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Estado:</span>
                    <span className={`font-semibold flex items-center gap-1 ${
                      emp.active ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {emp.active ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Ativo
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Inativo
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  onClick={() => onSwitchUser(emp)}
                  disabled={isCurrentActive}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isCurrentActive
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  {isCurrentActive ? 'Operador Atual' : 'Mudar para este Operador'}
                </button>

                <button
                  onClick={() => handleOpenEdit(emp)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Cadastrar / Editar Funcionário */}
      {modalOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {employees.some((e) => e.id === editingEmployee.id) ? 'Editar Funcionário' : 'Novo Funcionário'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome Completo:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Mendes"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nome de Usuário:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="carlos.caixa"
                    value={editingEmployee.username}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, username: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    PIN (4 Dígitos):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    placeholder="1234"
                    value={editingEmployee.pin}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, pin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-center font-bold text-slate-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Cargo / Nível de Acesso:
                </label>
                <select
                  value={editingEmployee.role}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value as Role })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:border-amber-600 focus:outline-hidden"
                >
                  <option value="cashier">Operador de Caixa (Vendas, Turnos próprios, Gaveta)</option>
                  <option value="waiter">Atendente / Garçom (Lançamento de comandas de mesa)</option>
                  <option value="manager">Gerente (Gestão de stock, relatórios, sangrias)</option>
                  <option value="admin">Administrador (Acesso total irrestrito)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Telefone / Contacto:
                </label>
                <input
                  type="text"
                  placeholder="+351 910 000 000"
                  value={editingEmployee.phone || ''}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="emp-active"
                  checked={editingEmployee.active}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, active: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="emp-active" className="font-semibold text-slate-700">
                  Funcionário Ativo (Pode operar o sistema e abrir turnos)
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
