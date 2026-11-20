import React from 'react';
import { useCart } from '../context/CartContext';

export default function CartDrawer({ onExploreCatalog }) {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartItemQty, 
    removeFromCart, 
    totalCount, 
    totalPrice,
    handleWhatsAppCheckout 
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside 
        className="fixed top-0 right-0 h-full w-full sm:max-w-md bg-[#FAF8F5] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out"
        role="dialog" 
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="cart-header p-4 sm:p-6 bg-white border-b border-[#ECC979]/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F2DEC7] text-[#CF7D65] flex items-center justify-center border border-[#ECC979]/50">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 20a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm7 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-9.8-2h11.6L21 6H6l-1.1-2.3A1 1 0 0 0 4 3H2v2h1.1l3.6 10.6a2 2 0 0 0 1.9 1.4z"></path>
              </svg>
            </div>
            <div>
              <h3 className="font-serif font-bold text-[#2E2A27] text-base sm:text-lg">Tu Carrito</h3>
              <span className="text-xs text-[#7A736B]">
                {totalCount} {totalCount === 1 ? 'producto agregado' : 'productos agregados'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-[#FAF6EF] hover:bg-[#F2DEC7] text-[#565935] flex items-center justify-center text-lg transition-colors cursor-pointer border border-[#ECC979]/40"
            aria-label="Cerrar carrito"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FAF6EF]/40">
          {cart.length === 0 ? (
            <div className="cart-empty-state text-center py-12 px-4">
              <div className="text-5xl mb-4">🍰</div>
              <h4 className="text-lg font-bold text-[#2E2A27] mb-2 font-serif">Tu carrito está vacío</h4>
              <p className="text-sm text-[#7A736B] mb-6 max-w-xs mx-auto">
                Explora nuestro catálogo para agregar deliciosas creaciones artesanales.
              </p>
              <button 
                onClick={() => {
                  setIsCartOpen(false);
                  if (onExploreCatalog) onExploreCatalog();
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white rounded-full font-semibold text-xs sm:text-sm shadow-[0_4px_14px_rgba(207,125,101,0.3)] border border-[#ECC979]/50 transition-all cursor-pointer active:scale-95"
              >
                Ver Catálogo
              </button>
            </div>
          ) : (
            cart.map(item => {
              const subtotal = (item.cantidad * item.precio).toFixed(2);
              return (
                <div key={item.id} className="cart-item-card flex items-center gap-3 p-3 bg-white rounded-xl border border-[#ECC979]/35 shadow-sm fade-in">
                  <img 
                    src={item.imagen} 
                    alt={item.nombre} 
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      if (!e.target.dataset.hasFailed) {
                        e.target.dataset.hasFailed = 'true';
                        e.target.src = 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400';
                      }
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs sm:text-sm font-bold text-[#2E2A27] truncate mb-0.5" title={item.nombre}>
                      {item.nombre}
                    </h5>
                    <div className="text-[11px] text-[#7A736B] mb-2">
                      ${Number(item.precio).toFixed(2)} c/u
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-[#ECC979]/50 rounded-full px-1.5 py-0.5 bg-[#F7EFE4] gap-2">
                        <button 
                          onClick={() => updateCartItemQty(item.id, item.cantidad - 1)}
                          className="w-5 h-5 flex items-center justify-center font-bold text-[#CF7D65] hover:text-[#BF6D55] text-sm cursor-pointer"
                          aria-label="Disminuir"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold text-[#565935] min-w-3 text-center">{item.cantidad}</span>
                        <button 
                          onClick={() => updateCartItemQty(item.id, item.cantidad + 1)}
                          className="w-5 h-5 flex items-center justify-center font-bold text-[#CF7D65] hover:text-[#BF6D55] text-sm cursor-pointer"
                          aria-label="Aumentar"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-[#D4AF37] font-sans tabular-nums">
                        ${subtotal}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors cursor-pointer self-start"
                    title="Eliminar producto"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="cart-footer p-4 sm:p-6 border-t border-[#ECC979]/30 bg-white">
            <div className="flex justify-between items-center mb-1 text-xs sm:text-sm text-[#7A736B]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#2E2A27] tabular-nums">${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4 text-sm sm:text-base font-bold text-[#2E2A27] border-t border-gray-100 pt-2">
              <span>Total a Pagar</span>
              <span className="font-sans font-extrabold tracking-tight tabular-nums text-lg sm:text-xl text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(212,175,55,0.25)]">
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {/* Mensaje de anticipación para pedidos (visible solo cuando hay al menos 1 producto) */}
            <div className="mb-4 p-3 rounded-xl bg-[#FAF6EF] border border-[#ECC979]/45 text-[11px] sm:text-xs text-[#565935] leading-relaxed flex items-start gap-2.5 shadow-sm">
              <span className="text-sm mt-0.5 select-none">🕒</span>
              <div className="space-y-0.5">
                <p className="font-semibold text-[#2E2A27]">
                  Los pedidos se preparan con 48 horas de anticipación, de lunes a viernes.
                </p>
                <p className="text-[#7A736B]">
                  Los pedidos confirmados un viernes se entregan el lunes.
                </p>
              </div>
            </div>

            <button 
              onClick={handleWhatsAppCheckout}
              className="w-full py-3 sm:py-3.5 rounded-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold text-xs sm:text-sm shadow-md hover:bg-[#1EBE5D] active:scale-95 transition-all cursor-pointer"
            >
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.077-1.11-.059-.395-.129-.899-.301-1.558-.588-2.736-1.196-4.521-3.957-4.658-4.14-.136-.184-1.11-1.477-1.11-2.816 0-1.339.704-1.996.953-2.268.249-.272.544-.34.726-.34.181 0 .363.002.521.01.168.009.395-.064.618.472.227.545.772 1.884.839 2.02.068.136.113.295.023.477-.091.182-.136.295-.272.454-.136.159-.286.355-.408.477-.136.136-.278.284-.12.556.159.272.704 1.162 1.51 1.881 1.037.925 1.912 1.212 2.184 1.348.272.136.431.113.59-.068.159-.182.68-1.045.861-1.408.181-.363.363-.304.606-.213.243.091 1.543.727 1.808.859.265.132.442.197.507.308.065.111.065.642-.079 1.047z"/>
              </svg>
              <span>Enviar Pedido a WhatsApp</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
