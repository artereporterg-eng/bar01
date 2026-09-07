import React, { useState, useMemo } from 'react';
import { Product, StockMovement, StoreSettings, Employee, ProductCategory, UnitType } from '../types';
import { formatMoney, formatDateTime } from '../utils/storage';
import { 
  Package, 
  AlertTriangle, 
  PlusCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Search, 
  Edit, 
  Trash2, 
  History, 
  TrendingUp, 
  DollarSign, 
  Layers,
  X,
  Check,
  Filter
} from 'lucide-react';

interface StockManagementProps {
  products: Product[];
  movements: StockMovement[];
  activeEmployee: Employee;
  settings: StoreSettings;
  onSaveProduct: (product: Product) => void;
  onAddStockMovement: (movement: Omit<StockMovement, 'id' | 'date'>) => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({
  products,
  movements,
  activeEmployee,
  settings,
  onSaveProduct,
  onAddStockMovement,
}) => {
  const [activeTab, setActiveTab] = useState<'produtos' | 'movimentacoes'>('produtos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [onlyLowStock, setOnlyLowStock] = useState<boolean>(false);

  // Modals
  const [productModalOpen, setProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [entryModalOpen, setEntryModalOpen] = useState<boolean>(false);
  const [lossModalOpen, setLossModalOpen] = useState<boolean>(false);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);

  // Form states for Entry Modal
  const [entryQty, setEntryQty] = useState<string>('');
  const [entryCost, setEntryCost] = useState<string>('');
  const [entryReason, setEntryReason] = useState<string>('');

  // Form states for Loss/Adjustment Modal
  const [lossQty, setLossQty] = useState<string>('');
  const [lossReason, setLossReason] = useState<string>('');
  const [lossType, setLossType] = useState<'quebra_perda' | 'saida_ajuste'>('quebra_perda');

  // Categories list
  const categories = useMemo(() => {
    const list = [
      'Bebidas e Refrigerantes',
      'Cervejas',
      'Vinhos e Destilados',
      'Petiscos e Porções',
      'Pratos e Refeições',
      'Lanches e Sanduíches',
      'Cafetaria',
      'Sobremesas'
    ];
    return ['Todas', ...list];
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'Todas' && p.category !== selectedCategory) return false;
      if (onlyLowStock && p.stock > p.minStock) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBarcode = p.barcode?.toLowerCase().includes(q);
        return matchName || matchBarcode;
      }
      return true;
    });
  }, [products, selectedCategory, onlyLowStock, searchQuery]);

  // Inventory KPI metrics
  const totalStockCost = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock > 0 ? p.stock * p.costPrice : 0), 0);
  }, [products]);

  const totalStockRetail = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.stock > 0 ? p.stock * p.sellingPrice : 0), 0);
  }, [products]);

  const potentialProfit = Math.max(0, totalStockRetail - totalStockCost);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= p.minStock).length;
  }, [products]);

  // Handler for New/Edit Product
  const handleOpenNewProduct = () => {
    setEditingProduct({
      id: `prod-${Date.now()}`,
      name: '',
      category: 'Bebidas e Refrigerantes',
      barcode: '',
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 10,
      unit: 'un',
      active: true,
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct({ ...prod });
    setProductModalOpen(true);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;
    onSaveProduct(editingProduct);
    setProductModalOpen(false);
    setEditingProduct(null);
  };

  // Handler for Stock Entry (Reposição)
  const handleOpenEntryModal = (prod: Product) => {
    setTargetProduct(prod);
    setEntryQty('12');
    setEntryCost(prod.costPrice.toString());
    setEntryReason('Entrada de mercadoria / Reposição de fornecedor');
    setEntryModalOpen(true);
  };

  const handleEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProduct) return;
    const qty = parseInt(entryQty);
    if (!qty || qty <= 0) return;

    const unitCost = parseFloat(entryCost) || targetProduct.costPrice;
    const prev = targetProduct.stock;
    const next = prev + qty;

    // Add movement
    onAddStockMovement({
      productId: targetProduct.id,
      productName: targetProduct.name,
      type: 'entrada',
      quantity: qty,
      previousStock: prev,
      newStock: next,
      reason: entryReason.trim() || 'Entrada regular de stock',
      employeeName: activeEmployee.name,
      cost: unitCost * qty,
    });

    // Update product
    onSaveProduct({
      ...targetProduct,
      stock: next,
      costPrice: unitCost,
    });

    setEntryModalOpen(false);
    setTargetProduct(null);
  };

  // Handler for Loss / Adjustment (Quebra)
  const handleOpenLossModal = (prod: Product) => {
    setTargetProduct(prod);
    setLossQty('1');
    setLossType('quebra_perda');
    setLossReason('Garrafa partida acidentalmente');
    setLossModalOpen(true);
  };

  const handleLossSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProduct) return;
    const qty = parseInt(lossQty);
    if (!qty || qty <= 0) return;

    const prev = targetProduct.stock;
    const next = Math.max(0, prev - qty);

    onAddStockMovement({
      productId: targetProduct.id,
      productName: targetProduct.name,
      type: lossType,
      quantity: -qty,
      previousStock: prev,
      newStock: next,
      reason: lossReason.trim() || 'Ajuste de stock manual',
      employeeName: activeEmployee.name,
    });

    onSaveProduct({
      ...targetProduct,
      stock: next,
    });

    setLossModalOpen(false);
    setTargetProduct(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Gestão e Controlo de Stock</h2>
          <p className="text-xs text-slate-500">
            Inventário completo, reposições, alertas de stock mínimo e histórico de movimentos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenNewProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Cadastrar Novo Produto
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Total de Produtos</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl font-black text-slate-900 block">
            {products.length}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Cadastrados no catálogo
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Valor em Stock (Custo)</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xl font-black text-slate-900 block">
            {formatMoney(totalStockCost, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Investimento em mercadorias
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Valor Estimado de Venda</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-emerald-700 block">
            {formatMoney(totalStockRetail, settings.currencySymbol)}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            Lucro potencial: {formatMoney(potentialProfit, settings.currencySymbol)}
          </span>
        </div>

        <div className={`p-4 rounded-2xl border shadow-2xs transition ${
          lowStockCount > 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span className={lowStockCount > 0 ? 'text-amber-800 font-bold' : ''}>
              Alertas de Stock Baixo
            </span>
            <AlertTriangle className={`w-4 h-4 ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <span className={`text-2xl font-black block ${lowStockCount > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
            {lowStockCount}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Produtos abaixo do limite mínimo
          </span>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-3">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'produtos'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Catálogo e Stock ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('movimentacoes')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'movimentacoes'
                ? 'border-amber-600 text-amber-700 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Histórico de Movimentações ({movements.length})
          </button>
        </div>

        {/* Tab 1: Products */}
        {activeTab === 'produtos' && (
          <div className="p-5 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar por nome ou código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-amber-600 transition"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-hidden focus:border-amber-600"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setOnlyLowStock(!onlyLowStock)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    onlyLowStock
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Apenas Stock Baixo
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Produto</th>
                    <th className="py-3 px-3">Categoria</th>
                    <th className="py-3 px-3 text-center">Unidade</th>
                    <th className="py-3 px-3 text-right">Preço Custo</th>
                    <th className="py-3 px-3 text-right">Preço Venda</th>
                    <th className="py-3 px-3 text-center">Margem</th>
                    <th className="py-3 px-4 text-center">Stock Atual</th>
                    <th className="py-3 px-4 text-center">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const isOutOfStock = p.stock <= 0;
                    const isLowStock = p.stock > 0 && p.stock <= p.minStock;
                    const margin = p.costPrice > 0 ? Math.round(((p.sellingPrice - p.costPrice) / p.costPrice) * 100) : 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            SKU: {p.barcode || 'N/D'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-medium">
                          {p.category}
                        </td>
                        <td className="py-3 px-3 text-center uppercase text-slate-500 font-medium">
                          {p.unit}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-600">
                          {formatMoney(p.costPrice, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          {formatMoney(p.sellingPrice, settings.currencySymbol)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            +{margin}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-800'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stock} {p.unit}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              Mínimo: {p.minStock}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEntryModal(p)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                              title="Adicionar entrada / Reposição de Stock"
                            >
                              <ArrowDownCircle className="w-3.5 h-3.5" />
                              Entrada
                            </button>
                            <button
                              onClick={() => handleOpenLossModal(p)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] border border-rose-200 transition cursor-pointer flex items-center gap-1"
                              title="Registar quebra, perda ou ajuste"
                            >
                              <ArrowUpCircle className="w-3.5 h-3.5" />
                              Quebra
                            </button>
                            <button
                              onClick={() => handleOpenEditProduct(p)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                              title="Editar Produto"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Stock Movement Audit Log */}
        {activeTab === 'movimentacoes' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Histórico de Movimentações de Stock</h3>
                <p className="text-xs text-slate-500">
                  Registo auditável de todas as compras, quebras e saídas automáticas por vendas
                </p>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {movements.length} movimentos registados
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Produto</th>
                    <th className="py-3 px-3">Tipo</th>
                    <th className="py-3 px-3 text-center">Quantidade</th>
                    <th className="py-3 px-3 text-center">Saldo</th>
                    <th className="py-3 px-4">Motivo / Fornecedor</th>
                    <th className="py-3 px-4">Responsável</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movements.map((mov) => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {formatDateTime(mov.date)}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {mov.productName}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            mov.type === 'entrada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : mov.type === 'quebra_perda'
                              ? 'bg-rose-100 text-rose-800'
                              : mov.type === 'venda'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {mov.type === 'entrada' ? 'Entrada' : mov.type === 'quebra_perda' ? 'Quebra / Perda' : mov.type === 'venda' ? 'Venda PDV' : 'Ajuste'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                            {isPositive ? '+' : ''}{mov.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center text-slate-600 font-medium">
                          {mov.previousStock} → <strong className="text-slate-900">{mov.newStock}</strong>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {mov.reason}
                          {mov.cost && (
                            <span className="block text-[10px] text-slate-400">
                              Custo total: {formatMoney(mov.cost, settings.currencySymbol)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-medium whitespace-nowrap">
                          {mov.employeeName}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* MODAL 1: Cadastrar / Editar Produto */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {products.some((p) => p.id === editingProduct.id) ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nome do Produto / Bebida / Prato:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Cerveja Super Bock 33cl"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:border-amber-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria:</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:border-amber-600 focus:outline-hidden"
                  >
                    {categories.filter((c) => c !== 'Todas').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unidade:</label>
                  <select
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value as UnitType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:border-amber-600 focus:outline-hidden"
                  >
                    <option value="garrafa">Garrafa</option>
                    <option value="lata">Lata</option>
                    <option value="dose">Dose / Copo</option>
                    <option value="un">Unidade (un)</option>
                    <option value="prato">Prato / Porção</option>
                    <option value="kg">Quilograma (kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Preço de Custo ({settings.currencySymbol}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingProduct.costPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Preço de Venda ({settings.currencySymbol}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editingProduct.sellingPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-amber-800 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stock Atual em Armazém:
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Stock Mínimo (Alerta):
                  </label>
                  <input
                    type="number"
                    required
                    value={editingProduct.minStock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-amber-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código de Barras / SKU:
                </label>
                <input
                  type="text"
                  placeholder="Ex: 560123456789"
                  value={editingProduct.barcode}
                  onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:border-amber-600 focus:outline-hidden font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  Salvar Produto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Entrada de Stock / Reposição */}
      {entryModalOpen && targetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Entrada de Mercadoria / Reposição</h3>
              </div>
              <button
                onClick={() => setEntryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-900 block">{targetProduct.name}</span>
              <span className="text-slate-500 block">Stock atual: {targetProduct.stock} {targetProduct.unit}</span>
            </div>

            <form onSubmit={handleEntrySubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Qtd a Adicionar ({targetProduct.unit}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={entryQty}
                    onChange={(e) => setEntryQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-emerald-700 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Custo Unitário ({settings.currencySymbol}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={entryCost}
                    onChange={(e) => setEntryCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Fornecedor / Fatura / Nota de Entrega:
                </label>
                <input
                  type="text"
                  required
                  value={entryReason}
                  onChange={(e) => setEntryReason(e.target.value)}
                  placeholder="Ex: Factura nº 4091 Fornecedor Cervejas Lda"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEntryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Quebra / Perda / Ajuste */}
      {lossModalOpen && targetProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-sm text-slate-900">Registo de Quebra / Ajuste de Stock</h3>
              </div>
              <button
                onClick={() => setLossModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <span className="font-bold text-slate-900 block">{targetProduct.name}</span>
              <span className="text-slate-500 block">Stock atual: {targetProduct.stock} {targetProduct.unit}</span>
            </div>

            <form onSubmit={handleLossSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Saída:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLossType('quebra_perda')}
                    className={`py-2 px-3 rounded-lg border font-semibold text-xs cursor-pointer ${
                      lossType === 'quebra_perda'
                        ? 'bg-rose-50 border-rose-500 text-rose-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Quebra / Avaria / Validade
                  </button>
                  <button
                    type="button"
                    onClick={() => setLossType('saida_ajuste')}
                    className={`py-2 px-3 rounded-lg border font-semibold text-xs cursor-pointer ${
                      lossType === 'saida_ajuste'
                        ? 'bg-amber-50 border-amber-500 text-amber-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Correção de Inventário
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantidade a Abater ({targetProduct.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  max={targetProduct.stock}
                  required
                  value={lossQty}
                  onChange={(e) => setLossQty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm text-rose-700 focus:border-rose-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo / Justificativa Detalhada:
                </label>
                <input
                  type="text"
                  required
                  value={lossReason}
                  onChange={(e) => setLossReason(e.target.value)}
                  placeholder="Ex: Garrafa caiu e partiu-se na geleira do bar"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-rose-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLossModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Confirmar Baixa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
