import React, { useState } from 'react';
import { updateOrderStatus } from '../services/api';

export default function OrderDetailView({ order, onBack, onStatusUpdated }) {
  const [currentStatus, setCurrentStatus] = useState(order?.estado || 'Pendiente');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  if (!order) {
    return (
      <div className="bg-white p-8 rounded-2xl text-center space-y-4">
        <p className="text-gray-500 text-sm">No se ha seleccionado ningún pedido.</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#1A3628] text-white rounded-lg text-xs font-semibold">
          Volver a Pedidos
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus) => {
    setCurrentStatus(newStatus);
    setIsUpdating(true);
    try {
      await updateOrderStatus(order._id || order.id || order.codigo, newStatus);
      setSuccessNotice(true);
      if (onStatusUpdated) onStatusUpdated();
      setTimeout(() => setSuccessNotice(false), 3000);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (st) => {
    switch ((st || '').toLowerCase()) {
      case 'completado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const orderId = order.codigo || (order._id ? `SER-${String(order._id).slice(-4).toUpperCase()}` : 'SER-XXXX');
  const items = Array.isArray(order.productos) ? order.productos : [];
  const total = Number(order.total || 0).toFixed(2);
  const metodoPago = order.cliente?.metodoPago || order.metodoPago || 'WhatsApp / Transferencia';

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
          <div className="flex items-center gap-3">
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

        {/* Selector de estado directo */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-bold text-[#565935] whitespace-nowrap">Cambiar Estado:</label>
          <select 
            value={currentStatus}
            disabled={isUpdating}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#ECC979]/40 text-xs font-semibold text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 bg-[#FAF6EF] cursor-pointer"
          >
            <option value="Pendiente">⏳ Pendiente</option>
            <option value="Completado">✅ Completado</option>
            <option value="Cancelado">❌ Cancelado</option>
          </select>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">
          ✓ Estado del pedido actualizado exitosamente en el sistema.
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
            <span className="text-sm font-bold text-[#565935]">TOTAL PAGADO:</span>
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

            <div className="space-y-3 text-xs sm:text-sm">
              <div>
                <span className="text-[#7A736B] text-[11px] block">Nombre:</span>
                <strong className="text-gray-900 block">{order.cliente?.nombre || 'Cliente General'}</strong>
              </div>

              <div>
                <span className="text-[#7A736B] text-[11px] block">Teléfono / WhatsApp:</span>
                <span className="text-gray-700 font-mono block">{order.cliente?.telefono || 'No especificado'}</span>
              </div>

              <div>
                <span className="text-[#7A736B] text-[11px] block">Método de Pago:</span>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded-full bg-[#FAF6EF] text-[#565935] text-xs font-semibold border border-[#ECC979]/40">
                  {metodoPago}
                </span>
              </div>

              {order.notas && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[#7A736B] text-[11px] block">Notas / Observaciones:</span>
                  <p className="text-gray-600 italic text-xs mt-1 bg-[#FAF6EF] p-2.5 rounded-lg border border-[#ECC979]/30">
                    "{order.notas}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
