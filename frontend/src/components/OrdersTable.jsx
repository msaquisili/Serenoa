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
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPayment, setFilterPayment] = useState('Todos');
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Estados para modal de edición
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    nombre: '',
    telefono: '',
    metodoPago: 'WhatsApp / Transferencia',
    estado: 'Pendiente',
    total: 0,
    notas: ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Estados para modal de confirmación de eliminación
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mostrar mensaje toast temporal
  const showToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Totales reales según estado (con soporte amplio para variantes de estado)
  const allCount = orders.length;
  
  const pendingCount = orders.filter(o => {
    const s = (o.estado || 'Pendiente').toLowerCase();
    return s === 'pendiente' || s === 'por preparar';
  }).length;

  const preparingCount = orders.filter(o => {
    const s = (o.estado || '').toLowerCase();
    return s === 'en preparación' || s === 'en preparacion' || s === 'preparando';
  }).length;

  const completedCount = orders.filter(o => {
    const s = (o.estado || '').toLowerCase();
    return s === 'completado' || s === 'entregado' || s === 'pagado';
  }).length;

  const cancelledCount = orders.filter(o => {
    const s = (o.estado || '').toLowerCase();
    return s === 'cancelado';
  }).length;

  // Filtrado de pedidos en tiempo real
  const filteredOrders = orders.filter(o => {
    const st = (o.estado || 'Pendiente').toLowerCase();
    let matchStatus = true;

    if (filterStatus === 'Pendiente') {
      matchStatus = st === 'pendiente' || st === 'por preparar';
    } else if (filterStatus === 'En preparación') {
      matchStatus = st === 'en preparación' || st === 'en preparacion' || st === 'preparando';
    } else if (filterStatus === 'Completado') {
      matchStatus = st === 'completado' || st === 'entregado' || st === 'pagado';
    } else if (filterStatus === 'Cancelado') {
      matchStatus = st === 'cancelado';
    }

    const pago = (o.cliente?.metodoPago || o.metodoPago || '').toLowerCase();
    let matchPayment = true;
    if (filterPayment === 'Transferencia') {
      matchPayment = pago.includes('transferencia');
    } else if (filterPayment === 'Efectivo') {
      matchPayment = pago.includes('efectivo');
    } else if (filterPayment === 'WhatsApp') {
      matchPayment = pago.includes('whatsapp');
    } else if (filterPayment === 'Tarjeta') {
      matchPayment = pago.includes('tarjeta');
    }

    return matchStatus && matchPayment;
  });

  // 1. Cambio reactivo inmediato del Estado
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    
    // Notificar al padre para actualización optimista inmediata en memoria
    if (onOrderUpdated) {
      onOrderUpdated(orderId, { estado: newStatus });
    }

    try {
      await updateOrder(orderId, { estado: newStatus });
      showToast(`Estado actualizado a "${newStatus}"`);
      if (onOrdersUpdated) onOrdersUpdated(true);
    } catch (err) {
      console.error('Error actualizando estado:', err);
      showToast('Error al guardar el estado en el servidor', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  // 2. Cambio reactivo inmediato del Método de Pago
  const handlePaymentChange = async (orderId, newMethod) => {
    setUpdatingId(orderId);

    // Notificar al padre para actualización optimista inmediata en memoria
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

  // 3. Abrir modal para editar pedido
  const handleOpenEdit = (order) => {
    setEditingOrder(order);
    setEditForm({
      nombre: order.cliente?.nombre || '',
      telefono: order.cliente?.telefono || '',
      metodoPago: order.cliente?.metodoPago || order.metodoPago || 'WhatsApp / Transferencia',
      estado: order.estado || 'Pendiente',
      total: Number(order.total || 0),
      notas: order.notas || ''
    });
  };

  // 4. Guardar cambios del pedido editado
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;
    const orderId = editingOrder._id || editingOrder.id || editingOrder.codigo;

    setIsSavingEdit(true);

    const updatePayload = {
      cliente: {
        ...(editingOrder.cliente || {}),
        nombre: editForm.nombre.trim(),
        telefono: editForm.telefono.trim(),
        metodoPago: editForm.metodoPago
      },
      metodoPago: editForm.metodoPago,
      estado: editForm.estado,
      total: Number(editForm.total) || 0,
      notas: editForm.notas.trim()
    };

    // Actualización optimista inmediata
    if (onOrderUpdated) {
      onOrderUpdated(orderId, updatePayload);
    }

    try {
      await updateOrder(orderId, updatePayload);
      showToast('Pedido actualizado con éxito');
      setEditingOrder(null);
      if (onOrdersUpdated) onOrdersUpdated(true);
    } catch (err) {
      console.error('Error guardando edición de pedido:', err);
      showToast('Error al guardar los cambios del pedido', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 5. Eliminar pedido
  const handleConfirmDelete = async () => {
    if (!deletingOrder) return;
    const orderId = deletingOrder._id || deletingOrder.id || deletingOrder.codigo;

    setIsDeleting(true);

    // Eliminación optimista inmediata en interfaz
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
      showToast('Error al eliminar el pedido', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Clases CSS dinámicas para estado
  const getStatusBadgeClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completado' || s === 'entregado' || s === 'pagado') {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
    if (s === 'en preparación' || s === 'en preparacion' || s === 'preparando') {
      return 'bg-blue-50 text-blue-800 border-blue-300';
    }
    if (s === 'cancelado') {
      return 'bg-red-50 text-red-800 border-red-300';
    }
    return 'bg-amber-50 text-amber-800 border-amber-300';
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ECC979]/40 shadow-sm overflow-hidden relative">
      {/* Notificación Toast flotante */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all animate-bounce ${
          toastMessage.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-[#565935] border-[#ECC979]/60 text-white shadow-xl'
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

        {/* Barra de Filtros: Estados con conteo reactivo y Método de Pago */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Píldoras de Estado reflejando el total real */}
          <div className="flex flex-wrap gap-1.5 bg-[#FAF6EF] p-1 rounded-xl border border-[#ECC979]/30">
            <button
              type="button"
              onClick={() => setFilterStatus('Todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Todos' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Todos ({allCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('Pendiente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Pendiente' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('En preparación')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'En preparación' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              En preparación ({preparingCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('Completado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Completado' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Completados ({completedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('Cancelado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Cancelado' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Cancelados ({cancelledCount})
            </button>
          </div>

          {/* Opción Método de Pago */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#565935] whitespace-nowrap">Filtrar Pago:</label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#ECC979]/40 text-xs font-semibold text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 bg-[#FAF6EF] cursor-pointer"
            >
              <option value="Todos">Todos los métodos</option>
              <option value="Transferencia">🏦 Transferencia</option>
              <option value="Efectivo">💵 Efectivo</option>
              <option value="WhatsApp">📱 WhatsApp</option>
              <option value="Tarjeta">💳 Tarjeta</option>
            </select>
          </div>
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
                const currentMetodo = order.cliente?.metodoPago || order.metodoPago || 'WhatsApp / Transferencia';
                const currentEstado = order.estado || 'Pendiente';

                return (
                  <tr key={orderId} className="hover:bg-[#FAF6EF]/40 transition-colors">
                    {/* Código del Pedido */}
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

                    {/* Cantidad de productos */}
                    <td className="py-3 px-4 text-gray-600">
                      {totalItems} {totalItems === 1 ? 'postre' : 'postres'}
                    </td>

                    {/* Método de Pago - EDITABLE DIRECTAMENTE */}
                    <td className="py-3 px-4">
                      <select
                        value={currentMetodo}
                        disabled={updatingId === orderId}
                        onChange={(e) => handlePaymentChange(orderId, e.target.value)}
                        title="Haz clic para cambiar el método de pago"
                        className="text-xs font-semibold px-2.5 py-1 rounded-full border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] hover:border-[#565935] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#565935]"
                      >
                        <option value="WhatsApp / Transferencia">📱 WhatsApp / Transferencia</option>
                        <option value="Transferencia">🏦 Transferencia</option>
                        <option value="Efectivo">💵 Efectivo</option>
                        <option value="Tarjeta">💳 Tarjeta / POS</option>
                      </select>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 font-extrabold text-[#D4AF37] font-sans tabular-nums text-sm">
                      ${Number(order.total || 0).toFixed(2)}
                    </td>

                    {/* Estado - EDITABLE DIRECTAMENTE */}
                    <td className="py-3 px-4">
                      <select 
                        value={currentEstado}
                        disabled={updatingId === orderId}
                        onChange={(e) => handleStatusChange(orderId, e.target.value)}
                        title="Haz clic para actualizar el estado del pedido"
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer focus:outline-none ${getStatusBadgeClass(currentEstado)}`}
                      >
                        <option value="Pendiente">⏳ Pendiente</option>
                        <option value="En preparación">🥣 En preparación</option>
                        <option value="Completado">✅ Completado</option>
                        <option value="Entregado">📦 Entregado</option>
                        <option value="Cancelado">❌ Cancelado</option>
                      </select>
                    </td>

                    {/* Acciones: Ver Detalle, Editar y Eliminar */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Botón Ver Detalle */}
                        <button 
                          type="button"
                          onClick={() => onViewOrderDetail(order)}
                          title="Ver detalle completo"
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#565935] hover:text-white text-[#565935] border border-[#ECC979]/40 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Ver
                        </button>

                        {/* Botón Editar Pedido */}
                        <button 
                          type="button"
                          onClick={() => handleOpenEdit(order)}
                          title="Editar información del pedido"
                          className="px-2.5 py-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#CF7D65] hover:text-white text-[#CF7D65] border border-[#ECC979]/40 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Editar
                        </button>

                        {/* Botón Eliminar Pedido */}
                        <button 
                          type="button"
                          onClick={() => setDeletingOrder(order)}
                          title="Eliminar este pedido"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: EDITAR PEDIDO COMPLETO */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#ECC979]/50 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#ECC979]/20 pb-3">
              <div>
                <h4 className="text-lg font-serif font-bold text-[#2E2A27]">
                  Editar Pedido {editingOrder.codigo || `SER-${String(editingOrder._id || editingOrder.id).slice(-4).toUpperCase()}`}
                </h4>
                <p className="text-xs text-[#7A736B]">Modifica los datos del cliente, pago o estado.</p>
              </div>
              <button 
                type="button"
                onClick={() => setEditingOrder(null)}
                className="w-8 h-8 rounded-full bg-[#FAF6EF] text-[#7A736B] hover:text-[#2E2A27] flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              {/* Nombre del cliente */}
              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">Nombre del Cliente *</label>
                <input 
                  type="text" 
                  required
                  value={editForm.nombre}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 font-medium"
                />
              </div>

              {/* Teléfono / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">Teléfono / WhatsApp</label>
                <input 
                  type="text" 
                  value={editForm.telefono}
                  onChange={(e) => setEditForm(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 font-mono text-xs"
                />
              </div>

              {/* Fila: Método de Pago y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#565935] mb-1">Método de Pago *</label>
                  <select
                    value={editForm.metodoPago}
                    onChange={(e) => setEditForm(prev => ({ ...prev, metodoPago: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] font-semibold cursor-pointer"
                  >
                    <option value="WhatsApp / Transferencia">📱 WhatsApp / Transferencia</option>
                    <option value="Transferencia">🏦 Transferencia</option>
                    <option value="Efectivo">💵 Efectivo</option>
                    <option value="Tarjeta">💳 Tarjeta / POS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#565935] mb-1">Estado del Pedido *</label>
                  <select
                    value={editForm.estado}
                    onChange={(e) => setEditForm(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] font-semibold cursor-pointer"
                  >
                    <option value="Pendiente">⏳ Pendiente</option>
                    <option value="En preparación">🥣 En preparación</option>
                    <option value="Completado">✅ Completado</option>
                    <option value="Entregado">📦 Entregado</option>
                    <option value="Cancelado">❌ Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Total ($) */}
              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">Total a Pagar ($ USD)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={editForm.total}
                  onChange={(e) => setEditForm(prev => ({ ...prev, total: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#D4AF37] font-extrabold focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 font-sans tabular-nums text-base"
                />
              </div>

              {/* Notas u Observaciones */}
              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">Notas u Observaciones</label>
                <textarea 
                  rows="2"
                  value={editForm.notas}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notas: e.target.value }))}
                  placeholder="Instrucciones de entrega, dedicatoria o detalles especiales..."
                  className="w-full px-3 py-2 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 text-xs"
                />
              </div>

              {/* Botones de acción del Modal */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#ECC979]/20">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#565935] to-[#6A6E41] hover:from-[#484B2C] hover:to-[#565935] text-white font-semibold text-xs shadow-sm cursor-pointer transition-all border border-[#ECC979]/50"
                >
                  {isSavingEdit ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMAR ELIMINACIÓN DE PEDIDO */}
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
