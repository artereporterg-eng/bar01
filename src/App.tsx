import React, { useState, useEffect, useMemo } from 'react';
import { 
  Employee, 
  Product, 
  Sale, 
  Shift, 
  StockMovement, 
  StoreSettings, 
  PaymentMethod 
} from './types';
import { 
  loadData, 
  saveToStorage, 
  STORAGE_KEYS, 
  DEFAULT_SETTINGS, 
  generateInitialSalesAndShifts 
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { PosView } from './components/PosView';
import { StockManagement } from './components/StockManagement';
import { ReportsView } from './components/ReportsView';
import { ShiftHistoryView } from './components/ShiftHistoryView';
import { EmployeesManagement } from './components/EmployeesManagement';
import { ReceiptModal } from './components/ReceiptModal';
import { ShiftEndModal } from './components/ShiftEndModal';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // Load initial state
  const initialData = useMemo(() => loadData(), []);

  const [settings, setSettings] = useState<StoreSettings>(initialData.settings);
  const [employees, setEmployees] = useState<Employee[]>(initialData.employees);
  const [activeEmployee, setActiveEmployee] = useState<Employee>(() => {
    // Default to Carlos Mendes or first active employee
    const found = initialData.employees.find((e) => e.username === 'carlos.caixa' && e.active);
    return found || initialData.employees[0];
  });
  const [products, setProducts] = useState<Product[]>(initialData.products);
  const [sales, setSales] = useState<Sale[]>(initialData.sales);
  const [shifts, setShifts] = useState<Shift[]>(initialData.shifts);
  const [movements, setMovements] = useState<StockMovement[]>(initialData.movements);

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState<'pos' | 'stock' | 'reports' | 'shifts' | 'employees'>('pos');

  // Modals state
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [receiptShift, setReceiptShift] = useState<Shift | null>(null);
  const [isShiftEndOpen, setIsShiftEndOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Active open shift
  const currentShift = useMemo(() => {
    return shifts.find((s) => s.status === 'open') || null;
  }, [shifts]);

  // Sales belonging to the current active shift
  const currentShiftSales = useMemo(() => {
    if (!currentShift) return [];
    return sales.filter((s) => s.shiftId === currentShift.id);
  }, [sales, currentShift]);

  // Low stock counter for badges
  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStock).length;
  }, [products]);

  // Persist changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EMPLOYEES, employees);
  }, [employees]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SALES, sales);
  }, [sales]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.SHIFTS, shifts);
  }, [shifts]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MOVEMENTS, movements);
  }, [movements]);

  // Handle Complete Sale from POS
  const handleCompleteSale = (saleData: {
    items: {
      productId: string;
      productName: string;
      unitPrice: number;
      costPrice: number;
      quantity: number;
      total: number;
      notes?: string;
    }[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    costTotal: number;
    paymentMethod: PaymentMethod;
    cashReceived?: number;
    change?: number;
    customerName?: string;
    tableOrOrder?: string;
  }) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const receiptNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const shiftId = currentShift ? currentShift.id : 'shift-default';

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      receiptNumber,
      date: dateStr,
      time: timeStr,
      timestamp: now.getTime(),
      shiftId,
      employeeId: activeEmployee.id,
      employeeName: activeEmployee.name,
      items: saleData.items,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      tax: saleData.tax,
      total: saleData.total,
      costTotal: saleData.costTotal,
      paymentMethod: saleData.paymentMethod,
      cashReceived: saleData.cashReceived,
      change: saleData.change,
      customerName: saleData.customerName,
      tableOrOrder: saleData.tableOrOrder,
      status: 'completed',
    };

    // 1. Update stock in products and add audit movements
    const newMovements: StockMovement[] = [];
    const updatedProducts = products.map((prod) => {
      const soldItem = saleData.items.find((it) => it.productId === prod.id);
      if (soldItem) {
        const nextStock = Math.max(0, prod.stock - soldItem.quantity);
        newMovements.push({
          id: `mov-${Date.now()}-${Math.random()}`,
          productId: prod.id,
          productName: prod.name,
          type: 'venda',
          quantity: -soldItem.quantity,
          previousStock: prod.stock,
          newStock: nextStock,
          date: now.toISOString(),
          reason: `Venda ${receiptNumber} (${saleData.tableOrOrder || 'Balcão'})`,
          employeeName: activeEmployee.name,
        });
        return { ...prod, stock: nextStock };
      }
      return prod;
    });

    setProducts(updatedProducts);
    setMovements((prev) => [...newMovements, ...prev]);

    // 2. Append sale
    setSales((prev) => [newSale, ...prev]);

    // 3. Update active shift totals
    if (currentShift) {
      setShifts((prev) =>
        prev.map((s) => {
          if (s.id === currentShift.id) {
            const isCash = saleData.paymentMethod === 'dinheiro';
            const isCard = saleData.paymentMethod === 'cartao_tpa';
            const isTrans = saleData.paymentMethod === 'transferencia_pix';

            return {
              ...s,
              totalSales: s.totalSales + saleData.total,
              salesCount: s.salesCount + 1,
              totalCash: isCash ? s.totalCash + saleData.total : s.totalCash,
              totalCard: isCard ? s.totalCard + saleData.total : s.totalCard,
              totalTransfer: isTrans ? s.totalTransfer + saleData.total : s.totalTransfer,
            };
          }
          return s;
        })
      );
    }

    // 4. Automatically open Receipt Modal for printing ticket!
    setReceiptSale(newSale);
  };

  // Handle Confirm Close Shift (Término de Período)
  const handleConfirmCloseShift = (
    closingCashReported: number,
    notes: string,
    onSuccessPrint: (closedShift: Shift) => void
  ) => {
    if (!currentShift) return;

    const now = new Date();
    const totalSangrias = (currentShift.cashDrops || [])
      .filter((d) => d.type === 'sangria')
      .reduce((acc, d) => acc + d.amount, 0);

    const totalSuprimentos = (currentShift.cashDrops || [])
      .filter((d) => d.type === 'suprimento')
      .reduce((acc, d) => acc + d.amount, 0);

    const expectedCash = currentShift.openingCash + currentShift.totalCash + totalSuprimentos - totalSangrias;
    const difference = closingCashReported - expectedCash;

    const closedShift: Shift = {
      ...currentShift,
      endTime: now.toISOString(),
      status: 'closed',
      closingCashReported,
      closingCashExpected: expectedCash,
      cashDifference: difference,
      notes: notes.trim() || undefined,
    };

    setShifts((prev) => prev.map((s) => (s.id === currentShift.id ? closedShift : s)));

    // Open Z-Report thermal ticket to print
    setReceiptShift(closedShift);
    onSuccessPrint(closedShift);
  };

  // Add sangria / suprimento to active shift
  const handleAddCashDrop = (type: 'sangria' | 'suprimento', amount: number, reason: string) => {
    if (!currentShift) return;
    const drop = {
      id: `drop-${Date.now()}`,
      amount,
      type,
      reason,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      employeeName: activeEmployee.name,
    };

    setShifts((prev) =>
      prev.map((s) => (s.id === currentShift.id ? { ...s, cashDrops: [...(s.cashDrops || []), drop] } : s))
    );
  };

  // Open a new shift
  const handleOpenNewShift = (employeeId: string, employeeName: string, openingCash: number) => {
    const nextNumber = (shifts[0]?.shiftNumber || 100) + 1;
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      shiftNumber: nextNumber,
      employeeId,
      employeeName,
      startTime: new Date().toISOString(),
      status: 'open',
      openingCash,
      totalSales: 0,
      totalCash: 0,
      totalCard: 0,
      totalTransfer: 0,
      salesCount: 0,
      cashDrops: [],
    };

    setShifts((prev) => [newShift, ...prev]);

    // Also switch active employee to the shift opener
    const emp = employees.find((e) => e.id === employeeId);
    if (emp) setActiveEmployee(emp);
  };

  // Product Save (Create or Edit)
  const handleSaveProduct = (product: Product) => {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.map((p) => (p.id === product.id ? product : p));
      }
      return [product, ...prev];
    });
  };

  // Stock Movement manual addition
  const handleAddStockMovement = (movementData: Omit<StockMovement, 'id' | 'date'>) => {
    const newMovement: StockMovement = {
      ...movementData,
      id: `mov-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setMovements((prev) => [newMovement, ...prev]);
  };

  // Employee Save
  const handleSaveEmployee = (emp: Employee) => {
    setEmployees((prev) => {
      const exists = prev.some((e) => e.id === emp.id);
      if (exists) {
        return prev.map((e) => (e.id === emp.id ? emp : e));
      }
      return [emp, ...prev];
    });
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    localStorage.clear();
    const seeded = generateInitialSalesAndShifts();
    setSettings(DEFAULT_SETTINGS);
    setProducts(initialData.products);
    setEmployees(initialData.employees);
    setSales(seeded.sales);
    setShifts(seeded.shifts);
    setMovements(seeded.movements);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-amber-200 selection:text-amber-900 font-sans">
      
      {/* Desktop Geometric Balance Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeEmployee={activeEmployee}
        currentShift={currentShift}
        lowStockCount={lowStockCount}
        settings={settings}
        onOpenShiftEndModal={() => setIsShiftEndOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Main View Area Container */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        
        {/* Geometric Balance Top Header */}
        <TopHeader
          currentTab={currentTab}
          currentShift={currentShift}
          activeEmployee={activeEmployee}
          lowStockCount={lowStockCount}
          settings={settings}
          onOpenShiftEndModal={() => setIsShiftEndOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onSelectTab={(tab) => setCurrentTab(tab)}
        />

        {/* Main View Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {currentTab === 'pos' && (
            <PosView
              products={products}
              currentShift={currentShift}
              activeEmployee={activeEmployee}
              settings={settings}
              onCompleteSale={handleCompleteSale}
              onOpenShiftEndModal={() => setIsShiftEndOpen(true)}
            />
          )}

          {currentTab === 'stock' && (
            <StockManagement
              products={products}
              movements={movements}
              activeEmployee={activeEmployee}
              settings={settings}
              onSaveProduct={handleSaveProduct}
              onAddStockMovement={handleAddStockMovement}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsView
              sales={sales}
              settings={settings}
              onSelectSaleToPrint={(sale) => setReceiptSale(sale)}
            />
          )}

          {currentTab === 'shifts' && (
            <ShiftHistoryView
              shifts={shifts}
              currentShift={currentShift}
              employees={employees}
              settings={settings}
              onOpenNewShift={handleOpenNewShift}
              onSelectShiftToPrint={(shift) => setReceiptShift(shift)}
              onOpenShiftEndModal={() => setIsShiftEndOpen(true)}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeesManagement
              employees={employees}
              activeEmployee={activeEmployee}
              settings={settings}
              onSaveEmployee={handleSaveEmployee}
              onSwitchUser={(emp) => setActiveEmployee(emp)}
            />
          )}
        </main>
      </div>

      {/* MODAL: Término de Período de Vendas (Fecho de Turno) */}
      {isShiftEndOpen && currentShift && (
        <ShiftEndModal
          currentShift={currentShift}
          shiftSales={currentShiftSales}
          settings={settings}
          onClose={() => setIsShiftEndOpen(false)}
          onConfirmCloseShift={handleConfirmCloseShift}
          onAddCashDrop={handleAddCashDrop}
        />
      )}

      {/* MODAL: Thermal Receipt / Ticket Z Print Preview */}
      {(receiptSale || receiptShift) && (
        <ReceiptModal
          sale={receiptSale}
          shift={receiptShift}
          settings={settings}
          onClose={() => {
            setReceiptSale(null);
            setReceiptShift(null);
          }}
        />
      )}

      {/* MODAL: Operador Switch / PIN Authentication */}
      <AuthModal
        employees={employees}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSelectEmployee={(emp) => setActiveEmployee(emp)}
      />

      {/* MODAL: Configurações do Bar & Cantina */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
        onResetDemoData={handleResetDemoData}
      />

    </div>
  );
}
