import React, { useState, useEffect } from 'react';
import { getAllCategories, saveCustomCategory, deleteCustomCategory } from '../services/api';

export default function CategoriesManager({ products = [], onCategoriesUpdated }) {
  const [categories, setCategories] = useState(() => getAllCategories(products));
  const [newCatName, setNewCatName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);

  // Sincronización reactiva bidireccional con toda la aplicación
  useEffect(() => {
    setCategories(getAllCategories(products));

    const handleSync = () => {
      setCategories(getAllCategories(products));
    };

    window.addEventListener('serenoa_categories_updated', handleSync);
    return () => {
      window.removeEventListener('serenoa_categories_updated', handleSync);
    };
  }, [products]);

  const handleAdd = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const trimmed = newCatName.trim();
    if (!trimmed) {
      setErrorMessage('Por favor escribe un nombre de categoría.');
      return;
    }

    const res = saveCustomCategory(trimmed, products);
    if (!res.success) {
      setErrorMessage(res.message);
      return;
    }

    const updated = getAllCategories(products);
    setCategories(updated);
    setNewCatName('');
    setSuccessMessage(res.message);
    if (onCategoriesUpdated) onCategoriesUpdated(updated);
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  const handleDelete = (catName) => {
    deleteCustomCategory(catName);
    const updated = getAllCategories(products);
    setCategories(updated);
    setConfirmDeleteCat(null);
    setSuccessMessage(`Categoría "${catName}" eliminada.`);
    if (onCategoriesUpdated) onCategoriesUpdated(updated);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#ECC979]/40 shadow-sm p-6 max-w-2xl">
      <h3 className="text-base sm:text-lg font-bold font-serif text-[#2E2A27] mb-1">
        Gestión de Categorías
      </h3>
      <p className="text-xs text-[#7A736B] mb-5">
        Organiza las familias de postres para los filtros de la tienda pública y del panel.
      </p>

      {/* Notificación de éxito en la interfaz */}
      {successMessage && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center justify-between">
          <span>✓ {successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-700 font-bold">&times;</button>
        </div>
      )}

      {/* Formulario para agregar */}
      <form onSubmit={handleAdd} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input 
            type="text" 
            value={newCatName}
            onChange={e => {
              setNewCatName(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            placeholder="Nueva categoría (ej: Alfajores, Helados)..."
            className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 ${errorMessage ? 'border-red-400 focus:ring-red-200' : 'border-[#ECC979]/40 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65]'}`}
          />
          <button 
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap border border-[#ECC979]/50 active:scale-95"
          >
            Agregar nueva categoría
          </button>
        </div>

        {/* Mensaje de error moderno directamente en la interfaz debajo del campo */}
        {errorMessage && (
          <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </p>
        )}
      </form>

      {/* Lista de categorías */}
      <div className="divide-y divide-gray-100 border border-[#ECC979]/20 rounded-xl overflow-hidden">
        {categories.map(cat => {
          const count = products.filter(p => (p.categoria || '').toLowerCase() === cat.toLowerCase()).length;
          const isConfirming = confirmDeleteCat === cat;

          return (
            <div key={cat} className="p-3.5 flex justify-between items-center bg-white hover:bg-[#FAF6EF]/60 transition-colors">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900 text-xs sm:text-sm">{cat}</span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#99B4AA]/20 text-[#565935] font-semibold border border-[#99B4AA]/30">
                  {count} {count === 1 ? 'producto' : 'productos'}
                </span>
              </div>

              {isConfirming ? (
                <div className="inline-flex items-center gap-2 p-1 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-[11px] text-red-700 font-bold px-1">¿Eliminar?</span>
                  <button 
                    onClick={() => handleDelete(cat)}
                    className="px-2.5 py-0.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                  >
                    Sí
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteCat(null)}
                    className="px-2.5 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold cursor-pointer"
                  >
                    No
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setConfirmDeleteCat(cat)}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 rounded hover:bg-red-50 cursor-pointer transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
