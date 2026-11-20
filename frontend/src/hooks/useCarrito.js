import { useCarrito as useCarritoContext } from '../context/CartContext';

/**
 * Custom Hook `useCarrito`
 * Provee acceso seguro al estado local y persistente del carrito de compras.
 * Conectado directamente a localStorage bajo la clave 'carritoSerenoa'.
 */
export function useCarrito() {
  return useCarritoContext();
}

export default useCarrito;
