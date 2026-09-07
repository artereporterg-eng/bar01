import { Employee, Product, Sale, Shift, StockMovement, StoreSettings } from '../types';

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Bar & Cantina Central',
  nif: '540192837',
  address: 'Avenida Principal, nº 42 - Centro',
  phone: '+351 912 345 678 / +244 923 456 789',
  receiptFooter: 'Obrigado pela sua preferência! Volte sempre.',
  currency: 'AOA',
  currencySymbol: 'Kz',
  taxPercentage: 14,
};

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Administrador Geral',
    username: 'admin',
    pin: '1234',
    role: 'admin',
    active: true,
    phone: '+351 910 000 001',
    createdAt: '2026-01-01',
  },
  {
    id: 'emp-2',
    name: 'Maria Fernandes (Gerente)',
    username: 'maria.gerente',
    pin: '2222',
    role: 'manager',
    active: true,
    phone: '+351 910 000 002',
    createdAt: '2026-01-15',
  },
  {
    id: 'emp-3',
    name: 'Carlos Mendes (Caixa Turno)',
    username: 'carlos.caixa',
    pin: '0000',
    role: 'cashier',
    active: true,
    phone: '+351 910 000 003',
    createdAt: '2026-02-01',
  },
  {
    id: 'emp-4',
    name: 'Pedro Santos (Atendente)',
    username: 'pedro.atendente',
    pin: '1111',
    role: 'waiter',
    active: true,
    phone: '+351 910 000 004',
    createdAt: '2026-02-10',
  },
];

