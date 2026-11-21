import React, { createContext, useContext, useState, useEffect } from 'react';
import { createOrder } from '../services/api';

const CartContext = createContext();

const WHATSAPP_PHONE = '593969879578';

export const CartProvider = ({ children }) => {
  // 1. Inicialización aislada y persistente en el navegador del cliente
  const [cart, setCart] = useState(() => {
    try {
      const stored = window.localStorage.getItem('carritoSerenoa') || window.localStorage.getItem('serenoa_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error leyendo carritoSerenoa desde localStorage:', e);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [badgeBump, setBadgeBump] = useState(false);

  // 2. Efecto para mantener sincronizado el almacenamiento local cada vez que cambie el carrito
  useEffect(() => {
    try {
      window.localStorage.setItem('carritoSerenoa', JSON.stringify(cart));
    } catch (e) {
      console.error('Error guardando carritoSerenoa en localStorage:', e);
    }
  }, [cart]);

  const triggerBadgeBump = () => {
    setBadgeBump(true);
    setTimeout(() => setBadgeBump(false), 300);
  };

  const getProductQty = (productId) => {
    const item = cart.find(i => i.id === productId);
    return item ? item.cantidad : 0;
  };

  const addToCart = (product, delta = 1) => {
    if (!product) return;
    setCart(prev => {
      const index = prev.findIndex(item => item.id === product.id);
      if (index > -1) {
        const nextQty = prev[index].cantidad + delta;
        if (nextQty <= 0) {
          return prev.filter(item => item.id !== product.id);
        }
        const updated = [...prev];
        updated[index] = { ...updated[index], cantidad: nextQty };
        return updated;
      }
      if (delta > 0) {
        return [...prev, {
          id: product.id,
          nombre: product.nombre,
          precio: product.precio,
          imagen: product.imagen,
          cantidad: delta,
          categoria: product.categoria
        }];
      }
      return prev;
    });
    triggerBadgeBump();
  };

  const updateCartItemQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, cantidad: newQty } : item));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const totalCount = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.cantidad * item.precio), 0);

  const handleWhatsAppCheckout = () => {
    if (cart.length === 0) return;

    const total = totalPrice.toFixed(2);
    let message = `*¡Hola Serenoa! Deseo realizar el siguiente pedido:*\n\n`;
    message += `------------------------------------\n`;

    cart.forEach(item => {
      const sub = (item.cantidad * item.precio).toFixed(2);
      message += `• *${item.cantidad}x* ${item.nombre}\n  ($${Number(item.precio).toFixed(2)} c/u) = *$${sub}*\n`;
    });

    message += `------------------------------------\n`;
    message += `*TOTAL A PAGAR: $${total}*\n\n`;
    message += `_Por favor confírmame los datos para la reserva. ¡Muchas gracias!_`;

    const encodedUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

    // Registrar pedido en el backend si está activo (usando la API centralizada con VITE_API_URL)
    try {
      createOrder({
        cliente: {
          nombre: 'Cliente Web / WhatsApp',
          telefono: `+${WHATSAPP_PHONE}`,
          metodoPago: 'Transferencia'
        },
        productos: cart.map(i => ({
          producto: i.id && i.id.startsWith('prod-') ? null : i.id,
          nombre: i.nombre,
          cantidad: i.cantidad,
          precioUnitario: i.precio
        })),
        total: Number(total),
        notas: 'Pedido originado desde el carrito web con botón de WhatsApp.'
      }).catch(err => console.log('Registro asíncrono:', err));
    } catch (e) {}

    window.open(encodedUrl, '_blank');
  };

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      setIsCartOpen,
      badgeBump,
      addToCart,
      updateCartItemQty,
      removeFromCart,
      getProductQty,
      totalCount,
      totalPrice,
      handleWhatsAppCheckout
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export const useCarrito = () => useContext(CartContext);
