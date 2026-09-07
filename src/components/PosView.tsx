import React, { useState, useMemo } from 'react';
import { Product, CartItem, PaymentMethod, Sale, StoreSettings, Shift, Employee } from '../types';
import { formatMoney } from '../utils/storage';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Coins, 
  ArrowRight, 
  Check, 
  X, 
  AlertCircle, 
  FileText,
  Utensils,
  Beer,
  Wine,
  Coffee,
  Sparkles,
  User,
  Hash
} from 'lucide-react';

interface PosViewProps {
  products: Product[];
  currentShift: Shift | null;
  activeEmployee: Employee;
  settings: StoreSettings;
  onCompleteSale: (saleData: {
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
  }) => void;
  onOpenShiftEndModal: () => void;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  currentShift,
  activeEmployee,
  settings,
  onCompleteSale,
  onOpenShiftEndModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableOrOrder, setTableOrOrder] = useState<string>('Balcão');
  const [customerName, setCustomerName] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  
  // Checkout Modal
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [cashGiven, setCashGiven] = useState<string>('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['Todas', ...Array.from(set)];
  }, [products]);

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.active) return false;
      if (selectedCategory !== 'Todas' && p.category !== selectedCategory) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBarcode = p.barcode?.toLowerCase().includes(q);
        const matchCat = p.category?.toLowerCase().includes(q);
        return matchName || matchBarcode || matchCat;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // Don't allow adding more than available stock
        if (existing.quantity >= product.stock) {
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item; // limit to stock
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setTableOrOrder('Balcão');
    setCustomerName('');
    setDiscountPercent(0);
  };

  // Financial totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  }, [cart]);

  const discountAmount = (subtotal * discountPercent) / 100;
  const taxableTotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round((taxableTotal * settings.taxPercentage) / 100);
  const total = taxableTotal; // In European/PT style, tax is inclusive or already reflected in gross price

  const costTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.costPrice * item.quantity, 0);
  }, [cart]);

  // Calculate change for cash payment
  const numericCashGiven = parseFloat(cashGiven) || 0;
  const change = Math.max(0, numericCashGiven - total);

  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashGiven(total.toString());
    setIsCheckoutOpen(true);
  };

  const handleFinishSale = () => {
    if (paymentMethod === 'dinheiro' && numericCashGiven < total) {
      alert(`Valor entregue em dinheiro (${formatMoney(numericCashGiven, settings.currencySymbol)}) é menor que o total a pagar (${formatMoney(total, settings.currencySymbol)}).`);
      return;
    }

    const saleItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      unitPrice: item.product.sellingPrice,
      costPrice: item.product.costPrice,
      quantity: item.quantity,
      total: item.product.sellingPrice * item.quantity,
      notes: item.notes,
    }));

    onCompleteSale({
      items: saleItems,
      subtotal,
      discount: discountAmount,
      tax,
      total,
      costTotal,
      paymentMethod,
      cashReceived: paymentMethod === 'dinheiro' ? numericCashGiven : undefined,
      change: paymentMethod === 'dinheiro' ? change : 0,
      customerName: customerName.trim() || undefined,
      tableOrOrder: tableOrOrder.trim() || 'Balcão',
    });

    setIsCheckoutOpen(false);
    clearCart();
  };

  // Helper for quick cash buttons (e.g. 500, 1000, 2000, 5000, 10000, 20000)
  const getCashOptions = () => {
    const base = [total, Math.ceil(total / 500) * 500, Math.ceil(total / 1000) * 1000, Math.ceil(total / 5000) * 5000];
    return Array.from(new Set(base.filter((v) => v >= total))).sort((a, b) => a - b);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* Left Column: Product Catalog (Cols 1 to 8) */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Search & Shift Alert Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar produto por nome ou código de barras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-amber-600 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {currentShift ? (
            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Turno #{currentShift.shiftNumber}
              </span>
              <button
                onClick={onOpenShiftEndModal}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                title="Fechar Turno de Vendas"
              >
                Término de Período
              </button>
            </div>
          ) : (
            <div className="text-xs text-rose-600 font-semibold flex items-center gap-1 shrink-0">
              <AlertCircle className="w-4 h-4" />
              Nenhum turno aberto
            </div>
          )}
        </div>

        {/* Categories Carousel / Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const count = cat === 'Todas' ? products.length : products.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedCategory === cat ? 'bg-amber-800 text-amber-200' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredProducts.map((product) => {
            const inCart = cart.find((c) => c.product.id === product.id);
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStock;

            return (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={isOutOfStock}
                className={`p-3.5 rounded-2xl text-left border transition flex flex-col justify-between relative group cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                    : inCart
                    ? 'bg-amber-50/60 border-amber-400 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-xs'
                }`}
              >
                {/* Stock Tag */}
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider truncate pr-1">
                    {product.unit}
                  </span>
                  {isOutOfStock ? (
                    <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-bold">
                      Esgotado
                    </span>
                  ) : isLowStock ? (
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                      Resta: {product.stock}
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500">
                      Stock: {product.stock}
                    </span>
                  )}
                </div>

                {/* Product Name */}
                <h4 className="font-bold text-xs text-slate-800 line-clamp-2 leading-tight mb-2 min-h-[32px]">
                  {product.name}
                </h4>

                {/* Price & Cart counter */}
                <div className="flex items-end justify-between pt-2 border-t border-slate-100 w-full">
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 block">
                      {formatMoney(product.sellingPrice, settings.currencySymbol)}
                    </span>
                  </div>

                  {inCart && (
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                      {inCart.quantity}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
            <Utensils className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm text-slate-600">Nenhum produto encontrado</p>
            <p className="text-xs text-slate-400 mt-1">
              Verifique a categoria selecionada ou o termo de pesquisa.
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Order / Comanda / Cart (Cols 9 to 12) */}
      <div className="lg:col-span-4 sticky top-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-100px)]">
          
          {/* Cart Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm">Comanda / Pedido Atual</h3>
                <p className="text-[10px] text-slate-400">
                  {cart.reduce((sum, it) => sum + it.quantity, 0)} itens selecionados
                </p>
              </div>
            </div>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Table / Customer Details Inputs */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Mesa / Comanda:
              </label>
              <input
                type="text"
                placeholder="Ex: Mesa 03"
                value={tableOrOrder}
                onChange={(e) => setTableOrOrder(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                Cliente (Opcional):
              </label>
              <input
                type="text"
                placeholder="Nome do cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-600"
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="p-3 overflow-y-auto flex-1 divide-y divide-slate-100 min-h-[220px]">
            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">Nenhum item adicionado.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Toque nos produtos ao lado para incluir na comanda.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-800 truncate">{item.product.name}</h5>
                    <p className="text-[10px] text-slate-400">
                      {formatMoney(item.product.sellingPrice, settings.currencySymbol)} cada
                    </p>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200 transition cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-slate-900 text-xs">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-200 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Subtotal Item */}
                  <div className="text-right min-w-[70px]">
                    <span className="font-extrabold text-slate-900 block text-xs">
                      {formatMoney(item.product.sellingPrice * item.quantity, settings.currencySymbol)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5 ml-auto mt-0.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{formatMoney(subtotal, settings.currencySymbol)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">Desconto:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent || ''}
                      onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      placeholder="0"
                      className="w-12 px-1.5 py-0.5 text-right border border-slate-300 rounded text-xs"
                    />
                    <span className="text-[10px] text-slate-500">%</span>
                    {discountAmount > 0 && (
                      <span className="font-bold text-rose-600 text-xs ml-1">
                        (-{formatMoney(discountAmount, settings.currencySymbol)})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>IVA ({settings.taxPercentage}% inc.):</span>
                  <span>{formatMoney(tax, settings.currencySymbol)}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold">
                  <span className="text-slate-900 text-sm">TOTAL A COBRAR:</span>
                  <span className="text-xl font-extrabold text-amber-700">
                    {formatMoney(total, settings.currencySymbol)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleOpenCheckout}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Cobrar / Finalizar Venda</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Checkout / Payment Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Recebimento de Venda</h3>
                <p className="text-xs text-slate-400">
                  {tableOrOrder} {customerName ? `• ${customerName}` : ''}
                </p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Display */}
            <div className="bg-amber-50 p-6 text-center border-b border-amber-200">
              <span className="text-xs uppercase font-bold text-amber-800 tracking-wider block">
                Valor Total a Pagar
              </span>
              <span className="text-3xl font-black text-amber-900 mt-1 block">
                {formatMoney(total, settings.currencySymbol)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Escolha a Forma de Pagamento:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`py-3 px-2 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'dinheiro'
                        ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Coins className="w-5 h-5 text-amber-600" />
                    <span>Dinheiro</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cartao_tpa')}
                    className={`py-3 px-2 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'cartao_tpa'
                        ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span>Cartão / TPA</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transferencia_pix')}
                    className={`py-3 px-2 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'transferencia_pix'
                        ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span>Transferência</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('fiado')}
                    className={`py-3 px-2 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      paymentMethod === 'fiado'
                        ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-5 h-5 text-slate-600" />
                    <span>Conta / A Prazo</span>
                  </button>
                </div>
              </div>

              {/* Cash specific: Received amount & Change calculation */}
              {paymentMethod === 'dinheiro' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Valor Entregue pelo Cliente ({settings.currencySymbol}):
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 focus:border-amber-600 focus:outline-hidden text-lg font-bold text-slate-900 bg-white"
                      placeholder="Valor recebido"
                    />
                  </div>

                  {/* Quick suggest buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {getCashOptions().map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCashGiven(opt.toString())}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-500 rounded-lg text-xs font-bold text-slate-700 transition"
                      >
                        {formatMoney(opt, settings.currencySymbol)}
                      </button>
                    ))}
                  </div>

                  {/* Troco Result */}
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-700">Troco a Devolver:</span>
                    <span className={`text-lg font-black ${change > 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {formatMoney(change, settings.currencySymbol)}
                    </span>
                  </div>
                </div>
              )}

              {paymentMethod === 'cartao_tpa' && (
                <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    Pagamento por Terminal TPA / Multicaixa
                  </p>
                  <p className="text-blue-700">
                    Insira o valor de <strong>{formatMoney(total, settings.currencySymbol)}</strong> no terminal e aguarde o comprovativo.
                  </p>
                </div>
              )}

              {paymentMethod === 'transferencia_pix' && (
                <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
                  <p className="font-bold">Pagamento por Transferência Bancária / QR Code</p>
                  <p className="text-purple-700">
                    Confirme o envio do comprovativo bancário no valor exato de <strong>{formatMoney(total, settings.currencySymbol)}</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleFinishSale}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Venda e Imprimir Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
