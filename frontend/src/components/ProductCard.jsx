import React from 'react';
import { useCarrito } from '../hooks/useCarrito';

export default function ProductCard({ producto }) {
  const { addToCart, getProductQty } = useCarrito();
  const qty = getProductQty(producto.id);

  return (
    <div className="card group bg-white rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-[#ECC979]/45 hover:border-[#D4AF37] flex flex-col justify-between overflow-hidden fade-in">
      <div>
        <div className="relative h-44 sm:h-52 w-full rounded-xl overflow-hidden mb-3 sm:mb-4 bg-[#FAF6EF]">
          <img 
            src={producto.imagen} 
            alt={producto.nombre} 
            loading="lazy"
            onError={(e) => {
              if (!e.target.dataset.hasFailed) {
                e.target.dataset.hasFailed = 'true';
                e.target.src = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400';
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-2.5 left-2.5 bg-[#99B4AA]/95 text-white text-[11px] sm:text-xs font-semibold px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-md shadow-sm border border-white/30">
            {producto.categoria}
          </span>
        </div>
        
        <div className="flex justify-between items-start gap-2 mb-1.5 sm:mb-2">
          <h3 className="text-base sm:text-lg font-bold text-[#2E2A27] leading-tight line-clamp-2">
            {producto.nombre}
          </h3>
          <span 
            className="text-base sm:text-lg font-extrabold text-[#D4AF37] tracking-tight tabular-nums whitespace-nowrap drop-shadow-[0_1px_2px_rgba(212,175,55,0.25)]"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
          >
            ${Number(producto.precio).toFixed(2)}
          </span>
        </div>
        
        <p className="text-[#7A736B] text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
          {producto.descripcion}
        </p>
      </div>

      <div className="card-action-container mt-auto">
        {qty > 0 ? (
          <div 
            className="card-qty-control flex items-center justify-between bg-[#F7EFE4] rounded-full p-1.5 border border-[#ECC979]/60 shadow-inner"
          >
            <button 
              onClick={() => addToCart(producto, -1)}
              className="btn-card-qty w-8 h-8 rounded-full bg-white text-[#CF7D65] hover:bg-[#CF7D65] hover:text-white flex items-center justify-center font-extrabold transition-all cursor-pointer shadow-sm active:scale-90 text-lg leading-none border border-[#ECC979]/50"
              title="Disminuir"
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            <span 
              className="card-qty-value font-extrabold text-[#565935] text-base px-2.5 select-none"
              style={{ fontWeight: 800, fontSize: '1.1rem' }}
            >
              {qty}
            </span>
            <button 
              onClick={() => addToCart(producto, 1)}
              className="btn-card-qty w-8 h-8 rounded-full bg-white text-[#CF7D65] hover:bg-[#CF7D65] hover:text-white flex items-center justify-center font-extrabold transition-all cursor-pointer shadow-sm active:scale-90 text-lg leading-none border border-[#ECC979]/50"
              title="Aumentar"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        ) : (
          <button 
            onClick={() => addToCart(producto, 1)}
            className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white font-semibold rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_14px_rgba(207,125,101,0.28)] border border-[#ECC979]/50 active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4 text-[#FDF0CD]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 4v16m8-8H4"></path>
            </svg>
            Añadir al Carrito
          </button>
        )}
      </div>
    </div>
  );
}