export const DEFAULT_PRODUCTS: Product[] = [
  // Cervejas
  {
    id: 'prod-1',
    name: 'Cerveja Cuca / Sagres 33cl',
    category: 'Cervejas',
    barcode: '5601234001',
    costPrice: 400,
    sellingPrice: 800,
    stock: 72,
    minStock: 24,
    unit: 'garrafa',
    active: true,
  },
  {
    id: 'prod-2',
    name: 'Cerveja Super Bock 33cl',
    category: 'Cervejas',
    barcode: '5601234002',
    costPrice: 450,
    sellingPrice: 900,
    stock: 48,
    minStock: 20,
    unit: 'garrafa',
    active: true,
  },
  {
    id: 'prod-3',
    name: 'Cerveja Heineken Long Neck',
    category: 'Cervejas',
    barcode: '5601234003',
    costPrice: 600,
    sellingPrice: 1200,
    stock: 14, // low stock alert demo
    minStock: 20,
    unit: 'garrafa',
    active: true,
  },
  {
    id: 'prod-4',
    name: 'Cerveja de Pressão / Fino 30cl',
    category: 'Cervejas',
    barcode: '5601234004',
    costPrice: 350,
    sellingPrice: 750,
    stock: 120,
    minStock: 30,
    unit: 'dose',
    active: true,
  },
  // Bebidas e Refrigerantes
  {
    id: 'prod-5',
    name: 'Coca-Cola Lata 330ml',
    category: 'Bebidas e Refrigerantes',
    barcode: '5601234005',
    costPrice: 350,
    sellingPrice: 700,
    stock: 50,
    minStock: 24,
    unit: 'lata',
    active: true,
  },
  {
    id: 'prod-6',
    name: 'Guaraná Antarctica 330ml',
    category: 'Bebidas e Refrigerantes',
    barcode: '5601234006',
    costPrice: 350,
    sellingPrice: 700,
    stock: 36,
    minStock: 15,
    unit: 'lata',
    active: true,
  },
  {
    id: 'prod-7',
    name: 'Água Mineral sem Gás 50cl',
    category: 'Bebidas e Refrigerantes',
    barcode: '5601234007',
    costPrice: 150,
    sellingPrice: 400,
    stock: 80,
    minStock: 30,
    unit: 'garrafa',
    active: true,
  },
  {
    id: 'prod-8',
    name: 'Sumo Natural de Laranja',
    category: 'Bebidas e Refrigerantes',
    barcode: '5601234008',
    costPrice: 500,
    sellingPrice: 1100,
    stock: 25,
    minStock: 10,
    unit: 'un',
    active: true,
  },
  // Vinhos e Destilados
  {
    id: 'prod-9',
    name: 'Vinho Tinto da Casa (Copo)',
    category: 'Vinhos e Destilados',
    barcode: '5601234009',
    costPrice: 400,
    sellingPrice: 900,
    stock: 60,
    minStock: 15,
    unit: 'dose',
    active: true,
  },
  {
    id: 'prod-10',
    name: 'Gin Tónico Clássico',
    category: 'Vinhos e Destilados',
    barcode: '5601234010',
    costPrice: 1200,
    sellingPrice: 2800,
    stock: 18,
    minStock: 10,
    unit: 'dose',
    active: true,
  },
  {
    id: 'prod-11',
    name: 'Whisky Black Label (Dose)',
    category: 'Vinhos e Destilados',
    barcode: '5601234011',
    costPrice: 1500,
    sellingPrice: 3500,
    stock: 8, // low stock alert
    minStock: 12,
    unit: 'dose',
    active: true,
  },
  {
    id: 'prod-12',
    name: 'Caipirinha Tradicional',
    category: 'Vinhos e Destilados',
    barcode: '5601234012',
    costPrice: 900,
    sellingPrice: 2200,
    stock: 35,
    minStock: 10,
    unit: 'dose',
    active: true,
  },
  // Petiscos e Porções
  {
    id: 'prod-13',
    name: 'Batata Frita Porção Estaladiça',
    category: 'Petiscos e Porções',
    barcode: '5601234013',
    costPrice: 600,
    sellingPrice: 1500,
    stock: 45,
    minStock: 15,
    unit: 'prato',
    active: true,
  },
  {
    id: 'prod-14',
    name: 'Pica-Pau de Novilho com Molho',
    category: 'Petiscos e Porções',
    barcode: '5601234014',
    costPrice: 1800,
    sellingPrice: 3800,
    stock: 22,
    minStock: 8,
    unit: 'prato',
    active: true,
  },
  {
    id: 'prod-15',
    name: 'Asas de Frango Crocantes (8 un)',
    category: 'Petiscos e Porções',
    barcode: '5601234015',
    costPrice: 1200,
    sellingPrice: 2600,
    stock: 19,
    minStock: 10,
    unit: 'prato',
    active: true,
  },
  {
    id: 'prod-16',
    name: 'Tábua Mista de Queijos e Chouriço',
    category: 'Petiscos e Porções',
    barcode: '5601234016',
    costPrice: 2000,
    sellingPrice: 4500,
    stock: 12,
    minStock: 6,
    unit: 'prato',
    active: true,
  },
  // Pratos e Refeições
  {
    id: 'prod-17',
    name: 'Bitoque de Vaca com Ovo e Batata',
    category: 'Pratos e Refeições',
    barcode: '5601234017',
    costPrice: 2200,
    sellingPrice: 4800,
    stock: 28,
    minStock: 10,
    unit: 'prato',
    active: true,
  },
  {
    id: 'prod-18',
    name: 'Prato do Dia / Feijoada Cantina',
    category: 'Pratos e Refeições',
    barcode: '5601234018',
    costPrice: 1600,
    sellingPrice: 3500,
    stock: 30,
    minStock: 10,
    unit: 'prato',
    active: true,
  },
  // Lanches e Sanduíches
  {
    id: 'prod-19',
    name: 'Tosta Mista em Pão Rústico',
    category: 'Lanches e Sanduíches',
    barcode: '5601234019',
    costPrice: 500,
    sellingPrice: 1300,
    stock: 40,
    minStock: 15,
    unit: 'un',
    active: true,
  },
  {
    id: 'prod-20',
    name: 'Bifana no Pão com Mostarda',
    category: 'Lanches e Sanduíches',
    barcode: '5601234020',
    costPrice: 700,
    sellingPrice: 1700,
    stock: 35,
    minStock: 12,
    unit: 'un',
    active: true,
  },
  {
    id: 'prod-21',
    name: 'Hambúrguer Artesanal Completo',
    category: 'Lanches e Sanduíches',
    barcode: '5601234021',
    costPrice: 1400,
    sellingPrice: 3200,
    stock: 25,
    minStock: 8,
    unit: 'un',
    active: true,
  },
  // Cafetaria e Sobremesas
  {
    id: 'prod-22',
    name: 'Café Expresso Italiano',
    category: 'Cafetaria',
    barcode: '5601234022',
    costPrice: 80,
    sellingPrice: 300,
    stock: 200,
    minStock: 50,
    unit: 'dose',
    active: true,
  },
  {
    id: 'prod-23',
    name: 'Galão em Copo de Vidro',
    category: 'Cafetaria',
    barcode: '5601234023',
    costPrice: 180,
    sellingPrice: 600,
    stock: 120,
    minStock: 30,
    unit: 'un',
    active: true,
  },
  {
    id: 'prod-24',
    name: 'Pastel de Nata Crocante',
    category: 'Sobremesas',
    barcode: '5601234024',
    costPrice: 200,
    sellingPrice: 500,
    stock: 24,
    minStock: 10,
    unit: 'un',
    active: true,
  },
  {
    id: 'prod-25',
    name: 'Mousse de Chocolate Caseira',
    category: 'Sobremesas',
    barcode: '5601234025',
    costPrice: 450,
    sellingPrice: 1100,
    stock: 15,
    minStock: 8,
    unit: 'un',
    active: true,
  },
];

