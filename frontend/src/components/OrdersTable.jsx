import React, { useState } from 'react';
import { updateOrderStatus } from '../services/api';

export default function OrdersTable({ 
  orders = [], 
  onOrdersUpdated, 
  onNewOrder, 
  onViewOrderDetail 
}) {
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPayment, setFilterPayment] = useState('Todos');
  const [updatingId, setUpdatingId] = useState(null);

  // Totales reales según estado
  const allCount = orders.length;
  const pendingCount = orders.filter(o => (o.estado || 'Pendiente').toLowerCase() === 'pendiente').length;
  const completedCount = orders.filter(o => (o.estado || '').toLowerCase() === 'completado').length;
  const cancelledCount = orders.filter(o => (o.estado || '').toLowerCase() === 'cancelado').length;

  // Filtrado de pedidos en tiempo real
  const filteredOrders = orders.filter(o => {
    const st = (o.estado || 'Pendiente').toLowerCase();
    const matchStatus = filterStatus === 'Todos' || st === filterStatus.toLowerCase();

    const pago = (o.cliente?.metodoPago || o.metodoPago || '').toLowerCase();
    let matchPayment = true;
    if (filterPayment === 'Transferencia') {
      matchPayment = pago.includes('transferencia');
    } else if (filterPayment === 'Efectivo') {
      matchPayment = pago.includes('efectivo');
    }

    return matchStatus && matchPayment;
  });

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      if (onOrdersUpdated) onOrdersUpdated();
    } catch (err) {
      console.error('Error actualizando pedido:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'completado':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getPaymentBadge = (order) => {
    const raw = (order.cliente?.metodoPago || order.metodoPago || 'Transferencia').toLowerCase();
    if (raw.includes('efectivo')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          💵 Efectivo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        🏦 Transferencia
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ECC979]/40 shadow-sm overflow-hidden">
      {/* Header con botón + Nuevo Pedido y Filtros */}
      <div className="p-5 sm:p-6 border-b border-[#ECC979]/20 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif text-[#2E2A27]">
              Gestión de Pedidos
            </h3>
            <p className="text-xs text-[#7A736B]">
              Revisa pedidos entrantes desde WhatsApp o la tienda y actualiza su estado.
            </p>
          </div>

          {/* Botón + Nuevo Pedido con redirección a página completa */}
          <button 
            type="button"
            onClick={onNewOrder}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-[#ECC979]/50 active:scale-95"
          >
            <span className="text-sm font-bold text-[#FDF0CD]">+</span>
            <span>Nuevo Pedido</span>
          </button>
        </div>

        {/* Barra de Filtros: Estados con conteo real y Método de Pago */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Píldoras de Estado reflejando el total real */}
          <div className="flex flex-wrap gap-1.5 bg-[#FAF6EF] p-1 rounded-xl border border-[#ECC979]/30">
            <button
              onClick={() => setFilterStatus('Todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Todos' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Todos ({allCount})
            </button>
            <button
              onClick={() => setFilterStatus('Pendiente')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Pendiente' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setFilterStatus('Completado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Completado' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Completados ({completedCount})
            </button>
            <button
              onClick={() => setFilterStatus('Cancelado')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filterStatus === 'Cancelado' ? 'bg-[#565935] text-white shadow-sm' : 'text-[#7A736B] hover:text-[#2E2A27]'}`}
            >
              Cancelados ({cancelledCount})
            </button>
          </div>

          {/* Opción Método de Pago */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-[#565935] whitespace-nowrap">Método Pago:</label>
            <select
              value={filterPayment}
              onChange={(e) => setFilterPayment(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-[#ECC979]/40 text-xs font-semibold text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 bg-[#FAF6EF] cursor-pointer"
            >
              <option value="Todos">Todos los métodos</option>
              <option value="Transferencia">🏦 Transferencia</option>
              <option value="Efectivo">💵 Efectivo</option>
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
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-[#7A736B]">
                  No hay pedidos registrados con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => {
                const totalItems = (order.productos || []).reduce((acc, p) => acc + (p.cantidad || 1), 0);
                const orderId = order._id || order.id || order.codigo;

                return (
                  <tr key={orderId} className="hover:bg-[#FAF6EF]/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#565935]">
                      {order.codigo || `SER-${String(orderId).slice(-4).toUpperCase()}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">
                        {order.cliente?.nombre || 'Cliente General'}
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {order.cliente?.telefono || 'Sin teléfono'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {totalItems} {totalItems === 1 ? 'postre' : 'postres'}
                    </td>
                    <td className="py-3 px-4">
                      {getPaymentBadge(order)}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#D4AF37] font-sans tabular-nums">
                      ${Number(order.total || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <select 
                        value={order.estado || 'Pendiente'}
                        disabled={updatingId === orderId}
                        onChange={(e) => handleStatusChange(orderId, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${getStatusBadgeClass(order.estado)}`}
                      >
                        <option value="Pendiente">⏳ Pendiente</option>
                        <option value="Completado">✅ Completado</option>
                        <option value="Cancelado">❌ Cancelado</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {/* Redirección a página completa en vez de modal */}
                      <button 
                        type="button"
                        onClick={() => onViewOrderDetail(order)}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF6EF] hover:bg-[#565935] hover:text-white text-[#565935] border border-[#ECC979]/40 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
