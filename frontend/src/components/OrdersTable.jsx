import React, { useState } from 'react';
import { updateOrder, deleteOrder } from '../services/api';

export default function OrdersTable({ 
  orders = [], 
  onOrdersUpdated, 
  onOrderUpdated,
  onOrderDeleted,
  onNewOrder, 
  onViewOrderDetail 
}) {
  // Filtros de navegación
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPayment, setFilterPayment] = useState('Todos');
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Estado para edición INLINE (sin modal)
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [inlineForm, setInlineForm] = useState({
    nombre: '',
    telefono: '',
    metodoPago: 'Transferencia',
    estado: 'Pendiente',
    total: 0,
    notas: ''
  });
  const [isSavingInline, setIsSavingInline] = useState(false);

  // Estado ÚNICAMENTE para modal de confirmación de eliminación
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notificación toast flotante
  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Normalización de Método de Pago: estrictamente 'Transferencia' o 'Efectivo'
  const normalizePayment = (raw) => {
    const s = String(raw || '').toLowerCase();
    return s.includes('efectivo') ? 'Efectivo' : 'Transferencia';
  };

  // Normalización de Estado: estrictamente 'Pendiente', 'Completado', 'Cancelado'
  const normalizeStatus = (raw) => {
    const s = String(raw || '').toLowerCase();
    if (s === 'completado' || s === 'entregado' || s === 'pagado') return 'Completado';
    if (s === 'cancelado') return 'Cancelado';
    return 'Pendiente';
  };

  // 1. Pedidos que coinciden con el método de pago seleccionado (para que los conteos de estado sumen exactamente el total mostrado)
  const ordersMatchingPayment = filterPayment === 'Todos'
    ? orders
    : orders.filter(o => normalizePayment(o.cliente?.metodoPago || o.metodoPago) === filterPayment);

  // Conteos exactos y dinámicos para las píldoras de estado
  const allCount = ordersMatchingPayment.length;
  const pendingCount = ordersMatchingPayment.filter(o => normalizeStatus(o.estado) === 'Pendiente').length;
  const completedCount = ordersMatchingPayment.filter(o => normalizeStatus(o.estado) === 'Completado').length;
  const cancelledCount = ordersMatchingPayment.filter(o => normalizeStatus(o.estado) === 'Cancelado').length;

  // 2. Pedidos que coinciden con el estado seleccionado (para que las opciones de método de pago muestren sus cantidades exactas)
  const ordersMatchingStatus = filterStatus === 'Todos'
    ? orders
    : orders.filter(o => normalizeStatus(o.estado) === filterStatus);

  const allPaymentCount = ordersMatchingStatus.length;
  const transferCount = ordersMatchingStatus.filter(o => normalizePayment(o.cliente?.metodoPago || o.metodoPago) === 'Transferencia').length;
  const cashCount = ordersMatchingStatus.filter(o => normalizePayment(o.cliente?.metodoPago || o.metodoPago) === 'Efectivo').length;

  // Filtrado de pedidos
  const filteredOrders = orders.filter(o => {
    const st = normalizeStatus(o.estado);
    const matchStatus = filterStatus === 'Todos' || st === filterStatus;

    const pago = normalizePayment(o.cliente?.metodoPago || o.metodoPago);
    const matchPayment = filterPayment === 'Todos' || pago === filterPayment;

    return matchStatus && matchPayment;
  });

  // 1. Cambio directo e instantáneo de Estado
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    
    if (onOrderUpdated) {
      onOrderUpdated(orderId, { estado: newStatus });
    }

    try {
      await updateOrder(orderId, { estado: newStatus });
      showToast(`Estado actualizado a "${newStatus}"`);
      if (onOrdersUpdated) onOrdersUpdated(true);
    } catch (err) {
      console.error('Error actualizando estado:', err);
      showToast('Error al guardar el estado', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. Cambio directo e instantáneo de Método de Pago
  const handlePaymentChange = async (orderId, newMethod) => {
    setUpdatingId(orderId);

    if (onOrderUpdated) {
      onOrderUpdated(orderId, { metodoPago: newMethod, cliente: { metodoPago: newMethod } });
    }

    try {
      await updateOrder(orderId, { metodoPago: newMethod });
      showToast(`Método de pago cambiado a "${newMethod}"`);
      if (onOrdersUpdated) onOrdersUpdated(true);
    } catch (err) {
      console.error('Error actualizando método de pago:', err);
      showToast('Error al guardar el método de pago', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // 3. Iniciar edición INLINE en la propia tabla (sin modal)
  const handleStartInlineEdit = (order) => {
    const orderId = order._id || order.id || order.codigo;
    setInlineEditingId(orderId);
    setInlineForm({
      nombre: order.cliente?.nombre || '',
      telefono: order.cliente?.telefono || '',
      metodoPago: normalizePayment(order.cliente?.metodoPago || order.metodoPago),
      estado: normalizeStatus(order.estado),
      total: Number(order.total || 0),
      notas: order.notas || ''
    });
  };

  // 4. Guardar edición INLINE
  const handleSaveInlineEdit = async (orderId) => {
    setIsSavingInline(true);

    const updatePayload = {
      cliente: {
        nombre: inlineForm.nombre.trim(),
        telefono: inlineForm.telefono.trim(),
        metodoPago: inlineForm.metodoPago
      },
      metodoPago: inlineForm.metodoPago,
      estado: inlineForm.estado,
      total: Number(inlineForm.total) || 0,
      notas: inlineForm.notas.trim()
    };

    if (onOrderUpdated) {
      onOrderUpdated(orderId, updatePayload);
    }

    try {
      await updateOrder(orderId, updatePayload);
      showToast('Pedido actualizado correctamente');
      setInlineEditingId(null);
      if (onOrdersUpdated) onOrdersUpdated(true);
    } catch (err) {
      console.error('Error guardando edición:', err);
      showToast('Error al guardar cambios', 'error');
    } finally {
      setIsSavingInline(false);
    }
  };

  // 5. Confirmar eliminación (Único modal permitido)
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    const orderId = deletingOrder._id || deletingOrder.id || deletingOrder.codigo;

    setIsDeleting(true);

    if (onOrderDeleted) {
      onOrderDeleted(orderId);
    }

    try {
      await deleteOrder(orderId);
      showToast('Pedido eliminado correctamente');
      setDeletingOrder(null);
      if (onOrdersUpdated) onOrdersUpdated(true);
    } catch (err) {
      console.error('Error eliminando pedido:', err);
      showToast('Error al eliminar pedido', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadgeClass = (st) => {
    const norm = normalizeStatus(st);
    if (norm === 'Completado') return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    if (norm === 'Cancelado') return 'bg-red-50 text-red-800 border-red-300';
    return 'bg-amber-50 text-amber-800 border-amber-300';
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ECC979]/40 shadow-sm overflow-hidden relative">
      {/* Toast de notificación temporal */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
          toastMessage.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-[#565935] border-[#ECC979]/60 text-white'
        }`}>
          <span>{toastMessage.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header con botón + Nuevo Pedido y Filtros */}
      <div className="p-5 sm:p-6 border-b border-[#ECC979]/20 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-[#2E2A27]">
              Gestión de Pedidos
            </h3>
            <p className="text-xs text-[#7A736B]">
              Revisa, edita o elimina pedidos entrantes y actualiza su estado en tiempo real.
            </p>
          </div>

          {/* Botón + Nuevo Pedido */}
          <button 
            type="button"
            onClick={onNewOrder}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-[#ECC979]/50 active:scale-95"
          >
            <span className="text-sm font-bold text-[#FDF0CD]">+</span>
            <span>Nuevo Pedido</span>
          </button>
        </div>

        {/* Barra de Filtros: Estados y Métodos de Pago corregidos */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Píldoras de Estado (Exactamente: Todos, Pendientes, Completados, Cancelados) */}
          <div className="flex flex-wrap gap-2 bg-[#FAF6EF] p-1.5 rounded-xl border border-[#ECC979]/30">
            <button
              type="button"
              onClick={() => setFilterStatus('Todos')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Todos' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Todos ({allCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('Pendiente')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Pendiente' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('Completado')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Completado' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Completados ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('Cancelado')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Cancelado' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Cancelados ({cancelledCount})
            </button>
          </div>

          {/* Filtro Método de Pago (Exactamente: Todos, Transferencia, Efectivo) */}
          <div className="flex items-center gap-2.5">
            <label className="text-xs font-bold text-[#565935] whitespace-nowrap">Método Pago:</label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="px-3.5 py-1.5 rounded-lg border border-[#ECC979]/40 text-xs font-semibold text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 bg-[#FAF6EF] cursor-pointer"
            >
              <option value="Todos">Todos los métodos ({allPaymentCount})</option>
              <option value="Transferencia">🏦 Transferencia ({transferCount})</option>
              <option value="Efectivo">💵 Efectivo ({cashCount})</option>
            </select>
          </div>
        </div>

        {/* Resumen dinámico del filtro activo que confirma el total exacto */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7A736B] pt-1 border-t border-gray-100">
          <span>
            Mostrando <strong className="text-[#2E2A27]">{filteredOrders.length}</strong> de <strong className="text-[#2E2A27]">{orders.length}</strong> pedidos registrados
            {filterStatus !== 'Todos' && <span className="ml-1 text-[#565935] font-semibold">· Estado: {filterStatus}</span>}
            {filterPayment !== 'Todos' && <span className="ml-1 text-[#565935] font-semibold">· Método: {filterPayment}</span>}
          </span>
          {(filterStatus !== 'Todos' || filterPayment !== 'Todos') && (
            <button
              type="button"
              onClick={() => {
                setFilterStatus('Todos');
                setFilterPayment('Todos');
              }}
              className="text-xs text-[#CF7D65] hover:text-[#565935] font-semibold underline cursor-pointer transition-colors"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[#FAF6EF] text-[#565935] font-semibold border-b border-[#ECC979]/20">
            <tr>
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Productos</th>
              <th className="py-3 px-4">Método de Pago</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-[#7A736B]">
                  <div className="text-2xl mb-2">📦</div>
                  No hay pedidos registrados con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const totalItems = (order.productos || []).reduce((acc, p) => acc + (p.cantidad || 1), 0);
                const orderId = order._id || order.id || order.codigo;
                const currentMetodo = normalizePayment(order.cliente?.metodoPago || order.metodoPago);
                const currentEstado = normalizeStatus(order.estado);
                const isEditingThis = inlineEditingId === orderId;

                return (
                  <React.Fragment key={orderId}>
                    {/* Fila principal del pedido */}
                    <tr className={`hover:bg-[#FAF6EF]/40 transition-colors ${isEditingThis ? 'bg-[#FAF6EF]/70' : ''}`}>
                      {/* Código */}
                      <td className="py-3 px-4 font-mono font-bold text-[#565935]">
                        {order.codigo || `SER-${String(orderId).slice(-4).toUpperCase()}`}
                      </td>

                      {/* Cliente */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">
                          {order.cliente?.nombre || 'Cliente General'}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {order.cliente?.telefono || 'Sin teléfono'}
                        </div>
                      </td>

                      {/* Productos */}
                      <td className="py-3 px-4 text-gray-600">
                        {totalItems} {totalItems === 1 ? 'postre' : 'postres'}
                      </td>

                      {/* Método de Pago - 2 opciones: Transferencia y Efectivo */}
                      <td className="py-3.5 px-4">
                        <select
                          value={currentMetodo}
                          disabled={updatingId === orderId}
                          onChange={(e) => handlePaymentChange(orderId, e.target.value)}
                          title="Haz clic para cambiar el método de pago"
                          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] hover:border-[#565935] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#565935] min-w-[135px]"
                        >
                          <option value="Transferencia">🏦 Transferencia</option>
                          <option value="Efectivo">💵 Efectivo</option>
                        </select>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-extrabold text-[#D4AF37] font-sans tabular-nums text-sm whitespace-nowrap">
                        ${Number(order.total || 0).toFixed(2)}
                      </td>

                      {/* Estado - 3 opciones: Pendiente, Completado y Cancelado */}
                      <td className="py-3.5 px-4">
                        <select 
                          value={currentEstado}
                          disabled={updatingId === orderId}
                          onChange={(e) => handleStatusChange(orderId, e.target.value)}
                          title="Haz clic para actualizar el estado del pedido"
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer focus:outline-none min-w-[130px] ${getStatusBadgeClass(currentEstado)}`}
                        >
                          <option value="Pendiente">⏳ Pendiente</option>
                          <option value="Completado">✅ Completado</option>
                          <option value="Cancelado">❌ Cancelado</option>
                        </select>
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          {/* Botón Ver Detalle (Página completa, sin modal) */}
                          <button 
                            type="button"
                            onClick={() => onViewOrderDetail(order)}
                            title="Ver detalle completo"
                            className="px-3 py-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#565935] hover:text-white text-[#565935] border border-[#ECC979]/40 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Ver
                          </button>

                          {/* Botón Editar (Activa edición inline en la fila, sin modal) */}
                          <button 
                            type="button"
                            onClick={() => {
                              if (isEditingThis) {
                                setInlineEditingId(null);
                              } else {
                                handleStartInlineEdit(order);
                              }
                            }}
                            title="Editar datos del pedido en línea"
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                              isEditingThis 
                                ? 'bg-[#CF7D65] text-white border-[#CF7D65]' 
                                : 'bg-[#FAF6EF] hover:bg-[#CF7D65] hover:text-white text-[#CF7D65] border-[#ECC979]/40'
                            }`}
                          >
                            {isEditingThis ? 'Cerrar' : 'Editar'}
                          </button>

                          {/* Botón Eliminar (Abre el único modal de confirmación) */}
                          <button 
                            type="button"
                            onClick={() => setDeletingOrder(order)}
                            title="Eliminar este pedido"
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Fila expandible de EDICIÓN INLINE (Sin modals) */}
                    {isEditingThis && (
                      <tr className="bg-[#FAF6EF]/90 border-y border-[#ECC979]/40">
                        <td colSpan="7" className="p-4 sm:p-5">
                          <div className="bg-white p-4 rounded-xl border border-[#ECC979]/40 space-y-3">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                              <span className="text-xs font-bold text-[#565935]">
                                ✏️ Edición en línea de {order.codigo || `SER-${String(orderId).slice(-4).toUpperCase()}`}
                              </span>
                              <span className="text-[11px] text-[#7A736B]">Guarda tus cambios directamente aquí</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                              {/* Cliente Nombre */}
                              <div>
                                <label className="block font-bold text-[#565935] mb-1">Cliente *</label>
                                <input 
                                  type="text" 
                                  value={inlineForm.nombre}
                                  onChange={(e) => setInlineForm(prev => ({ ...prev, nombre: e.target.value }))}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27]"
                                  placeholder="Nombre del cliente"
                                />
                              </div>

                              {/* Teléfono */}
                              <div>
                                <label className="block font-bold text-[#565935] mb-1">Teléfono</label>
                                <input 
                                  type="text" 
                                  value={inlineForm.telefono}
                                  onChange={(e) => setInlineForm(prev => ({ ...prev, telefono: e.target.value }))}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] font-mono"
                                  placeholder="+593 9..."
                                />
                              </div>

                              {/* Método de Pago: Transferencia o Efectivo */}
                              <div>
                                <label className="block font-bold text-[#565935] mb-1">Método de Pago</label>
                                <select
                                  value={inlineForm.metodoPago}
                                  onChange={(e) => setInlineForm(prev => ({ ...prev, metodoPago: e.target.value }))}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] font-semibold cursor-pointer"
                                >
                                  <option value="Transferencia">🏦 Transferencia</option>
                                  <option value="Efectivo">💵 Efectivo</option>
                                </select>
                              </div>

                              {/* Estado: Pendiente, Completado o Cancelado */}
                              <div>
                                <label className="block font-bold text-[#565935] mb-1">Estado</label>
                                <select
                                  value={inlineForm.estado}
                                  onChange={(e) => setInlineForm(prev => ({ ...prev, estado: e.target.value }))}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] font-semibold cursor-pointer"
                                >
                                  <option value="Pendiente">⏳ Pendiente</option>
                                  <option value="Completado">✅ Completado</option>
                                  <option value="Cancelado">❌ Cancelado</option>
                                </select>
                              </div>

                              {/* Total ($) */}
                              <div>
                                <label className="block font-bold text-[#565935] mb-1">Total ($)</label>
                                <input 
                                  type="number" 
                                  step="0.01"
                                  min="0"
                                  value={inlineForm.total}
                                  onChange={(e) => setInlineForm(prev => ({ ...prev, total: e.target.value }))}
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#ECC979]/40 bg-[#FAF6EF] text-[#D4AF37] font-extrabold tabular-nums"
                                />
                              </div>

                              {/* Notas */}
                              <div className="sm:col-span-2 md:col-span-3">
                                <label className="block font-bold text-[#565935] mb-1">Notas / Observaciones</label>
                                <input 
                                  type="text" 
                                  value={inlineForm.notas}
                                  onChange={(e) => setInlineForm(prev => ({ ...prev, notas: e.target.value }))}
                                  placeholder="Detalles de entrega, instrucciones o dedicatoria..."
                                  className="w-full px-2.5 py-1.5 rounded-lg border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27]"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                              <button
                                type="button"
                                disabled={isSavingInline}
                                onClick={() => setInlineEditingId(null)}
                                className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                disabled={isSavingInline}
                                onClick={() => handleSaveInlineEdit(orderId)}
                                className="px-4 py-1.5 rounded-lg bg-[#565935] hover:bg-[#484B2C] text-white font-semibold text-xs cursor-pointer shadow-sm transition-colors"
                              >
                                {isSavingInline ? 'Guardando...' : 'Guardar Cambios'}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ÚNICO MODAL PERMITIDO: Confirmación para Eliminar Pedido */}
      {deletingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-red-200 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto">
              🗑️
            </div>
            <div>
              <h4 className="text-base font-bold font-serif text-[#2E2A27]">
                ¿Eliminar este pedido?
              </h4>
              <p className="text-xs text-[#7A736B] mt-1">
                Se eliminará permanentemente el pedido <strong>{deletingOrder.codigo || 'SER-XXXX'}</strong> de <em>{deletingOrder.cliente?.nombre || 'Cliente'}</em> (${Number(deletingOrder.total || 0).toFixed(2)}).
              </p>
            </div>
            <div className="flex justify-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeletingOrder(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs cursor-pointer shadow-sm transition-colors"
              >
                {isDeleting ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
