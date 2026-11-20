import React, { useState } from 'react';
import { createOrder } from '../services/api';

export default function NewOrderView({ products = [], onOrderCreated, onBack }) {
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [metodoPago, setMetodoPago] = useState('Transferencia');
  const [estado, setEstado] = useState('Pendiente');
  const [notas, setNotas] = useState('');

  // Ítems agregados al pedido
  const [orderItems, setOrderItems] = useState([]);

  // Selector de producto a agregar
  const [selectedProductId, setSelectedProductId] = useState(() => {
    return products.length > 0 ? (products[0]._id || products[0].id) : '';
  });
  const [selectedQty, setSelectedQty] = useState(1);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Agregar producto al pedido
  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find(p => (p._id || p.id) === selectedProductId);
    if (!prod) return;

    const qty = Math.max(1, parseInt(selectedQty) || 1);

    setOrderItems(prev => {
      const existingIndex = prev.findIndex(item => item.id === (prod._id || prod.id));
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].cantidad += qty;
        return copy;
      }
      return [...prev, {
        id: prod._id || prod.id,
        producto: prod._id || prod.id,
        nombre: prod.nombre,
        precioUnitario: Number(prod.precio),
        cantidad: qty,
        imagen: prod.imagen
      }];
    });

    setSelectedQty(1);
    setErrorMsg('');
  };

  const handleRemoveItem = (id) => {
    setOrderItems(prev => prev.filter(i => i.id !== id));
  };

  const handleUpdateItemQty = (id, newQty) => {
    const qty = parseInt(newQty);
    if (qty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setOrderItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: qty } : i));
  };

  // Cálculo automático del total
  const total = orderItems.reduce((acc, item) => acc + (item.cantidad * item.precioUnitario), 0);

  // Generar código de pedido automático
  const generateOrderCode = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `SER-${randomSuffix}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clienteNombre.trim()) {
      setErrorMsg('Por favor ingresa el nombre o descripción del cliente.');
      return;
    }
    if (orderItems.length === 0) {
      setErrorMsg('Debes añadir al menos un producto del catálogo al pedido.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const codigo = generateOrderCode();
      const payload = {
        codigo,
        cliente: {
          nombre: clienteNombre.trim(),
          telefono: clienteTelefono.trim() || 'Sin teléfono',
          metodoPago: metodoPago,
          direccion: 'Retiro en pastelería'
        },
        metodoPago: metodoPago,
        productos: orderItems.map(item => ({
          producto: (item.id && !String(item.id).startsWith('prod-')) ? item.id : null,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario
        })),
        total: Number(total.toFixed(2)),
        estado: estado,
        estadoPago: estado === 'Completado' ? 'Pagado' : 'Pendiente',
        estadoLogistica: estado === 'Completado' ? 'Entregado' : 'Por preparar',
        notas: notas.trim()
      };

      await createOrder(payload);

      setSuccessMsg(`¡Pedido ${codigo} registrado con éxito!`);
      setTimeout(() => {
        if (onOrderCreated) onOrderCreated();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar el pedido en el sistema.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Barra superior de navegación */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#ECC979]/40 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#565935] hover:text-[#CF7D65] mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            Volver a Pedidos
          </button>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2E2A27]">
            Nuevo Pedido
          </h2>
          <p className="text-xs text-[#7A736B]">
            Ingresa los datos del cliente, selecciona postres del catálogo y el total se calculará automáticamente.
          </p>
        </div>

        <button 
          type="button"
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-[#FAF6EF] hover:bg-[#F2DEC7] text-[#565935] text-xs font-semibold border border-[#ECC979]/40 transition-colors cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      {/* Alertas */}
      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 text-xs sm:text-sm rounded-xl border border-red-200 flex items-center gap-2">
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs sm:text-sm rounded-xl border border-emerald-200 flex items-center gap-2">
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Formulario en 2 columnas */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Datos del Cliente y Selección de Postres (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Bloque 1: Cliente */}
          <div className="bg-white p-6 rounded-2xl border border-[#ECC979]/40 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#7A736B] border-b border-[#ECC979]/20 pb-2">
              1. Datos del Cliente
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#565935] mb-1">
                Nombre / Descripción del Cliente <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={clienteNombre}
                onChange={e => setClienteNombre(e.target.value)}
                placeholder="Ej: Sofía Velasteguí (Pedido cumpleaños)"
                className="w-full px-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">
                  Teléfono de Contacto
                </label>
                <input 
                  type="text" 
                  value={clienteTelefono}
                  onChange={e => setClienteTelefono(e.target.value)}
                  placeholder="Ej: +593 98 765 4321"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">
                  Método de Pago <span className="text-red-500">*</span>
                </label>
                <select 
                  value={metodoPago}
                  onChange={e => setMetodoPago(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm font-semibold text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65] bg-white cursor-pointer"
                >
                  <option value="Transferencia">🏦 Transferencia</option>
                  <option value="Efectivo">💵 Efectivo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">
                  Estado del Pedido <span className="text-red-500">*</span>
                </label>
                <select 
                  value={estado}
                  onChange={e => setEstado(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm font-semibold text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65] bg-white cursor-pointer"
                >
                  <option value="Pendiente">⏳ Pendiente</option>
                  <option value="Completado">✅ Completado</option>
                  <option value="Cancelado">❌ Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">
                  Notas / Observaciones
                </label>
                <input 
                  type="text" 
                  value={notas}
                  onChange={e => setNotas(e.target.value)}
                  placeholder="Ej: Empaque de regalo, recoger a las 4pm..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65]"
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Selección de Productos del Catálogo */}
          <div className="bg-white p-6 rounded-2xl border border-[#ECC979]/40 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#7A736B] border-b border-[#ECC979]/20 pb-2">
              2. Agregar Productos del Catálogo
            </h3>

            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-[#565935] mb-1">
                  Seleccionar Postre
                </label>
                <select 
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm font-medium text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 bg-[#FAF6EF] cursor-pointer"
                >
                  {products.map(p => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.nombre} — ${Number(p.precio).toFixed(2)} ({p.categoria})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-xs font-bold text-[#565935] mb-1">
                  Cantidad
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={selectedQty}
                  onChange={e => setSelectedQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm font-bold text-center tabular-nums"
                />
              </div>

              <button 
                type="button"
                onClick={handleAddItem}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#565935] hover:bg-[#6B6D43] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-[#ECC979]/40 active:scale-95"
              >
                <span>+</span>
                <span>Añadir al Pedido</span>
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen de Pedido y Total (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-[#ECC979]/40 shadow-sm sticky top-6 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[#ECC979]/20">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#7A736B]">
                Resumen del Pedido
              </h4>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF6EF] text-[#CF7D65] border border-[#ECC979]/40">
                Código autogenerado al guardar
              </span>
            </div>

            {/* Lista de productos agregados */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {orderItems.length === 0 ? (
                <div className="py-8 text-center text-[#7A736B] text-xs">
                  <div className="text-3xl mb-1">🍰</div>
                  No has añadido ningún postre todavía.
                </div>
              ) : (
                orderItems.map(item => (
                  <div key={item.id} className="p-3 bg-[#FAF6EF] rounded-xl border border-[#ECC979]/30 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-[#2E2A27] truncate">{item.nombre}</h5>
                      <span className="text-[11px] text-[#7A736B]">${item.precioUnitario.toFixed(2)} c/u</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        min="1"
                        value={item.cantidad}
                        onChange={e => handleUpdateItemQty(item.id, e.target.value)}
                        className="w-14 px-2 py-1 bg-white border border-[#ECC979]/40 rounded-lg text-xs font-bold text-center tabular-nums"
                      />
                      <span className="text-xs font-extrabold text-[#D4AF37] tabular-nums whitespace-nowrap min-w-[50px] text-right">
                        ${(item.cantidad * item.precioUnitario).toFixed(2)}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="w-6 h-6 rounded-full hover:bg-red-100 text-red-500 text-xs font-bold flex items-center justify-center cursor-pointer transition-colors"
                        title="Eliminar"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desglose de totales */}
            <div className="pt-3 border-t border-[#ECC979]/20 space-y-2">
              <div className="flex justify-between text-xs text-[#7A736B]">
                <span>Total de postres:</span>
                <span className="font-semibold text-[#2E2A27] tabular-nums">
                  {orderItems.reduce((acc, i) => acc + i.cantidad, 0)} unidades
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#7A736B]">
                <span>Método de pago:</span>
                <span className="font-semibold text-[#2E2A27]">{metodoPago}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-dashed border-[#ECC979]/40">
                <span className="text-sm font-bold text-[#565935]">TOTAL AUTOMÁTICO:</span>
                <span className="text-2xl font-extrabold text-[#D4AF37] font-sans tabular-nums">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Botón de envío */}
            <button 
              type="submit"
              disabled={isSubmitting || orderItems.length === 0}
              className="w-full py-3 bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white rounded-full font-semibold text-xs sm:text-sm shadow-[0_4px_14px_rgba(207,125,101,0.3)] border border-[#ECC979]/50 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>{isSubmitting ? 'Generando pedido...' : 'Agregar Pedido'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