// Helper to generate initial past sales for rich daily/monthly/annual charts
export function generateInitialSalesAndShifts(): { sales: Sale[]; shifts: Shift[]; movements: StockMovement[] } {
  const sales: Sale[] = [];
  const shifts: Shift[] = [];
  const movements: StockMovement[] = [];

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Create current active shift for Carlos
  const activeShiftId = 'shift-curr-101';
  const openTime = new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(); // 4 hours ago

  const activeShift: Shift = {
    id: activeShiftId,
    shiftNumber: 104,
    employeeId: 'emp-3',
    employeeName: 'Carlos Mendes (Caixa Turno)',
    startTime: openTime,
    status: 'open',
    openingCash: 15000,
    totalSales: 0,
    totalCash: 0,
    totalCard: 0,
    totalTransfer: 0,
    salesCount: 0,
    cashDrops: [
      {
        id: 'drop-1',
        amount: 5000,
        type: 'sangria',
        reason: 'Recolha para cofre da gerência',
        time: new Date(now.getTime() - 1.5 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        employeeName: 'Carlos Mendes (Caixa Turno)',
      }
    ],
  };

  // Generate sales for today in this shift
  const sampleItemsList = [
    { prod: DEFAULT_PRODUCTS[0], qty: 2 },
    { prod: DEFAULT_PRODUCTS[12], qty: 1 },
    { prod: DEFAULT_PRODUCTS[4], qty: 1 },
    { prod: DEFAULT_PRODUCTS[18], qty: 2 },
    { prod: DEFAULT_PRODUCTS[21], qty: 3 },
  ];

  let receiptCounter = 1001;

  // 6 sales today in current shift
  for (let i = 0; i < 6; i++) {
    const saleTime = new Date(now.getTime() - (3.5 - i * 0.5) * 60 * 60 * 1000);
    const timeStr = saleTime.toTimeString().split(' ')[0];
    const items = [
      {
        productId: DEFAULT_PRODUCTS[i % 5].id,
        productName: DEFAULT_PRODUCTS[i % 5].name,
        unitPrice: DEFAULT_PRODUCTS[i % 5].sellingPrice,
        costPrice: DEFAULT_PRODUCTS[i % 5].costPrice,
        quantity: (i % 3) + 1,
        total: DEFAULT_PRODUCTS[i % 5].sellingPrice * ((i % 3) + 1),
      },
      {
        productId: DEFAULT_PRODUCTS[(i + 4) % 15].id,
        productName: DEFAULT_PRODUCTS[(i + 4) % 15].name,
        unitPrice: DEFAULT_PRODUCTS[(i + 4) % 15].sellingPrice,
        costPrice: DEFAULT_PRODUCTS[(i + 4) % 15].costPrice,
        quantity: 1,
        total: DEFAULT_PRODUCTS[(i + 4) % 15].sellingPrice,
      }
    ];

    const subtotal = items.reduce((acc, it) => acc + it.total, 0);
    const costTotal = items.reduce((acc, it) => acc + it.costPrice * it.quantity, 0);
    const tax = Math.round(subtotal * 0.14);
    const total = subtotal;
    const pMethod = i % 3 === 0 ? 'dinheiro' : i % 3 === 1 ? 'cartao_tpa' : 'transferencia_pix';

    const sale: Sale = {
      id: `sale-${receiptCounter}`,
      receiptNumber: `TKT-${receiptCounter}`,
      date: todayStr,
      time: timeStr,
      timestamp: saleTime.getTime(),
      shiftId: activeShiftId,
      employeeId: 'emp-3',
      employeeName: 'Carlos Mendes (Caixa Turno)',
      items,
      subtotal,
      discount: 0,
      tax,
      total,
      costTotal,
      paymentMethod: pMethod,
      cashReceived: pMethod === 'dinheiro' ? Math.ceil(total / 1000) * 1000 : undefined,
      change: pMethod === 'dinheiro' ? (Math.ceil(total / 1000) * 1000) - total : 0,
      tableOrOrder: `Mesa 0${(i % 6) + 1}`,
      customerName: i % 2 === 0 ? `Cliente Balcão #${i + 1}` : undefined,
      status: 'completed',
    };

    sales.push(sale);
    activeShift.totalSales += total;
    activeShift.salesCount += 1;
    if (pMethod === 'dinheiro') activeShift.totalCash += total;
    else if (pMethod === 'cartao_tpa') activeShift.totalCard += total;
    else activeShift.totalTransfer += total;

    receiptCounter++;
  }

  shifts.push(activeShift);

  // Generate historical past closed shifts & sales (last 30 days & months for complete reports)
  for (let dayOffset = 1; dayOffset <= 28; dayOffset++) {
    const pastDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    const pDateStr = pastDate.toISOString().split('T')[0];
    const shiftEmp = dayOffset % 2 === 0 ? DEFAULT_EMPLOYEES[2] : DEFAULT_EMPLOYEES[1];
    const pastShiftId = `shift-past-${100 - dayOffset}`;

    let pastShiftSales = 0;
    let pastShiftCash = 0;
    let pastShiftCard = 0;
    let pastShiftTrans = 0;
    const salesInDay = 4 + (dayOffset % 6);

    for (let s = 0; s < salesInDay; s++) {
      const pastSaleTime = new Date(pastDate.getTime() + (9 + s * 1.5) * 60 * 60 * 1000);
      const items = [
        {
          productId: DEFAULT_PRODUCTS[(s * 2) % DEFAULT_PRODUCTS.length].id,
          productName: DEFAULT_PRODUCTS[(s * 2) % DEFAULT_PRODUCTS.length].name,
          unitPrice: DEFAULT_PRODUCTS[(s * 2) % DEFAULT_PRODUCTS.length].sellingPrice,
          costPrice: DEFAULT_PRODUCTS[(s * 2) % DEFAULT_PRODUCTS.length].costPrice,
          quantity: 1 + (s % 3),
          total: DEFAULT_PRODUCTS[(s * 2) % DEFAULT_PRODUCTS.length].sellingPrice * (1 + (s % 3)),
        }
      ];

      const subtotal = items.reduce((acc, it) => acc + it.total, 0);
      const costTotal = items.reduce((acc, it) => acc + it.costPrice * it.quantity, 0);
      const tax = Math.round(subtotal * 0.14);
      const total = subtotal;
      const pMethod = s % 3 === 0 ? 'dinheiro' : s % 3 === 1 ? 'cartao_tpa' : 'transferencia_pix';

      const sale: Sale = {
        id: `sale-past-${dayOffset}-${s}`,
        receiptNumber: `TKT-${900 - dayOffset * 10 - s}`,
        date: pDateStr,
        time: pastSaleTime.toTimeString().split(' ')[0],
        timestamp: pastSaleTime.getTime(),
        shiftId: pastShiftId,
        employeeId: shiftEmp.id,
        employeeName: shiftEmp.name,
        items,
        subtotal,
        discount: 0,
        tax,
        total,
        costTotal,
        paymentMethod: pMethod,
        tableOrOrder: `Mesa 0${(s % 5) + 1}`,
        status: 'completed',
      };

      sales.push(sale);
      pastShiftSales += total;
      if (pMethod === 'dinheiro') pastShiftCash += total;
      else if (pMethod === 'cartao_tpa') pastShiftCard += total;
      else pastShiftTrans += total;
    }

    const pastShift: Shift = {
      id: pastShiftId,
      shiftNumber: 104 - dayOffset,
      employeeId: shiftEmp.id,
      employeeName: shiftEmp.name,
      startTime: new Date(pastDate.getTime() + 8 * 3600000).toISOString(),
      endTime: new Date(pastDate.getTime() + 18 * 3600000).toISOString(),
      status: 'closed',
      openingCash: 10000,
      closingCashReported: 10000 + pastShiftCash,
      closingCashExpected: 10000 + pastShiftCash,
      cashDifference: 0,
      totalSales: pastShiftSales,
      totalCash: pastShiftCash,
      totalCard: pastShiftCard,
      totalTransfer: pastShiftTrans,
      salesCount: salesInDay,
      cashDrops: [],
      notes: 'Turno encerrado com conferência regular sem quebras de caixa.',
    };
    shifts.push(pastShift);
  }

  // Sample stock movements for audit
  movements.push(
    {
      id: 'mov-1',
      productId: 'prod-1',
      productName: 'Cerveja Cuca / Sagres 33cl',
      type: 'entrada',
      quantity: 48,
      previousStock: 24,
      newStock: 72,
      date: new Date(now.getTime() - 2 * 24 * 3600000).toISOString(),
      reason: 'Entrega fornecedor Distribuidora Central (Factura #9812)',
      employeeName: 'Maria Fernandes (Gerente)',
      cost: 19200,
    },
    {
      id: 'mov-2',
      productId: 'prod-3',
      productName: 'Cerveja Heineken Long Neck',
      type: 'quebra_perda',
      quantity: -2,
      previousStock: 16,
      newStock: 14,
      date: new Date(now.getTime() - 1 * 24 * 3600000).toISOString(),
      reason: 'Quebra acidental de garrafas durante reposição de geleira',
      employeeName: 'Carlos Mendes (Caixa Turno)',
    }
  );

  return { sales, shifts, movements };
}

// Storage helpers with local persistence
const STORAGE_KEYS = {
  SETTINGS: 'bar_cantina_settings',
  EMPLOYEES: 'bar_cantina_employees',
  PRODUCTS: 'bar_cantina_products',
  SALES: 'bar_cantina_sales',
  SHIFTS: 'bar_cantina_shifts',
  MOVEMENTS: 'bar_cantina_movements',
  CURRENT_USER_ID: 'bar_cantina_active_user_id',
};

export function loadData() {
  let settings: StoreSettings = DEFAULT_SETTINGS;
  let employees: Employee[] = DEFAULT_EMPLOYEES;
  let products: Product[] = DEFAULT_PRODUCTS;
  let sales: Sale[] = [];
  let shifts: Shift[] = [];
  let movements: StockMovement[] = [];

  try {
    const s = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (s) settings = JSON.parse(s);

    const e = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (e) employees = JSON.parse(e);

    const p = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (p) products = JSON.parse(p);

    const sa = localStorage.getItem(STORAGE_KEYS.SALES);
    const sh = localStorage.getItem(STORAGE_KEYS.SHIFTS);
    const mo = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);

    if (sa && sh && mo) {
      sales = JSON.parse(sa);
      shifts = JSON.parse(sh);
      movements = JSON.parse(mo);
    } else {
      const generated = generateInitialSalesAndShifts();
      sales = generated.sales;
      shifts = generated.shifts;
      movements = generated.movements;
      // save initially
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
      localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
      localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
    }
  } catch (err) {
    console.error('Error loading data from localStorage', err);
    const generated = generateInitialSalesAndShifts();
    sales = generated.sales;
    shifts = generated.shifts;
    movements = generated.movements;
  }

  return { settings, employees, products, sales, shifts, movements };
}

export function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export { STORAGE_KEYS };

// Currency and numbers formatter
export function formatMoney(amount: number, symbol: string = 'Kz'): string {
  if (isNaN(amount)) amount = 0;
  return `${amount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

export function formatDateTime(isoOrDateString: string): string {
  try {
    const d = new Date(isoOrDateString);
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoOrDateString;
  }
}
