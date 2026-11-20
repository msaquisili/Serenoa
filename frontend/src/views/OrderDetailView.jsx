import React, { useState } from 'react';
import { updateOrder, deleteOrder } from '../services/api';

export default function OrderDetailView({ 
  order, 
  onBack, 
  onStatusUpdated, 
  onOrderUpdated, 
  onOrderDeleted 
}) {
  const [currentStatus, setCurrentStatus] = useState(order?.estado || 'Pendiente');
  const [currentMetodo, setCurrentMetodo] = useState(
    order?.cliente?.metodoPago || order?.metodoPago || 'WhatsApp / Transferencia'
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  // Modal de edición
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: order?.cliente?.nombre || '',
    telefono: order?.cliente?.telefono || '',
    metodoPago: order?.cliente?.metodoPago || order?.metodoPago || 'WhatsApp / Transferencia',
    estado: order?.estado || 'Pendiente',
    total: Number(order?.total || 0),
    notas: order?.notas || ''
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!order) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center space-y-4">
        <p className="text-gray-500 text-sm">No se ha seleccionado ningún pedido.</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#1A3628] text-white rounded-lg text-xs font-semibold cursor-pointer">
          Volver a Pedidos
        </button>
      </div>
    );
  }

  const orderId = order.codigo || (order._id ? `SER-${String(order._id).slice(-4).toUpperCase()}` : 'SER-XXXX');
  const actualId = order._id || order.id || order.codigo;

  const showNotice = (msg, type = 'success') => {
    setFeedbackNotice({ text: msg, type });
    setTimeout(() => setFeedbackNotice(null), 3500);
  };

  // 1. Cambio de Estado
  const handleStatusChange = async (newStatus) => {
    setCurrentStatus(newStatus);
    setIsUpdating(true);

    if (onOrderUpdated) {
      onOrderUpdated(actualId, { estado: newStatus });
    }

    try {
      await updateOrder(actualId, { estado: newStatus });
      showNotice(`Estado del pedido actualizado a "${newStatus}"`);
      if (onStatusUpdated) onStatusUpdated(true);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      showNotice('Error al actualizar estado en el servidor', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // 2. Cambio directo de Método de Pago
  const handlePaymentChange = async (newMethod) => {
    setCurrentMetodo(newMethod);
    setIsUpdating(true);

    const updatePayload = {
      metodoPago: newMethod,
      cliente: { ...(order.cliente || {}), metodoPago: newMethod }
    };

    if (onOrderUpdated) {
      onOrderUpdated(actualId, updatePayload);
    }

    try {
      await updateOrder(actualId, updatePayload);
      showNotice(`Método de pago actualizado a "${newMethod}"`);
      if (onStatusUpdated) onStatusUpdated(true);
    } catch (err) {
      console.error('Error al actualizar método de pago:', err);
      showNotice('Error al actualizar método de pago en el servidor', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. Guardar cambios del formulario de edición
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setIsSavingEdit(true);

    const updatePayload = {
      cliente: {
        ...(order.cliente || {}),
        nombre: editForm.nombre.trim(),
        telefono: editForm.telefono.trim(),
        metodoPago: editForm.metodoPago
      },
      metodoPago: editForm.metodoPago,
      estado: editForm.estado,
      total: Number(editForm.total) || 0,
      notas: editForm.notas.trim()
    };

    if (onOrderUpdated) {
      onOrderUpdated(actualId, updatePayload);
    }

    try {
      await updateOrder(actualId, updatePayload);
      setCurrentStatus(editForm.estado);
      setCurrentMetodo(editForm.metodoPago);
      setIsEditing(false);
      showNotice('Pedido actualizado exitosamente');
      if (onStatusUpdated) onStatusUpdated(true);
    } catch (err) {
      console.error('Error guardando edición:', err);
      showNotice('Error al guardar cambios', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 4. Confirmar eliminación del pedido
  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    if (onOrderDeleted) {
      onOrderDeleted(actualId);
    }

    try {
      await deleteOrder(actualId);
      if (onStatusUpdated) onStatusUpdated(true);
      onBack();
    } catch (err) {
      console.error('Error eliminando pedido:', err);
      showNotice('Error al eliminar pedido', 'error');
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (st) => {
    const s = (st || '').toLowerCase();
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

  const items = Array.isArray(order.productos) ? order.productos : [];
  const total = Number(order.total || 0).toFixed(2);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header Superior */}
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
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2E2A27]">
              Pedido {orderId}
            </h2>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusBadge(currentStatus)}`}>
              {currentStatus}
            </span>
          </div>
          <span className="text-xs text-[#7A736B]">
            Registrado el {new Date(order.createdAt || Date.now()).toLocaleString('es-EC', { dateStyle: 'full', timeStyle: 'short' })}
          </span>
        </div>

        {/* Acciones principales: Estado, Editar y Eliminar */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-[#565935] whitespace-nowrap">Estado:</label>
            <select 
              value={currentStatus}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-[#ECC979]/40 text-xs font-semibold text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 bg-[#FAF6EF] cursor-pointer"
            >
              <option value="Pendiente">⏳ Pendiente</option>
              <option value="En preparación">🥣 En preparación</option>
              <option value="Completado">✅ Completado</option>
              <option value="Entregado">📦 Entregado</option>
              <option value="Cancelado">❌ Cancelado</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF6EF] hover:bg-[#CF7D65] hover:text-white text-[#CF7D65] border border-[#ECC979]/50 text-xs font-semibold cursor-pointer transition-colors"
          >
            Editar
          </button>

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 border border-red-200 text-xs font-semibold cursor-pointer transition-colors"
            title="Eliminar este pedido"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          feedbackNotice.type === 'error'
            ? 'bg-red-50 text-red-800 border-red-200'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <span>{feedbackNotice.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{feedbackNotice.text}</span>
        </div>
      )}

      {/* Grid de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Productos (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#ECC979]/40 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A736B] border-b border-[#ECC979]/20 pb-2">
            Productos en la Orden
          </h3>

          <div className="divide-y divide-gray-100">
            {items.map((item, idx) => {
              const qty = Number(item.cantidad) || 1;
              const price = Number(item.precioUnitario || item.precio || 0);
              const sub = qty * price;
              return (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#2E2A27]">{item.nombre}</h4>
                    <span className="text-xs text-[#7A736B]">
                      {qty} x ${price.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-[#D4AF37] tabular-nums">
                    ${sub.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#ECC979]/20 flex justify-between items-baseline">
            <span className="text-sm font-bold text-[#565935]">TOTAL:</span>
            <span className="text-2xl font-extrabold text-[#D4AF37] font-sans tabular-nums">
              ${total}
            </span>
          </div>
        </div>

        {/* Columna Derecha: Cliente y Método de Pago (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-[#ECC979]/40 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A736B] border-b border-[#ECC979]/20 pb-2">
              Información del Cliente
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <span className="text-[#7A736B] text-[11px] block font-semibold">Nombre:</span>
                <strong className="text-gray-900 block text-sm">{order.cliente?.nombre || 'Cliente General'}</strong>
              </div>

              <div>
                <span className="text-[#7A736B] text-[11px] block font-semibold">Teléfono / WhatsApp:</span>
                <span className="text-gray-700 font-mono block">{order.cliente?.telefono || 'No especificado'}</span>
              </div>

              {/* Método de Pago - EDITABLE DIRECTAMENTE */}
              <div>
                <span className="text-[#7A736B] text-[11px] block font-semibold mb-1">Método de Pago:</span>
                <select
                  value={currentMetodo}
                  disabled={isUpdating}
                  onChange={(e) => handlePaymentChange(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#565935]"
                >
                  <option value="WhatsApp / Transferencia">📱 WhatsApp / Transferencia</option>
                  <option value="Transferencia">🏦 Transferencia</option>
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Tarjeta">💳 Tarjeta / POS</option>
                </select>
              </div>

              {order.notas && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[#7A736B] text-[11px] block font-semibold">Notas / Observaciones:</span>
                  <p className="text-gray-600 italic text-xs mt-1 bg-[#FAF6EF] p-2.5 rounded-lg border border-[#ECC979]/30">
                    "{order.notas}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL PARA EDITAR PEDIDO */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#ECC979]/50 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#ECC979]/20 pb-3">
              <div>
                <h4 className="text-lg font-serif font-bold text-[#2E2A27]">
                  Editar Pedido {orderId}
                </h4>
                <p className="text-xs text-[#7A736B]">Actualiza la información del pedido.</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-[#FAF6EF] text-[#7A736B] hover:text-[#2E2A27] flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">Nombre del Cliente *</label>
                <input 
                  type="text" 
                  required
                  value={editForm.nombre}
                  onChange={(e) => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">Teléfono / WhatsApp</label>
                <input 
                  type="text" 
                  value={editForm.telefono}
                  onChange={(e) => setEditForm(prev => ({ ...prev, telefono: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] font-mono text-xs"
                />
              </div>

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

              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">Total ($ USD)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={editForm.total}
                  onChange={(e) => setEditForm(prev => ({ ...prev, total: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#D4AF37] font-extrabold tabular-nums text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#565935] mb-1">Notas u Observaciones</label>
                <textarea 
                  rows="2"
                  value={editForm.notas}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notas: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECC979]/40 bg-[#FAF6EF] text-[#2E2A27] text-xs"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#ECC979]/20">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => setIsEditing(false)}
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

      {/* MODAL PARA CONFIRMAR ELIMINACIÓN */}
      {showDeleteModal && (
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
                Se eliminará permanentemente el pedido <strong>{orderId}</strong> (${total}). Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex justify-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
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
