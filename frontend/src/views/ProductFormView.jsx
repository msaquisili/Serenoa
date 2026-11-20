import React, { useState, useEffect } from 'react';
import { saveProduct } from '../services/api';

export default function ProductFormView({ productToEdit, onSaved, onBack, existingCategories = [] }) {
  const isEditing = Boolean(productToEdit);

  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Tartas',
    precio: '',
    costo: '',
    stock: '10',
    descripcion: '',
    imagen: '',
    activo: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const PRESET_IMAGES = [
    { label: 'Tarta de Fresa', url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400' },
    { label: 'Cheesecake Frutos Rojos', url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400' },
    { label: 'Macarons Franceses', url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?q=80&w=400' },
    { label: 'Selva Negra', url: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=400' },
    { label: 'Éclair Chocolate', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=400' },
    { label: 'Galletas Mantequilla', url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=400' }
  ];

  const defaultCategories = ['Tartas', 'Cheesecakes', 'Macarons', 'Postres Especiales', 'Galletas'];
  const allCategories = [...new Set([...defaultCategories, ...existingCategories])];

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        nombre: productToEdit.nombre || '',
        categoria: productToEdit.categoria || 'Tartas',
        precio: productToEdit.precio ? String(productToEdit.precio) : '',
        costo: productToEdit.costo !== undefined ? String(productToEdit.costo) : '',
        stock: productToEdit.stock !== undefined ? String(productToEdit.stock) : '10',
        descripcion: productToEdit.descripcion || productToEdit.desc || '',
        imagen: productToEdit.imagen || '',
        activo: productToEdit.activo !== undefined ? productToEdit.activo : true
      });
    } else {
      setFormData({
        nombre: '',
        categoria: allCategories[0] || 'Tartas',
        precio: '',
        costo: '',
        stock: '10',
        descripcion: '',
        imagen: PRESET_IMAGES[0].url,
        activo: true
      });
    }
    setErrorMsg('');
    setSuccessMsg('');
  }, [productToEdit]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('La imagen no debe superar los 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar automáticamente a máximo 900x900 para mantener alta calidad y peso ultra ligero
        const maxDim = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, imagen: optimizedDataUrl }));
        setErrorMsg('');
      };
      img.onerror = () => {
        setFormData(prev => ({ ...prev, imagen: event.target.result }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const calculateMargin = () => {
    const p = parseFloat(formData.precio);
    const c = parseFloat(formData.costo);
    if (!isNaN(p) && !isNaN(c) && p > 0 && c > 0) {
      const margin = ((p - c) / p) * 100;
      return margin.toFixed(1);
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setErrorMsg('Por favor escribe el nombre del postre.');
      return;
    }
    if (!formData.precio || Number(formData.precio) <= 0) {
      setErrorMsg('Por favor ingresa un precio válido mayor a 0.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        categoria: formData.categoria.trim(),
        precio: Number(formData.precio),
        costo: Number(formData.costo) || 0,
        stock: Number(formData.stock) || 0,
        descripcion: formData.descripcion.trim(),
        imagen: formData.imagen || PRESET_IMAGES[0].url,
        activo: formData.activo
      };

      const targetId = productToEdit ? (productToEdit._id || productToEdit.id) : null;
      await saveProduct(payload, targetId);

      setSuccessMsg(isEditing ? '¡Producto actualizado con éxito!' : '¡Producto agregado al catálogo!');
      setTimeout(() => {
        if (onSaved) onSaved();
      }, 700);
    } catch (err) {
      setErrorMsg(err.message || 'Error guardando producto en el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const margin = calculateMargin();

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Barra superior de navegación de página completa */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#ECC979]/40 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#565935] hover:text-[#CF7D65] mb-2 cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
            Volver al Catálogo
          </button>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2E2A27]">
            {isEditing ? `Editar Postre: ${productToEdit.nombre}` : 'Nuevo Postre'}
          </h2>
          <p className="text-xs text-[#7A736B]">
            {isEditing ? 'Actualiza los datos del producto en la tienda y en la base de datos.' : 'Completa la información para publicar una nueva delicia en el catálogo.'}
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

      {/* Alertas en línea */}
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

      {/* Cuerpo principal en 2 columnas: Formulario a la izquierda y Previsualización a la derecha */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Formulario (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-[#ECC979]/40 shadow-sm space-y-5">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#7A736B] border-b border-[#ECC979]/20 pb-2">
            Información del Postre
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#565935] mb-1">
              Nombre del Postre <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              required
              value={formData.nombre}
              onChange={e => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Tarta de Fresa Clásica y Pistacho"
              className="w-full px-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#565935] mb-1">
                Categoría / Familia <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.categoria}
                onChange={e => setFormData({ ...formData, categoria: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65] bg-white cursor-pointer"
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#565935] mb-1">
                Stock Inicial en Cocina
              </label>
              <input 
                type="number" 
                min="0"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
                placeholder="10"
                className="w-full px-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#565935] mb-1">
                Precio de Venta ($ USD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-[#D4AF37] font-bold text-sm">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  required
                  value={formData.precio}
                  onChange={e => setFormData({ ...formData, precio: e.target.value })}
                  placeholder="15.00"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65] tabular-nums font-bold text-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#565935] mb-1">
                Costo de Producción ($ USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-gray-400 font-bold text-sm">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={formData.costo}
                  onChange={e => setFormData({ ...formData, costo: e.target.value })}
                  placeholder="6.50"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65] tabular-nums"
                />
              </div>
            </div>
          </div>

          {margin && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
              <span className="text-emerald-800 font-medium">Margen estimado de ganancia:</span>
              <strong className="text-emerald-900 font-bold text-sm">{margin}%</strong>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#565935] mb-1">
              Descripción del Postre
            </label>
            <textarea 
              rows="3"
              value={formData.descripcion}
              onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Detalla los ingredientes finos, texturas y experiencia de sabor..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65]"
            ></textarea>
          </div>

          {/* Fotografía del Producto */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-[#565935] mb-2">
              Fotografía del Postre
            </label>

            {/* Presets rápidos */}
            <span className="text-[11px] text-[#7A736B] block mb-2">Selecciona una imagen sugerida:</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
              {PRESET_IMAGES.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setFormData({ ...formData, imagen: img.url })}
                  className={`relative rounded-lg overflow-hidden h-14 border-2 transition-all cursor-pointer ${formData.imagen === img.url ? 'border-[#D4AF37] scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* O subir imagen propia / URL */}
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <input 
                type="text" 
                value={formData.imagen}
                onChange={e => setFormData({ ...formData, imagen: e.target.value })}
                placeholder="O pega la URL de la imagen..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#ECC979]/40 text-xs focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65]"
              />
              <label className="w-full sm:w-auto px-4 py-2 rounded-xl border border-[#ECC979]/50 text-[#565935] hover:bg-[#FAF6EF] text-xs font-semibold cursor-pointer whitespace-nowrap text-center transition-colors">
                <span>Subir archivo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Estado Activo */}
          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="chk-activo"
              checked={formData.activo}
              onChange={e => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-[#CF7D65] rounded border-[#ECC979]/60 focus:ring-[#CF7D65] cursor-pointer"
            />
            <label htmlFor="chk-activo" className="text-xs sm:text-sm font-semibold text-[#565935] cursor-pointer select-none">
              Publicar inmediatamente en el catálogo visible de la tienda
            </label>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-[#ECC979]/20 flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 rounded-full border border-[#ECC979]/40 text-[#7A736B] hover:bg-[#FAF6EF] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white text-xs sm:text-sm font-semibold shadow-[0_4px_14px_rgba(207,125,101,0.3)] border border-[#ECC979]/50 transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSubmitting ? 'Guardando postre...' : (isEditing ? 'Guardar Cambios' : 'Publicar Postre')}
            </button>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Vista Previa (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#ECC979]/40 shadow-sm sticky top-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A736B] mb-3">
              Vista Previa en Tienda
            </h4>

            {/* Tarjeta idéntica a la tienda */}
            <div className="bg-[#FAF6EF] rounded-2xl p-4 border border-[#ECC979]/45 shadow-sm">
              <div className="relative h-44 w-full rounded-xl overflow-hidden mb-3 bg-white">
                <img 
                  src={formData.imagen || PRESET_IMAGES[0].url} 
                  alt={formData.nombre || 'Postre'} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = PRESET_IMAGES[0].url;
                  }}
                />
                <span className="absolute top-2.5 left-2.5 bg-[#99B4AA]/95 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-sm">
                  {formData.categoria}
                </span>
              </div>

              <div className="flex justify-between items-start gap-2 mb-1.5">
                <h3 className="text-base font-bold text-[#2E2A27] leading-tight line-clamp-2">
                  {formData.nombre || 'Nombre del Postre'}
                </h3>
                <span className="text-base font-extrabold text-[#D4AF37] tracking-tight tabular-nums whitespace-nowrap">
                  ${formData.precio ? Number(formData.precio).toFixed(2) : '0.00'}
                </span>
              </div>

              <p className="text-[#7A736B] text-xs line-clamp-2 mb-3 leading-relaxed">
                {formData.descripcion || 'Descripción del postre como aparecerá ante tus clientes en Serenoa.'}
              </p>

              <div className="w-full py-2 bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] text-white text-xs font-semibold rounded-full text-center select-none shadow-sm border border-[#ECC979]/40">
                Añadir al Carrito
              </div>
            </div>

            <div className="mt-4 p-3 bg-[#FAF6EF] rounded-xl border border-[#ECC979]/40 text-[11px] text-[#565935] space-y-1">
              <strong className="text-[#CF7D65]">💡 Tip de presentación:</strong>
              <p>Los postres con fotografías nítidas y descripción de ingredientes suelen generar más pedidos en WhatsApp.</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
