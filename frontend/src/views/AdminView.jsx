import React, { useState, useEffect } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import OrdersTable from '../components/OrdersTable';
import ProductsTable from '../components/ProductsTable';
import CategoriesManager from '../components/CategoriesManager';
import MessagesManager from '../components/MessagesManager';
import ProductFormView from './ProductFormView';
import NewOrderView from './NewOrderView';
import OrderDetailView from './OrderDetailView';
import { fetchProducts, fetchOrders, loginAdmin, normalizeProduct, getAllCategories } from '../services/api';

export default function AdminView({ onNavigateToStore }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(localStorage.getItem('serenoa_admin_token'));
  });

  // Pestaña activa principal: 'dashboard' | 'pedidos' | 'productos' | 'categorias' | 'mensajes'
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('pedidos')) return 'pedidos';
      if (hash.includes('productos') || hash.includes('catalogo')) return 'productos';
      if (hash.includes('categorias')) return 'categorias';
      if (hash.includes('mensajes')) return 'mensajes';
    }
    return 'dashboard';
  });

  // Sub-página dedicada de pantalla completa (en lugar de modals)
  // 'list' | 'nuevo-producto' | 'editar-producto' | 'nuevo-pedido' | 'detalle-pedido'
  const [subPage, setSubPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('/nuevo_producto') || path.includes('/nuevo-producto')) {
        return 'nuevo-producto';
      }
    }
    return 'list';
  });

  // Estado del menú lateral en móviles (hamburguesa)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Datos
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Objetos en edición o detalle
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Login form state
  const [loginUser, setLoginUser] = useState('admin');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [prods, ords] = await Promise.all([
        fetchProducts(),
        fetchOrders()
      ]);
      setProducts(prods);
      setOrders(ords);
    } catch (err) {
      console.error('Error cargando datos de admin:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Actualización optimista de pedidos en memoria para feedback instantáneo
  const handleOrderUpdated = (orderId, updatePayload) => {
    setOrders(prev => prev.map(o => {
      const match = String(o._id) === String(orderId) || String(o.id) === String(orderId) || String(o.codigo) === String(orderId);
      if (!match) return o;
      const mergedCliente = updatePayload.cliente
        ? { ...(o.cliente || {}), ...updatePayload.cliente }
        : { ...(o.cliente || {}) };
      if (updatePayload.metodoPago) {
        mergedCliente.metodoPago = updatePayload.metodoPago;
      }
      return {
        ...o,
        ...updatePayload,
        cliente: mergedCliente,
        metodoPago: updatePayload.metodoPago || mergedCliente.metodoPago || o.metodoPago
      };
    }));

    setSelectedOrder(prev => {
      if (!prev) return null;
      const match = String(prev._id) === String(orderId) || String(prev.id) === String(orderId) || String(prev.codigo) === String(orderId);
      if (!match) return prev;
      const mergedCliente = updatePayload.cliente
        ? { ...(prev.cliente || {}), ...updatePayload.cliente }
        : { ...(prev.cliente || {}) };
      if (updatePayload.metodoPago) {
        mergedCliente.metodoPago = updatePayload.metodoPago;
      }
      return {
        ...prev,
        ...updatePayload,
        cliente: mergedCliente,
        metodoPago: updatePayload.metodoPago || mergedCliente.metodoPago || prev.metodoPago
      };
    });
  };

  // Eliminación optimista de pedidos en memoria para feedback instantáneo
  const handleOrderDeleted = (orderId) => {
    setOrders(prev => prev.filter(o => 
      String(o._id) !== String(orderId) && 
      String(o.id) !== String(orderId) && 
      String(o.codigo) !== String(orderId)
    ));
    if (selectedOrder && (
      String(selectedOrder._id) === String(orderId) || 
      String(selectedOrder.id) === String(orderId) || 
      String(selectedOrder.codigo) === String(orderId)
    )) {
      handleBackToList();
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await loginAdmin(loginUser.trim(), loginPass.trim());
      if (res && res.token) {
        localStorage.setItem('serenoa_admin_token', res.token);
        setIsAuthenticated(true);
      }
    } catch (err) {
      setLoginError(err.message || 'Credenciales inválidas');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('serenoa_admin_token');
    setIsAuthenticated(false);
  };

  // Navegación a vistas de página completa
  const handleOpenNewProduct = () => {
    setActiveTab('productos');
    setEditingProduct(null);
    setSubPage('nuevo-producto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditProduct = (prod) => {
    setActiveTab('productos');
    setEditingProduct(prod);
    setSubPage('editar-producto');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenNewOrder = () => {
    setSubPage('nuevo-pedido');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenOrderDetail = (order) => {
    setSelectedOrder(order);
    setSubPage('detalle-pedido');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToList = () => {
    setSubPage('list');
    setEditingProduct(null);
    setSelectedOrder(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Conteo total de pedidos en tiempo real para el badge del sidebar
  const totalOrdersCount = orders.length;

  // Si no está autenticado, muestra la pantalla de inicio de sesión
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF6EF] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#ECC979]/40 max-w-md w-full text-center">
          <div className="w-14 h-14 rounded-full bg-[#99B4AA]/20 text-[#565935] flex items-center justify-center text-2xl mx-auto mb-4 border border-[#ECC979]/50">
            🔒
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#2E2A27] mb-1">
            Panel de Administración
          </h2>
          <p className="text-xs text-[#7A736B] mb-6">
            Ingresa tus credenciales para gestionar el catálogo, pedidos y analítica de Serenoa.
          </p>

          {loginError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-[#2E2A27] mb-1">Usuario</label>
              <input 
                type="text" 
                required
                value={loginUser}
                onChange={e => setLoginUser(e.target.value)}
                placeholder="admin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2E2A27] mb-1">Contraseña</label>
              <input 
                type="password" 
                required
                value={loginPass}
                onChange={e => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECC979]/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#CF7D65]/20 focus:border-[#CF7D65]"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-gradient-to-r from-[#CF7D65] to-[#DE8B74] hover:from-[#BF6D55] hover:to-[#CF7D65] text-white rounded-full font-semibold text-xs sm:text-sm transition-all shadow-[0_4px_14px_rgba(207,125,101,0.3)] border border-[#ECC979]/60 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isLoggingIn ? 'Iniciando sesión...' : 'Ingresar al Panel'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-center">
            <button 
              onClick={onNavigateToStore}
              className="text-xs text-[#565935] hover:text-[#CF7D65] font-semibold cursor-pointer transition-colors"
            >
              ← Volver a la Tienda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6EF] flex flex-col md:flex-row relative">
      {/* Overlay oscuro para cerrar el sidebar en móviles */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR RESPONSIVO */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#565935] text-white flex flex-col justify-between p-6 z-50 transition-transform duration-300 ease-in-out flex-shrink-0 border-r border-[#ECC979]/30 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}
      >
        <div>
          {/* Logo y Encabezado */}
          <div className="pb-6 mb-6 border-b border-[#ECC979]/20 flex items-center justify-between">
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight block text-[#FAF6EF]">Serenoa</span>
              <span className="text-[11px] text-[#ECC979] uppercase tracking-widest block font-bold mt-0.5">
                ADMINISTRADOR
              </span>
            </div>

            {/* Botón de cerrar 'X' visible únicamente en versión móvil */}
            <button 
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold cursor-pointer transition-colors"
              title="Cerrar navegación"
            >
              ✕
            </button>
          </div>

          {/* Menú de pestañas */}
          <nav className="space-y-2 text-xs sm:text-sm">
            {[
              { id: 'dashboard', label: 'Métricas del Negocio', icon: '📊' },
              { id: 'pedidos', label: 'Gestión de Pedidos', icon: '📦', badge: totalOrdersCount },
              { id: 'productos', label: 'Catálogo de Postres', icon: '🍰', count: products.length },
              { id: 'categorias', label: 'Gestión de Categorías', icon: '🏷️' },
              { id: 'mensajes', label: 'Consultas Clientes', icon: '💬' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSubPage('list'); // Al cambiar de pestaña vuelve a la lista
                  setIsSidebarOpen(false); // Cierra sidebar en móvil
                }}
                className={`w-full flex items-center justify-between gap-4 px-4 py-3 rounded-xl font-medium transition-all cursor-pointer ${activeTab === tab.id && subPage === 'list' ? 'bg-white/20 text-[#FAF6EF] font-bold shadow-sm border-l-4 border-[#ECC979]' : 'text-[#FAF6EF]/80 hover:bg-white/10 hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0 text-base">{tab.icon}</span>
                  <span className="whitespace-nowrap font-medium">{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span className="ml-auto shrink-0 min-w-6 h-6 px-2 flex items-center justify-center rounded-full bg-[#D4AF37] text-white text-xs font-bold shadow-xs border border-white/30">
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && (
                  <span className="ml-auto shrink-0 text-xs text-[#FAF6EF]/60 font-semibold">{tab.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer del Sidebar */}
        <div className="pt-6 mt-6 border-t border-[#ECC979]/20 space-y-2">
          <button 
            type="button"
            onClick={onNavigateToStore}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-[#ECC979]/20 text-[#FAF6EF] hover:text-white text-xs font-semibold transition-all border border-[#ECC979]/40 cursor-pointer shadow-sm"
          >
            <span>Ver Tienda Pública</span>
          </button>
          <button 
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-red-200 hover:bg-red-500/20 text-xs font-medium transition-all cursor-pointer"
          >
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 sm:p-7 md:p-8 overflow-y-auto max-h-screen bg-[#FAF6EF]">
        {/* Barra superior con botón de menú hamburguesa (visible sólo en móvil) */}
        <div className="md:hidden flex items-center justify-between mb-4 pb-3 border-b border-[#ECC979]/30">
          <button 
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-xl bg-white text-[#565935] border border-[#ECC979]/40 shadow-sm flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
            <span>Menú</span>
          </button>
          <span className="font-serif font-bold text-[#2E2A27] text-lg">Serenoa Admin</span>
        </div>

        {/* Renderizado condicional de vistas completas dedicadas (sin modals) */}
        {loading ? (
          <div className="p-12 text-center text-[#7A736B]">
            Cargando información del catálogo y pedidos...
          </div>
        ) : subPage === 'nuevo-producto' ? (
          <ProductFormView 
            productToEdit={null}
            onSaved={(savedProd) => {
              setActiveTab('productos');
              if (savedProd) {
                setProducts(prev => {
                  const norm = normalizeProduct(savedProd);
                  return [norm, ...prev.filter(p => String(p._id || p.id) !== String(norm._id || norm.id))];
                });
              }
              loadData(true);
              handleBackToList();
            }}
            onBack={() => {
              setActiveTab('productos');
              handleBackToList();
            }}
            existingCategories={getAllCategories(products)}
          />
        ) : subPage === 'editar-producto' ? (
          <ProductFormView 
            productToEdit={editingProduct}
            onSaved={(savedProd) => {
              setActiveTab('productos');
              if (savedProd) {
                setProducts(prev => {
                  const norm = normalizeProduct(savedProd);
                  return prev.map(p => String(p._id || p.id) === String(norm._id || norm.id) ? norm : p);
                });
              }
              loadData(true);
              handleBackToList();
            }}
            onBack={() => {
              setActiveTab('productos');
              handleBackToList();
            }}
            existingCategories={getAllCategories(products)}
          />
        ) : subPage === 'nuevo-pedido' ? (
          <NewOrderView 
            products={products}
            onOrderCreated={(newOrder) => {
              if (newOrder) {
                setOrders(prev => [newOrder, ...prev]);
              }
              loadData(true);
              handleBackToList();
            }}
            onBack={handleBackToList}
          />
        ) : subPage === 'detalle-pedido' ? (
          <OrderDetailView 
            order={selectedOrder}
            onBack={handleBackToList}
            onStatusUpdated={loadData}
            onOrderUpdated={handleOrderUpdated}
            onOrderDeleted={handleOrderDeleted}
          />
        ) : (
          /* Vistas principales de cada pestaña */
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="mb-2">
                  <h1 className="text-2xl font-serif font-bold text-[#2E2A27]">
                    Métricas del Negocio
                  </h1>
                </div>
                <AnalyticsDashboard orders={orders} products={products} />
              </div>
            )}

            {activeTab === 'pedidos' && (
              <OrdersTable 
                orders={orders} 
                onOrdersUpdated={loadData}
                onOrderUpdated={handleOrderUpdated}
                onOrderDeleted={handleOrderDeleted}
                onNewOrder={handleOpenNewOrder}
                onViewOrderDetail={handleOpenOrderDetail}
              />
            )}

            {activeTab === 'productos' && (
              <ProductsTable 
                products={products} 
                onRefresh={loadData}
                onNewProduct={handleOpenNewProduct}
                onEditProduct={handleOpenEditProduct}
              />
            )}

            {activeTab === 'categorias' && (
              <CategoriesManager 
                products={products} 
                onCategoriesUpdated={loadData} 
              />
            )}

            {activeTab === 'mensajes' && (
              <MessagesManager />
            )}
          </>
        )}
      </main>
    </div>
  );
}
