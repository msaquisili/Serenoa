import React, { useState } from 'react';
import { deleteProduct } from '../services/api';

export default function ProductsTable({ products = [], onRefresh, onNewProduct, onEditProduct }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const categories = ['Todas', ...new Set(products.map(p => p.categoria).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchCat = categoryFilter === 'Todas' || (p.categoria || '').toLowerCase() === categoryFilter.toLowerCase();
    const q = searchTerm.toLowerCase().trim();
    const matchSearch = !q || 
      (p.nombre && p.nombre.toLowerCase().includes(q)) ||
      (p.categoria && p.categoria.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleDelete = async (prodId) => {
    setIsDeleting(true);
    try {
      await deleteProduct(prodId);
      setConfirmDeleteId(null);
      setFeedbackMsg('Producto eliminado correctamente del catálogo.');
      if (onRefresh) onRefresh();
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      console.error('Error eliminando producto:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ECC979]/40 shadow-sm overflow-hidden">
      {/* Mensaje de notificación en línea */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs border-b border-emerald-100 flex items-center justify-between">
          <span>✓ {feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      {/* Header con búsqueda, filtros y botón nuevo producto */}
      <div className="p-5 sm:p-6 border-b border-[#ECC979]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-serif text-[#2E2A27]">
            Catálogo de Productos
          </h3>
          <p className="text-xs text-[#7A736B]">
            Administra los postres, sus precios, stock y visibilidad en la tienda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar postre..."
            className="px-3 py-1.5 rounded-lg border border-[#ECC979]/40 text-xs text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65] w-full sm:w-44"
          />

          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#ECC979]/40 text-xs font-medium text-[#2E2A27] focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 bg-[#FAF6EF] cursor-pointer"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Redirección a página completa para nuevo producto */}
          <button 
            type="button"
            onClick={onNewProduct}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer border border-[#ECC979]/50 active:scale-95"
          >
            <span className="font-bold text-[#FDF0CD]">+</span>
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[#FAF6EF] text-[#565935] font-semibold border-b border-[#ECC979]/20">
            <tr>
              <th className="py-3 px-4">Postre</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Precio</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-10 text-center text-[#7A736B]">
                  No se encontraron postres con ese criterio.
                </td>
              </tr>
            ) : (
              filteredProducts.map(p => {
                const prodId = p._id || p.id;
                const isConfirming = confirmDeleteId === prodId;

                return (
                  <tr key={prodId} className="hover:bg-[#FAF6EF]/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={p.imagen} 
                          alt={p.nombre} 
                          className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-[#ECC979]/30"
                          onError={(e) => {
                            if (!e.target.dataset.hasFailed) {
                              e.target.dataset.hasFailed = 'true';
                              e.target.src = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400';
                            }
                          }}
                        />
                        <div>
                          <div className="font-bold text-gray-900">{p.nombre}</div>
                          <div className="text-[11px] text-gray-400 max-w-xs truncate">{p.descripcion}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#99B4AA]/20 text-[#565935] text-xs font-semibold border border-[#99B4AA]/30">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#D4AF37] font-sans tabular-nums">
                      ${Number(p.precio).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${p.stock <= 3 ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.activo && p.stock > 0 ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          Disponible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[11px] font-semibold">
                          Agotado / Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isConfirming ? (
                        <div className="inline-flex items-center gap-1.5 p-1 bg-red-50 rounded-lg border border-red-200">
                          <span className="text-[11px] text-red-700 font-bold px-1">¿Eliminar?</span>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDelete(prodId)}
                            className="px-2 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            {isDeleting ? '...' : 'Sí'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Redirección a página completa para editar */}
                          <button 
                            type="button"
                            onClick={() => onEditProduct(p)}
                            className="px-2.5 py-1 rounded bg-[#FAF6EF] hover:bg-[#565935] hover:text-white text-[#565935] border border-[#ECC979]/40 text-xs font-semibold transition-colors cursor-pointer"
                            title="Editar postre en página dedicada"
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            type="button"
                            onClick={() => setConfirmDeleteId(prodId)}
                            className="px-2.5 py-1 rounded bg-red-50 hover:bg-red-600 hover:text-white text-red-600 text-xs font-semibold transition-colors cursor-pointer"
                            title="Eliminar producto"
                          >
                            🗑️
                          </button>
                        </div>
                      )}
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
