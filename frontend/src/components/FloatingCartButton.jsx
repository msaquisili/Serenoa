import React from 'react';
import { useCart } from '../context/CartContext';

export default function FloatingCartButton() {
  const { totalCount, setIsCartOpen, badgeBump } = useCart();

  return (
    <button 
      onClick={() => setIsCartOpen(true)}
      className={`floating-cart-btn fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white shadow-[0_8px_25px_rgba(207,125,101,0.45)] border-2 border-[#ECC979] hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer ${badgeBump ? 'bump scale-110' : ''}`}
      aria-label="Abrir Carrito"
      title="Ver carrito de compras"
    >
      <svg className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 group-hover:scale-110 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-9.8-2h11.6L21 6H6l-1.1-2.3A1 1 0 0 0 4 3H2v2h1.1l3.6 10.6a2 2 0 0 0 1.9 1.4z"></path>
      </svg>
      {totalCount > 0 && (
        <span className={`cart-badge absolute -top-1.5 -right-1.5 bg-[#D4AF37] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md ${badgeBump ? 'bump' : ''}`}>
          {totalCount}
        </span>
      )}
    </button>
  );
}
